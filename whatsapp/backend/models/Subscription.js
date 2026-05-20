const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  plan: {
    type: String,
    enum: ['BASIC', 'PRO', 'ENTERPRISE'],
    default: 'BASIC',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'TRIAL', 'PENDING', 'CANCELLED', 'EXPIRED'],
    default: 'TRIAL',
    index: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  monthlyPrice: {
    type: Number,
    default: 1000, // KES
  },
  mpesaTransactionId: {
    type: String,
    index: true,
  },
  mpesaPhoneNumber: {
    type: String,
    trim: true,
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
