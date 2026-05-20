# WhatsApp Lead Tracker - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB 6+ installed or MongoDB Atlas account
- WhatsApp Business API access
- M-Pesa Daraja API credentials

## Backend Deployment

### Option 1: Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up and verify email

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select backend branch

3. **Configure Service**
   - Build Command: `cd whatsapp/backend && npm install`
   - Start Command: `cd whatsapp/backend && npm start`
   - Environment: Node
   - Region: Choose closest to Kenya (Frankfurt or Singapore)

4. **Set Environment Variables**
   - MONGODB_URI (MongoDB connection string)
   - JWT_SECRET
   - WHATSAPP_ACCESS_TOKEN
   - WHATSAPP_PHONE_NUMBER_ID
   - WHATSAPP_VERIFY_TOKEN
   - MPESA_CONSUMER_KEY
   - MPESA_CONSUMER_SECRET
   - MPESA_PASSKEY
   - MPESA_SHORTCODE
   - MPESA_CALLBACK_URL (your Render URL + /api/mpesa/webhook)
   - FRONTEND_URL (your frontend URL)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Option 2: Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create Project**
   - Click "New Project"
   - Connect GitHub repository

3. **Add MongoDB**
   - Click "Add Database"
   - Select MongoDB
   - Copy connection string

4. **Set Environment Variables**
   - Same as Render above

5. **Deploy**
   - Railway auto-deploys on push to main branch

### Option 3: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t3.medium or larger
   - Security Group: Allow ports 22, 80, 443

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod

   # Clone repository
   git clone your-repo-url
   cd whatsapp/backend
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Start Application**
   ```bash
   npm install
   npm start
   ```

6. **Use PM2 for Production**
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name whatsapp-lead-tracker
   pm2 save
   pm2 startup
   ```

## Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your frontend repository

3. **Configure Environment Variables**
   - NEXT_PUBLIC_API_URL: Your backend URL
   - NEXT_PUBLIC_APP_URL: Your frontend URL

4. **Deploy**
   - Click "Deploy"
   - Vercel auto-deploys on push

## Webhook Configuration

### WhatsApp Webhook

1. **Get Your Backend URL**
   - From Render/Railway/EC2 output
   - Format: `https://your-app.onrender.com`

2. **Configure in Meta Developer Console**
   - Go to https://developers.facebook.com/apps
   - Select your app
   - WhatsApp → Settings → Webhooks
   - Callback URL: `https://your-app.onrender.com/webhook/whatsapp`
   - Verify Token: Match your `.env` file
   - Subscribe to: messages, messages_sent, message_delivered, message_read

3. **Test Webhook**
   - Send a test message to your WhatsApp Business number
   - Check logs in your backend

### M-Pesa Webhook

1. **Configure in Safaricom Developer Portal**
   - Go to https://developer.safaricom.co.ke
   - Select your app
   - Lipa Na M-Pesa Online → Callback URL
   - Set: `https://your-app.onrender.com/api/mpesa/webhook`

2. **Test Payment**
   - Use test phone: 254708374149
   - Use test PIN: 123456
   - Verify callback is received

## Security Best Practices

### Backend
1. **Use HTTPS** - Always use HTTPS for webhooks
2. **Rate Limiting** - Already implemented in middleware
3. **Input Validation** - Validate all user inputs
4. **Environment Variables** - Never commit `.env` file
5. **CORS** - Restrict to your frontend domain
6. **JWT Secret** - Use strong, random secret in production
7. **Database** - Use MongoDB Atlas with IP whitelisting

### Frontend
1. **API URL** - Store in environment variables
2. **Token Storage** - Use localStorage (or sessionStorage for better security)
3. **HTTPS** - Always use HTTPS
4. **CORS** - Configure backend CORS properly

## Monitoring

### Backend Logging
```bash
# Check logs on Render
render logs -f

# Check logs on Railway
railway logs

# Check logs on EC2
pm2 logs whatsapp-lead-tracker
```

### Database Monitoring
- Use MongoDB Atlas dashboard
- Set up alerts for high latency
- Monitor database size

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor webhook failures
- Track M-Pesa payment failures

## Scaling

### Backend Scaling
1. **Horizontal Scaling**
   - Add more instances on Render/Railway
   - Use load balancer on EC2

2. **Database Scaling**
   - Upgrade MongoDB Atlas tier
   - Add read replicas
   - Implement caching (Redis)

### Frontend Scaling
- Vercel auto-scales
- Use CDN for static assets
- Implement image optimization

## Maintenance

### Daily
- Check webhook logs
- Monitor payment failures
- Review new leads

### Weekly
- Backup database
- Check server resources
- Review analytics

### Monthly
- Review subscription renewals
- Update dependencies
- Security audit

## Troubleshooting

### Webhook Not Receiving Messages
1. Check webhook URL is correct
2. Verify HTTPS is working
3. Check Meta webhook logs
4. Verify WhatsApp Business number is connected

### M-Pesa Payment Not Working
1. Check callback URL is accessible
2. Verify M-Pesa credentials
3. Check sandbox vs production environment
4. Test with different phone numbers

### Database Connection Issues
1. Verify MongoDB URI
2. Check IP whitelist
3. Verify credentials
4. Test connection locally
