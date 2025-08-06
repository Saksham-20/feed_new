// backend/server.js - Enhanced with real-time features
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Import database connection
const { connectDB } = require('./config/database');

// Import middleware
const corsMiddleware = require('./middleware/cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { authenticateSocket } = require('./middleware/auth');

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(corsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files
app.use('/uploads', express.static('uploads'));

// Make io instance available to routes
app.set('io', io);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: io.engine.clientsCount
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Import all models and set up associations
require('./models/associations');

// Import controllers
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const clientController = require('./controllers/clientController');
const employeeController = require('./controllers/employeeController');
const feedbackController = require('./controllers/feedbackController');

// Import middleware
const { authenticateToken, authorizeRole } = require('./middleware/auth');
const { upload, handleUploadError } = require('./middleware/upload');
const {
  registerValidation,
  loginValidation,
  orderValidation,
  customerValidation,
  feedbackValidation,
  idValidation,
  paginationValidation
} = require('./middleware/validation');

// Auth routes
app.post('/api/auth/register', registerValidation, authController.register);
app.post('/api/auth/login', loginValidation, authController.login);
app.post('/api/auth/refresh', authController.refreshToken);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.put('/api/auth/profile', authenticateToken, authController.updateProfile);
app.post('/api/auth/change-password', authenticateToken, authController.changePassword);

// Admin routes
app.get('/api/admin/dashboard/overview', 
  authenticateToken, 
  authorizeRole(['admin']), 
  adminController.getDashboardOverview
);
app.get('/api/admin/users', 
  authenticateToken, 
  authorizeRole(['admin']), 
  paginationValidation,
  adminController.getUsers
);
app.get('/api/admin/pending-approvals', 
  authenticateToken, 
  authorizeRole(['admin']), 
  adminController.getPendingApprovals
);
app.post('/api/admin/approve-user', 
  authenticateToken, 
  authorizeRole(['admin']), 
  adminController.approveUser
);
app.post('/api/admin/reject-user', 
  authenticateToken, 
  authorizeRole(['admin']), 
  adminController.rejectUser
);

// Client routes
app.get('/api/client/dashboard', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientController.getDashboardOverview
);
app.get('/api/client/orders', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientController.getOrders
);
app.get('/api/client/orders/:id', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientController.getOrder
);
app.post('/api/client/orders', 
  authenticateToken, 
  authorizeRole(['client']), 
  orderValidation,
  clientController.createOrder
);
app.get('/api/client/bills', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientController.getBills
);
app.get('/api/client/bills/:id', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientController.getBill
);

// Employee routes
app.get('/api/employees/sales/dashboard', 
  authenticateToken, 
  authorizeRole(['sales_purchase', 'admin']), 
  employeeController.getSalesDashboard
);
app.get('/api/employees/marketing/dashboard', 
  authenticateToken, 
  authorizeRole(['marketing', 'admin']), 
  employeeController.getMarketingDashboard
);
app.get('/api/employees/office/dashboard', 
  authenticateToken, 
  authorizeRole(['office', 'admin']), 
  employeeController.getOfficeDashboard
);

// Feedback routes
app.get('/api/feedback', 
  authenticateToken, 
  feedbackController.getAllFeedback
);
app.get('/api/feedback/client', 
  authenticateToken, 
  authorizeRole(['client']), 
  feedbackController.getClientFeedback
);
app.post('/api/feedback', 
  authenticateToken, 
  feedbackValidation,
  feedbackController.createFeedback
);
app.get('/api/feedback/:id', 
  authenticateToken, 
  idValidation,
  feedbackController.getFeedback
);
app.put('/api/feedback/:id', 
  authenticateToken, 
  idValidation,
  feedbackController.updateFeedback
);
app.delete('/api/feedback/:id', 
  authenticateToken, 
  idValidation,
  feedbackController.deleteFeedback
);

// Upload routes
app.post('/api/uploads/single', 
  authenticateToken,
  upload.single('file'),
  handleUploadError,
  (req, res) => {
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      }
    });
  }
);

