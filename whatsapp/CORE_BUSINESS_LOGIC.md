# WhatsApp Lead Tracker - Core Business Logic

## WhatsApp Message to Lead Conversion

### Step-by-Step Process

```javascript
// 1. Webhook receives message
POST /webhook/whatsapp
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "254712345678",
          "text": { "body": "Hello, I want to buy a car" }
        }]
      }
    }]
  }]
}

// 2. Extract phone number
const phoneNumber = message.from.replace('c:', ''); // "254712345678"

// 3. Check if lead exists
let lead = await Lead.findOne({ phoneNumber });

// 4. If new lead, create it
if (!lead) {
  lead = new Lead({
    phoneNumber,
    name: phoneNumber, // Default name
    status: 'NEW',
    source: 'WHATSAPP',
    assignedTo: null // Will be assigned later
  });
  await lead.save();
  
  // Create status history
  await LeadStatusHistory.create({
    leadId: lead._id,
    fromStatus: 'NONE',
    toStatus: 'NEW',
    timestamp: new Date()
  });
}

// 5. Create message record
const messageRecord = new Message({
  leadId: lead._id,
  sender: 'customer',
  phoneNumber,
  messageText: message.text.body,
  messageId: uuidv4(),
  whatsappMessageId: message.id,
  timestamp: new Date(message.timestamp * 1000),
  status: 'DELIVERED'
});
await messageRecord.save();

// 6. Update analytics
await updateAnalytics(lead._id, 'NEW');

// 7. Auto-reply (optional)
await WhatsAppService.sendMessage(
  phoneNumber,
  'Thank you for contacting us! A representative will get back to you shortly.'
);

// 8. Return result
return {
  lead,
  message: messageRecord,
  isNewLead: !existingLead
};
```

### Deduplication Logic

```javascript
// Phone number is the primary identifier
// Handle different phone number formats
function normalizePhoneNumber(phoneNumber) {
  // Remove spaces, dashes, parentheses
  let normalized = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Handle Kenya format variations
  if (normalized.startsWith('0')) {
    normalized = '254' + normalized.substring(1);
  } else if (normalized.startsWith('+254')) {
    normalized = '254' + normalized.substring(4);
  }
  
  return normalized;
}

// Check for existing lead
const normalizedPhone = normalizePhoneNumber(phoneNumber);
const existingLead = await Lead.findOne({ 
  phoneNumber: { $regex: new RegExp(normalizedPhone) } 
});
```

## Lead Status Lifecycle

### Status Transitions

```
NEW → CONTACTED → INTERESTED → CLOSED
         ↓
        LOST
```

### Status Change Logic

```javascript
async function updateLeadStatus(leadId, newStatus, changedBy, notes = null) {
  const lead = await Lead.findById(leadId);
  
  if (!lead) {
    throw new Error('Lead not found');
  }
  
  const oldStatus = lead.status;
  
  // Validate status transition
  const validTransitions = {
    'NEW': ['CONTACTED', 'LOST'],
    'CONTACTED': ['INTERESTED', 'LOST'],
    'INTERESTED': ['CLOSED', 'LOST'],
    'CLOSED': [], // Cannot change from CLOSED
    'LOST': [] // Cannot change from LOST
  };
  
  if (!validTransitions[oldStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition: ${oldStatus} → ${newStatus}`);
  }
  
  // Update lead
  lead.status = newStatus;
  lead.updatedAt = new Date();
  
  if (newStatus === 'CLOSED') {
    lead.closedAt = new Date();
  } else if (newStatus === 'LOST') {
    lead.lostReason = notes || lead.lostReason;
  }
  
  await lead.save();
  
  // Create status history
  await LeadStatusHistory.create({
    leadId: lead._id,
    fromStatus: oldStatus,
    toStatus: newStatus,
    changedBy: changedBy || null,
    notes,
    timestamp: new Date()
  });
  
  // Update analytics
  await updateAnalytics(lead._id, newStatus, oldStatus);
  
  return lead;
}
```

### Auto-Status Assignment

```javascript
// When message received from NEW lead
if (lead.status === 'NEW') {
  lead.status = 'CONTACTED';
  await lead.save();
  
  // Create status history
  await LeadStatusHistory.create({
    leadId: lead._id,
    fromStatus: 'NEW',
    toStatus: 'CONTACTED',
    timestamp: new Date()
  });
}

