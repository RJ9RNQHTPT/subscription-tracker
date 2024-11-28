const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cron = require('node-cron'); // Import node-cron for scheduling tasks
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails

// Import Models
const User = require('./models/user');
const Subscription = require('./models/subscription');

// Email-Sending Function
const sendReminderEmail = async (email, subscription) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail email service
    auth: {
      user: process.env.EMAIL_USER, // Use EMAIL_USER from .env
      pass: process.env.EMAIL_PASS, // Use EMAIL_PASS from .env
    },
    debug: true, // Enable debugging
    logger: true, // Log email details to the console
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email from .env
    to: email,
    subject: 'Subscription Reminder',
    text: `Hi! Your subscription to "${subscription.serviceName}" will end on ${subscription.endDate}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Reminder email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// JWT Verification Middleware
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Subscription Tracker API');
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/protected', verifyJWT, (req, res) => {
  res.status(200).json({ message: 'You have accessed a protected route!', userId: req.userId });
});

app.post('/subscriptions', verifyJWT, async (req, res) => {
  try {
    const { serviceName, startDate, endDate } = req.body;
    const subscription = new Subscription({ userId: req.userId, serviceName, startDate, endDate });
    await subscription.save();
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Subscription Reminder Scheduler
cron.schedule('* * * * *', async () => {
  console.log('🔔 Running subscription reminder check...');
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  try {
    const subscriptions = await Subscription.find({
      endDate: { $gte: today, $lte: nextWeek },
    });

    subscriptions.forEach((subscription) => {
      console.log(`📬 Reminder: Subscription "${subscription.serviceName}" ends on ${subscription.endDate}`);
      sendReminderEmail('user-email@example.com', subscription); // Replace with the user's email
    });

    console.log('✅ Reminder check completed.');
  } catch (error) {
    console.error('❌ Error during reminder check:', error);
  }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

