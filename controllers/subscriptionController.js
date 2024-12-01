const Subscription = require('../models/subscription');

// Create a subscription
const createSubscription = async (req, res) => {
  try {
    const { serviceName, startDate, endDate } = req.body;
    const subscription = new Subscription({
      userId: req.userId,
      serviceName,
      startDate,
      endDate,
    });
    await subscription.save();
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

// Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, startDate, endDate } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { serviceName, startDate, endDate },
      { new: true }
    );

    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    res.status(200).json({ message: 'Subscription updated successfully', subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOneAndDelete({ _id: id, userId: req.userId });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
};


