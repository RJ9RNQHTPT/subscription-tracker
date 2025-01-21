const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription');
const authenticateToken = require('../utils/middleware/authenticateToken'); // Middleware

// Get all subscriptions for a user
router.get('/', authenticateToken, async (req, res) => {
  console.log('[GET /subscriptions] Request received');

  try {
    // Fetch subscriptions for authenticated user
    const subscriptions = await Subscription.find({ userId: req.user.userId });
    console.log('[GET /subscriptions] Subscriptions fetched:', subscriptions);
    res.json(subscriptions);
  } catch (error) {
    console.error('[GET /subscriptions] Error:', error.message);
    res.status(500).json({ error: 'Error fetching subscriptions' });
  }
});

// Add a new subscription
router.post('/', authenticateToken, async (req, res) => {
  console.log('[POST /subscriptions] Request received with data:', req.body);

  const { serviceName, startDate, endDate } = req.body;

  // Extract `userId` from `req.user` populated by authenticateToken
  const userId = req.user?.userId;
  console.log('[POST /subscriptions] Authenticated user ID:', userId);

  if (!serviceName || !startDate || !endDate || !userId) {
    console.error('[POST /subscriptions] Validation error: Missing fields');
    return res
      .status(400)
      .json({ error: 'All fields (serviceName, startDate, endDate, userId) are required' });
  }

  try {
    const newSubscription = new Subscription({
      userId,
      serviceName,
      startDate,
      endDate,
    });

    const savedSubscription = await newSubscription.save();
    console.log('[POST /subscriptions] Subscription saved:', savedSubscription);
    res.status(201).json(savedSubscription);
  } catch (error) {
    console.error('[POST /subscriptions] Server error:', error.message);
    res.status(500).json({ error: 'Error adding subscription' });
  }
});

// Delete a subscription
router.delete('/:id', authenticateToken, async (req, res) => {
  console.log(`[DELETE /subscriptions/${req.params.id}] Request received`);

  try {
    const deletedSubscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId, // Ensure user owns the subscription
    });

    if (!deletedSubscription) {
      return res.status(404).json({ error: 'Subscription not found or not authorized' });
    }

    console.log('[DELETE /subscriptions] Subscription deleted:', deletedSubscription);
    res.json({ message: 'Subscription deleted successfully', deletedSubscription });
  } catch (error) {
    console.error('[DELETE /subscriptions] Error:', error.message);
    res.status(500).json({ error: 'Error deleting subscription' });
  }
});

module.exports = router;


