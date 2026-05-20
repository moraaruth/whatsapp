# WhatsApp Lead Tracker - Backend

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start MongoDB
# Windows: Start MongoDB service
# Mac/Linux: mongod

# Create admin user
npm run seed:admin

# Start development server
npm run dev
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm run seed:admin` - Create admin user

## API Documentation

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Leads
```
GET /api/leads
GET /api/leads/:id
PATCH /api/leads/:id/status
POST /api/leads/:id/note
GET /api/leads/search?searchTerm=...
GET /api/leads/dashboard/stats
```

### Messages
```
GET /api/leads/:id/messages
POST /api/leads/:id/messages
```

### M-Pesa
```
POST /api/mpesa/stkpush
POST /api/mpesa/webhook
GET /api/mpesa/subscription/status
```

## Webhook Setup

### WhatsApp Webhook
- URL: `https://your-domain.com/webhook/whatsapp`
- Method: GET (verification), POST (messages)

### M-Pesa Webhook
- URL: `https://your-domain.com/api/mpesa/webhook`
- Method: POST
- Content-Type: application/json

## Environment Variables

See `.env.example` for all required variables.

## Database

MongoDB collections:
- users
- leads
- messages
- leadStatusHistory
- subscriptions
- analytics
- notifications
- webhookLogs
