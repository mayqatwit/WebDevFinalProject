const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const cookbookRoutes = require('./routes/cookbooks');
app.use('/api/cookbooks', cookbookRoutes);

const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

const stepRoutes = require('./routes/recipeSteps');
app.use('/api/recipeSteps', stepRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});