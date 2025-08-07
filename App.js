import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  AppState,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';

// Core dependencies with error handling
let AsyncStorage, NetInfo, NavigationContainer, createStackNavigator;
let Feather;

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  NetInfo = require('@react-native-community/netinfo').default;
  NavigationContainer = require('@react-navigation/native').NavigationContainer;
  createStackNavigator = require('@react-navigation/stack').createStackNavigator;
  Feather = require('@expo/vector-icons').Feather;
} catch (error) {
  console.warn('Some dependencies missing, using fallbacks:', error.message);
}

// Import components - Create fallback components if files don't exist
let LoginScreen, SignupScreen, DashboardScreen, LoadingSpinner;

try {
  LoginScreen = require('./src/screens/LoginScreen').default;
} catch (error) {
  console.warn('LoginScreen not found, using fallback');
  LoginScreen = ({ onLogin }) => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>LoginScreen component not found</Text>
      <Text style={styles.fallbackSubtext}>Please create src/screens/LoginScreen.js</Text>
    </View>
  );
}

try {
  SignupScreen = require('./src/screens/SignupScreen').default;
} catch (error) {
  console.warn('SignupScreen not found, using fallback');
  SignupScreen = ({ navigation }) => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>SignupScreen component not found</Text>
      <Text style={styles.fallbackSubtext}>Please create src/screens/SignupScreen.js</Text>
    </View>
  );
}

try {
  DashboardScreen = require('./src/screens/DashboardScreen').default;
} catch (error) {
  console.warn('DashboardScreen not found, using fallback');
  DashboardScreen = ({ user, onLogout }) => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>Dashboard</Text>
      <Text style={styles.fallbackSubtext}>Welcome, {user?.fullname || 'User'}!</Text>
      <Text style={styles.fallbackSubtext}>Role: {user?.role || 'N/A'}</Text>
      <TouchableOpacity style={styles.fallbackButton} onPress={onLogout}>
        <Text style={styles.fallbackButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

try {
  LoadingSpinner = require('./src/components/common/LoadingSpinner').default;
} catch (error) {
  console.warn('LoadingSpinner not found, using fallback');
  LoadingSpinner = ({ overlay, visible = true }) => 
    visible ? <ActivityIndicator size="large" color={theme.colors.primary} /> : null;
}

// Safe theme fallback
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#FF6B35',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
  }
};

// Safe constants
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            The app encountered an error. Please restart the app.
          </Text>
          <Text 
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Safe Splash Screen Component
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete && onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.splashContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            {Feather ? (
              <Feather name="zap" size={40} color="#FFFFFF" />
            ) : (
              <Text style={styles.logoEmoji}>⚡</Text>
            )}
          </View>
          <Text style={styles.appName}>Business Pro</Text>
          <Text style={styles.appTagline}>Professional Business Management</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

// Main App Component
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initializeApp();
    const cleanupNetwork = setupNetworkListener();
    const cleanupBackHandler = setupBackHandler();

    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App has come to the foreground!');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      cleanupNetwork();
      cleanupBackHandler();
      subscription?.remove();
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    console.log('🚀 Initializing Business Pro App');
    try {
      // Check for existing user session
      if (AsyncStorage) {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (userData && token) {
          setUser(JSON.parse(userData));
          console.log('👤 User session restored');
        }
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const setupNetworkListener = () => {
    if (NetInfo) {
      const unsubscribe = NetInfo.addEventListener(state => {
        console.log('🌐 Connection type:', state.type);
        console.log('🌐 Is connected?', state.isConnected);
        setConnectionStatus(state.isConnected ? 'online' : 'offline');
      });
      return unsubscribe;
    }
    return () => {};
  };

  const setupBackHandler = () => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        if (user) {
          Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'YES', onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
    return () => {};
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up app resources');
  };

  const handleLogin = async (userData) => {
    console.log('👤 User logged in:', userData.role);
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLogout = async () => {
    console.log('👋 User logged out');
    try {
      if (AsyncStorage) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
        ]);
      }
      setUser(null);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <ErrorBoundary>
        <SplashScreen onComplete={() => setIsLoading(false)} />
      </ErrorBoundary>
    );
  }

  // Fallback navigation if dependencies are missing
  if (!NavigationContainer || !createStackNavigator) {
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          {user ? (
            <DashboardScreen user={user} onLogout={handleLogout} />
          ) : (
            <LoginScreen onLogin={handleLogin} />
          )}
          
          {/* Connection Status */}
          {connectionStatus === 'offline' && (
            <View style={styles.offlineBar}>
              <Text style={styles.offlineText}>No internet connection</Text>
            </View>
          )}
        </View>
      </ErrorBoundary>
    );
  }

  // Full navigation setup
  const Stack = createStackNavigator();

  return (
    <ErrorBoundary>
      <NavigationContainer
        onReady={() => console.log('📍 Navigation ready')}
        onStateChange={(state) => console.log('📍 Navigation state changed')}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        
        <View style={styles.container}>
          {/* Connection Status */}
          {connectionStatus === 'offline' && (
            <View style={styles.offlineBar}>
              <Text style={styles.offlineText}>No internet connection</Text>
            </View>
          )}
          
          {/* Navigation */}
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Screen name="Dashboard">
                {() => <DashboardScreen user={user} onLogout={handleLogout} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Login">
                  {() => <LoginScreen onLogin={handleLogin} />}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Error Boundary Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },

  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Offline Bar
  offlineBar: {
    backgroundColor: theme.colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default App;