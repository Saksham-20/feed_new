// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

// Replace this with your actual API URL
const BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // Development URL
  : 'https://your-production-api.com'; // Production URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
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
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
        
        console.error('Token refresh failed:', refreshError);
        // You can emit an event here to redirect to login screen
      }
    }

    return Promise.reject(error);
  }
);

export default api;