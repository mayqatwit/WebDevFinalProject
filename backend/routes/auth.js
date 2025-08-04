// backend/routes/auth.js - New authentication routes
const express = require('express');
const router = express.Router();
const db = require('../db');

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  try {
    // Check if username already exists
    const [existingUsers] = await db.query(
      'SELECT user_id FROM Users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    
    // Insert new user (in a real app, you'd hash the password)
    const [result] = await db.query(
      'INSERT INTO Users (username, email, passwd) VALUES (?, ?, ?)',
      [username, email, password]
    );
    
    // Return user info (without password)
    res.status(201).json({
      user_id: result.insertId,
      username: username,
      email: email,
      message: 'User created successfully'
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // Find user by username or email
    const [users] = await db.query(
      'SELECT user_id, username, email, passwd FROM Users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = users[0];
    
    // Check password (in a real app, you'd compare hashed passwords)
    if (user.passwd !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Return user info (without password)
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      message: 'Login successful'
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check if username/email is available
router.post('/check-availability', async (req, res) => {
  const { username, email } = req.body;
  
  try {
    const [existing] = await db.query(
      'SELECT user_id FROM Users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    res.json({
      available: existing.length === 0,
      message: existing.length === 0 ? 'Available' : 'Username or email already taken'
    });
    
  } catch (err) {
    console.error('Availability check error:', err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router;