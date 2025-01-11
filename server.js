const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Factorial = require('./models/Factorial');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection

const mongoURI = process.env.MONGO_URI; // Get URI from environment variable

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


// Factorial Logic
function factorialIterative(n) {
    let result = 1;
    for (let i = 1; i <= n; i++) result *= i;
    return result;
}

function factorialRecursive(n) {
    return n <= 1 ? 1 : n * factorialRecursive(n - 1);
}

// API Routes
app.post('/api/factorial', async (req, res) => {
    const { number, method } = req.body;

    if (typeof number !== 'number' || number < 0 || !['iterative', 'recursive'].includes(method)) {
        return res.status(400).json({ error: 'Invalid input. Enter a positive integer and valid method.' });
    }

    const result = method === 'iterative' ? factorialIterative(number) : factorialRecursive(number);

    // Save to database
    try {
        const record = new Factorial({ number, method, result });
        await record.save();
        res.json({ result });
    } catch (error) {
        console.error('Error saving to database:', error);
        res.status(500).json({ error: 'Database error.' });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await Factorial.find().sort({ calculatedAt: -1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
