# WhatsApp Lead Tracker - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- MongoDB 6+ installed or MongoDB Atlas account
- WhatsApp Business API access
- M-Pesa Daraja API credentials

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd whatsapp/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# See .env.example for required variables
```

### 2. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB
# Windows: Start MongoDB service
# Mac/Linux: mongod

# Create database
mongosh
> use whatsapp-lead-tracker
```

**Option B: MongoDB Atlas**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `MONGODB_URI` in .env

### 3. WhatsApp Cloud API Setup

1. **Create Meta Developer Account**
   - Go to https://developers.facebook.com
   - Create new app
   - Select "Business" type

2. **Enable WhatsApp Business API**
   - Add WhatsApp product
   - Configure Business Account
   - Link to Facebook Page

3. **Get Credentials**
   - Copy Access Token
   - Copy Phone Number ID
   - Set Verify Token

4. **Configure Webhook**
   - Callback URL: `https://your-domain.com/webhook/whatsapp`
   - Verify token: Match .env value
   - Subscribe to: messages, messages_sent, message_delivered, message_read

### 4. M-Pesa Daraja API Setup

1. **Get Daraja Credentials**
   - Register on https://developer.safaricom.co.ke
   - Create app
   - Get Consumer Key and Secret
   - Get Passkey

2. **Configure STK Push**
   - Set Shortcode: 174379 (Sandbox)
   - Set Passkey
   - Set Callback URL: `https://your-domain.com/api/mpesa/webhook`

### 5. Create Admin User

```bash
# Create admin user
npm run seed:admin

# Or manually create
# Email: admin@whatsappleadtracker.com
# Password: admin123 (or set in .env)
```

### 6. Start Backend

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### 7. Frontend Setup

```bash
# Navigate to frontend directory
cd whatsapp/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:3001
```

## Testing

### Test WhatsApp Webhook

1. **Send test message**
   - Use WhatsApp Business number
   - Send: "Hello"

2. **Check backend logs**
   - Should see: "Processed message from..."

### Test M-Pesa Payment

1. **Initiate STK push**
   - Use test phone: 254708374149
   - Use test PIN: 123456

2. **Check callback**
   - Backend should receive webhook
   - Subscription should be created

## Troubleshooting

### Common Issues

**WhatsApp Webhook Not Working**
- Check HTTPS is enabled
- Verify webhook URL is correct
- Check Meta webhook logs

**M-Pesa Payment Not Working**
- Verify M-Pesa credentials
- Check callback URL is accessible
- Test with different phone numbers

**Database Connection Issues**
- Verify MongoDB URI
- Check IP whitelist
- Test connection locally

## Next Steps

1. **Configure environment variables**
2. **Set up WhatsApp Business API**
3. **Configure M-Pesa Daraja API**
4. **Create admin user**
5. **Start backend and frontend**
6. **Test with sample data**
7. **Deploy to production**

## Support

For issues, check:
- Backend logs: `npm run dev`
- Frontend logs: `npm run dev`
- MongoDB logs: `mongosh`
