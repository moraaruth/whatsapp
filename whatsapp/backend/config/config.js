require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-lead-tracker',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  whatsapp: {
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    apiUrl: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v18.0'}`,
  },
  
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE || '174379',
    passkey: process.env.MPESA_PASSKEY,
    env: process.env.MPESA_ENV || 'sandbox',
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    stkPushTimeout: parseInt(process.env.MPESA_STK_PUSH_TIMEOUT) || 30000,
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  subscription: {
    monthlyPriceKES: 1000,
    trialDays: 7,
  },
};
