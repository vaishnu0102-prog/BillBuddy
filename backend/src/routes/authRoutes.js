const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  startGoogleAuth,
  googleLogin
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/google", startGoogleAuth);

router.get("/google/callback", googleLogin);

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "You are authenticated!",
    user: req.user
  });
});

module.exports = router;