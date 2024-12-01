const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT'); // Import JWT middleware
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Route
router.get('/protected', verifyJWT, (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
    userId: req.userId, // From verifyJWT middleware
  });
});

module.exports = router;

