
const pool = require("../config/database");

// Convert monetary values into integer paise to avoid floating-point errors.
const toCents = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !/^\d+(\.\d{1,2})?$/.test(String(value))
  ) {
    return null;
  }

  const [rupees, paise = ""] = String(value).split(".");
  return Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
};

const formatCents = (cents) => (cents / 100).toFixed(2);

const validId = (value) =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;


// Allocate equal shares, distributing leftover paise.
const calculateEqualShares = (totalCents, participants) => {
  const base = Math.floor(totalCents / participants.length);
  const remainder = totalCents % participants.length;

  return participants.map((participant, index) => ({
    user_id: participant.user_id,
    share_amount: base + (index < remainder ? 1 : 0),
    percentage: null
  }));
};


// Calculate percentage shares using the largest-remainder method.
const calculatePercentageShares = (totalCents, participants) => {
  const shares = participants.map((participant, index) => {
    const percentageBasisPoints = Math.round(
      Number(participant.percentage) * 100
    );

    const numerator = totalCents * percentageBasisPoints;

    return {
      user_id: participant.user_id,
      share_amount: Math.floor(numerator / 10000),
      percentage: participant.percentage,
      remainder: numerator % 10000,
      index
    };
  });

  const allocated = shares.reduce(
    (sum, share) => sum + share.share_amount,
    0
  );

  let remaining = totalCents - allocated;

  const priority = [...shares].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index
  );

  for (let i = 0; i < remaining; i++) {
    priority[i].share_amount += 1;
  }

  return shares.map(({ user_id, share_amount, percentage }) => ({
    user_id,
    share_amount,
    percentage
  }));
};


// ======================================
// Add Group Expense
// ======================================

const addGroupExpense = async (req, res) => {
  let client;

  try {
    const userId = Number(req.user.userId);
    const groupId = Number(req.params.groupId);

    const {
      title,
      amount,
      category,
      description,
      expense_date,
      paid_by,
      split_type,
      participants
    } = req.body;

    if (!validId(groupId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid group ID"
      });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Expense title is required"
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        status: "error",
        message: "Expense title cannot exceed 150 characters"
      });
    }

    const totalCents = toCents(amount);

    if (totalCents === null || totalCents <= 0 || totalCents > 999999999999) {
      return res.status(400).json({
        status: "error",
        message: "Enter a valid positive amount with up to 2 decimal places"
      });
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Expense category is required"
      });
    }

    if (category.trim().length > 100) {
      return res.status(400).json({
        status: "error",
        message: "Category cannot exceed 100 characters"
      });
    }

    if (!validId(paid_by)) {
      return res.status(400).json({
        status: "error",
        message: "A valid payer is required"
      });
    }

    if (!["equal", "exact", "percentage"].includes(split_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid split type"
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one expense participant is required"
      });
    }

    const participantIds = participants.map((p) => Number(p.user_id));

    if (participantIds.some((id) => !validId(id))) {
      return res.status(400).json({
        status: "error",
        message: "Invalid participant ID"
      });
    }

    if (new Set(participantIds).size !== participantIds.length) {
      return res.status(400).json({
        status: "error",
        message: "Duplicate participants are not allowed"
      });
    }

    // Calculate shares.
    let shares = [];

    if (split_type === "equal") {
      shares = calculateEqualShares(totalCents, participants);
    }

    if (split_type === "exact") {
      shares = participants.map((participant) => ({
        user_id: Number(participant.user_id),
        share_amount: toCents(participant.amount),
        percentage: null
      }));

      if (shares.some((share) =>
        share.share_amount === null || share.share_amount <= 0
      )) {
        return res.status(400).json({
          status: "error",
          message: "Every exact share must be greater than zero and have at most 2 decimal places"
        });
      }
    }

    if (split_type === "percentage") {
      const percentages = participants.map((participant) => {
        const value = participant.percentage;

        if (
          value === undefined ||
          value === null ||
          value === "" ||
          !/^\d+(\.\d{1,2})?$/.test(String(value))
        ) {
          return null;
        }

        return Number(value);
      });

      if (
        percentages.some(
          (value) => value === null || !Number.isFinite(value) || value <= 0 || value > 100
        )
      ) {
        return res.status(400).json({
          status: "error",
          message: "Each percentage must be greater than 0 and at most 100"
        });
      }

      const totalBasisPoints = percentages.reduce(
        (sum, value) => sum + Math.round(value * 100),
        0
      );

      if (totalBasisPoints !== 10000) {
        return res.status(400).json({
          status: "error",
          message: "Participant percentages must add up to exactly 100%"
        });
      }

      shares = calculatePercentageShares(
        totalCents,
        participants.map((participant, index) => ({
          user_id: Number(participant.user_id),
          percentage: percentages[index]
        }))
      );
    }

    // Verify all share amounts add up to the expense total.
    const sharesTotal = shares.reduce(
      (sum, share) => sum + share.share_amount,
      0
    );

    if (sharesTotal !== totalCents) {
      return res.status(400).json({
        status: "error",
        message: "Expense shares do not match the total amount"
      });
    }

    // Begin database transaction.
    client = await pool.connect();

    await client.query("BEGIN");

    // Verify the payer belongs to the group.
    const payerResult = await client.query(
      `SELECT user_id
       FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, Number(paid_by)]
    );

    if (payerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        status: "error",
        message: "The selected payer is not a member of this group"
      });
    }

    // Verify every participant belongs to the group.
    const membersResult = await client.query(
      `SELECT user_id
       FROM group_members
       WHERE group_id = $1
         AND user_id = ANY($2::integer[])`,
      [groupId, participantIds]
    );

    if (membersResult.rows.length !== participantIds.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "One or more participants do not belong to this group"
      });
    }

    // Create the expense.
    const expenseResult = await client.query(
      `INSERT INTO group_expenses
       (group_id, paid_by, title, amount, category,
        description, expense_date, split_type)
       VALUES ($1, $2, $3, $4, $5, $6,
               COALESCE($7::date, CURRENT_DATE), $8)
       RETURNING *`,
      [
        groupId,
        Number(paid_by),
        title.trim(),
        formatCents(totalCents),
        category.trim(),
        description?.trim() || null,
        expense_date || null,
        split_type
      ]
    );

    const expense = expenseResult.rows[0];

    // Save individual member shares.
    for (const share of shares) {
      await client.query(
        `INSERT INTO expense_splits
         (expense_id, group_id, user_id, share_amount, percentage)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          expense.id,
          groupId,
          share.user_id,
          formatCents(share.share_amount),
          share.percentage
        ]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Group expense added successfully",
      expense,
      splits: shares.map((share) => ({
        user_id: share.user_id,
        share_amount: formatCents(share.share_amount),
        percentage: share.percentage
      }))
    });

  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Add group expense error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to add group expense"
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};


