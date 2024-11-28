const mongoose = require('mongoose');

// Debugging log for model initialization
console.log('Initializing userSchema...');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema); // Match the 'ref' in subscription.js
console.log('User model initialized.'); // Confirmation log

module.exports = User;


