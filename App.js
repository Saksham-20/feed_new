import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { FeedbackProvider } from './src/context/FeedbackContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ClientScreen from './src/screens/ClientScreen';
import AdminScreen from './src/screens/enhanced/AdminScreen';
import MarketingEmployeeScreen from './src/screens/MarketingEmployeeScreen';
import SalePurchaseEmployeeScreen from './src/screens/SalePurchaseEmployeeScreen';
import OfficeEmployeeScreen from './src/screens/OfficeEmployeeScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Hide splash screen after app loads
    const prepare = async () => {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <FeedbackProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            
            <Stack.Navigator
              initialRouteName="LoginScreen"
              screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                animationEnabled: true,
                cardStyle: { backgroundColor: '#FFFFFF' },
              }}
            >
              {/* Authentication Screens */}
              <Stack.Screen 
                name="LoginScreen" 
                component={LoginScreen}
                options={{
                  animationTypeForReplace: 'push',
                }}
              />
              <Stack.Screen 
                name="SignupScreen" 
                component={SignupScreen}
                options={{
                  gestureEnabled: true,
                }}
              />

              {/* User Role Screens */}
              <Stack.Screen 
                name="ClientScreen" 
                component={ClientScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="AdminScreen" 
                component={AdminScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="MarketingEmployeeScreen" 
                component={MarketingEmployeeScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="SalePurchaseEmployeeScreen" 
                component={SalePurchaseEmployeeScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="OfficeEmployeeScreen" 
                component={OfficeEmployeeScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </FeedbackProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}