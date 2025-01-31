const mongoose = require('mongoose');

// Subscription schema
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Method to check if a subscription is expired
subscriptionSchema.methods.isExpired = function () {
  return new Date(this.endDate) < new Date();
};

// Static method to get all expired subscriptions
subscriptionSchema.statics.getExpiredSubscriptions = async function () {
  return await this.find({ endDate: { $lt: new Date() } });
};

// Middleware to remove expired subscriptions automatically
subscriptionSchema.pre('save', function (next) {
  if (new Date(this.endDate) < new Date()) {
    next(new Error('Cannot save an expired subscription'));
  } else {
    next();
  }
});

// Middleware to automatically remove expired subscriptions periodically
subscriptionSchema.statics.deleteExpiredSubscriptions = async function () {
  const result = await this.deleteMany({ endDate: { $lt: new Date() } });
  console.log(`Deleted ${result.deletedCount} expired subscriptions.`);
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;

