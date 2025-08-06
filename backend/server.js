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
app.get('/api/feedback/:threadId', 
  authenticateToken, 
  feedbackController.getFeedbackThread
);
app.post('/api/feedback/:threadId/reply', 
  authenticateToken, 
  feedbackController.replyToFeedback
);

// File upload endpoint
app.post('/api/upload', 
  authenticateToken,
  upload.array('files', 5),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path.replace(/\\/g, '/'),
        url: `/uploads/${req.body.category || 'general'}/${file.filename}`
      }));

      // Notify relevant users about file upload
      const io = req.app.get('io');
      io.emit('fileUploaded', {
        files: uploadedFiles,
        uploadedBy: req.user.id,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: uploadedFiles
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      });
    }
  }
);

// Import and use route modules with error handling
try {
  // Admin route modules
  const adminDashboardRoutes = require('./routes/admin/dashboard');
  const adminFeedbackRoutes = require('./routes/admin/feedback');
  const adminUsersRoutes = require('./routes/admin/users');
  const adminAnalyticsRoutes = require('./routes/admin/analytics');
  
  app.use('/api/admin/dashboard', adminDashboardRoutes);
  app.use('/api/admin/feedback', adminFeedbackRoutes);
  app.use('/api/admin/users', adminUsersRoutes);
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
  });

  socket.on('leaveThread', (threadId) => {
    socket.leave(`thread:${threadId}`);
  });

  // Handle real-time notifications
  socket.on('markNotificationRead', (notificationId) => {
    // This would typically update the database
    socket.emit('notificationMarkedRead', { notificationId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
    
    // Notify other users about disconnection
    socket.broadcast.emit('userDisconnected', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // Send initial data
  socket.emit('connected', {
    userId: socket.userId,
    role: socket.userRole,
    onlineUsers: Array.from(connectedUsers.keys()),
    timestamp: new Date()
  });
});

// Helper functions for real-time notifications
const sendNotificationToUser = (userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

const sendNotificationToRole = (role, notification) => {
  io.to(`role:${role}`).emit('notification', notification);
};

const sendToThread = (threadId, event, data) => {
  io.to(`thread:${threadId}`).emit(event, data);
};

// Make real-time functions available globally
global.socketHelpers = {
  sendNotificationToUser,
  sendNotificationToRole,
  sendToThread,
  getConnectedUsers: () => Array.from(connectedUsers.entries()),
  isUserOnline: (userId) => connectedUsers.has(userId)
};

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`⚡ Socket.IO enabled for real-time features`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();