const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all steps
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT s.step_id, r.recipe_name, s.step_num, s.ingredient_name, s.ingredient_amount, s.ingredient_unit, s.step_desc FROM RecipeSteps s JOIN Recipes r ON r.recipe_id = s.from_recipe');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Get steps for a specific recipe
router.get('/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    const [rows] = await db.query(
      `SELECT s.step_id, r.recipe_name, s.step_num, s.ingredient_name, 
              s.ingredient_amount, s.ingredient_unit, s.step_desc 
       FROM RecipeSteps s 
       JOIN Recipes r ON r.recipe_id = s.from_recipe 
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

// Add a step
router.post('/', async (req, res) => {
  const { step_num, from_recipe, ingredient_name, ingredient_amount, ingredient_unit, step_desc } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO RecipeSteps (step_num, from_recipe, ingredient_name, ingredient_amount, ingredient_unit, step_desc) VALUES (?, ?, ?, ?, ?, ?)',
      [step_num, from_recipe, ingredient_name, ingredient_amount, ingredient_unit, step_desc]
    );
    res.status(201).json({ step_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add step');
  }
});

// Edit a recipe step
router.put('/:stepId', async (req, res) => {
  const stepId = req.params.stepId;
  const { ingredient_name, ingredient_amount, ingredient_unit, step_desc } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE RecipeSteps 
       SET ingredient_name = ?, ingredient_amount = ?, ingredient_unit = ?, step_desc = ? 
       WHERE step_id = ?`,
      [ingredient_name, ingredient_amount, ingredient_unit, step_desc, stepId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Step not found' });
    }

    res.status(200).json({ message: 'Step updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).send('Could not update step');
  }
});

// Delete steps for a recipe (useful for editing recipes)
router.delete('/recipe/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    const [result] = await db.query(
      'DELETE FROM RecipeSteps WHERE from_recipe = ?',
      [recipeId]
    );

    res.status(200).json({ 
      message: 'Steps deleted successfully',
      deletedCount: result.affectedRows
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Could not delete steps');
  }
});

// Delete a specific step
router.delete('/:stepId', async (req, res) => {
  const stepId = req.params.stepId;

  try {
    const [result] = await db.query(
      'DELETE FROM RecipeSteps WHERE step_id = ?',
      [stepId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Step not found' });
    }

    res.status(200).json({ message: 'Step deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Could not delete step');
  }
});

module.exports = router;