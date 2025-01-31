const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

// Ensure MONGODB_URI is defined
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined. Please check your .env file.");
    process.exit(1); // Stop execution if no URI is provided
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static(path.join(__dirname, '/')));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err.message);
    });

// Serve Manifest
app.get('/site.webmanifest', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    fs.createReadStream(path.join(__dirname, 'site.webmanifest')).pipe(res);
});

// Test Route
app.get('/', (req, res) => {
    res.send("🚀 Subscription Tracker API is Running...");
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
});









