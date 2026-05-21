require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const connectDB = require('../config/database');
const config = require('../config/config');
const { limiter, authLimiter } = require('../middleware/rateLimiter');
const securityMiddleware = require('../middleware/security');

// Routes
const authRoutes = require('../routes/auth.routes');
const leadsRoutes = require('../routes/leads.routes');
const mpesaRoutes = require('../routes/mpesa.routes');
const whatsappWebhook = require('../routes/whatsapp.webhook');

const app = express();

// Middleware
app.use(express.json());
app.use(securityMiddleware);
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WhatsApp Lead Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/webhook/whatsapp', whatsappWebhook);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = config.port;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Connect to database after server starts
  connectDB();
});

module.exports = app;
