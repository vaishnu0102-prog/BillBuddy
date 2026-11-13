
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  addGroupExpense,
  getGroupExpenses,
  deleteGroupExpense
} = require("../controllers/groupExpenseController");

const router = express.Router();

// All group expense routes require authentication
router.use(authMiddleware);

// Add a group expense
router.post("/:groupId", addGroupExpense);

// Get all expenses of a group
router.get("/:groupId", getGroupExpenses);

// Delete a group expense
router.delete("/:groupId/:expenseId", deleteGroupExpense);

module.exports = router;
