const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all cookbooks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
        `SELECT c.book_id, c.cookbook_name AS Book_Name, c.cookbook_desc AS Description, u.username AS Owner 
        FROM Cookbooks c 
        JOIN Users u ON u.user_id = c.owner_id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

// Get cookbooks for a specific user
router.get('/owner/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
        `SELECT c.book_id, c.cookbook_name AS Book_Name, c.cookbook_desc AS Description, u.username AS Owner 
        FROM Cookbooks c 
        JOIN Users u ON u.user_id = c.owner_id
        WHERE c.owner_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

//Get cookbooks a user has shared with them
router.get('/sharedWith/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
        `SELECT c.book_id, c.cookbook_name, c.cookbook_desc 
        FROM Cookbooks c 
        JOIN SharedCookbooks sb ON sb.book_id = c.book_id
        WHERE sb.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal server error');
  }
});

//Get all users a cookbook is shared with
router.get('/contributors/:bookId', async (req, res) => {
  const bookId = req.params.bookId;

  try {
    const [rows] = await db.query(
        `SELECT u.user_id, u.username 
        FROM Cookbooks c 
        JOIN SharedCookbooks sb ON sb.book_id = c.book_id
        JOIN Users u ON u.user_id = sb.user_id
        WHERE c.book_id = ?`,
      [bookId]
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

//edit a cookbook
router.put('/:bookId', async (req, res) => {
  const bookId = req.params.bookId;
  const { cookbook_name, cookbook_desc } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE Cookbooks 
       SET cookbook_name = ?, cookbook_desc = ? 
       WHERE book_id = ?`,
      [cookbook_name, cookbook_desc, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cookbook not found' });
    }

    res.status(200).json({ message: 'Cookbook updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).send('Could not update cookbook');
  }
});


//Add a contributor
router.post('/shareWith/', async (req, res) => {
  const { book_id, user_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO SharedCookbooks (book_id, user_id) VALUES (?, ?)',
      [book_id, user_id]
    );
    res.status(201).json({ book_id: result.insertId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Could not add user');
  }
});

//Remove a contributor
router.delete('/removeShare/', async (req, res) => {
  const { book_id, user_id } = req.body;
  try {
    const [result] = await db.query(
      'DELETE FROM SharedCookbooks WHERE book_id = ? AND user_id = ?',
      [book_id, user_id]
    );
    res.status(200).json({ message: 'Contributor removed successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Could not remove contributor');
  }
});
module.exports = router;