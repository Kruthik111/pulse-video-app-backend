module.exports = {
  mongodb_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse_db',
  jwt_secret: process.env.JWT_SECRET || 'dev-secret-key',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '24h',
  port: process.env.PORT || 5000,
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:5173'
};
