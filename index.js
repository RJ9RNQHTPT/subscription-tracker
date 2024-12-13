const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();

const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const Subscription = require('./models/subscription');
const sendReminderEmail = require('./utils/sendReminderEmail');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  connectTimeoutMS: 10000, // 10 seconds connection timeout
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Exit the application if the database connection fails
  });




// Function to run the subscription reminder check
const runSubscriptionReminderCheck = async () => {
  console.log('🔔 Running subscription reminder check...');
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  try {
    const subscriptions = await Subscription.find({
      endDate: { $lte: sevenDaysFromNow, $gte: now }
    }).populate('userId'); // Populate userId to get email

    for (const subscription of subscriptions) {
      const recipientEmail = subscription.userId.email; // Ensure email exists
      if (recipientEmail) {
        await sendReminderEmail(recipientEmail, subscription);
      } else {
        console.warn(`⚠️ No email found for user with ID: ${subscription.userId}`);
      }
    }

    console.log('✅ Reminder check completed.');
  } catch (error) {
    console.error('❌ Error while running subscription reminders:', error);
  }
};

// Schedule the reminder email task to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('🔔 Running subscription reminder check...');
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  try {
    console.log('🔍 Fetching subscriptions ending within 7 days...');
    const subscriptions = await Subscription.find({
      endDate: { $lte: sevenDaysFromNow, $gte: now },
    });

    console.log('✅ Subscriptions fetched:', subscriptions);

    for (const subscription of subscriptions) {
      console.log(`📧 Sending email to user ${subscription.userId}...`);
      await sendReminderEmail(subscription.userId, subscription);
    }

    console.log('✅ Reminder check completed.');
  } catch (error) {
    console.error('❌ Error while running subscription reminders:', error.message);
  }
});


// Manually trigger the function for testing purposes
runSubscriptionReminderCheck();

app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

