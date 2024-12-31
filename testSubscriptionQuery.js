require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./models/subscription');

const testQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected');

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    console.log('Testing subscription query...');
    const subscriptions = await Subscription.find({
      endDate: { $lte: sevenDaysFromNow, $gte: now },
    });

    console.log(`Found ${subscriptions.length} subscriptions.`);
    subscriptions.forEach(sub => {
      console.log(`Subscription ID: ${sub._id}, Service Name: ${sub.serviceName}`);
    });
  } catch (error) {
    console.error('❌ Query error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testQuery();
