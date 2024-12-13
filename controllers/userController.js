const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import the User model

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Registering user: ${email}`); // Debugging log

    // Log request body
    console.log(`Request body:`, req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Password hashed successfully`);

    const user = new User({ email, password: hashedPassword });
    console.log(`New user created:`, user);

    await user.save();
    console.log(`User registered successfully: ${email}`);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message); // Debugging log

    if (error.code === 11000) {
      // Duplicate email error
      res.status(400).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
};


// Login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`User attempting login: ${email}`); // Debugging log

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(`User logged in successfully: ${email}`); // Debugging log
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error.message); // Debugging log
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Protected route handler (Optional for reference)
const protectedRoute = (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
    userId: req.userId,
  });
};

module.exports = { registerUser, loginUser, protectedRoute };
