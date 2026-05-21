# WhatsApp Lead Tracker - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WhatsApp User                                       │
│                    (Customer/Prospect)                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  WhatsApp Message → WhatsApp Cloud API                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WhatsApp Cloud API (Meta)                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  - Webhook Verification                                               │  │
│  │  - Message Delivery                                                   │  │
│  │  - Status Updates                                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  /webhook/whatsapp  →  WhatsAppMessageController                     │  │
│  │    - Verify webhook                                                   │  │
│  │    - Process incoming messages                                        │  │
│  │    - Create/update leads                                              │  │
│  │    - Save messages                                                    │  │
│  │                                                                       │  │
│  │  /api/auth/*        →  AuthController                                │  │
│  │    - Register                                                         │  │
│  │    - Login                                                            │  │
│  │                                                                       │  │
│  │  /api/leads/*       →  LeadController                                │  │
│  │    - Get all leads                                                    │  │
│  │    - Get lead by ID                                                   │  │
│  │    - Update status                                                    │  │
│  │    - Add note                                                         │  │
│  │    - Search leads                                                     │  │
│  │    - Dashboard stats                                                  │  │
│  │                                                                       │  │
│  │  /api/mpesa/*       →  MpesaController                               │  │
│  │    - STK Push                                                         │  │
│  │    - Payment webhook                                                  │  │
│  │    - Subscription status                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
┌───────────────────────────────────┐     ┌─────────────────────────────────┐
│         MongoDB Database          │     │      M-Pesa Daraja API          │
│  ┌────────────────────────────┐   │     │  (Payment Processing)         │
│  │ Users                      │   │     │  - STK Push                 │
│  │   - Authentication         │   │     │  - Payment Callback         │
│  │   - Profile                │   │     │  - Transaction Validation   │
│  │   - Subscription info      │   │     └─────────────────────────────────┘
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ Leads                      │   │
│  │   - Basic info             │   │
│  │   - Status                 │   │
│  │   - Priority               │   │
│  │   - Assigned user          │   │
│  │   - Metadata               │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ Messages                   │   │
│  │   - Text content           │   │
│  │   - Media                  │   │
│  │   - Timestamp              │   │
│  │   - Status                 │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ LeadStatusHistory          │   │
│  │   - Status changes         │   │
│  │   - Timestamps             │   │
│  │   - Notes                  │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ Subscriptions              │   │
│  │   - Plan details           │   │
│  │   - Payment info           │   │
│  │   - Status                 │   │
│  │   - Renewal info           │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ Analytics                  │   │
│  │   - Daily stats            │   │
│  │   - Revenue                │   │
│  │   - Conversions            │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ Notifications              │   │
│  │   - Reminders              │   │
│  │   - Alerts                 │   │
│  │   - Payment updates        │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ WebhookLogs                │   │
│  │   - Incoming webhooks      │   │
│  │   - Processing status      │   │
│  │   - Errors                 │   │
│  └────────────────────────────┘   │
└───────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard (Next.js)                             │
│  ┌────────────────────────────────────────────��──────────────────────────┐  │
│  │  /dashboard           →  DashboardPage                               │  │
│  │    - Stats overview                                                     │  │
│  │    - Quick actions                                                      │  │
│  │    - Subscription status                                                │  │
│  │                                                                       │  │
│  │  /leads               →  LeadsPage                                   │  │
│  │    - Lead list                                                          │  │
│  │    - Filters                                                            │  │
│  │    - Search                                                             │  │
│  │                                                                       │  │
│  │  /leads/:id           →  LeadDetailPage                              │  │
│  │    - Lead info                                                          │  │
│  │    - Conversation chat                                                  │  │
│  │    - Status updates                                                     │  │
│  │    - Notes                                                              │  │
│  │                                                                       │  │
│  │  /profile             →  ProfilePage                                 │  │
│  │    - User settings                                                      │  │
│  │    - Company info                                                       │  │
│  │                                                                       │  │
│  │  /subscription        →  SubscriptionPage                            │  │
│  │    - Current plan                                                       │  │
│  │    - Upgrade options                                                    │  │
│  │    - Payment history                                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WhatsApp Message Flow                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. Customer sends WhatsApp message
   └─> WhatsApp Cloud API

2. WhatsApp Cloud API sends webhook to backend
   └─> POST /webhook/whatsapp
       {
         "object": "whatsapp_business_account",
         "entry": [{
           "changes": [{
             "value": {
               "messages": [{
                 "from": "254707438317",
                 "text": { "body": "Hello" }
               }]
             }
           }]
         }]
       }

3. Backend processes webhook
   ├─> Extract phone number
   ├─> Check if lead exists
   │   ├─> YES: Update lead, add message
   │   └─> NO: Create new lead, add message
   ├─> Save message to database
   ├─> Update analytics
   └─> Send auto-reply (optional)

4. Data stored in MongoDB
   ├─> Leads collection (updated or created)
   ├─> Messages collection (new message)
   ├─> LeadStatusHistory (if new lead)
   └─> Analytics (updated)

5. Frontend displays updated data
   ├─> Dashboard shows new stats
   ├─> Leads list shows new lead
   └─> Lead detail shows new message
```

## API Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API Request Flow                                         │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend → Backend → Database

1. Frontend makes API request
   GET /api/leads
   Authorization: Bearer <token>

2. Backend middleware processes request
   ├─> Rate limiter checks request count
   ├─> Security middleware validates headers
   └─> Auth middleware validates JWT token

3. Controller handles request
   LeadController.getAllLeads()
   ├─> Extract user ID from token
   ├─> Call LeadService.getLeadsByUser()
   └─> Return JSON response

4. Service layer processes business logic
   LeadService.getLeadsByUser()
   ├─> Query MongoDB for leads
   ├─> Apply filters
   ├─> Sort results
   └─> Return leads array

5. Database query
   db.leads.find({
     assignedTo: ObjectId("<user_id>"),
     status: "NEW"
   }).sort({ createdAt: -1 })

6. Response flows back
   Database → Service → Controller → Frontend
```

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    M-Pesa Payment Flow                                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. User clicks "Subscribe" button
   └─> Frontend calls /api/mpesa/stkpush

2. Backend initiates STK push
   ├─> Get access token from M-Pesa
   ├─> Generate password
   ├─> Create payload
   └─> Send request to M-Pesa

3. M-Pesa processes request
   └─> Returns CheckoutRequestID

4. User receives STK prompt on phone
   └─> User enters PIN

5. M-Pesa sends callback to backend
   POST /api/mpesa/webhook
   {
     "Body": {
       "stkCallback": {
         "ResultCode": 0,
         "ResultDesc": "Success",
         "Amount": 1000,
         "MpesaReceiptNumber": "R8J5K9ABC"
       }
     }
   }

6. Backend processes callback
   ├─> Validate payment
   ├─> Find subscription
   ├─> Update subscription status
   ├─> Create notification
   └─> Send success response

7. Frontend shows success
   └─> User redirected to dashboard
```

## Event-Driven Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Event-Driven Flow                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Event: WhatsApp Message Received
   ├─> Webhook received
   ├─> Message processed
   ├─> Lead created/updated
   ├─> Message saved
   ├─> Status history created
   ├─> Analytics updated
   └─> Notification sent (if needed)

Event: Lead Status Changed
   ├─> Status updated
   ├─> History recorded
   ├─> Notification sent
   ├─> Analytics updated
   └─> Follow-up scheduled (if needed)

Event: Payment Successful
   ├─> Subscription activated
   ├─> Notification sent
   ├─> Analytics updated
   └─> Welcome email sent (if configured)

Event: Follow-up Due
   ├─> Cron job triggers
   ├─> Find leads with follow-up date
   ├─> Send WhatsApp reminder
   ├─> Update follow-up date
   └─> Log activity
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Security Flow                                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. Authentication
   ├─> User registers/logs in
   ├─> Password hashed with bcrypt
   ├─> JWT token generated
   └─> Token stored in frontend

2. API Requests
   ├─> Token sent in Authorization header
   ├─> Backend validates token
   ├─> User ID extracted
   └─> Request processed

3. Rate Limiting
   ├─> Request count tracked per IP
   ├─> Limit enforced (100 requests/15min)
   └─> 429 response if exceeded

4. Input Validation
   ├─> Request body validated
   ├─> SQL injection prevention
   └─> XSS prevention

5. Database Security
   ├─> Environment variables for credentials
   ├─> Connection string encrypted
   └─> IP whitelist (if using MongoDB Atlas)
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Production Deployment                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         Internet                                          │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│      Frontend (Vercel)        │     │      Backend (Render)         │
│  - Static files               │     │  - Node.js app                  │
│  - CDN delivery               │     │  - API endpoints                │
│  - Auto-scaling               │     │  - Auto-scaling                 │
└───────────────────────────────┘     └───────────────────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Cloud Services                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  MongoDB Atlas (Cloud Database)                                     │  │
│  │  - Replication                                                      │  │
│  │  - Backups                                                          │  │
│  │  - Security                                                         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  WhatsApp Cloud API (Meta)                                          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  M-Pesa Daraja API (Safaricom)                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

## Cron Jobs & Scheduled Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Scheduled Tasks                                          │
└─────────────────────────────────────────────────────────────────────────────┘

1. Daily Analytics Update (2:00 AM)
   ├─> Calculate daily stats
   ├─> Update analytics collection
   └─> Generate reports

2. Follow-up Reminders (9:00 AM)
   ├─> Find leads with follow-up date today
   ├─> Send WhatsApp reminders
   └─> Update follow-up dates

3. Subscription Expiry Check (10:00 AM)
   ├─> Find subscriptions expiring in 3 days
   ├─> Send renewal notifications
   └─> Send final reminder for expiring subscriptions

4. Webhook Log Cleanup (3:00 AM)
   ├─> Delete logs older than 30 days
   └─> Free up database space

5. Notification Cleanup (4:00 AM)
   ├─> Delete read notifications older than 7 days
   └─> Free up database space
```
