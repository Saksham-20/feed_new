// src/utils/constants.js
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SYNC_QUEUE: 'syncQueue',
  CACHE_PREFIX: 'cache_',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  SALES_PURCHASE: 'sales_purchase',
  MARKETING: 'marketing',
  OFFICE: 'office',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const FEEDBACK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  PROFILE: '/api/auth/profile',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard/overview',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_PENDING: '/api/admin/pending-approvals',
  
  // Client
  CLIENT_DASHBOARD: '/api/client/dashboard',
  CLIENT_ORDERS: '/api/client/orders',
  CLIENT_BILLS: '/api/client/bills',
  
  // Employees
  SALES_DASHBOARD: '/api/employees/sales/dashboard',
  MARKETING_DASHBOARD: '/api/employees/marketing/dashboard',
  OFFICE_DASHBOARD: '/api/employees/office/dashboard',
  
  // Feedback
  FEEDBACK: '/api/feedback',
  
  // Files
  UPLOAD: '/api/upload',
  UPLOADS: '/api/uploads',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTED: 'connected',
  
  // User events
  USER_STATUS_UPDATE: 'userStatusUpdate',
  USER_TYPING: 'userTyping',
  JOIN_THREAD: 'joinThread',
  LEAVE_THREAD: 'leaveThread',
  
  // Data events
  NOTIFICATION: 'notification',
  ORDER_UPDATE: 'orderUpdate',
  FEEDBACK_REPLY: 'feedbackReply',
  FILE_UPLOADED: 'fileUploaded',
  SYSTEM_ALERT: 'systemAlert',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
};