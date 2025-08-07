// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://192.168.1.22:3000'; // Change this to your actual API URL
const API_TIMEOUT = 30000; // 30 seconds

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Custom fetch with timeout
const fetchWithTimeout = (url, options = {}, timeout = API_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// API Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Set token
  async setToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  // Clear token
  async clearToken() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Build headers
  async buildHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders,
    };

    const token = await this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.response = { status: response.status, data };
      throw error;
    }

    return { data, status: response.status };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.buildHeaders(options.headers);
      
      const requestOptions = {
        method: 'GET',
        headers,
        ...options,
      };

      // Add body for POST, PUT, PATCH requests
      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        requestOptions.body = JSON.stringify(options.body);
      } else if (options.body) {
        requestOptions.body = options.body;
        // Remove content-type for FormData to let browser set it
        if (options.body instanceof FormData) {
          delete requestOptions.headers['Content-Type'];
        }
      }

      console.log(`🌐 API Request: ${requestOptions.method} ${url}`);
      
      const response = await fetchWithTimeout(url, requestOptions, this.timeout);
      const result = await this.handleResponse(response);
      
      console.log(`✅ API Response: ${result.status}`);
      return result;
      
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error.message);
      
      // Handle specific error cases
      if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        await this.clearToken();
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    return this.request(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
    });
  }

  // PUT request
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
    });
  }

  // PATCH request
  async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data to form
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// Auth Service
class AuthService {
  constructor(apiService) {
    this.api = apiService;
  }

  // Login
  async login(email, password) {
    try {
      const response = await this.api.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store tokens and user data
        const { accessToken, refreshToken } = response.data.data.tokens;
        const userData = response.data.data.user;

        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, refreshToken || ''],
          [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        ]);

        return {
          success: true,
          user: userData,
          tokens: { accessToken, refreshToken },
        };
      }

      return {
        success: false,
        error: response.data.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please try again.',
      };
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await this.api.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      // Always clear local data
      await this.api.clearToken();
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.api.getToken();
    const userData = await this.getCurrentUser();
    return !!(token && userData);
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.api.post('/api/auth/refresh', {
        refreshToken,
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken || refreshToken],
        ]);

        return { success: true };
      }

      throw new Error(response.data.message || 'Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.api.clearToken();
      return { success: false, error: error.message };
    }
  }
}

// Create instances
const api = new ApiService();
const auth = new AuthService(api);

export { api, auth };
export default api;