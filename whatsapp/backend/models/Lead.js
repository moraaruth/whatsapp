const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    index: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'LOST'],
    default: 'NEW',
    index: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  },
  source: {
    type: String,
    enum: ['WHATSAPP', 'WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER'],
    default: 'WHATSAPP',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  notes: [
    {
      text: {
        type: String,
        required: true,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  followUpDate: {
    type: Date,
  },
  nextFollowUpReminder: {
    type: Date,
  },
  closedAt: {
    type: Date,
  },
  lostReason: {
    type: String,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'KES',
  },
  metadata: {
    type: Map,
    of: String,
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

// Index for faster queries
leadSchema.index({ phoneNumber: 1, status: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
