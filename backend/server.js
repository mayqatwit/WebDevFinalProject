const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://Cluster48451:RHrEmKEJYCDio9cj@cluster48451.jqo5amn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster48451', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cookbook = mongoose.model('cookbook', {
  title: String,
  description: String,
  shared: Boolean,
});

// Routes
app.get('/cookbooks', async (req, res) => {
  const books = await Cookbook.find();
  res.json(books);
});

app.post('/cookbooks', async (req, res) => {
  const book = new Cookbook(req.body);
  await book.save();
  res.status(201).json(book);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));