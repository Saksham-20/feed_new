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
  TouchableOpacity,
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
  LoginScreen = ({ navigation, onLogin }) => (
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
    visible ? (
      <View style={[styles.loadingContainer, overlay && styles.loadingOverlay]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    ) : null;
}

// Theme fallback
const theme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
  }
};

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: '@BusinessPro:userData',
  ACCESS_TOKEN: '@BusinessPro:accessToken',
  REFRESH_TOKEN: '@BusinessPro:refreshToken',
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
    console.error('🚨 App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            The app encountered an unexpected error. Please restart the application.
          </Text>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.restartButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Splash Screen Component
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>⚡</Text>
        <Text style={styles.appName}>Business Pro</Text>
        <Text style={styles.appTagline}>Professional Business Management</Text>
      </View>
      <LoadingSpinner />
    </View>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initializeApp();
    const networkCleanup = setupNetworkListener();
    const backHandlerCleanup = setupBackHandler();
    const appStateCleanup = setupAppStateListener();

    return () => {
      networkCleanup();
      backHandlerCleanup();
      appStateCleanup();
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Business Pro App');
      
      if (AsyncStorage) {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('👤 Restored user session:', parsedUser.role);
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('❌ App initialization error:', error);
    }
  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App has come to the foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('📱 App has gone to the background');
      }
      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  };

  const setupNetworkListener = () => {
    if (NetInfo) {
      const unsubscribe = NetInfo.addEventListener(state => {
        console.log('🌐 Network status:', state.type, state.isConnected);
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
                  {({ navigation }) => <LoginScreen navigation={navigation} onLogin={handleLogin} />}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

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
  restartButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Fallback Component Styles
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading Spinner Styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Connection Status Styles
  offlineBar: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});