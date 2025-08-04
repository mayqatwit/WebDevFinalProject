const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all cookbooks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
        `SELECT c.book_id, c.cookbook_name AS Book_Name, c.cookbook_desc AS Description, u.username AS Owner 
        FROM Cookbooks c 
        JOIN Users u ON u.user_id = c.owner_id'`
    );
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Get cookbooks for a specific user
router.get('/:userId', async (req, res) => {
  const recipeId = req.params.userId;

  try {
    const [rows] = await db.query(
        `SELECT c.book_id, c.cookbook_name AS Book_Name, c.cookbook_desc AS Description, u.username AS Owner 
        FROM Cookbooks c 
        JOIN Users u ON u.user_id = c.owner_id'
        WHERE c.owner_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Add a cookbook
router.post('/', async (req, res) => {
  const { owner_id, cookbook_name, cookbook_desc } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Cookbooks (owner_id, cookbook_name, cookbook_desc) VALUES (?, ?, ?)',
      [owner_id, cookbook_name, cookbook_desc]
    );
    res.status(201).json({ book_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add cookbook');
  }
});

module.exports = router;