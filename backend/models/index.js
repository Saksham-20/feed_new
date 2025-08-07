// backend/models/index.js - Export all models
const User = require('./User');
const Order = require('./Order');
const Bill = require('./Bill');
const Customer = require('./Customer');
const { FeedbackThread, FeedbackMessage } = require('./FeedbackThread');

// Import other models if they exist
let Lead, Campaign, Task, Document;

try {
  Lead = require('./Lead');
} catch (e) {
  console.warn('Lead model not found, creating placeholder...');
  Lead = null;
}

try {
  Campaign = require('./Campaign');
} catch (e) {
  console.warn('Campaign model not found, creating placeholder...');
  Campaign = null;
}

try {
  Task = require('./Task');
} catch (e) {
  console.warn('Task model not found, creating placeholder...');
  Task = null;
}

try {
  Document = require('./Document');
} catch (e) {
  console.warn('Document model not found, creating placeholder...');
  Document = null;
}

module.exports = {
  User,
  Order,
  Bill,
  Customer,
  FeedbackThread,
  FeedbackMessage,
  Lead,
  Campaign,
  Task,
  Document
};