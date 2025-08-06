// App.js - Enhanced main app component with real-time features
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  AppState,
  NetInfo,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import InteractiveDashboard from './src/components/dashboard/InteractiveDashboard';
import AdminScreen from './src/screens/enhanced/AdminScreen';
import ClientScreen from './src/screens/enhanced/ClientScreen';
import MarketingEmployeeScreen from './src/screens/MarketingEmployeeScreen';
import SalesEmployeeScreen from './src/screens/SalesEmployeeScreen';
import OfficeEmployeeScreen from './src/screens/OfficeEmployeeScreen';

// Import services and utilities
import apiService from './src/services/api';
import realtimeService from './src/services/realtimeService';
import { STORAGE_KEYS, USER_ROLES } from './src/utils/constants';
import { theme } from './src/styles/theme';
import LoadingSpinner from './src/components/common/LoadingSpinner';
import ConnectionStatusBar from './src/components/common/ConnectionStatusBar';
import NotificationBanner from './src/components/common/NotificationBanner';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [notifications, setNotifications] = useState([]);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  const appState = useRef(AppState.currentState);
  const notificationTimeout = useRef(null);

  useEffect(() => {
    initializeApp();
    setupAppStateListener();
    setupNetworkListener();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setupRealtimeConnection();
    } else {
      disconnectRealtime();
    }
  }, [isAuthenticated, user]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check authentication status
      await checkAuthStatus();
      
      // Setup API service listeners
      setupApiServiceListeners();
      
      // Check app version or force updates if needed
      await checkAppUpdates();
      
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app. Please restart.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid
        try {
          const response = await apiService.getProfile();
          if (response.data.success) {
            setUser(response.data.data);
            setIsAuthenticated(true);
            console.log('User authenticated:', response.data.data.email);
          } else {
            throw new Error('Invalid session');
          }
        } catch (error) {
          console.log('Session expired, clearing auth data');
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      await clearAuthData();
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    setUser(null);
    setIsAuthenticated(false);
  };

  const setupApiServiceListeners = () => {
    // Listen for authentication events
    apiService.on('authSuccess', (userData) => {
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Authentication successful:', userData.email);
    });

    apiService.on('authFailure', () => {
      setUser(null);
      setIsAuthenticated(false);
      Alert.alert('Session Expired', 'Please log in again.');
    });

    apiService.on('logout', () => {
      setUser(null);
      setIsAuthenticated(false);
      disconnectRealtime();
    });

    apiService.on('networkError', () => {
      setConnectionStatus('offline');
    });

    apiService.on('connected', () => {
      setConnectionStatus('online');
    });
  };

  const setupRealtimeConnection = async () => {
    if (!user) return;

    console.log('Setting up real-time connection for user:', user.email);
    
    const connected = await realtimeService.connect();
    if (connected) {
      setupRealtimeListeners();
    }
  };

  const setupRealtimeListeners = () => {
    // Connection status
    realtimeService.on('connected', () => {
      console.log('Real-time connection established');
      setConnectionStatus('online');
    });

    realtimeService.on('disconnected', () => {
      console.log('Real-time connection lost');
      setConnectionStatus('offline');
    });

    realtimeService.on('connectionError', (error) => {
      console.error('Real-time connection error:', error);
      setConnectionStatus('error');
    });

    // Notifications
    realtimeService.subscribeToNotifications((notification) => {
      console.log('Real-time notification received:', notification);
      setNotifications(prev => [notification, ...prev.slice(0, 99)]);
      showNotification(notification);
    });

    // System alerts
    realtimeService.subscribeToSystemAlerts((alert) => {
      Alert.alert('System Alert', alert.message, [
        { text: 'OK', onPress: () => console.log('System alert acknowledged') }
      ]);
    });

    // Order updates
    realtimeService.subscribeToOrderUpdates((orderData) => {
      console.log('Order update received:', orderData);
      showNotification({
        title: 'Order Update',
        message: `Order #${orderData.id} has been ${orderData.status}`,
        type: 'info'
      });
    });

    // File uploads
    realtimeService.subscribeToFileUploads((fileData) => {
      console.log('File upload notification:', fileData);
      if (fileData.uploadedBy !== user.id) {
        showNotification({
          title: 'New File Uploaded',
          message: `${fileData.files.length} file(s) uploaded`,
          type: 'info'
        });
      }
    });
  };

  const disconnectRealtime = () => {
    console.log('Disconnecting real-time service');
    realtimeService.disconnect();
    setConnectionStatus('offline');
  };

  const showNotification = (notification) => {
    setCurrentNotification(notification);
    setShowNotificationBanner(true);

    // Clear existing timeout
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }

    // Auto-hide after 5 seconds
    notificationTimeout.current = setTimeout(() => {
      setShowNotificationBanner(false);
    }, 5000);
  };

  const hideNotification = () => {
    setShowNotificationBanner(false);
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground');
        
        if (isAuthenticated) {
          // Refresh data when app becomes active
          checkAuthStatus();
          
          // Reconnect real-time if needed
          if (!realtimeService.isSocketConnected()) {
            setupRealtimeConnection();
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background');
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state.isConnected ? 'online' : 'offline');
      
      if (state.isConnected) {
        setConnectionStatus('online');
        
        // Retry failed requests when back online
        if (isAuthenticated) {
          apiService.retryFailedRequests();
          
          // Reconnect real-time if needed
          if (!realtimeService.isSocketConnected()) {
            setupRealtimeConnection();
          }
        }
      } else {
        setConnectionStatus('offline');
      }
    });

    return unsubscribe;
  };

  const checkAppUpdates = async () => {
    // Implement app update checking logic here
    // This could check app store version vs current version
    try {
      // Placeholder for update checking
      console.log('Checking for app updates...');
    } catch (error) {
      console.log('Update check failed:', error);
    }
  };

  const cleanup = () => {
    disconnectRealtime();
    apiService.removeAllListeners();
    
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
  };

  const getTabBarIcon = (routeName, focused, color, size) => {
    let iconName;

    switch (routeName) {
      case 'Dashboard':
        iconName = 'home';
        break;
      case 'Orders':
        iconName = 'shopping-cart';
        break;
      case 'Messages':
        iconName = 'message-circle';
        break;
      case 'Profile':
        iconName = 'user';
        break;
      case 'Reports':
        iconName = 'bar-chart-2';
        break;
      case 'Users':
        iconName = 'users';
        break;
      default:
        iconName = 'circle';
    }

    return <Icon name={iconName} size={size} color={color} />;
  };

  const AdminTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => 
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{ tabBarLabel: 'Dashboard' }}
      >
        {(props) => <InteractiveDashboard {...props} userRole={user?.role} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Users" 
        component={AdminScreen} 
        options={{ tabBarLabel: 'Users' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={AdminScreen} 
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={AdminScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );

  const ClientTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => 
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard">
        {(props) => <InteractiveDashboard {...props} userRole={user?.role} />}
      </Tab.Screen>
      <Tab.Screen name="Orders" component={ClientScreen} />
      <Tab.Screen name="Messages" component={ClientScreen} />
      <Tab.Screen name="Profile" component={ClientScreen} />
    </Tab.Navigator>
  );

  const EmployeeTabs = () => {
    const getEmployeeComponent = () => {
      switch (user?.role) {
        case USER_ROLES.SALES_PURCHASE:
          return SalesEmployeeScreen;
        case USER_ROLES.MARKETING:
          return MarketingEmployeeScreen;
        case USER_ROLES.OFFICE:
          return OfficeEmployeeScreen;
        default:
          return MarketingEmployeeScreen;
      }
    };

    const EmployeeComponent = getEmployeeComponent();

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => 
            getTabBarIcon(route.name, focused, color, size),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: styles.tabBar,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard">
          {(props) => <InteractiveDashboard {...props} userRole={user?.role} />}
        </Tab.Screen>
        <Tab.Screen name="Work" component={EmployeeComponent} />
        <Tab.Screen name="Messages" component={EmployeeComponent} />
        <Tab.Screen name="Profile" component={EmployeeComponent} />
      </Tab.Navigator>
    );
  };

  const getMainComponent = () => {
    if (!user) return null;

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return <AdminTabs />;
      case USER_ROLES.CLIENT:
        return <ClientTabs />;
      case USER_ROLES.SALES_PURCHASE:
      case USER_ROLES.MARKETING:
      case USER_ROLES.OFFICE:
        return <EmployeeTabs />;
      default:
        return <ClientTabs />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <SplashScreen />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false}
      />
      
      {/* Connection Status Bar */}
      <ConnectionStatusBar status={connectionStatus} />
      
      {/* Notification Banner */}
      {showNotificationBanner && currentNotification && (
        <NotificationBanner
          notification={currentNotification}
          onClose={hideNotification}
          onPress={() => {
            hideNotification();
            // Handle notification tap
            console.log('Notification tapped:', currentNotification);
          }}
        />
      )}

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main">
              {() => getMainComponent()}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
});

export default App;