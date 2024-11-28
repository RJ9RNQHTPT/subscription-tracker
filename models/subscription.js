const mongoose = require('mongoose');

// Debugging log for model initialization
console.log('Initializing subscriptionSchema...');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Match exported model name
  serviceName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

console.log('Subscription model initialized.'); // Confirmation log
module.exports = mongoose.model('Subscription', subscriptionSchema);
