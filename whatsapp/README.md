# WhatsApp Lead-to-Sale Tracker System

A complete production-grade SaaS product for WhatsApp-first businesses in Kenya. This system helps businesses capture WhatsApp messages as structured leads, track lead lifecycle, store conversation history, and monetize via M-Pesa subscriptions.

## 🎯 Product Overview

This system enables WhatsApp-first businesses to:
- Capture WhatsApp messages as structured leads
- Track lead lifecycle: NEW → CONTACTED → INTERESTED → CLOSED → LOST
- Store full conversation history
- Assign follow-ups
- Provide sales dashboard
- Improve conversion rates from WhatsApp inquiries
- Monetize via subscription payments using M-Pesa

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WhatsApp User                                  │
│                         (Customer/Prospect)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WhatsApp Cloud API                                  │
│                         (Meta Webhook)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  /webhook/whatsapp  →  Process Message → Create/Update Lead          │  │
│  │  /api/leads         →  CRUD operations for leads                     │  │
│  │  /api/mpesa         →  M-Pesa STK Push & Webhook                     │  │
│  │  /api/auth          →  Authentication                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
┌───────────────────────────────────┐     ┌─────────────────────────────────┐
│         MongoDB Database          │     │      M-Pesa Daraja API          │
│  ┌────────────────────────────┐   │     │  (Payment Processing)         │
│  │ Users                      │   │     │  - STK Push                 │
│  │ Leads                      │   │     │  - Payment Callback         │
│  │ Messages                   │   │     │  - Transaction Validation   │
│  │ LeadStatusHistory          │   │     └─────────────────────────────────┘
│  │ Subscriptions              │   │
│  │ Analytics                  │   │
│  │ Notifications              │   │
│  └────────────────────────────┘   │
└───────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard (Next.js)                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Dashboard          →  Overview & Stats                              │  │
│  │  Leads              →  Lead List & Filters                           │  │
│  │  Lead Detail        →  Chat & Status Management                      │  │
│  │  Subscription       →  Payment & Plan Management                     │  │
│  │  Profile            →  User Settings                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
whatsapp/
├── backend/                          # Express.js Backend API
│   ├── config/                       # Configuration files
│   │   ├── config.js                # Environment & app config
│   │   └── database.js              # MongoDB connection
│   ├── controllers/                 # Request handlers
│   │   ├── AuthController.js
│   │   ├── LeadController.js
│   │   ├── MessageController.js
│   │   └── MpesaController.js
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Message.js
│   │   ├── LeadStatusHistory.js
│   │   ├── Subscription.js
│   │   ├── Analytics.js
│   │   ├── Notification.js
│   │   └── WebhookLog.js
│   ├── routes/                      # API routes
│   │   ├── auth.routes.js
│   │   ├── leads.routes.js
│   │   ├── mpesa.routes.js
│   │   └── whatsapp.webhook.js
│   ├── services/                    # Business logic
│   │   ├── AuthService.js
│   │   ├── LeadService.js
│   │   ├── WhatsAppService.js
│   │   ├── MpesaService.js
��   │   └── SubscriptionService.js
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # JWT authentication
│   │   ├── rateLimiter.js
│   │   └── security.js
│   ├── src/
│   │   ├── server.js                # Main entry point
│   │   └── scripts/
│   │       ├── createAdmin.js       # Create admin user
│   │       └── seedData.js          # Seed sample data
│   ├── .env.example
│   └── package.json
│
├── frontend/                         # Next.js Frontend
│   ├── pages/                       # Next.js pages
│   │   ├── index.js                 # Landing page
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── leads.js
│   │   ├── leads/[id].js           # Dynamic lead detail page
│   │   ├── profile.js
│   │   └── subscription.js
│   ├── services/                    # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── leadService.js
│   │   └── mpesaService.js
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🗄️ MongoDB Database Design

### Users Collection
```javascript
{
  firstName: String,        // User's first name
  lastName: String,         // User's last name
  email: String,            // Unique email address
  phoneNumber: String,      // Unique phone number (Kenya format: 254...)
  password: String,         // Hashed password
  role: String,             // 'admin' or 'user'
  isActive: Boolean,        // Account status
  isVerified: Boolean,      // Email/phone verification
  whatsappBusinessNumber: String,  // WhatsApp Business number
  company: String,          // Business name
  industry: String,         // Business industry
  lastLogin: Date,          // Last login timestamp
  createdAt: Date,
  updatedAt: Date
}
```

