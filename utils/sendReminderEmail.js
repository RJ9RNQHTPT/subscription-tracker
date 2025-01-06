require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('../models/subscription');
const nodemailer = require('nodemailer');

// Utility function to validate email addresses
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function to send a single email reminder
const sendReminderEmail = async (recipientEmail, subscription) => {
  if (!isValidEmail(recipientEmail)) {
    console.error(`❌ Invalid email address: ${recipientEmail}`);
    return; // Exit the function if email is invalid
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Reminder: ${subscription.serviceName} Subscription Ending Soon`,
    text: `Hi, your subscription to "${subscription.serviceName}" will end on ${subscription.endDate}. Please renew if you'd like to continue.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Reminder email sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${recipientEmail}:`, error.message);
    console.error('Full Error Details:', error);
  }
};

// Main function to fetch subscriptions and send reminders
const sendReminderEmails = async () => {
  console.log('Script started');

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database');

    console.log('Fetching subscriptions with reminders due...');
    const subscriptions = await Subscription.find({
      endDate: { $lte: new Date(new Date().setDate(new Date().getDate() + 7)) },
    });

    console.log('Fetched subscriptions:', subscriptions);

    for (const subscription of subscriptions) {
      console.log(`Preparing to send email for subscription: ${subscription.serviceName}`);
      await sendReminderEmail(process.env.EMAIL_USER, subscription); // Replace with user's email if needed
    }

    console.log('Email reminders logic executed successfully');
  } catch (error) {
    console.error('Error in sending reminders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function
sendReminderEmails();
