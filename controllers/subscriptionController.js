const Subscription = require('../models/subscription');

// Create a subscription
const createSubscription = async (req, res) => {
  try {
    const { userId, serviceName, startDate, endDate } = req.body;
    const subscription = new Subscription({ userId, serviceName, startDate, endDate });
    await subscription.save();
    console.log('Subscription created successfully:', subscription); // Debugging log
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error.message); // Debugging log
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

// Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    console.log('Fetched all subscriptions:', subscriptions); // Debugging log
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error.message); // Debugging log
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching subscription with ID: ${id}`); // Debugging log
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      console.log(`No subscription found for ID: ${id}`); // Debugging log
      return res.status(404).json({ error: 'Subscription not found' });
    }
    console.log('Subscription fetched successfully:', subscription); // Debugging log
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error.message); // Debugging log
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, startDate, endDate } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { serviceName, startDate, endDate },
      { new: true }
    );
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    console.log('Subscription updated successfully:', subscription); // Debugging log
    res.status(200).json({ message: 'Subscription updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription:', error.message); // Debugging log
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    console.log('Subscription deleted successfully:', subscription); // Debugging log
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error.message); // Debugging log
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};