### Leads Collection
```javascript
{
  phoneNumber: String,      // WhatsApp phone number (indexed)
  name: String,             // Lead's name
  email: String,            // Email if provided
  status: String,           // NEW, CONTACTED, INTERESTED, CLOSED, LOST
  priority: String,         // LOW, MEDIUM, HIGH, URGENT
  source: String,           // HOW_LEAD_WAS_CREATED
  assignedTo: ObjectId,     // User who owns the lead
  notes: [                  // Array of notes
    {
      text: String,
      createdBy: ObjectId,
      createdAt: Date
    }
  ],
  followUpDate: Date,       // When to follow up
  nextFollowUpReminder: Date,
  closedAt: Date,           // When lead was closed
  lostReason: String,       // Why lead was lost
  totalValue: Number,       // Estimated deal value
  currency: String,         // KES, USD, etc.
  metadata: Map,            // Additional key-value data
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  leadId: ObjectId,         // Reference to lead
  sender: String,           // 'customer', 'business', 'system'
  phoneNumber: String,
  messageText: String,
  messageId: String,        // Unique message ID
  whatsappMessageId: String, // WhatsApp message ID
  timestamp: Date,
  status: String,           // DELIVERED, READ, SENT, FAILED
  mediaUrl: String,         // URL for media messages
  mediaType: String,        // IMAGE, VIDEO, AUDIO, etc.
  isRead: Boolean,
  createdAt: Date
}
```

### Subscriptions Collection
```javascript
{
  userId: ObjectId,         // Reference to user
  plan: String,             // BASIC, PRO, ENTERPRISE
  status: String,           // ACTIVE, TRIAL, PENDING, CANCELLED, EXPIRED
  startDate: Date,
  endDate: Date,
  trialEndsAt: Date,        // Trial period end date
  monthlyPrice: Number,     // Subscription price
  mpesaTransactionId: String,
  mpesaPhoneNumber: String,
  autoRenew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "254712345678",
  "password": "password123"
}

POST /api/auth/login
{
  "emailOrPhone": "john@example.com",
  "password": "password123"
}
```

### Leads
```
GET /api/leads?status=NEW&priority=HIGH&page=1&limit=20
GET /api/leads/:id
PATCH /api/leads/:id/status
{
  "status": "CONTACTED",
  "notes": "Called customer, interested in product"
}
POST /api/leads/:id/note
{
  "text": "Customer requested follow-up on Friday"
}
GET /api/leads/search?searchTerm=john
GET /api/leads/dashboard/stats
```

### Messages
```
GET /api/leads/:id/messages
POST /api/leads/:id/messages
{
  "messageText": "Thank you for your inquiry!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE"
}
```

### M-Pesa Payments
```
POST /api/mpesa/stkpush
{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "plan": "BASIC"
}

POST /api/mpesa/webhook  // M-Pesa callback
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345",
      "CheckoutRequestID": "67890",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "Amount": 1000,
      "MpesaReceiptNumber": "R8J5K9ABC",
      "TransactionDate": "20240115123456",
      "PhoneNumber": "254712345678"
    }
  }
}

GET /api/mpesa/subscription/status
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/whatsapp-lead-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# WhatsApp Cloud API
WHATSAPP_API_VERSION=v18.0
WHATSAPP_ACCESS_TOKEN=your-whatsapp-business-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-mpesa-passkey
MPESA_ENV=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/webhook
MPESA_STK_PUSH_TIMEOUT=30000

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Quick Start

### Backend Setup

```bash
cd whatsapp/backend

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env
# Edit .env with your credentials

# Start MongoDB (ensure MongoDB is running)
# On Windows: Start MongoDB service
# On Mac/Linux: mongod

# Create admin user
npm run seed:admin

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd whatsapp/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📱 WhatsApp Cloud API Setup

1. **Create Meta Developer Account**
   - Go to https://developers.facebook.com
   - Create a new app
   - Select "Business" type

