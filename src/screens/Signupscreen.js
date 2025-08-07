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
    email: '',
    phone: '',
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = ['fullname', 'email', 'phone', 'password', 'confirmPassword'];
    
    if (selectedUserType?.requiresApproval) {
      requiredFields.push('department', 'employeeId');
    }

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        const fieldNames = {
          fullname: 'Full name',
          email: 'Email address',
          phone: 'Phone number',
          password: 'Password',
          confirmPassword: 'Confirm password',
          department: 'Department',
          employeeId: 'Employee ID'
        };
        Alert.alert('Error', `${fieldNames[field]} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Phone validation (Indian format)
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const signupData = {
        fullname: formData.fullname.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/\s+/g, ''),
        role: formData.role,
        password: formData.password,
      };

      if (selectedUserType?.requiresApproval) {
        signupData.department = formData.department.trim();
        signupData.employee_id = formData.employeeId.trim();
      }

      const response = await api.post('/api/auth/register', signupData);

      if (response.data.success) {
        if (selectedUserType?.requiresApproval) {
          Alert.alert(
            'Registration Successful!',
            'Your account has been created and is pending admin approval. You will be notified once your account is approved.',
            [{ 
              text: 'OK', 
              onPress: () => navigation.navigate('LoginScreen')
            }]
          );
        } else {
          Alert.alert(
            'Registration Successful!',
            'Your account has been created successfully. You can now sign in.',
            [{ 
              text: 'OK', 
              onPress: () => navigation.navigate('LoginScreen')
            }]
          );
        }
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Unable to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response?.status === 409) {
        Alert.alert('Registration Failed', 'An account with this email or phone number already exists');
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
          {userTypes.map(type => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.userTypeOption,
                formData.role === type.key && styles.userTypeOptionSelected
              ]}
              onPress={() => {
                handleInputChange('role', type.key);
                setShowUserTypes(false);
              }}
            >
              <View style={styles.userTypeOptionInfo}>
                <View style={[styles.userTypeIcon, { backgroundColor: type.color }]}>
                  <Icon name={type.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.userTypeText}>
                  <Text style={styles.userTypeTitle}>{type.label}</Text>
                  <Text style={styles.userTypeDesc}>{type.description}</Text>
                  {type.requiresApproval && (
                    <Text style={styles.approvalNote}>Requires admin approval</Text>
                  )}
                </View>
              </View>
              {formData.role === type.key && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join our business platform</Text>
          </View>
        </View>

        {/* Signup Form */}
        <View style={styles.formContainer}>
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
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text.toLowerCase().trim())}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail"
            required
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon="phone"
            required
          />

          {renderUserTypeSelector()}

          {selectedUserType?.requiresApproval && (
            <>
              <Input
                label="Department"
                value={formData.department}
                onChangeText={(text) => handleInputChange('department', text)}
                placeholder="Enter your department"
                leftIcon="briefcase"
                autoCapitalize="words"
                required
              />

              <Input
                label="Employee ID"
                value={formData.employeeId}
                onChangeText={(text) => handleInputChange('employeeId', text)}
                placeholder="Enter your employee ID"
                leftIcon="hash"
                autoCapitalize="none"
                required
              />
            </>
          )}

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Enter your password (min. 6 characters)"
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
              onPress={() => navigation.navigate('LoginScreen')}
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
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    backgroundColor: '#FFFFFF',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userTypeText: {
    flex: 1,
  },
  userTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  userTypeDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  approvalNote: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '500',
    marginTop: 2,
  },
  userTypeOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
    overflow: 'hidden',
  },
  userTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userTypeOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  userTypeOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  signupButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    marginTop: 24,
    marginBottom: 20,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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