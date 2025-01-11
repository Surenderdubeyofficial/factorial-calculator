const mongoose = require('mongoose');

const factorialSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    method: { type: String, enum: ['iterative', 'recursive'], required: true },
    result: { type: Number, required: true },
    calculatedAt: { type: Date, default: Date.now },
});

const Factorial = mongoose.model('Factorial', factorialSchema);
module.exports = Factorial;
