const crypto = require("crypto");
const transporter = require("../config/mailer");

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
// Forgot Password
// ===============================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    // Generic response to prevent email enumeration
    const successResponse = {
      status: "success",
      message: "If an account exists with this email, a password reset link has been sent."
    };

    if (result.rows.length === 0) {
      return res.status(200).json(successResponse);
    }

    const user = result.rows[0];

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Insert or replace existing reset token
    await pool.query(
      `INSERT INTO password_reset_tokens
       (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET
         token_hash = EXCLUDED.token_hash,
         expires_at = EXCLUDED.expires_at,
         created_at = CURRENT_TIMESTAMP`,
      [user.id, tokenHash, expiresAt]
    );

    // Frontend reset URL
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const resetLink =
      `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send reset email
    await transporter.sendMail({
      from: `"BillBuddy" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: "Reset Your BillBuddy Password",

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${user.name},</h2>

          <p>We received a request to reset your BillBuddy password.</p>

          <p>Click the button below to create a new password:</p>

          <a href="${resetLink}"
             style="display:inline-block;
                    padding:12px 24px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;">
            Reset Password
          </a>

          <p>This link will expire in 15 minutes.</p>

          <p>If you didn't request this, you can safely ignore this email.</p>

          <p>Regards,<br>Team BillBuddy</p>
        </div>
      `
    });

    return res.status(200).json(successResponse);

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to process your request right now."
    });
  }
};


// ===============================
// Reset Password
// ===============================

const resetPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Token and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 8 characters long"
      });
    }

    // Hash received token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await client.query("BEGIN");

    // Verify token and expiry
    const result = await client.query(
      `SELECT user_id
       FROM password_reset_tokens
       WHERE token_hash = $1
       AND expires_at > CURRENT_TIMESTAMP
       FOR UPDATE`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "Invalid or expired password reset link."
      });
    }

    const userId = result.rows[0].user_id;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await client.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [passwordHash, userId]
    );

    // Delete used reset token
    await client.query(
      `DELETE FROM password_reset_tokens
       WHERE user_id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now log in."
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Reset password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to reset password. Please try again."
    });

  } finally {
    client.release();
  }
};


// ===============================
// Export Controllers
// ===============================

module.exports = {
  registerUser,
  loginUser,
  startGoogleAuth,
  googleLogin,
  forgotPassword,
  resetPassword
};