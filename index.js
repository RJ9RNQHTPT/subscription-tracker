const cors = require('cors');
const express = require('express');

// Initialize Express app
const app = express();

// Allow specific origins
const corsOptions = {
    origin: ['http://127.0.0.1:8080', 'https://my-subscription-reminder.herokuapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
};

app.use(cors(corsOptions)); // Apply CORS configuration
app.use(express.json()); // Parse JSON bodies

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const sendReminderEmail = require('./utils/sendReminderEmail'); // Import the reminder function

// Load environment variables
dotenv.config();

// Utility function to get the current timestamp for logs
const getCurrentTimestamp = () => {
    return new Date().toLocaleString();
};

// Suppress Mongoose strictQuery warning
mongoose.set('strictQuery', true);

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`[${getCurrentTimestamp()}] ✅ MongoDB connected`);
    })
    .catch((error) => {
        console.error(`[${getCurrentTimestamp()}] ❌ MongoDB connection failed:`, error.message);
    });

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Schedule the cron job to send email reminders daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log(`[${getCurrentTimestamp()}] 🕒 Starting daily email reminders task...`);
    try {
        await sendReminderEmail();
        console.log(`[${getCurrentTimestamp()}] ✅ Daily email reminders task completed successfully.`);
    } catch (error) {
        console.error(`[${getCurrentTimestamp()}] ❌ Error executing daily email reminders task:`, error.message);
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[${getCurrentTimestamp()}] ✅ Server running on port ${PORT}`);
});

