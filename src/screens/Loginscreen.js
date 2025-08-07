import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation, onLogin }) => {
  const authContext = useContext(AuthContext);
  const login = authContext?.login || onLogin;
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(formData.phone) || cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.phone, formData.password);
      
      if (result && result.success) {
        navigateToUserScreen(result.user.role);
      } else if (result && result.error) {
        Alert.alert('Login Failed', result.error);
      } else {
        // Direct login success (when onLogin is used)
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToUserScreen = (userRole) => {
    if (!navigation) return;
    
    const navigationMap = {
      'client': 'ClientScreen',
      'sales_purchase': 'SalePurchaseEmployeeScreen',
      'marketing': 'MarketingEmployeeScreen',
      'office': 'OfficeEmployeeScreen',
      'admin': 'AdminScreen',
    };

    const screenName = navigationMap[userRole] || 'ClientScreen';
    navigation.replace(screenName);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be available soon. Please contact support if you need immediate assistance.',
      [{ text: 'OK' }]
    );
  };

  const handleSignupNavigation = () => {
    if (navigation) {
      navigation.navigate('Signup');
    } else {
      Alert.alert('Navigation', 'Please restart the app to access signup');
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={handleSignupNavigation}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Create Account</Text>
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
    minHeight: height,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 12,
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  welcomeContainer: {
    marginBottom: 32,
    alignItems: 'center',
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
    marginBottom: 32,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 'auto',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  signupLink: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;