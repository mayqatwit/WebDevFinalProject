const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email FROM Users');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Add a user
router.post('/', async (req, res) => {
  const { username, email, passwd } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Users (username, email, passwd) VALUES (?, ?, ?)',
      [username, email, passwd]
    );
    res.status(201).json({ user_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add user');
  }
});

module.exports = router;