// When customer sends follow-up message
if (lead.status === 'CONTACTED') {
  // Check for keywords indicating interest
  const interestKeywords = ['interested', 'price', 'buy', 'purchase', 'cost'];
  const hasInterest = interestKeywords.some(keyword => 
    messageText.toLowerCase().includes(keyword)
  );
  
  if (hasInterest) {
    lead.status = 'INTERESTED';
    await lead.save();
  }
}

// When lead is closed
if (lead.status === 'INTERESTED' && messageText.includes('deal') || messageText.includes('agreed')) {
  lead.status = 'CLOSED';
  lead.closedAt = new Date();
  await lead.save();
}
```

## Follow-Up Logic

### Setting Follow-Ups

```javascript
async function setFollowUp(leadId, followUpDate, userId) {
  const lead = await Lead.findById(leadId);
  
  if (!lead) {
    throw new Error('Lead not found');
  }
  
  lead.followUpDate = followUpDate;
  lead.nextFollowUpReminder = followUpDate;
  lead.updatedAt = new Date();
  
  await lead.save();
  
  // Create notification for follow-up
  await Notification.create({
    userId: lead.assignedTo,
    type: 'REMINDER',
    title: 'Follow-up Due',
    message: `Follow up with ${lead.name} (${lead.phoneNumber}) on ${followUpDate}`,
    isRead: false,
    relatedLeadId: lead._id
  });
  
  return lead;
}
```

### Cron Job for Follow-Up Reminders

```javascript
// cron.js
const cron = require('node-cron');
const LeadService = require('./services/LeadService');
const WhatsAppService = require('./services/WhatsAppService');

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find leads with follow-up due today
    const leads = await LeadService.getFollowUpLeads();
    
    for (const lead of leads) {
      // Send WhatsApp reminder
      await WhatsAppService.sendMessage(
        lead.phoneNumber,
        `Hi ${lead.name}, this is a follow-up reminder. We'll be in touch soon!`
      );
      
      // Update follow-up date (next week)
      const nextFollowUp = new Date();
      nextFollowUp.setDate(today.getDate() + 7);
      
      lead.followUpDate = nextFollowUp;
      lead.nextFollowUpReminder = nextFollowUp;
      await lead.save();
    }
    
    console.log(`Processed ${leads.length} follow-ups`);
  } catch (error) {
    console.error('Follow-up cron job error:', error);
  }
});
```

## Subscription Gating

### Check Subscription Status

```javascript
async function checkSubscriptionStatus(userId) {
  const subscription = await Subscription.findOne({ userId })
    .sort({ createdAt: -1 });
  
  if (!subscription) {
    return {
      isActive: false,
      isTrial: true,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }
  
  const now = new Date();
  const isActive = subscription.status === 'ACTIVE' && 
                   (!subscription.endDate || subscription.endDate > now);
  const isTrial = subscription.status === 'TRIAL' && 
                  (!subscription.trialEndsAt || subscription.trialEndsAt > now);
  
  return {
    isActive,
    isTrial,
    trialEndsAt: subscription.trialEndsAt,
    plan: subscription.plan,
    status: subscription.status
  };
}
```

### Middleware for Subscription Check

```javascript
// middleware/subscriptionCheck.js
const SubscriptionService = require('../services/SubscriptionService');

async function requireSubscription(req, res, next) {
  const userId = req.user.id;
  const status = await SubscriptionService.checkSubscriptionStatus(userId);
  
  if (!status.isActive && !status.isTrial) {
    return res.status(403).json({
      success: false,
      message: 'Your subscription has expired. Please renew to continue using the service.'
    });
  }
  
  next();
}

module.exports = requireSubscription;
```

### Usage in Routes

```javascript
// routes/leads.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const requireSubscription = require('../middleware/subscriptionCheck');

// All lead routes require subscription
router.use(protect, requireSubscription);

router.get('/', LeadController.getAllLeads);
router.get('/:id', LeadController.getLeadById);
// ... other routes
```

## Analytics Calculation

### Daily Analytics Update

```javascript
async function updateAnalytics(leadId, newStatus, oldStatus = null) {
  const lead = await Lead.findById(leadId);
  if (!lead) return;
  
  const userId = lead.assignedTo;
  if (!userId) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find or create daily analytics
  let analytics = await Analytics.findOne({
    userId,
    date: today
  });
  
  if (!analytics) {
    analytics = new Analytics({
      userId,
      date: today
    });
  }
  
  // Recalculate all stats
  analytics.totalLeads = await Lead.countDocuments({ assignedTo: userId });
  analytics.newLeads = await Lead.countDocuments({ assignedTo: userId, status: 'NEW' });
  analytics.contactedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'CONTACTED' });
  analytics.interestedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'INTERESTED' });
  analytics.closedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'CLOSED' });
  analytics.lostLeads = await Lead.countDocuments({ assignedTo: userId, status: 'LOST' });
  
  // Update messages count
  const leadIds = await Lead.find({ assignedTo: userId }).distinct('_id');
  analytics.totalMessages = await Message.countDocuments({ leadId: { $in: leadIds } });
  
  // Update conversions and revenue
  analytics.totalConversions = analytics.closedLeads;
  
  const closedLeads = await Lead.find({ 
    assignedTo: userId, 
    status: 'CLOSED' 
  }).select('totalValue');
  
  analytics.totalRevenue = closedLeads.reduce((sum, lead) => sum + (lead.totalValue || 0), 0);
  
  await analytics.save();
}
```

### Dashboard Stats

```javascript
async function getDashboardStats(userId) {
  const [totalLeads, newLeads, closedLeads, interestedLeads, totalMessages] = await Promise.all([
    Lead.countDocuments({ assignedTo: userId }),
    Lead.countDocuments({ assignedTo: userId, status: 'NEW' }),
    Lead.countDocuments({ assignedTo: userId, status: 'CLOSED' }),
    Lead.countDocuments({ assignedTo: userId, status: 'INTERESTED' }),
    Message.countDocuments({ leadId: { $in: await Lead.find({ assignedTo: userId }).distinct('_id') } })
  ]);
  
  const closedLeadsData = await Lead.find({ 
    assignedTo: userId, 
    status: 'CLOSED' 
  }).select('totalValue');
  
  const totalRevenue = closedLeadsData.reduce((sum, lead) => sum + (lead.totalValue || 0), 0);
  
  return {
    totalLeads,
    newLeads,
    closedLeads,
    interestedLeads,
    totalMessages,
    totalRevenue
  };
}
```

## Search Functionality

### Lead Search

```javascript
async function searchLeads(userId, searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  
  const leads = await Lead.find({
    assignedTo: userId,
    $or: [
      { name: regex },
      { phoneNumber: regex },
      { email: regex },
      { 'notes.text': regex }
    ]
  }).sort({ createdAt: -1 });
  
  return leads;
}
```

### Advanced Search with Filters

```javascript
async function getLeadsByUser(userId, filters = {}) {
  const query = { assignedTo: userId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.source) {
    query.source = filters.source;
  }
  
  if (filters.followUp) {
    const now = new Date();
    query.followUpDate = { $lte: now };
  }
  
  return await Lead.find(query)
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'firstName lastName email');
}
```

## Notification System

### Create Notification

```javascript
async function createNotification(userId, type, title, message, relatedLeadId = null) {
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    isRead: false,
    relatedLeadId
  });
  
  await notification.save();
  
  return notification;
}

