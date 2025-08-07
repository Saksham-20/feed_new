import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native';

// Try to import dependencies with fallbacks
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available, using fallback');
  Icon = ({ name, size, color, style }) => (
    <View style={[{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }, style]} />
  );
}

const { width, height } = Dimensions.get('window');

// Theme
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#FF6B35',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    surface: '#FFFFFF',
    background: '#F9FAFB',
    border: '#E5E7EB',
  }
};

// User Roles
const USER_ROLES = {
  CLIENT: 'client',
  SALES_PURCHASE: 'sales_purchase',
  MARKETING: 'marketing',
  OFFICE: 'office',
  ADMIN: 'admin',
};

// Simple Input Component
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  error,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      {label && (
        <Text style={styles.inputLabel}>
          {label}{required && ' *'}
        </Text>
      )}
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        disabled && styles.inputWrapperDisabled,
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon 
              name={leftIcon} 
              size={20} 
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          style={[
            styles.textInput,
            leftIcon && styles.textInputWithLeftIcon,
            rightIcon && styles.textInputWithRightIcon,
          ]}
        />

        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
          >
            <Icon 
              name={rightIcon} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

// Simple Button Component
const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? '#93C5FD' : theme.colors.primary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? theme.colors.border : theme.colors.primary,
        };
      default:
        return {
          backgroundColor: isDisabled ? '#93C5FD' : theme.colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          color: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      default:
        return {
          color: '#FFFFFF',
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getButtonStyle(),
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextStyle().color} />
      ) : (
        <Text style={[styles.buttonText, getTextStyle()]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.CLIENT,
    department: '',
    employee_id: '',
    agreeToTerms: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [errors, setErrors] = useState({});

  const userTypes = [
    {
      key: USER_ROLES.CLIENT,
      label: 'Client',
      description: 'Access to orders and billing',
      icon: 'user',
      color: theme.colors.primary,
      requiresApproval: false,
    },
    {
      key: USER_ROLES.SALES_PURCHASE,
      label: 'Sales & Purchase',
      description: 'Manage sales and purchase orders',
      icon: 'trending-up',
      color: theme.colors.success,
      requiresApproval: true,
    },
    {
      key: USER_ROLES.MARKETING,
      label: 'Marketing',
      description: 'Campaign and lead management',
      icon: 'megaphone',
      color: theme.colors.warning,
      requiresApproval: true,
    },
    {
      key: USER_ROLES.OFFICE,
      label: 'Office Employee',
      description: 'Administrative tasks and reports',
      icon: 'briefcase',
      color: theme.colors.secondary,
      requiresApproval: true,
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(formData.phone) || cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Employee fields validation
    if (formData.role !== USER_ROLES.CLIENT) {
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required for employees';
      }
      if (!formData.employee_id.trim()) {
        newErrors.employee_id = 'Employee ID is required for employees';
      }
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedUserType = userTypes.find(type => type.key === formData.role);
      
      if (selectedUserType?.requiresApproval) {
        Alert.alert(
          'Registration Submitted',
          `Your ${selectedUserType.label} account has been submitted for approval. You will be notified once it's approved by an administrator.`,
          [
            {
              text: 'OK',
              onPress: () => navigation?.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully. You can now sign in with your credentials.',
          [
            {
              text: 'Sign In',
              onPress: () => navigation?.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Registration Failed', 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const renderRoleSelector = () => {
    const selectedType = userTypes.find(type => type.key === formData.role);
    
    return (
      <View style={styles.roleSelectorContainer}>
        <Text style={styles.inputLabel}>Account Type *</Text>
        
        <TouchableOpacity
          style={[styles.roleSelector, showRoleSelector && styles.roleSelectorOpen]}
          onPress={() => setShowRoleSelector(!showRoleSelector)}
        >
          <View style={styles.roleSelectorContent}>
            <View style={[styles.roleIcon, { backgroundColor: selectedType.color }]}>
              <Icon name={selectedType.icon} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.roleText}>
              <Text style={styles.roleLabel}>{selectedType.label}</Text>
              <Text style={styles.roleDescription}>{selectedType.description}</Text>
            </View>
          </View>
          <Icon 
            name={showRoleSelector ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>

        {showRoleSelector && (
          <View style={styles.roleOptions}>
            {userTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.roleOption,
                  formData.role === type.key && styles.selectedRoleOption,
                ]}
                onPress={() => {
                  handleInputChange('role', type.key);
                  setShowRoleSelector(false);
                }}
              >
                <View style={styles.roleOptionContent}>
                  <View style={[styles.roleIcon, { backgroundColor: type.color }]}>
                    <Icon name={type.icon} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.roleText}>
                    <Text style={styles.roleLabel}>{type.label}</Text>
                    <Text style={styles.roleDescription}>{type.description}</Text>
                    {type.requiresApproval && (
                      <Text style={styles.approvalNote}>Requires admin approval</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEmployeeFields = () => {
    if (formData.role === USER_ROLES.CLIENT) return null;

    return (
      <>
        <Input
          label="Department"
          value={formData.department}
          onChangeText={(text) => handleInputChange('department', text)}
          placeholder="Enter your department"
          leftIcon="building"
          autoCapitalize="words"
          required
          error={errors.department}
        />

        <Input
          label="Employee ID"
          value={formData.employee_id}
          onChangeText={(text) => handleInputChange('employee_id', text)}
          placeholder="Enter your employee ID"
          leftIcon="id-card"
          autoCapitalize="characters"
          required
          error={errors.employee_id}
        />
      </>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleLoginNavigation}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join Business Pro today</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.formContainer}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Full Name"
              value={formData.fullname}
              onChangeText={(text) => handleInputChange('fullname', text)}
              placeholder="Enter your full name"
              leftIcon="user"
              autoCapitalize="words"
              required
              error={errors.fullname}
            />

            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email address"
              keyboardType="email-address"
              leftIcon="mail"
              autoCapitalize="none"
              required
              error={errors.email}
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              leftIcon="phone"
              required
              error={errors.phone}
            />

            {/* Account Type */}
            <Text style={styles.sectionTitle}>Account Type</Text>
            {renderRoleSelector()}

            {/* Employee Fields */}
            {renderEmployeeFields()}

            {/* Security */}
            <Text style={styles.sectionTitle}>Security</Text>
            
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Create a strong password (min. 6 characters)"
              secureTextEntry={!showPassword}
              leftIcon="lock"
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              required
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              leftIcon="lock"
              rightIcon={showConfirmPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              required
              error={errors.confirmPassword}
            />

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
            >
              <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
                {formData.agreeToTerms && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
                {errors.agreeToTerms && (
                  <Text style={styles.termsError}>* {errors.agreeToTerms}</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Create Account Button */}
            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            />

            {/* Sign In */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLoginNavigation}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  leftIconContainer: {
    marginRight: 12,
  },
  rightIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 16,
  },
  textInputWithLeftIcon: {
    paddingLeft: 0,
  },
  textInputWithRightIcon: {
    paddingRight: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 6,
  },
  
  // Role Selector
  roleSelectorContainer: {
    marginBottom: 20,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  roleSelectorOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleText: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  roleOptions: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  roleOption: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedRoleOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  roleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  approvalNote: {
    fontSize: 11,
    color: theme.colors.warning,
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  // Terms and Conditions
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  termsError: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
  
  // Button Styles
  button: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    marginBottom: 24,
  },
  
  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;