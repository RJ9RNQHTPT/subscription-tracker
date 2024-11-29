const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Joi = require('joi'); // Import Joi for validation

// Import Models
const User = require('./models/user');
const Subscription = require('./models/subscription');

// Email-Sending Function
const sendReminderEmail = async (email, subscription) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
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
app.use(express.json());

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

// Joi Schemas for Validation
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const subscriptionSchema = Joi.object({
  serviceName: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
});

// Routes

// [Route: Home]
app.get('/', (req, res) => {
  res.send('Welcome to Subscription Tracker API');
});

// [Route: Register]
app.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

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

// [Route: Login]
app.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

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

// [Route: Protected]
app.get('/protected', verifyJWT, (req, res) => {
  res.status(200).json({ message: 'You have accessed a protected route!', userId: req.userId });
});

// [Route: Create Subscription]
app.post('/subscriptions', verifyJWT, async (req, res) => {
  const { error } = subscriptionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { serviceName, startDate, endDate } = req.body;
    const subscription = new Subscription({ userId: req.userId, serviceName, startDate, endDate });
    await subscription.save();
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// [Route: Get Subscriptions]
app.get('/subscriptions', verifyJWT, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subscriptions' });
  }
});

// [Route: Update Subscription]
app.put('/subscriptions/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const { error } = subscriptionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { serviceName, startDate, endDate } = req.body;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { serviceName, startDate, endDate },
      { new: true }
    );

    if (!updatedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// [Route: Delete Subscription]
app.delete('/subscriptions/:id', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubscription = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// Subscription Reminder Scheduler
cron.schedule('0 9 * * *', async () => {
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
      sendReminderEmail(process.env.EMAIL_USER, subscription);
    });

    console.log('✅ Reminder check completed.');
  } catch (error) {
    console.error('❌ Error during reminder check:', error);
  }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




