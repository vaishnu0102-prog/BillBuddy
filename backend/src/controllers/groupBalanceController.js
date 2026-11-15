
const pool = require("../config/database");

// ======================================
// Get Group Balances
// ======================================

const getGroupBalances = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const groupId = Number(req.params.groupId);

    if (!Number.isSafeInteger(groupId) || groupId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid group ID",
      });
    }

    // Verify that the requesting user belongs to this group.
    const memberResult = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Group not found or you are not a member",
      });
    }

    // Calculate paid, owed and completed settlement amounts.
    const result = await pool.query(
      `SELECT
          gm.user_id,
          u.name,

          COALESCE(paid.total_paid, 0)::numeric(12,2)
            AS total_paid,

          COALESCE(owed.total_owed, 0)::numeric(12,2)
            AS total_owed,

          COALESCE(sent.total_sent, 0)::numeric(12,2)
            AS total_settled,

          COALESCE(received.total_received, 0)::numeric(12,2)
            AS total_received,

          (
            COALESCE(paid.total_paid, 0)
            - COALESCE(owed.total_owed, 0)
            + COALESCE(sent.total_sent, 0)
            - COALESCE(received.total_received, 0)
          )::numeric(12,2) AS net_balance

       FROM group_members gm

       INNER JOIN users u
         ON u.id = gm.user_id

       LEFT JOIN (
          SELECT paid_by, SUM(amount) AS total_paid
          FROM group_expenses
          WHERE group_id = $1
          GROUP BY paid_by
       ) paid ON paid.paid_by = gm.user_id

       LEFT JOIN (
          SELECT user_id, SUM(share_amount) AS total_owed
          FROM expense_splits
          WHERE group_id = $1
          GROUP BY user_id
       ) owed ON owed.user_id = gm.user_id

       LEFT JOIN (
          SELECT paid_by, SUM(amount) AS total_sent
          FROM group_settlements
          WHERE group_id = $1 AND status = 'completed'
          GROUP BY paid_by
       ) sent ON sent.paid_by = gm.user_id

       LEFT JOIN (
          SELECT paid_to, SUM(amount) AS total_received
          FROM group_settlements
          WHERE group_id = $1 AND status = 'completed'
          GROUP BY paid_to
       ) received ON received.paid_to = gm.user_id

       WHERE gm.group_id = $1
       ORDER BY u.name ASC`,
      [groupId]
    );

    const balances = result.rows.map((member) => ({
      user_id: member.user_id,
      name: member.name,
      total_paid: Number(member.total_paid),
      total_owed: Number(member.total_owed),
      total_settled: Number(member.total_settled),
      total_received: Number(member.total_received),
      net_balance: Number(member.net_balance),
      balance_status:
        Number(member.net_balance) > 0.005
          ? "gets_back"
          : Number(member.net_balance) < -0.005
          ? "owes"
          : "settled",
    }));

    return res.status(200).json({
      status: "success",
      group_id: groupId,
      balances,
    });

  } catch (error) {
    console.error("Get group balances error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to calculate group balances",
    });
  }
};


// ======================================
// Get Settlement Suggestions
// ======================================

const getSettlementSuggestions = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const groupId = Number(req.params.groupId);

    if (!Number.isSafeInteger(groupId) || groupId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid group ID",
      });
    }

    // Verify group membership
    const memberResult = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Group not found or you are not a member",
      });
    }

    // Calculate each member's net balance in paise.
    const result = await pool.query(
      `SELECT
          gm.user_id,
          u.name,
          ROUND((
            COALESCE(paid.total_paid, 0)
            - COALESCE(owed.total_owed, 0)
            + COALESCE(sent.total_sent, 0)
            - COALESCE(received.total_received, 0)
          ) * 100)::bigint AS net_balance_paise

       FROM group_members gm
       INNER JOIN users u ON u.id = gm.user_id

       LEFT JOIN (
          SELECT paid_by, SUM(amount) AS total_paid
          FROM group_expenses
          WHERE group_id = $1
          GROUP BY paid_by
       ) paid ON paid.paid_by = gm.user_id

       LEFT JOIN (
          SELECT user_id, SUM(share_amount) AS total_owed
          FROM expense_splits
          WHERE group_id = $1
          GROUP BY user_id
       ) owed ON owed.user_id = gm.user_id

       LEFT JOIN (
          SELECT paid_by, SUM(amount) AS total_sent
          FROM group_settlements
          WHERE group_id = $1 AND status = 'completed'
          GROUP BY paid_by
       ) sent ON sent.paid_by = gm.user_id

       LEFT JOIN (
          SELECT paid_to, SUM(amount) AS total_received
          FROM group_settlements
          WHERE group_id = $1 AND status = 'completed'
          GROUP BY paid_to
       ) received ON received.paid_to = gm.user_id

       WHERE gm.group_id = $1
       ORDER BY u.name ASC`,
      [groupId]
    );

    const debtors = [];
    const creditors = [];

    result.rows.forEach((member) => {
      const balance = Number(member.net_balance_paise);

      if (balance < 0) {
        debtors.push({
          user_id: member.user_id,
          name: member.name,
          remaining: Math.abs(balance),
        });
      } else if (balance > 0) {
        creditors.push({
          user_id: member.user_id,
          name: member.name,
          remaining: balance,
        });
      }
    });

    // Match debtors with creditors.
    const suggestions = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(
        debtors[i].remaining,
        creditors[j].remaining
      );

      if (amount > 0) {
        suggestions.push({
          from_user_id: debtors[i].user_id,
          from_name: debtors[i].name,
          to_user_id: creditors[j].user_id,
          to_name: creditors[j].name,
          amount: Number((amount / 100).toFixed(2)),
        });
      }

      debtors[i].remaining -= amount;
      creditors[j].remaining -= amount;

      if (debtors[i].remaining === 0) i++;
      if (creditors[j].remaining === 0) j++;
    }

    return res.status(200).json({
      status: "success",
      group_id: groupId,
      suggestions,
    });

  } catch (error) {
    console.error("Settlement suggestions error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to generate settlement suggestions",
    });
  }
};


