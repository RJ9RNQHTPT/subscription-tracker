require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./models/subscription'); // Adjust path if necessary

async function testQuery() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');

    // Define date range for reminders
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    console.log(`Querying for subscriptions ending between ${now} and ${sevenDaysFromNow}...`);

    // Execute the query
    const subscriptions = await Subscription.find({
      endDate: { $lte: sevenDaysFromNow, $gte: now },
    });

    console.log('Query results:', subscriptions);
  } catch (error) {
    console.error('Error while querying subscriptions:', error.message);
  } finally {
    mongoose.connection.close(); // Ensure the connection is closed after execution
    console.log('MongoDB connection closed');
  }
}

testQuery();
