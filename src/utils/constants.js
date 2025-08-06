// src/utils/constants.js

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@app/access_token',
  REFRESH_TOKEN: '@app/refresh_token',
  USER: '@app/user',
  PREFERENCES: '@app/preferences',
  RECENT_ACTIVITY: '@app/recent_activity',
};

export const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  MARKETING: 'marketing',
  SALES_PURCHASE: 'sales_purchase',
  OFFICE: 'office',
};

export const FEEDBACK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const FEEDBACK_CATEGORIES = {
  GENERAL: 'general',
  TECHNICAL: 'technical',
  BILLING: 'billing',
  FEATURE: 'feature',
  COMPLAINT: 'complaint',
  COMPLIMENT: 'compliment',
};

export const FEEDBACK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  FEEDBACK: {
    CLIENT: '/api/client/feedback',
    ADMIN: '/api/admin/feedback',
  },
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
};

export const CURRENCIES = {
  INR: 'INR',
  USD: 'USD',
};