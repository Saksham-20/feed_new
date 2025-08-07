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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { theme } from '../styles/theme';
import { api } from '../services/api';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    role: 'client',
    password: '',
    confirmPassword: '',
    department: '',
    employeeId: '',
  });

  const [loading, setLoading] = useState(false);
  const [showUserTypes, setShowUserTypes] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userTypes = [
    {
      key: 'client',
      label: 'Client',
      description: 'Access to orders, bills, and feedback',
      icon: 'user',
      color: '#007AFF',
      requiresApproval: false,
    },
    {
      key: 'sales_purchase',
      label: 'Sales & Purchase',
      description: 'Manage sales operations and purchases',
      icon: 'trending-up',
      color: '#34C759',
      requiresApproval: true,
    },
    {
      key: 'marketing',
      label: 'Marketing',
      description: 'Handle marketing campaigns and leads',
      icon: 'megaphone',
      color: '#FF9500',
      requiresApproval: true,
    },
    {
      key: 'office',
      label: 'Office Management',
      description: 'Administrative and office operations',
      icon: 'briefcase',
      color: '#AF52DE',
      requiresApproval: true,
    },
    {
      key: 'admin',
      label: 'Administrator',
      description: 'Full system access and user management',
      icon: 'shield',
      color: '#FF3B30',
      requiresApproval: true,
    },
  ];

  const selectedUserType = userTypes.find(type => type.key === formData.role);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { fullname, phone, email, password, confirmPassword } = formData;

    if (!fullname.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }

    // Phone number validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(phone) || cleanPhone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }

    // Employee fields validation for non-client roles
    if (formData.role !== 'client') {
      if (!formData.department.trim()) {
        Alert.alert('Validation Error', 'Please enter your department');
        return false;
      }
      if (!formData.employeeId.trim()) {
        Alert.alert('Validation Error', 'Please enter your employee ID');
        return false;
      }
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const signupData = {
        fullname: formData.fullname.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        password: formData.password,
      };

      // Add employee-specific fields if not a client
      if (formData.role !== 'client') {
        signupData.department = formData.department.trim();
        signupData.employeeId = formData.employeeId.trim();
      }

      const response = await api.post('/auth/register', signupData);

      if (response.data.success) {
        if (selectedUserType?.requiresApproval) {
          Alert.alert(
            'Registration Submitted!',
            'Your account has been created and is pending admin approval. You will be notified once your account is approved.',
            [{ 
              text: 'OK', 
              onPress: () => navigation.navigate('Login')
            }]
          );
        } else {
          Alert.alert(
            'Registration Successful!',
            'Your account has been created successfully. You can now sign in.',
            [{ 
              text: 'OK', 
              onPress: () => navigation.navigate('Login')
            }]
          );
        }
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Unable to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response?.status === 409) {
        Alert.alert('Registration Failed', 'An account with this phone number or email already exists');
      } else if (error.response?.status === 400) {
        Alert.alert('Registration Failed', error.response.data.message || 'Please check your information and try again');
      } else {
        Alert.alert('Registration Failed', 'Unable to connect to server. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeSelector = () => (
    <View style={styles.userTypeContainer}>
      <Text style={styles.userTypeLabel}>Account Type *</Text>
      
      <TouchableOpacity
        style={styles.selectedUserType}
        onPress={() => setShowUserTypes(!showUserTypes)}
      >
        <View style={styles.userTypeInfo}>
          <View style={[styles.userTypeIcon, { backgroundColor: selectedUserType?.color }]}>
            <Icon name={selectedUserType?.icon} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.userTypeText}>
            <Text style={styles.userTypeTitle}>{selectedUserType?.label}</Text>
            <Text style={styles.userTypeDesc}>{selectedUserType?.description}</Text>
            {selectedUserType?.requiresApproval && (
              <Text style={styles.approvalNote}>Requires admin approval</Text>
            )}
          </View>
        </View>
        <Icon name={showUserTypes ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {showUserTypes && (
        <View style={styles.userTypeOptions}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.userTypeOption,
                formData.role === type.key && styles.selectedOption,
              ]}
              onPress={() => {
                handleInputChange('role', type.key);
                setShowUserTypes(false);
              }}
            >
              <View style={styles.userTypeInfo}>
                <View style={[styles.userTypeIcon, { backgroundColor: type.color }]}>
                  <Icon name={type.icon} size={18} color="#FFFFFF" />
                </View>
                <View style={styles.userTypeText}>
                  <Text style={styles.userTypeTitle}>{type.label}</Text>
                  <Text style={styles.userTypeDesc}>{type.description}</Text>
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

  const renderEmployeeFields = () => {
    if (formData.role === 'client') return null;

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
        />

        <Input
          label="Employee ID"
          value={formData.employeeId}
          onChangeText={(text) => handleInputChange('employeeId', text)}
          placeholder="Enter your employee ID"
          leftIcon="id-card"
          autoCapitalize="characters"
          required
        />
      </>
    );
  };

  const handleLoginNavigation = () => {
    if (navigation) {
      navigation.navigate('Login');
    } else {
      Alert.alert('Navigation', 'Please restart the app to access login');
    }
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
            onPress={() => navigation?.goBack()}
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
          <Input
            label="Full Name"
            value={formData.fullname}
            onChangeText={(text) => handleInputChange('fullname', text)}
            placeholder="Enter your full name"
            leftIcon="user"
            autoCapitalize="words"
            required
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon="phone"
            autoCapitalize="none"
            required
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
          />

          {renderUserTypeSelector()}

          {renderEmployeeFields()}

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Enter your password (minimum 6 characters)"
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            required
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
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
          />

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={handleLoginNavigation}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {loading && <LoadingSpinner overlay />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // User Type Selector Styles
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  selectedUserType: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  userTypeOptions: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  userTypeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  userTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userTypeText: {
    flex: 1,
  },
  userTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  userTypeDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  approvalNote: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginTop: 4,
  },

  // Button Styles
  signupButton: {
    marginTop: 24,
    marginBottom: 20,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  loginLink: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;