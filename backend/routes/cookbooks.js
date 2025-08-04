const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT c.cookbook_name AS Book_Name, c.cookbook_desc AS Description, u.username AS Owner FROM Cookbooks c JOIN Users u ON u.user_id = c.owner_id');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Add a user
router.post('/', async (req, res) => {
  const { owner_id, cookbook_name, cookbook_desc } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Cookbooks (owner_id, cookbook_name, cookbook_desc) VALUES (?, ?, ?)',
      [owner_id, cookbook_name, cookbook_desc]
    );
    res.status(201).json({ user_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add cookbook');
  }
});

module.exports = router;