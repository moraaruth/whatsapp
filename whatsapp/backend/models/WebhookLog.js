const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['MESSAGE_RECEIVED', 'MESSAGE_SENT', 'MESSAGE_DELIVERED', 'MESSAGE_READ', 'STATUS_UPDATE'],
    required: true,
  },
  webhookType: {
    type: String,
    enum: ['WHATSAPP', 'MPESA'],
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  processedAt: {
    type: Date,
  },
  error: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

webhookLogSchema.index({ webhookType: 1, processed: 1 });
webhookLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WebhookLog', webhookLogSchema);
