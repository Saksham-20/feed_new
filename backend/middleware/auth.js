// backend/middleware/auth.js - Enhanced with Socket.IO authentication
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Regular HTTP authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Get fresh user data
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'fullname', 'email', 'role', 'status', 'isApproved']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    if (!user.isApproved && user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Account pending approval'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Get fresh user data
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'fullname', 'email', 'role', 'status', 'isApproved']
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    if (user.status !== 'active') {
      return next(new Error('Authentication error: Account not active'));
    }

    if (!user.isApproved && user.role !== 'client') {
      return next(new Error('Authentication error: Account pending approval'));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.userRole = user.role;
    socket.userData = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }

    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Authentication failed'));
  }
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Socket role-based authorization
const authorizeSocketRole = (allowedRoles) => {
  return (socket, next) => {
    if (!socket.userRole || !allowedRoles.includes(socket.userRole)) {
      return next(new Error(`Authorization error: Required roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
};

// Middleware to check if user owns resource
const authorizeResourceOwner = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (req.user.role === 'admin') {
      // Admins can access any resource
      return next();
    }

    if (req.user.id !== parseInt(resourceUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'fullname', 'email', 'role', 'status']
      });

      if (user && user.status === 'active') {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors in optional auth
    next();
  }
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const userRequestCount = userRequests.get(userId).length;

    if (userRequestCount >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    userRequests.get(userId).push(now);
    
    next();
  };
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Client-only middleware
const clientOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Client access required'
    });
  }
  next();
};

// Employee-only middleware (any employee role)
const employeeOnly = (req, res, next) => {
  const employeeRoles = ['sales_purchase', 'marketing', 'office'];
  
  if (!req.user || !employeeRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Employee access required'
    });
  }
  next();
};

// Middleware to log user actions
const logUserAction = (action) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`User Action: ${req.user.email} (${req.user.role}) performed ${action} at ${new Date().toISOString()}`);
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateSocket,
  authorizeRole,
  authorizeSocketRole,
  authorizeResourceOwner,
  optionalAuth,
  userRateLimit,
  adminOnly,
  clientOnly,
  employeeOnly,
  logUserAction
};