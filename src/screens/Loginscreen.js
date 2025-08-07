import React, { useState, useEffect } from 'react';
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

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('AsyncStorage not available');
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

// Import TextInput from React Native
import { TextInput } from 'react-native';

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

const LoginScreen = ({ navigation, onLogin }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      if (AsyncStorage) {
        const savedPhone = await AsyncStorage.getItem('savedPhone');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        
        if (savedPhone && savedRememberMe === 'true') {
          setFormData(prev => ({ ...prev, phone: savedPhone }));
          setRememberMe(true);
        }
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (AsyncStorage && rememberMe) {
        await AsyncStorage.setItem('savedPhone', formData.phone);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else if (AsyncStorage) {
        await AsyncStorage.multiRemove(['savedPhone', 'rememberMe']);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(formData.phone) || cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Save credentials if remember me is checked
      await saveCredentials();

      // Simulate API call - Replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock user data based on phone number
      const userData = getMockUserData(formData.phone);

      if (userData) {
        // Call the onLogin callback with user data
        onLogin(userData);
      } else {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMockUserData = (phone) => {
    // Mock user database - Replace with real API
    const mockUsers = {
      '1234567890': {
        user_id: '1',
        fullname: 'John Admin',
        email: 'admin@businesspro.com',
        phone: '1234567890',
        role: 'admin',
        status: 'active',
        department: 'Administration',
        employee_id: 'EMP001',
      },
      '9876543210': {
        user_id: '2',
        fullname: 'Jane Smith',
        email: 'jane@client.com',
        phone: '9876543210',
        role: 'client',
        status: 'active',
      },
      '5551234567': {
        user_id: '3',
        fullname: 'Mike Marketing',
        email: 'mike@businesspro.com',
        phone: '5551234567',
        role: 'marketing',
        status: 'active',
        department: 'Marketing',
        employee_id: 'EMP002',
      },
      '5559876543': {
        user_id: '4',
        fullname: 'Sarah Sales',
        email: 'sarah@businesspro.com',
        phone: '5559876543',
        role: 'sales_purchase',
        status: 'active',
        department: 'Sales',
        employee_id: 'EMP003',
      },
      '5555555555': {
        user_id: '5',
        fullname: 'Bob Office',
        email: 'bob@businesspro.com',
        phone: '5555555555',
        role: 'office',
        status: 'active',
        department: 'Office',
        employee_id: 'EMP004',
      },
    };

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return mockUsers[cleanPhone] || null;
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be available soon. Please contact support if you need immediate assistance.\n\nDemo Accounts:\n• Admin: 1234567890\n• Client: 9876543210\n• Marketing: 5551234567\n• Sales: 5559876543\n• Office: 5555555555\n\nPassword: any 6+ characters',
      [{ text: 'OK' }]
    );
  };

  const handleSignupNavigation = () => {
    if (navigation) {
      navigation.navigate('Signup');
    } else {
      Alert.alert('Navigation', 'Signup screen will be available soon.');
    }
  };

  const renderDemoAccounts = () => (
    <View style={styles.demoContainer}>
      <Text style={styles.demoTitle}>Demo Accounts</Text>
      <Text style={styles.demoText}>Try these phone numbers with any password (6+ chars):</Text>
      
      <View style={styles.demoAccountsGrid}>
        <TouchableOpacity 
          style={styles.demoAccount}
          onPress={() => setFormData({ ...formData, phone: '1234567890', password: 'admin123' })}
        >
          <Icon name="shield" size={16} color={theme.colors.error} />
          <Text style={styles.demoRole}>Admin</Text>
          <Text style={styles.demoPhone}>1234567890</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoAccount}
          onPress={() => setFormData({ ...formData, phone: '9876543210', password: 'client123' })}
        >
          <Icon name="user" size={16} color={theme.colors.primary} />
          <Text style={styles.demoRole}>Client</Text>
          <Text style={styles.demoPhone}>9876543210</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoAccount}
          onPress={() => setFormData({ ...formData, phone: '5551234567', password: 'marketing123' })}
        >
          <Icon name="megaphone" size={16} color={theme.colors.warning} />
          <Text style={styles.demoRole}>Marketing</Text>
          <Text style={styles.demoPhone}>5551234567</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoAccount}
          onPress={() => setFormData({ ...formData, phone: '5559876543', password: 'sales123' })}
        >
          <Icon name="trending-up" size={16} color={theme.colors.success} />
          <Text style={styles.demoRole}>Sales</Text>
          <Text style={styles.demoPhone}>5559876543</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚡</Text>
            <Text style={styles.logoText}>Business Pro</Text>
            <Text style={styles.logoSubtext}>Professional Business Management</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              leftIcon="phone"
              autoCapitalize="none"
              required
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Enter your password (minimum 6 characters)"
              secureTextEntry={!showPassword}
              leftIcon="lock"
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              required
            />

            {/* Remember Me */}
            <TouchableOpacity 
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberText}>Remember my phone number</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo Accounts */}
            {renderDemoAccounts()}

            {/* Sign Up */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignupNavigation}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Business Pro. All rights reserved.</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    width: '100%',
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
  
  // Remember Me
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rememberText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  loginButton: {
    marginBottom: 16,
  },
  
  // Forgot Password
  forgotPassword: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingHorizontal: 16,
  },
  
  // Demo Accounts
  demoContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  demoAccountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  demoAccount: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  demoPhone: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Sign Up
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
});

export default LoginScreen;