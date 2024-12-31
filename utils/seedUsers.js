const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path if needed

const seedUsers = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
  });

  try {
    const users = [
      { email: 'user1@example.com', password: 'Password1' },
      { email: 'user2@example.com', password: 'Password2' },
      { email: 'user3@example.com', password: 'Password3' },
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully.');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers();
