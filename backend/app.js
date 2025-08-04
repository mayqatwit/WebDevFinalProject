const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/data', (req, res) => {
  db.query('SELECT * FROM Cookbooks', (err, results) => {
    if (err) {
      console.error('Query error:', err);
      res.status(500).send('Database error');
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});