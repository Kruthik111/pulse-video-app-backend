const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Store io instance for access in controllers
app.set('io', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Authenticate socket user via token (optional but recommended)
  const token = socket.handshake.auth.token;
  if (token) {
    // We could verify JWT here and join specific tenant rooms
    console.log(`Socket ${socket.id} authenticated with token`);
  }

  socket.on('join_tenant', (tenantId) => {
    socket.join(tenantId);
    console.log(`Socket ${socket.id} joined tenant room: ${tenantId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Pulse Backend Running on PORT ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
