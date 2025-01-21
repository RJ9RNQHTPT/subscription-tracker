// Updated index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware for parsing JSON
app.use(express.json());
// Configure CORS
const corsOptions = {
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));


// Debugging logs for incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Suppress Mongoose strictQuery warning
mongoose.set('strictQuery', true);

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
        console.error('❌ MongoDB connection failed:', error.message);
    });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Test route to verify backend is running
app.get('/test-mongo', async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection('users').find().toArray();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// Updated script.js
const API_BASE_URL = 'http://127.0.0.1:5000';

// Fetch and display subscriptions
async function fetchSubscriptions() {
    const subscriptionsList = document.getElementById('subscriptionsList');
    subscriptionsList.innerHTML = 'Loading subscriptions...';

    try {
        const response = await fetch(`${API_BASE_URL}/subscriptions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const subscriptions = await response.json();

        if (subscriptions.length === 0) {
            subscriptionsList.innerHTML = '<p>No subscriptions found.</p>';
            return;
        }

        subscriptionsList.innerHTML = '';
        subscriptions.forEach((sub) => {
            const div = document.createElement('div');
            div.className = 'subscription';
            div.innerHTML = `
                <strong>${sub.serviceName}</strong>
                <p>Start Date: ${new Date(sub.startDate).toLocaleDateString()}</p>
                <p>End Date: ${new Date(sub.endDate).toLocaleDateString()}</p>
            `;
            subscriptionsList.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        subscriptionsList.innerHTML = '<p>Error loading subscriptions.</p>';
    }
}





