const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  totalLeads: {
    type: Number,
    default: 0,
  },
  newLeads: {
    type: Number,
    default: 0,
  },
  contactedLeads: {
    type: Number,
    default: 0,
  },
  interestedLeads: {
    type: Number,
    default: 0,
  },
  closedLeads: {
    type: Number,
    default: 0,
  },
  lostLeads: {
    type: Number,
    default: 0,
  },
  totalMessages: {
    type: Number,
    default: 0,
  },
  totalConversions: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
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

analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
