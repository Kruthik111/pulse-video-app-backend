const mongoose = require('mongoose');

const health = (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

const ready = (req, res) => {
  const isDBConnected = mongoose.connection.readyState === 1;
  res.status(isDBConnected ? 200 : 503).json({
    status: isDBConnected ? 'READY' : 'NOT_READY',
    db: isDBConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
};

const live = (req, res) => {
  res.status(200).json({
    status: 'LIVE',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  health,
  ready,
  live
};
