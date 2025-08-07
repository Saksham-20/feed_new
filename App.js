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
} catch (error) {
  console.warn('AsyncStorage not available:', error.message);
}

try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (error) {
  console.warn('NetInfo not available:', error.message);
}

try {
  const navigation = require('@react-navigation/native');
  NavigationContainer = navigation.NavigationContainer;
} catch (error) {
  console.warn('@react-navigation/native not available:', error.message);
}

try {
  const stack = require('@react-navigation/stack');
  createStackNavigator = stack.createStackNavigator;
} catch (error) {
  console.warn('@react-navigation/stack not available:', error.message);
}

try {
  Feather = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available:', error.message);
}

// Import components with proper error handling
let LoginScreen, SignupScreen, DashboardScreen, SplashScreen;
let AdminScreen, ClientScreen, MarketingEmployeeScreen, SalesPurchaseEmployeeScreen, OfficeEmployeeScreen;

// Main screens
try {
  LoginScreen = require('./src/screens/Loginscreen').default;
} catch (error) {
  console.warn('LoginScreen not found, using fallback');
  LoginScreen = ({ navigation, onLogin }) => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>Login Screen</Text>
      <TouchableOpacity 
        style={styles.fallbackButton} 
        onPress={() => onLogin({ fullname: 'Test User', role: 'client' })}
      >
        <Text style={styles.fallbackButtonText}>Test Login</Text>
      </TouchableOpacity>
    </View>
  );
}

try {
  SignupScreen = require('./src/screens/SignupScreen').default;
} catch (error) {
  console.warn('SignupScreen not found, using fallback');
  SignupScreen = ({ navigation }) => (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>Signup Screen</Text>
      <TouchableOpacity 
        style={styles.fallbackButton} 
        onPress={() => navigation?.goBack()}
      >
        <Text style={styles.fallbackButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

try {
  DashboardScreen = require('./src/screens/DashboardScreen').default;
} catch (error) {
  console.warn('DashboardScreen not found, using fallback');
}

try {
  SplashScreen = require('./src/screens/SplashScreen').default;
} catch (error) {
  console.warn('SplashScreen not found, using fallback');
  SplashScreen = ({ onComplete }) => {
    useEffect(() => {
      const timer = setTimeout(() => onComplete(), 2000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText}>Business Pro</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };
}

// Role-specific screens
try {
  AdminScreen = require('./src/screens/enhanced/AdminScreen').default;
} catch (error) {
  console.warn('AdminScreen not found');
}

try {
  ClientScreen = require('./src/screens/enhanced/ClientScreen').default;
} catch (error) {
  console.warn('ClientScreen not found');
}

try {
  MarketingEmployeeScreen = require('./src/screens/MarketingEmployeeScreen').default;
} catch (error) {
  console.warn('MarketingEmployeeScreen not found');
}

try {
  SalesPurchaseEmployeeScreen = require('./src/screens/SalesPurchaseEmployeeScreen').default;
} catch (error) {
  console.warn('SalesPurchaseEmployeeScreen not found');
}

try {
  OfficeEmployeeScreen = require('./src/screens/OfficeEmployeeScreen').default;
} catch (error) {
  console.warn('OfficeEmployeeScreen not found');
}

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

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'userData',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
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
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>Please restart the app</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('online');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing Business Pro App');
      
      // Setup connections and handlers
      const cleanupFunctions = [];
      
      try {
        cleanupFunctions.push(setupNetworkListener());
        cleanupFunctions.push(setupAppStateListener());
        cleanupFunctions.push(setupBackHandler());
        
        await checkUserAuthentication();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 1500); // Minimum splash time
      }

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
      };
    };

    initializeApp();
  }, []);

  const setupNetworkListener = () => {
    if (NetInfo) {
      const unsubscribe = NetInfo.addEventListener(state => {
        console.log('📶 Connection status:', state.isConnected ? 'online' : 'offline');
        setConnectionStatus(state.isConnected ? 'online' : 'offline');
      });
      return unsubscribe;
    }
    return () => {};
  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App has come to the foreground');
      }
      appState.current = nextAppState;
    });
    return () => subscription?.remove();
  };

  const setupBackHandler = () => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        if (user) {
          Alert.alert('Exit App', 'Are you sure you want to exit?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
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

  const checkUserAuthentication = async () => {
    try {
      if (AsyncStorage) {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('👤 Found existing user:', parsedUser.role);
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
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

  // Get appropriate dashboard screen based on user role
  const getDashboardScreen = (user) => {
    if (!user) return null;

    const roleScreenMap = {
      admin: AdminScreen,
      client: ClientScreen,
      marketing: MarketingEmployeeScreen,
      sales_purchase: SalesPurchaseEmployeeScreen,
      office: OfficeEmployeeScreen,
    };

    const ScreenComponent = roleScreenMap[user.role] || DashboardScreen;
    
    if (!ScreenComponent) {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Dashboard</Text>
          <Text style={styles.fallbackSubtext}>Welcome, {user.fullname}!</Text>
          <Text style={styles.fallbackSubtext}>Role: {user.role}</Text>
          <TouchableOpacity style={styles.fallbackButton} onPress={handleLogout}>
            <Text style={styles.fallbackButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <ScreenComponent user={user} onLogout={handleLogout} />;
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
          <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
          
          {user ? (
            getDashboardScreen(user)
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
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              gestureEnabled: true,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            {user ? (
              // Authenticated screens
              <>
                <Stack.Screen name="Dashboard">
                  {() => getDashboardScreen(user)}
                </Stack.Screen>
                {/* Add more authenticated screens here if needed */}
              </>
            ) : (
              // Authentication screens
              <>
                <Stack.Screen name="Login">
                  {({ navigation }) => (
                    <LoginScreen navigation={navigation} onLogin={handleLogin} />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Signup">
                  {({ navigation }) => (
                    <SignupScreen navigation={navigation} />
                  )}
                </Stack.Screen>
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
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Fallback Component Styles
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  fallbackButtonText: {
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
  splashText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },

  // Connection Status
  offlineBar: {
    backgroundColor: theme.colors.error,
    padding: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;