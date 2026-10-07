const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../config/database");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5001/api/auth/google/callback"
);


// ===============================
// Normal Signup
// ===============================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, email and password are required"
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email already registered"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      status: "error",
      message: "Something went wrong while creating the account"
    });
  }
};


// ===============================
// Start Google Authentication
// ===============================

const startGoogleAuth = (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account"
  });

  res.redirect(authUrl);
};


// ===============================
// Google OAuth Callback
// ===============================

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        status: "error",
        message: "Google authorization code is missing"
      });
    }

    // Exchange authorization code for Google tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify Google's ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    // Make sure Google verified the email
    if (!email || !payload.email_verified) {
      return res.status(400).json({
        status: "error",
        message: "Google email could not be verified"
      });
    }

    // Check whether Google account or email already exists
    const existingUser = await pool.query(
      `SELECT id, name, email, google_id
       FROM users
       WHERE google_id = $1 OR email = $2`,
      [googleId, email]
    );

    // Existing user
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      // Link Google account to existing email/password account
      if (!user.google_id) {
        await pool.query(
          "UPDATE users SET google_id = $1 WHERE id = $2",
          [googleId, user.id]
        );
      }

      return res.redirect(
        "http://localhost:5173/login?google=success"
      );
    }

    // New Google user
    await pool.query(
      `INSERT INTO users (name, email, password_hash, google_id)
       VALUES ($1, $2, $3, $4)`,
      [name, email, null, googleId]
    );

    return res.redirect(
      "http://localhost:5173/login?google=success"
    );

  } catch (error) {
    console.error("Google authentication error:", error);

    return res.redirect(
      "http://localhost:5173/signup?google=error"
    );
  }
};


// ===============================
// Export Controllers
// ===============================

module.exports = {
  registerUser,
  startGoogleAuth,
  googleLogin
};