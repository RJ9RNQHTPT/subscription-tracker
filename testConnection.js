require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB...');
console.log('URI:', uri);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
