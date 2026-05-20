const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/config');

const securityMiddleware = [
  helmet(),
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', config.frontendUrl],
    credentials: true,
  }),
];

module.exports = securityMiddleware;