// ======================================
// Get Group Expenses
// ======================================

const getGroupExpenses = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const groupId = Number(req.params.groupId);

    if (!validId(groupId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid group ID"
      });
    }

    const memberResult = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Group not found or you are not a member"
      });
    }

    const result = await pool.query(
      `SELECT
         e.*,
         payer.name AS paid_by_name,
         COALESCE(
           json_agg(
             json_build_object(
               'user_id', s.user_id,
               'name', member.name,
               'share_amount', s.share_amount,
               'percentage', s.percentage
             )
           ) FILTER (WHERE s.id IS NOT NULL),
           '[]'::json
         ) AS splits
       FROM group_expenses e
       INNER JOIN users payer ON payer.id = e.paid_by
       LEFT JOIN expense_splits s ON s.expense_id = e.id
       LEFT JOIN users member ON member.id = s.user_id
       WHERE e.group_id = $1
       GROUP BY e.id, payer.name
       ORDER BY e.expense_date DESC, e.created_at DESC`,
      [groupId]
    );

    return res.status(200).json({
      status: "success",
      count: result.rows.length,
      expenses: result.rows
    });

  } catch (error) {
    console.error("Get group expenses error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to fetch group expenses"
    });
  }
};


// ======================================
// Delete Group Expense
// Only the member who paid can delete it.
// ======================================

const deleteGroupExpense = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const groupId = Number(req.params.groupId);
    const expenseId = Number(req.params.expenseId);

    if (!validId(groupId) || !validId(expenseId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid group or expense ID"
      });
    }

    const result = await pool.query(
      `DELETE FROM group_expenses
       WHERE id = $1
         AND group_id = $2
         AND paid_by = $3
         AND EXISTS (
           SELECT 1
           FROM group_members gm
           WHERE gm.group_id = $2
             AND gm.user_id = $3
         )
       RETURNING id`,
      [expenseId, groupId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Expense not found or you are not authorized to delete it"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Group expense deleted successfully"
    });

  } catch (error) {
    console.error("Delete group expense error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to delete group expense"
    });
  }
};


module.exports = {
  addGroupExpense,
  getGroupExpenses,
  deleteGroupExpense
};
