const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all Recipes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT r. recipe_id, r.recipe_name, c.cookbook_name, u.username FROM Recipes r JOIN Cookbooks c ON c.book_id = r.book_id JOIN Users u ON u.user_id = r.contributor_id');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Add a Recipe
router.post('/', async (req, res) => {
  const { book_id, contributor_id, recipe_name, image } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Recipes (book_id, contributor_id, recipe_name, image) VALUES (?, ?, ?, ?)',
      [book_id, contributor_id, recipe_name, image]
    );
    res.status(201).json({ user_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add recipe');
  }
});

module.exports = router;