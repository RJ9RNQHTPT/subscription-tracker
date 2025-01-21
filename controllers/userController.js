const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[DEBUG] Incoming request to register user: ${email}`);

    // Hash the password
    console.log('[DEBUG] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[DEBUG] Password hashed successfully');

    // Create new user
    console.log('[DEBUG] Creating new user...');
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    console.log('[DEBUG] User object before saving:', newUser);
    const savedUser = await newUser.save();
    console.log('[DEBUG] User saved successfully:', savedUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('[DEBUG] Registration error:', error.message);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[DEBUG] User attempting login: ${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    // Generate JWT token with 7-day validity
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Include userId and email
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Extend expiration time to 7 days for testing
    );

    console.log(`[DEBUG] Token generated for user: ${email}`);
    res.json({ token });
  } catch (error) {
    console.error('[DEBUG] Login error:', error.message);
    res.status(500).json({ error: 'Error logging in' });
  }
};

module.exports = { registerUser, loginUser };
