const express = require('express');
const connectDB = require('./config/database');
const config = require('./config/config');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WhatsApp Lead Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// Test route
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route working',
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test route: http://localhost:${PORT}/test`);
});

module.exports = app;
