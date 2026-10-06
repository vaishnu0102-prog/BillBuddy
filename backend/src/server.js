require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "BillBuddy backend is running 🚀"
  });
});

// Database test
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "success",
      message: "BillBuddy backend and PostgreSQL are connected! 🐘",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
console.error("Database error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`BillBuddy backend running on http://localhost:${PORT}`);
});