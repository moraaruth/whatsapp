# WhatsApp Lead Tracker - API Documentation

## Authentication

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "254712345678",
  "password": "password123"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "254712345678",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "254712345678",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Leads

### Get All Leads
```
GET /api/leads?status=NEW&priority=HIGH&page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get Lead by ID
```
GET /api/leads/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "60d5ec8f8f8f8f8f8f8f8f8f",
    "phoneNumber": "254712345678",
    "name": "John Doe",
    "status": "NEW",
    "priority": "MEDIUM",
    "source": "WHATSAPP",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Lead Status
```
PATCH /api/leads/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONTACTED",
  "notes": "Called customer, interested in product"
}

Response: 200 OK
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {...}
}
```

### Add Note to Lead
```
POST /api/leads/:id/note
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Customer requested follow-up on Friday"
}

Response: 200 OK
{
  "success": true,
  "message": "Note added successfully",
  "data": {...}
}
```

### Search Leads
```
GET /api/leads/search?searchTerm=john
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

### Get Dashboard Stats
```
GET /api/leads/dashboard/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalLeads": 100,
    "newLeads": 20,
    "closedLeads": 15,
    "interestedLeads": 30,
    "totalMessages": 500,
    "totalRevenue": 45000
  }
}
```

## Messages

### Get Messages for Lead
```
GET /api/leads/:id/messages
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec8f8f8f8f8f8f8f8f8f",
      "leadId": "60d5ec8f8f8f8f8f8f8f8f8f",
      "sender": "customer",
      "messageText": "Hello, I'm interested in your product",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "status": "DELIVERED"
    }
  ]
}
```

### Send Message
```
POST /api/leads/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageText": "Thank you for your inquiry!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE"
}

Response: 200 OK
{
  "success": true,
  "message": "Message sent successfully",
  "data": {...}
}
```

## M-Pesa

### Initiate STK Push
```
POST /api/mpesa/stkpush
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "plan": "BASIC"
}

Response: 200 OK
{
  "success": true,
  "message": "STK push initiated successfully",
  "data": {
    "MerchantRequestID": "12345",
    "CheckoutRequestID": "67890",
    "ResponseCode": "0",
    "ResponseDesc": "Success"
  }
}
```

### Get Subscription Status
```
GET /api/mpesa/subscription/status
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "isActive": true,
    "isTrial": false,
    "plan": "BASIC",
    "monthlyPrice": 1000,
    "endDate": "2024-02-15T00:00:00.000Z"
  }
}
```

## Webhook

### WhatsApp Webhook (Verification)
```
GET /webhook/whatsapp
hub.mode=subscribe&hub.verify_token=your-token&hub.challenge=123456

Response: 123456
```

### WhatsApp Webhook (Messages)
```
POST /webhook/whatsapp
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "254712345678",
          "id": "wamid.HBgN...",
          "timestamp": "1640000000",
          "text": {
            "body": "Hello"
          },
          "type": "text"
        }]
      }
    }]
  }]
}

Response: 200 OK
{
  "success": true,
  "message": "Webhook received"
}
```

### M-Pesa Webhook
```
POST /api/mpesa/webhook
Content-Type: application/json

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

Response: 200 OK
{
  "success": true,
  "message": "Webhook received",
  "data": {...}
}
```
