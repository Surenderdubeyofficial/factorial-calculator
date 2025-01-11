const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// In-memory history storage (you can use a database if required)
let history = [];

// Route to calculate factorial
app.post('/api/factorial', (req, res) => {
    const { number, method } = req.body;

    if (number === undefined || number < 0) {
        return res.status(400).json({ message: 'Invalid input. Provide a non-negative number.' });
    }

    try {
        const result =
            method === 'iterative' ? factorialIterative(number) : factorialRecursive(number);
        const record = { id: Date.now(), number, method, result }; // Adding unique 'id' for each record
        history.push(record);
        return res.json({ result });
    } catch (error) {
        console.error('Error calculating factorial:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to fetch history
app.get('/api/history', (req, res) => {
    res.json(history);
});

// Route to clear all history
app.delete('/api/history', (req, res) => {
    history = [];
    res.json({ message: 'All calculation history cleared successfully.' });
});

// Route to delete a specific history entry by ID
app.delete('/api/history/:id', (req, res) => {
    const { id } = req.params;
    history = history.filter((record) => record.id !== parseInt(id));
    res.json({ message: `History record with ID: ${id} deleted successfully.` });
});

// Iterative factorial function
function factorialIterative(n) {
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Recursive factorial function
function factorialRecursive(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorialRecursive(n - 1);
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
