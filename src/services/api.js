// src/services/api.js - Enhanced API service with real-time features
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { EventEmitter } from 'events';

// Configuration based on environment
const API_CONFIG = {
  development: {
    BASE_URL: 'http://192.168.1.22:3000', // Your current dev URL
    TIMEOUT: 10000,
  },
  production: {
    BASE_URL: 'https://your-production-api.com',
    TIMEOUT: 15000,
  }
};

const ENV = __DEV__ ? 'development' : 'production';
const { BASE_URL, TIMEOUT } = API_CONFIG[ENV];

class ApiService extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.retryQueue = [];
    this.setupAxiosInstance();
  }

  setupAxiosInstance() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          // Emit request event
          this.emit('requestStart', config);
          
          return config;
        } catch (error) {
          console.error('Error in request interceptor:', error);
          return config;
        }
      },
      (error) => {
        this.emit('requestError', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        this.emit('requestEnd', response);
        return response;
      },
      async (error) => {
        this.emit('requestError', error);
        
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            
            if (refreshToken) {
              const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                refreshToken,
              });

              if (response.data.success) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                
                await Promise.all([
                  AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
                  AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken),
                ]);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            await this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // Handle network errors and retry
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          return this.handleNetworkError(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  async handleAuthFailure() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    this.emit('authFailure');
  }

  async handleNetworkError(originalRequest) {
    // Add to retry queue if offline
    this.retryQueue.push(originalRequest);
    this.emit('networkError', originalRequest);
    
    // Try offline fallback
    return this.getOfflineData(originalRequest);
  }

  async getOfflineData(request) {
    // Implement offline data retrieval based on request
    const cacheKey = `offline_${request.url}_${JSON.stringify(request.params || {})}`;
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return { data: JSON.parse(cachedData), fromCache: true };
      }
    } catch (error) {
      console.error('Error getting offline data:', error);
    }
    throw new Error('No offline data available');
  }

  // Auth methods
  async register(userData) {
    return this.api.post('/api/auth/register', userData);
  }

  async login(credentials) {
    const response = await this.api.post('/api/auth/login', credentials);
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
      this.emit('authSuccess', user);
    }
    return response;
  }

  async logout() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    this.emit('logout');
  }

  async getProfile() {
    return this.api.get('/api/auth/profile');
  }

  async updateProfile(profileData) {
    return this.api.put('/api/auth/profile', profileData);
  }

  // Admin methods
  async getAdminDashboard() {
    return this.api.get('/api/admin/dashboard/overview');
  }

  async getUsers(params = {}) {
    return this.api.get('/api/admin/users', { params });
  }

  async getPendingApprovals() {
    return this.api.get('/api/admin/pending-approvals');
  }

  async approveUser(userId, reason = '') {
    return this.api.post('/api/admin/approve-user', { userId, reason });
  }

  async rejectUser(userId, reason = '') {
    return this.api.post('/api/admin/reject-user', { userId, reason });
  }

  // Client methods
  async getClientDashboard() {
    return this.api.get('/api/client/dashboard');
  }

  async getOrders(params = {}) {
    return this.api.get('/api/client/orders', { params });
  }

  async getOrder(orderId) {
    return this.api.get(`/api/client/orders/${orderId}`);
  }

  async createOrder(orderData) {
    return this.api.post('/api/client/orders', orderData);
  }

  async getBills(params = {}) {
    return this.api.get('/api/client/bills', { params });
  }

  async getBill(billId) {
    return this.api.get(`/api/client/bills/${billId}`);
  }

  // Employee methods
  async getSalesDashboard() {
    return this.api.get('/api/employees/sales/dashboard');
  }

  async getMarketingDashboard() {
    return this.api.get('/api/employees/marketing/dashboard');
  }

  async getOfficeDashboard() {
    return this.api.get('/api/employees/office/dashboard');
  }

  // Feedback methods
  async getFeedback(params = {}) {
    return this.api.get('/api/feedback', { params });
  }

  async getClientFeedback() {
    return this.api.get('/api/feedback/client');
  }

  async createFeedback(feedbackData) {
    return this.api.post('/api/feedback', feedbackData);
  }

  async getFeedbackThread(threadId) {
    return this.api.get(`/api/feedback/${threadId}`);
  }

  async replyToFeedback(threadId, replyData) {
    return this.api.post(`/api/feedback/${threadId}/reply`, replyData);
  }

  // File upload methods
  async uploadFiles(files, category = 'general') {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('category', category);

    return this.api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for uploads
    });
  }

  async getUploads(params = {}) {
    return this.api.get('/api/uploads', { params });
  }

  async deleteUpload(uploadId) {
    return this.api.delete(`/api/uploads/${uploadId}`);
  }

  // Notification methods
  async getNotifications(params = {}) {
    return this.api.get('/api/notifications', { params });
  }

  async markNotificationRead(notificationId) {
    return this.api.put(`/api/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead() {
    return this.api.put('/api/notifications/mark-all-read');
  }

  async getUnreadCount() {
    return this.api.get('/api/notifications/unread-count');
  }

  // Connection status methods
  async checkConnection() {
    try {
      await this.api.get('/health', { timeout: 5000 });
      this.isConnected = true;
      this.emit('connected');
      return true;
    } catch (error) {
      this.isConnected = false;
      this.emit('disconnected');
      return false;
    }
  }

  // Retry failed requests
  async retryFailedRequests() {
    if (this.retryQueue.length === 0) return;
    
    const requests = [...this.retryQueue];
    this.retryQueue = [];
    
    for (const request of requests) {
      try {
        await this.api(request);
        this.emit('requestRetrySuccess', request);
      } catch (error) {
        this.retryQueue.push(request);
        this.emit('requestRetryFailed', { request, error });
      }
    }
  }

  // Real-time polling for updates
  startPolling(endpoint, interval = 30000, callback) {
    const pollData = async () => {
      try {
        const response = await this.api.get(endpoint);
        callback(null, response.data);
      } catch (error) {
        callback(error, null);
      }
    };

    // Initial call
    pollData();

    // Set up interval
    const intervalId = setInterval(pollData, interval);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Batch requests
  async batchRequests(requests) {
    try {
      const responses = await Promise.allSettled(
        requests.map(request => this.api(request))
      );
      
      return responses.map((result, index) => ({
        request: requests[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  }

  // Cache management
  async cacheResponse(key, data, ttl = 300000) { // 5 minutes default
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  async getCachedResponse(key) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const entry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < entry.ttl) {
          return entry.data;
        }
        // Expired, remove it
        await AsyncStorage.removeItem(`cache_${key}`);
      }
      return null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export both the instance and the class for flexibility
export default apiService;
export { ApiService };