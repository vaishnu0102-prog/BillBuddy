const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
// Normal Login
// ===============================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }

    // Find user by email
    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    // User not found
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Login successful
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      status: "error",
      message: "Something went wrong while logging in"
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


    // ===============================
    // Existing User
    // ===============================

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      // Link Google account to existing email/password account
      if (!user.google_id) {
        await pool.query(
          "UPDATE users SET google_id = $1 WHERE id = $2",
          [googleId, user.id]
        );
      }

      // Create JWT for Google login
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

      // Send token to frontend
      return res.redirect(
        `http://localhost:5173/login?google=success&token=${encodeURIComponent(token)}`
      );
    }


    // ===============================
    // New Google User
    // ===============================

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, google_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email`,
      [name, email, null, googleId]
    );

    const user = newUser.rows[0];

    // Create JWT for new Google user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Send token to frontend
    return res.redirect(
      `http://localhost:5173/login?google=success&token=${encodeURIComponent(token)}`
    );

  } catch (error) {
    console.error("Google authentication error:", error);

    return res.redirect(
      "http://localhost:5173/login?google=error"
    );
  }
};


// ===============================
// Export Controllers
// ===============================

module.exports = {
  registerUser,
  loginUser,
  startGoogleAuth,
  googleLogin
};