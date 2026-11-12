
const pool = require("../config/database");

// ======================================
// Add Personal Transaction
// ======================================

const addTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      type,
      amount,
      category,
      description,
      payment_method,
      transaction_date
    } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Transaction type must be income or expense"
      });
    }

    const numericAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please enter a valid amount greater than zero"
      });
    }

    if (
      !category ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        status: "error",
        message: "Category is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO personal_transactions
       (user_id, type, amount, category, description,
        payment_method, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6,
        COALESCE($7::date, CURRENT_DATE))
       RETURNING *`,
      [
        userId,
        type,
        numericAmount,
        category.trim(),
        description?.trim() || null,
        payment_method || null,
        transaction_date || null
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "Transaction added successfully",
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error("Add transaction error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to add transaction"
    });
  }
};


// ======================================
// Get All Personal Transactions
// ======================================

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT *
       FROM personal_transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC, created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      status: "success",
      count: result.rows.length,
      transactions: result.rows
    });

  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to fetch transactions"
    });
  }
};


// ======================================
// Get Single Personal Transaction
// ======================================

const getTransactionById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid transaction ID"
      });
    }

    const result = await pool.query(
      `SELECT *
       FROM personal_transactions
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found"
      });
    }

    return res.status(200).json({
      status: "success",
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error("Get transaction error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to fetch transaction"
    });
  }
};


// ======================================
// Update Personal Transaction
// ======================================

const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const {
      type,
      amount,
      category,
      description,
      payment_method,
      transaction_date
    } = req.body;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid transaction ID"
      });
    }

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Transaction type must be income or expense"
      });
    }

    const numericAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please enter a valid amount greater than zero"
      });
    }

    if (
      !category ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        status: "error",
        message: "Category is required"
      });
    }

    const result = await pool.query(
      `UPDATE personal_transactions
       SET type = $1,
           amount = $2,
           category = $3,
           description = $4,
           payment_method = $5,
           transaction_date = COALESCE($6::date, transaction_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        type,
        numericAmount,
        category.trim(),
        description?.trim() || null,
        payment_method || null,
        transaction_date || null,
        id,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Transaction updated successfully",
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error("Update transaction error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to update transaction"
    });
  }
};


// ======================================
// Delete Personal Transaction
// ======================================

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid transaction ID"
      });
    }

    const result = await pool.query(
      `DELETE FROM personal_transactions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Transaction deleted successfully"
    });

  } catch (error) {
    console.error("Delete transaction error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to delete transaction"
    });
  }
};


// ======================================
// Export Controllers
// ======================================

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