// Usage examples
await createNotification(
  userId,
  'REMINDER',
  'Follow-up Due',
  'Follow up with John Doe (254712345678) today',
  leadId
);

await createNotification(
  userId,
  'ALERT',
  'New Lead',
  'You have a new lead from WhatsApp',
  leadId
);

await createNotification(
  userId,
  'PAYMENT',
  'Subscription Renewal',
  'Your subscription expires in 3 days',
  subscriptionId
);
```

## Priority Assignment

### Auto-Priority Based on Keywords

```javascript
function assignPriority(messageText) {
  const urgentKeywords = ['urgent', 'immediately', 'asap', 'emergency', 'critical'];
  const highKeywords = ['price', 'buy', 'purchase', 'cost', 'available'];
  const mediumKeywords = ['info', 'information', 'details', 'question'];
  
  const text = messageText.toLowerCase();
  
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return 'URGENT';
  }
  
  if (highKeywords.some(keyword => text.includes(keyword))) {
    return 'HIGH';
  }
  
  if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

// Usage
const lead = new Lead({
  // ... other fields
  priority: assignPriority(messageText)
});
```

## Lead Assignment Logic

### Auto-Assignment

```javascript
async function assignLead(leadId, userId) {
  const lead = await Lead.findById(leadId);
  
  if (!lead) {
    throw new Error('Lead not found');
  }
  
  lead.assignedTo = userId;
  lead.updatedAt = new Date();
  
  // If new lead, auto-update status
  if (lead.status === 'NEW') {
    lead.status = 'CONTACTED';
  }
  
  await lead.save();
  
  // Create status history
  await LeadStatusHistory.create({
    leadId: lead._id,
    fromStatus: lead.status === 'CONTACTED' ? 'NEW' : 'NONE',
    toStatus: lead.status,
    changedBy: userId,
    timestamp: new Date()
  });
  
  // Create notification
  await createNotification(
    userId,
    'ALERT',
    'New Lead Assigned',
    `You have been assigned a new lead: ${lead.name}`,
    lead._id
  );
  
  return lead;
}
```

### Round-Robin Assignment

```javascript
async function assignLeadRoundRobin() {
  // Find users with least leads
  const users = await User.find({ role: 'user', isActive: true })
    .select('_id firstName lastName')
    .sort('leadCount')
    .limit(1);
  
  if (users.length === 0) return null;
  
  return users[0]._id;
}
```

## Data Export

### Export Leads to CSV

```javascript
async function exportLeads(userId) {
  const leads = await Lead.find({ assignedTo: userId })
    .select('name phoneNumber email status priority createdAt totalValue')
    .sort({ createdAt: -1 });
  
  // Convert to CSV
  const headers = ['Name', 'Phone', 'Email', 'Status', 'Priority', 'Created', 'Value'];
  const rows = leads.map(lead => [
    lead.name,
    lead.phoneNumber,
    lead.email || '',
    lead.status,
    lead.priority,
    lead.createdAt.toISOString().split('T')[0],
    lead.totalValue || 0
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  return csv;
}
```

## Data Retention

### Cleanup Old Data

```javascript
// cron/cleanup.js
const cron = require('node-cron');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const WebhookLog = require('../models/WebhookLog');

// Delete old messages (keep 90 days)
cron.schedule('0 3 * * *', async () => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  await Message.deleteMany({ createdAt: { $lt: ninetyDaysAgo } });
  console.log('Cleaned up old messages');
});

// Delete old notifications (keep 30 days)
cron.schedule('0 4 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await Notification.deleteMany({ 
    createdAt: { $lt: thirtyDaysAgo },
    isRead: true
  });
  console.log('Cleaned up old notifications');
});

// Delete old webhook logs (keep 30 days)
cron.schedule('0 5 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await WebhookLog.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
  console.log('Cleaned up old webhook logs');
});
```
