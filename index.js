process.on('warning', (warning) => { 
  if (warning.name === 'DeprecationWarning') {
    console.warn(warning.stack);
  }
});

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const sendReminderEmail = require('./utils/sendReminderEmail'); // Import the reminder function

dotenv.config();

const app = express();
app.use(express.json());

// Enable Mongoose debug mode for logging queries (optional)
mongoose.set('debug', true);
mongoose.set('strictQuery', false); // Suppress Mongoose strictQuery warning

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Schedule a cron job to run sendReminderEmail.js daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Cron job started: Sending reminder emails...');
  try {
    require('./utils/sendReminderEmail'); // Execute the script
  } catch (error) {
    console.error('❌ Error executing reminder emails:', error.message);
  }
  console.log('✅ Cron job completed: Reminder emails sent');
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
