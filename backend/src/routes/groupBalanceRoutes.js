
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getGroupBalances,
  getSettlementSuggestions,
  recordSettlement,
} = require("../controllers/groupBalanceController");

const router = express.Router();

// All balance and settlement routes require authentication.
router.use(authMiddleware);

// Get group balances.
router.get("/:groupId", getGroupBalances);

// Get settlement suggestions.
router.get("/:groupId/suggestions", getSettlementSuggestions);

// Record a completed settlement.
router.post("/:groupId/settlements", recordSettlement);

module.exports = router;