2. **Enable WhatsApp Business API**
   - Add WhatsApp product to your app
   - Configure WhatsApp Business Account
   - Link to a Facebook Page

3. **Get Credentials**
   - Copy your Access Token
   - Copy your Phone Number ID
   - Set up webhook in WhatsApp settings

4. **Configure Webhook**
   - Callback URL: `https://your-domain.com/webhook/whatsapp`
   - Verify token: Match with `WHATSAPP_VERIFY_TOKEN` in .env
   - Subscribe to messages, messages_sent, message_delivered, message_read

## 💳 M-Pesa Daraja API Setup

1. **Get Daraja Credentials**
   - Register on https://developer.safaricom.co.ke
   - Create an app
   - Get Consumer Key and Consumer Secret
   - Get Passkey from Lipa Na M-Pesa Online Password

2. **Configure STK Push**
   - Set Shortcode: 174379 (Sandbox)
   - Set Passkey
   - Set Callback URL: `https://your-domain.com/api/mpesa/webhook`

3. **Test Payment Flow**
   - Use test phone: 254708374149
   - Use test PIN: 123456

## 🎯 Kenya Market GTM Strategy

### Best First Niche to Target
**Real Estate Agencies in Nairobi**
- High volume of WhatsApp inquiries
- Clear lead-to-deal conversion
- Willing to pay for lead management
- Already use WhatsApp extensively

### Top 10 Nairobi Business Types Most Likely to Pay
1. Real Estate Agencies
2. Car Dealerships
3. E-commerce Stores
4. Restaurant Chains
5. Medical Clinics
6. Law Firms
7. Recruitment Agencies
8. Event Planning Companies
9. Property Management Firms
10. Automotive Repair Shops

### WhatsApp Cold Outreach Message
```
Hi [Name], I'm [Your Name] from [Your Company].

I noticed you're using WhatsApp for business inquiries. We've helped businesses like yours 
increase lead conversion by 40% using our WhatsApp Lead Tracker system.

Key features:
- Automatic lead capture from WhatsApp
- Full conversation history
- Follow-up reminders
- M-Pesa subscription payments

Would you be open to a 15-minute demo this week?

Best,
[Your Name]
```

### Pricing Strategy (KES)
- **Basic Plan**: KES 1,000/month (up to 500 leads)
- **Pro Plan**: KES 1,500/month (up to 2,000 leads + analytics)
- **Enterprise Plan**: KES 3,000/month (unlimited leads + API access)

### How to Close First 3 Paying Customers in 7 Days

**Day 1-2: Research & Outreach**
- Identify 50 real estate agencies in Nairobi
- Get WhatsApp numbers from their Facebook pages
- Send personalized cold messages

**Day 3-4: Demo & Follow-up**
- Offer free 7-day trial
- Conduct quick 15-minute demos
- Send follow-up messages

**Day 5-6: Close Deals**
- Offer first month at 50% discount (KES 500)
- Process payment via M-Pesa STK
- Onboard to system

**Day 7: Get Testimonials**
- Ask happy customers for testimonials
- Ask for referrals to other businesses

## 🛠️ Deployment Guide

### Backend Deployment (Render/Railway/AWS EC2)

1. **Create Dockerfile** (optional)
2. **Set Environment Variables** on hosting platform
3. **Configure Webhook URL** to point to production URL
4. **Set Up MongoDB Atlas** for production database
5. **Enable HTTPS** for webhook security

### Frontend Deployment (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Security Best Practices
- Use HTTPS for all webhooks
- Validate M-Pesa callbacks
- Rate limit authentication endpoints
- Sanitize user inputs
- Use environment variables for secrets
- Implement CORS properly
- Add input validation

## 📊 Key Metrics to Track

- **Lead Conversion Rate**: Closed / Total Leads
- **Response Time**: Average time to first response
- **Follow-up Rate**: Leads with follow-ups set
- **Revenue per User**: Total Revenue / Active Users
- **Churn Rate**: Cancelled subscriptions / Active subscriptions

## 📝 License

MIT License - See LICENSE file for details.

## 👥 Support

For support, email support@whatsappleadtracker.com or visit our help center.
