const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const { generateRequestId, requestLogger, securityHeaders } = require('./middleware/requestLogger');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthCheck = require('./middleware/healthCheck');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 2. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

// 3. Body parsers
app.use(express.json({ limit: process.env.REQUEST_SIZE_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_SIZE_LIMIT || '10mb' }));

// 4. Request ID
app.use(generateRequestId);

// 5. Security headers (Custom)
app.use(securityHeaders);

// 6. Request Timeout (30s)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({
      success: false,
      message: 'Request timeout',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  });
  next();
});

// 9. Request logging
app.use(requestLogger);

// 10. Health routes
app.get('/health', healthCheck.health);
app.get('/health/ready', healthCheck.ready);
app.get('/health/live', healthCheck.live);

// 10. Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 11. API routes
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/user', authRoutes);

// 12. Not-found handler
app.use(notFoundHandler);

// 14. Global error handler
app.use(globalErrorHandler);

module.exports = app;
