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


router.put('/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;
  const { book_id, recipe_name } = req.body;

  console.log('PUT /recipes/:recipeId called');
  console.log('Recipe ID:', recipeId);
  console.log('Request body:', req.body);

  // Validate input
  if (!recipe_name) {
    console.log('Validation error: recipe_name is required');
    return res.status(400).json({ 
      error: 'Recipe name is required',
      received: { book_id, recipe_name }
    });
  }

  try {
    console.log('Executing query with params:', [book_id, recipe_name, recipeId]);
    
    const [result] = await db.query(
      `UPDATE Recipes 
       SET book_id = ?, recipe_name = ? 
       WHERE recipe_id = ?`,
      [book_id, recipe_name, recipeId]
    );

    console.log('Query result:', result);

    if (result.affectedRows === 0) {
      console.log('No rows affected - recipe not found');
      return res.status(404).json({ 
        error: 'Recipe not found',
        recipeId: recipeId
      });
    }

    console.log('Recipe updated successfully');
    res.status(200).json({ 
      message: 'Recipe updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ 
      error: 'Could not update recipe',
      details: err.message
    });
  }
});
module.exports = router;