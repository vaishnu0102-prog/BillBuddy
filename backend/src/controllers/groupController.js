const pool = require("../config/database");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Group name is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO groups (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_by, created_at`,
      [name.trim(), userId]
    );

    const group = result.rows[0];

    // Automatically add the creator as a group member
    await pool.query(
      `INSERT INTO group_members (group_id, user_id)
       VALUES ($1, $2)`,
      [group.id, userId]
    );

    res.status(201).json({
      status: "success",
      message: "Group created successfully",
      group
    });

  } catch (error) {
    console.error("Create group error:", error);

    res.status(500).json({
      status: "error",
      message: "Something went wrong while creating the group"
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT 
         g.id,
         g.name,
         g.created_by,
         g.created_at
       FROM groups g
       INNER JOIN group_members gm
         ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      status: "success",
      groups: result.rows
    });

  } catch (error) {
    console.error("Get groups error:", error);

    res.status(500).json({
      status: "error",
      message: "Something went wrong while fetching groups"
    });
  }
};

module.exports = {
  createGroup,
  getMyGroups
};