# WhatsApp Lead Tracker - Database Schema

## Users

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  password: String,
  role: String,
  isActive: Boolean,
  isVerified: Boolean,
  whatsappBusinessNumber: String,
  company: String,
  industry: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Leads

```javascript
{
  _id: ObjectId,
  phoneNumber: String,
  name: String,
  email: String,
  status: String,
  priority: String,
  source: String,
  assignedTo: ObjectId,
  notes: [{
    text: String,
    createdBy: ObjectId,
    createdAt: Date
  }],
  followUpDate: Date,
  nextFollowUpReminder: Date,
  closedAt: Date,
  lostReason: String,
  totalValue: Number,
  currency: String,
  metadata: Map,
  createdAt: Date,
  updatedAt: Date
}
```

## Messages

```javascript
{
  _id: ObjectId,
  leadId: ObjectId,
  sender: String,
  phoneNumber: String,
  messageText: String,
  messageId: String,
  whatsappMessageId: String,
  timestamp: Date,
  status: String,
  mediaUrl: String,
  mediaType: String,
  isRead: Boolean,
  createdAt: Date
}
```

## LeadStatusHistory

```javascript
{
  _id: ObjectId,
  leadId: ObjectId,
  fromStatus: String,
  toStatus: String,
  changedBy: ObjectId,
  notes: String,
  timestamp: Date
}
```

## Subscriptions

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  plan: String,
  status: String,
  startDate: Date,
  endDate: Date,
  trialEndsAt: Date,
  monthlyPrice: Number,
  mpesaTransactionId: String,
  mpesaPhoneNumber: String,
  autoRenew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Analytics

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  totalLeads: Number,
  newLeads: Number,
  contactedLeads: Number,
  interestedLeads: Number,
  closedLeads: Number,
  lostLeads: Number,
  totalMessages: Number,
  totalConversions: Number,
  totalRevenue: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Notifications

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  title: String,
  message: String,
  isRead: Boolean,
  relatedLeadId: ObjectId,
  relatedSubscriptionId: ObjectId,
  createdAt: Date
}
```

## WebhookLog

```javascript
{
  _id: ObjectId,
  eventType: String,
  webhookType: String,
  payload: Object,
  processed: Boolean,
  processedAt: Date,
  error: String,
  createdAt: Date
}
```
