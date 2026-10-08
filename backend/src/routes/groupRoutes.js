const express = require("express");

const {
  createGroup,
  getMyGroups
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createGroup);

router.get("/", authMiddleware, getMyGroups);

module.exports = router;