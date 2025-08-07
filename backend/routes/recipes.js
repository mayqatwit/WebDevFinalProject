const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all Recipes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
        `SELECT r.recipe_id, r.recipe_name, c.cookbook_name, u.username 
        FROM Recipes r 
        JOIN Cookbooks c ON c.book_id = r.book_id 
        JOIN Users u ON u.user_id = r.contributor_id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Get recipes for a specific cookbook
router.get('/:bookId', async (req, res) => {
  const bookId = req.params.bookId;

  try {
    const [rows] = await db.query(
        `SELECT r.recipe_id, r.recipe_name, c.cookbook_name, u.username 
        FROM Recipes r 
        JOIN Cookbooks c ON c.book_id = r.book_id 
        JOIN Users u ON u.user_id = r.contributor_id
        WHERE r.book_id = ?`,
      [bookId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

//get ingredient list from a recipe
router.get('/ingredients/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    const [rows] = await db.query(
        `SELECT s.ingredient_name, s.ingredient_amount, s.ingredient_unit 
        FROM Recipes r 
        JOIN RecipeSteps s ON r.recipe_id = s.from_recipe
        WHERE s.from_recipe = ?
        ORDER BY s.step_num ASC`,
      [recipeId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

//get image file from database
router.get('/:id/image', async (req, res) => {
  const recipeId = req.params.id;

  try {
    const [rows] = await db.query(
      'SELECT image FROM Recipes WHERE recipe_id = ?',
      [recipeId]
    );

    if (rows.length === 0 || !rows[0].image) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', 'image/jpeg'); // or 'image/png' depending on what was uploaded
    res.send(rows[0].image);
  } catch (err) {
    console.error('Image fetch error:', err);
    res.status(500).send('Failed to fetch image');
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
    res.status(201).json({ recipe_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add recipe');
  }
});

//edit a recipe
router.put('/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;
  const { book_id, recipe_name } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE Recipes 
       SET book_id = ?, recipe_name = ? 
       WHERE recipe_id = ?`,
      [book_id, recipe_name, recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).send('Could not update recipe');
  }
});

module.exports = router;