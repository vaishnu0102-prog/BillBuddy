const express = require("express");

const {
  registerUser,
  startGoogleAuth,
  googleLogin
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.get("/google", startGoogleAuth);

router.get("/google/callback", googleLogin);

module.exports = router;