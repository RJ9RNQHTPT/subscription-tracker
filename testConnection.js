require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB...');
console.log('URI:', uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds for a server selection
  socketTimeoutMS: 30000, // Wait 30 seconds for socket operations
})
  .then(() => {
    console.log('✅ MongoDB connected');
    process.exit(0); // Exit after successful connection
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit on failure
  });
