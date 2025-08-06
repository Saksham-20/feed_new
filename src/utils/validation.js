// src/utils/validation.js

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateLength = (value, min, max) => {
  if (!value) return false;
  const length = value.toString().length;
  return length >= min && length <= max;
};

export const validateNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFormData = (data, rules) => {
  const errors = {};

  for (const field in rules) {
    const fieldRules = rules[field];
    const value = data[field];

    for (const rule of fieldRules) {
      switch (rule.type) {
        case 'required':
          if (!validateRequired(value)) {
            errors[field] = rule.message || `${field} is required`;
          }
          break;

        case 'email':
          if (value && !validateEmail(value)) {
            errors[field] = rule.message || 'Invalid email format';
          }
          break;

        case 'phone':
          if (value && !validatePhone(value)) {
            errors[field] = rule.message || 'Invalid phone number';
          }
          break;

        case 'password':
          if (value && !validatePassword(value)) {
            errors[field] = rule.message || 'Password must be at least 6 characters';
          }
          break;

        case 'length':
          if (value && !validateLength(value, rule.min || 0, rule.max || Infinity)) {
            errors[field] = rule.message || `${field} must be between ${rule.min} and ${rule.max} characters`;
          }
          break;

        case 'numeric':
          if (value && !validateNumeric(value)) {
            errors[field] = rule.message || `${field} must be a number`;
          }
          break;

        case 'url':
          if (value && !validateUrl(value)) {
            errors[field] = rule.message || 'Invalid URL format';
          }
          break;

        default:
          break;
      }

      // Stop at first error for this field
      if (errors[field]) break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};