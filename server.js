const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Factorial = require('./models/Factorial'); // Importing Factorial model
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000; // Use the port from environment or default to 5000

// Middleware to parse JSON and handle CORS
app.use(cors());
app.use(express.json());

// Root Route for Basic Confirmation
app.get('/', (req, res) => {
  res.send('Backend server is up and running!');
});

// MongoDB Connection using Mongoose
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Factorial Calculation Logic
function factorialIterative(n) {
  let result = 1;
  for (let i = 1; i <= n; i++) result *= i;
  return result;
}

function factorialRecursive(n) {
  return n <= 1 ? 1 : n * factorialRecursive(n - 1);
}

// API Route for calculating factorial
app.post('/api/factorial', async (req, res) => {
  const { number, method } = req.body;

  // Input validation
  if (typeof number !== 'number' || number < 0 || !['iterative', 'recursive'].includes(method)) {
    return res.status(400).json({ error: 'Invalid input. Enter a positive integer and valid method.' });
  }

  // Calculate the factorial based on the method selected (iterative or recursive)
  const result = method === 'iterative' ? factorialIterative(number) : factorialRecursive(number);

  // Save the result to MongoDB
  try {
    const record = new Factorial({ number, method, result });
    await record.save();
    res.json({ result });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.status(500).json({ error: 'Database error.' });
  }
});

// API Route for fetching the calculation history
app.get('/api/history', async (req, res) => {
  try {
    const history = await Factorial.find().sort({ calculatedAt: -1 }); // Sort history by most recent
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
