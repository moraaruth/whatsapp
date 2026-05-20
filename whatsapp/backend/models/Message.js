const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  sender: {
    type: String,
    enum: ['customer', 'business', 'system'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  messageText: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    unique: true,
    index: true,
  },
  whatsappMessageId: {
    type: String,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['DELIVERED', 'READ', 'SENT', 'FAILED'],
    default: 'SENT',
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LOCATION', 'CONTACT'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster message retrieval
messageSchema.index({ leadId: 1, timestamp: 1 });
messageSchema.index({ whatsappMessageId: 1 });

module.exports = mongoose.model('Message', messageSchema);