const recordSettlement = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = Number(req.user.userId);
    const groupId = Number(req.params.groupId);
    const { paid_to, amount } = req.body;

    const receiverId = Number(paid_to);
    const settlementAmount = Number(amount);

    console.log("Settlement Debug:", {
  userId,
  paid_to,
  receiverId,
  amount,
});

    if (!Number.isSafeInteger(groupId) || groupId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid group ID",
      });
    }

    if (
      !Number.isSafeInteger(receiverId) ||
      receiverId <= 0 ||
      receiverId === userId
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid settlement receiver",
      });
    }

    if (
      !Number.isFinite(settlementAmount) ||
      settlementAmount <= 0 ||
      !Number.isSafeInteger(Math.round(settlementAmount * 100))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Enter a valid settlement amount",
      });
    }

    await client.query("BEGIN");

    // Verify both users belong to the group.
    const members = await client.query(
      `SELECT user_id
       FROM group_members
       WHERE group_id = $1
       AND user_id IN ($2, $3)
       FOR UPDATE`,
      [groupId, userId, receiverId]
    );

    if (members.rows.length !== 2) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "Both users must belong to this group",
      });
    }

    // Calculate current balances before recording payment.
    const balanceResult = await client.query(
      `SELECT
        gm.user_id,
        ROUND((
          COALESCE(paid.total_paid, 0)
          - COALESCE(owed.total_owed, 0)
          + COALESCE(sent.total_sent, 0)
          - COALESCE(received.total_received, 0)
        ) * 100)::bigint AS net_balance_paise

       FROM group_members gm

       LEFT JOIN (
         SELECT paid_by, SUM(amount) AS total_paid
         FROM group_expenses
         WHERE group_id = $1
         GROUP BY paid_by
       ) paid ON paid.paid_by = gm.user_id

       LEFT JOIN (
         SELECT user_id, SUM(share_amount) AS total_owed
         FROM expense_splits
         WHERE group_id = $1
         GROUP BY user_id
       ) owed ON owed.user_id = gm.user_id

       LEFT JOIN (
         SELECT paid_by, SUM(amount) AS total_sent
         FROM group_settlements
         WHERE group_id = $1 AND status = 'completed'
         GROUP BY paid_by
       ) sent ON sent.paid_by = gm.user_id

       LEFT JOIN (
         SELECT paid_to, SUM(amount) AS total_received
         FROM group_settlements
         WHERE group_id = $1 AND status = 'completed'
         GROUP BY paid_to
       ) received ON received.paid_to = gm.user_id

       WHERE gm.group_id = $1
       AND gm.user_id IN ($2, $3)`,
      [groupId, userId, receiverId]
    );

    const payerBalance = balanceResult.rows.find(
      (row) => Number(row.user_id) === userId
    );

    const receiverBalance = balanceResult.rows.find(
      (row) => Number(row.user_id) === receiverId
    );

    console.log("Settlement Balance Debug:", {
  userId,
  receiverId,
  payerBalance: payerBalance
    ? Number(payerBalance.net_balance_paise)
    : null,
  receiverBalance: receiverBalance
    ? Number(receiverBalance.net_balance_paise)
    : null,
});

    const amountPaise = Math.round(settlementAmount * 100);

    if (
      !payerBalance ||
      !receiverBalance ||
      Number(payerBalance.net_balance_paise) >= 0 ||
      Number(receiverBalance.net_balance_paise) <= 0
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "Settlement must be from a member who owes money to a member who should receive money",
      });
    }

    const amountOwed = Math.abs(
      Number(payerBalance.net_balance_paise)
    );

    const amountReceivable = Number(
      receiverBalance.net_balance_paise
    );

    if (
      amountPaise > amountOwed ||
      amountPaise > amountReceivable
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "Settlement amount exceeds the outstanding balance",
      });
    }

    const insertResult = await client.query(
      `INSERT INTO group_settlements
       (group_id, paid_by, paid_to, amount, settlement_date, status)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, 'completed')
       RETURNING *`,
      [groupId, userId, receiverId, settlementAmount.toFixed(2)]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Settlement recorded successfully",
      settlement: insertResult.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Record settlement error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to record settlement",
    });

  } finally {
    client.release();
  }
};


module.exports = {
  getGroupBalances,
  getSettlementSuggestions,
  recordSettlement,
};