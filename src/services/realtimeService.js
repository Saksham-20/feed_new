// src/services/realtimeService.js - Real-time service with Socket.IO
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { EventEmitter } from 'events';

class RealtimeService extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscriptions = new Map();
    this.messageQueue = [];
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const serverUrl = __DEV__ 
        ? 'http://192.168.1.22:3000' 
        : 'https://your-production-api.com';

      if (!token) {
        console.log('No auth token found, cannot connect to socket');
        return false;
      }

      this.socket = io(serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventHandlers();
      return true;
    } catch (error) {
      console.error('Socket connection error:', error);
      this.emit('connectionError', error);
      return false;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.processMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('maxReconnectAttemptsReached');
      }
      
      this.emit('connectionError', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', attemptNumber);
    });

    // App-specific events
    this.socket.on('notification', (notification) => {
      console.log('New notification:', notification);
      this.emit('notification', notification);
    });

    this.socket.on('orderUpdate', (orderData) => {
      console.log('Order update:', orderData);
      this.emit('orderUpdate', orderData);
    });

    this.socket.on('feedbackReply', (replyData) => {
      console.log('New feedback reply:', replyData);
      this.emit('feedbackReply', replyData);
    });

    this.socket.on('userStatusUpdate', (statusData) => {
      this.emit('userStatusUpdate', statusData);
    });

    this.socket.on('userTyping', (typingData) => {
      this.emit('userTyping', typingData);
    });

    this.socket.on('fileUploaded', (fileData) => {
      console.log('File uploaded:', fileData);
      this.emit('fileUploaded', fileData);
    });

    this.socket.on('systemAlert', (alertData) => {
      console.log('System alert:', alertData);
      this.emit('systemAlert', alertData);
    });

    // Connection status updates
    this.socket.on('userConnected', (userData) => {
      this.emit('userConnected', userData);
    });

    this.socket.on('userDisconnected', (userData) => {
      this.emit('userDisconnected', userData);
    });

    // Initial connection data
    this.socket.on('connected', (data) => {
      console.log('Connected with data:', data);
      this.emit('initialData', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscriptions.clear();
      this.emit('disconnected');
    }
  }

  // Send message with queue support for offline scenarios
  send(event, data) {
    const message = { event, data, timestamp: Date.now() };
    
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      console.log('Message queued (offline):', event);
    }
  }

  processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.socket) {
        this.socket.emit(message.event, message.data);
      }
    }
  }

  // Subscription management
  subscribe(event, callback) {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    
    this.subscriptions.get(event).add(callback);
    this.on(event, callback);
    
    return () => {
      this.unsubscribe(event, callback);
    };
  }

  unsubscribe(event, callback) {
    if (this.subscriptions.has(event)) {
      this.subscriptions.get(event).delete(callback);
      this.off(event, callback);
    }
  }

  // Specific app methods
  joinThread(threadId) {
    this.send('joinThread', threadId);
  }

  leaveThread(threadId) {
    this.send('leaveThread', threadId);
  }

  sendTypingIndicator(threadId, isTyping) {
    this.send('typing', { threadId, isTyping });
  }

  updateUserStatus(status) {
    this.send('updateStatus', status);
  }

  markNotificationRead(notificationId) {
    this.send('markNotificationRead', notificationId);
  }

  // Real-time data subscriptions
  subscribeToNotifications(callback) {
    return this.subscribe('notification', callback);
  }

  subscribeToOrderUpdates(callback) {
    return this.subscribe('orderUpdate', callback);
  }

  subscribeToFeedbackReplies(callback) {
    return this.subscribe('feedbackReply', callback);
  }

  subscribeToFileUploads(callback) {
    return this.subscribe('fileUploaded', callback);
  }

  subscribeToSystemAlerts(callback) {
    return this.subscribe('systemAlert', callback);
  }

  subscribeToUserStatus(callback) {
    return this.subscribe('userStatusUpdate', callback);
  }

  subscribeToTypingIndicators(callback) {
    return this.subscribe('userTyping', callback);
  }

  // Connection status helpers
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      subscriptions: this.subscriptions.size,
    };
  }

  // Force reconnection
  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
      setTimeout(() => {
        this.socket.connect();
      }, 1000);
    }
  }

  // Health check
  ping() {
    return new Promise((resolve) => {
      if (!this.isConnected) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      this.socket.emit('ping', Date.now(), (response) => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;