// Try to load modular routes (graceful fallback if modules don't exist)
try {
  // Admin route modules
  const adminUserRoutes = require('./routes/admin/users');
  const adminAnalyticsRoutes = require('./routes/admin/analytics');
  
  app.use('/api/admin/users', adminUserRoutes);
  app.use('/api/admin/analytics', adminAnalyticsRoutes);

  // Client route modules
  const clientOrderRoutes = require('./routes/client/orders');
  const clientBillRoutes = require('./routes/client/bills');
  const clientFeedbackRoutes = require('./routes/client/feedback');
  
  app.use('/api/client/orders', clientOrderRoutes);
  app.use('/api/client/bills', clientBillRoutes);
  app.use('/api/client/feedback', clientFeedbackRoutes);

  // Employee route modules
  const salesRoutes = require('./routes/employees/sales');
  const marketingRoutes = require('./routes/employees/marketing');
  const officeRoutes = require('./routes/employees/office');
  
  app.use('/api/employees/sales', salesRoutes);
  app.use('/api/employees/marketing', marketingRoutes);
  app.use('/api/employees/office', officeRoutes);

  // Shared route modules
  const notificationRoutes = require('./routes/shared/notifications');
  const reportsRoutes = require('./routes/shared/reports');
  const uploadsRoutes = require('./routes/shared/uploads');
  
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/uploads', uploadsRoutes);

} catch (error) {
  console.error('Error loading route modules:', error.message);
  console.log('Continuing with basic routes only...');
}

// Socket.IO connection handling
const connectedUsers = new Map();

io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);
  
  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    role: socket.userRole,
    connectedAt: new Date()
  });

  // Join role-based rooms
  socket.join(`role:${socket.userRole}`);
  
  // Join user-specific room
  socket.join(`user:${socket.userId}`);

  // Handle user status
  socket.on('updateStatus', (status) => {
    socket.broadcast.emit('userStatusUpdate', {
      userId: socket.userId,
      status,
      timestamp: new Date()
    });
  });

  // Handle typing indicators for feedback/chat
  socket.on('typing', (data) => {
    socket.to(`thread:${data.threadId}`).emit('userTyping', {
      userId: socket.userId,
      threadId: data.threadId,
      isTyping: data.isTyping
    });
  });

  // Handle joining specific threads/rooms
  socket.on('joinThread', (threadId) => {
    socket.join(`thread:${threadId}`);
    console.log(`User ${socket.userId} joined thread ${threadId}`);
  });

  socket.on('leaveThread', (threadId) => {
    socket.leave(`thread:${threadId}`);
    console.log(`User ${socket.userId} left thread ${threadId}`);
  });

  // Handle real-time order updates
  socket.on('orderUpdate', (data) => {
    // Broadcast to relevant users (admin, sales staff, client)
    io.to(`role:admin`).emit('orderUpdate', data);
    io.to(`role:sales_purchase`).emit('orderUpdate', data);
    io.to(`user:${data.clientId}`).emit('orderUpdate', data);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.userId} (${reason})`);
    connectedUsers.delete(socket.userId);
    
    // Broadcast user offline status
    socket.broadcast.emit('userStatusUpdate', {
      userId: socket.userId,
      status: 'offline',
      timestamp: new Date()
    });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.userId}:`, error);
  });
});

// API endpoint to get connected users (admin only)
app.get('/api/system/connected-users', 
  authenticateToken, 
  authorizeRole(['admin']), 
  (req, res) => {
    const users = Array.from(connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
    
    res.json({
      success: true,
      data: {
        connectedUsers: users,
        totalConnections: users.length
      }
    });
  }
);

// API endpoint to broadcast notifications (admin only)
app.post('/api/system/broadcast', 
  authenticateToken, 
  authorizeRole(['admin']), 
  (req, res) => {
    const { message, type = 'info', targetRole, targetUser } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const notification = {
      type,
      title: 'System Notification',
      message,
      timestamp: new Date()
    };
    
    if (targetUser) {
      // Send to specific user
      io.to(`user:${targetUser}`).emit('notification', notification);
    } else if (targetRole) {
      // Send to all users of a specific role
      io.to(`role:${targetRole}`).emit('notification', notification);
    } else {
      // Broadcast to all connected users
      io.emit('notification', notification);
    }
    
    res.json({
      success: true,
      message: 'Notification broadcasted successfully'
    });
  }
);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Socket.IO enabled for real-time features`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };