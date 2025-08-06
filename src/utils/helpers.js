// src/utils/helpers.js

export const formatDate = (dateString, options = {}) => {
  try {
    const date = new Date(dateString);
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    return date.toLocaleDateString('en-IN', defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return formatDate(dateString, { month: 'short', day: 'numeric' });
    }
  } catch (error) {
    return 'Unknown';
  }
};

export const formatTime = (dateString, options = {}) => {
  try {
    const date = new Date(dateString);
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
    };
    return date.toLocaleTimeString('en-IN', defaultOptions);
  } catch (error) {
    return 'Invalid Time';
  }
};

export const formatCurrency = (amount, currency = 'INR') => {
  try {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

export const formatNumber = (number, options = {}) => {
  try {
    const formatter = new Intl.NumberFormat('en-IN', options);
    return formatter.format(number);
  } catch (error) {
    return number.toString();
  }
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      
      return item[key] === value;
    });
  });
};

export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImage = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

export const isDocument = (filename) => {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const extension = getFileExtension(filename).toLowerCase();
  return docExtensions.includes(extension);
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};