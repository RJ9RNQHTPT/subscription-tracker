require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const Subscription = require('../models/subscription'); // Import the Subscription model

// Debugging logs to confirm .env variables and environment
console.log('NODE_ENV:', process.env.NODE_ENV); // Add this
console.log('MONGODB_URI:', process.env.MONGODB_URI); // Add this

const seedSubscriptions = async () => {
  try {
    // Connect to MongoDB using the URI from the .env file
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });

    // Seed subscriptions
    const subscriptions = [
      {
        userId: '676a7b3c781a47341f08403a',
        serviceName: 'Netflix',
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-31'),
      },
      {
        userId: '676a7b3c781a47341f08403a',
        serviceName: 'Spotify',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-27'),
      },
      {
        userId: '676a7b3c781a47341f08403a',
        serviceName: 'Disney+',
        startDate: new Date('2024-12-18'),
        endDate: new Date('2024-12-28'),
      },
    ];

    await Subscription.insertMany(subscriptions);
    console.log('Subscriptions seeded successfully.');
  } catch (error) {
    console.error('Error seeding subscriptions:', error.message);
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close(); // Ensure the connection is closed
      console.log('Database connection closed.');
    }
  }
};

seedSubscriptions();
