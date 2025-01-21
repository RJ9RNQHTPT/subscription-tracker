const mongoose = require('mongoose');

console.log('Initializing subscriptionSchema...');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

console.log('Subscription model initialized.');

module.exports = mongoose.model('Subscription', subscriptionSchema);
