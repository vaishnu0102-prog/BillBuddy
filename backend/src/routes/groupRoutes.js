
const express = require("express");

const {
  createGroup,
  getMyGroups,
  getGroupDetails
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createGroup);

router.get("/", authMiddleware, getMyGroups);

router.get("/:groupId", authMiddleware, getGroupDetails);

module.exports = router;
