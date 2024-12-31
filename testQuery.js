const mongoose = require('mongoose');
const Subscription = require('./models/subscription'); // Adjust path as needed
require('dotenv').config();

const runTestQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });

    console.log('✅ MongoDB connected');
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const results = await Subscription.find({
      endDate: { $lte: sevenDaysFromNow, $gte: now },
    });
    console.log('Query results:', results);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Test query error:', error);
    mongoose.connection.close();
  }
};

runTestQuery();
