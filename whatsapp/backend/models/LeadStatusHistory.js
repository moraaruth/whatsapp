const mongoose = require('mongoose');

const leadStatusHistorySchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  fromStatus: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'LOST'],
    required: true,
  },
  toStatus: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'LOST'],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

leadStatusHistorySchema.index({ leadId: 1, timestamp: -1 });

module.exports = mongoose.model('LeadStatusHistory', leadStatusHistorySchema);
