
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} = require("../controllers/expenseController");

const router = express.Router();

// All expense routes require authentication
router.use(authMiddleware);

router.post("/", addTransaction);

router.get("/", getTransactions);

router.get("/:id", getTransactionById);

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction);

module.exports = router;
