// src/screens/SplashScreen.js - Enhanced diagnostic splash screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { theme } from '../styles/theme';

const SplashScreen = ({ onLoadComplete, debug = true }) => {
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [progress, setProgress] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Simulate loading steps for debugging
    const loadingSteps = [
      { text: 'Initializing app...', delay: 500 },
      { text: 'Loading configuration...', delay: 1000 },
      { text: 'Checking authentication...', delay: 1500 },
      { text: 'Setting up services...', delay: 2000 },
      { text: 'Preparing interface...', delay: 2500 },
      { text: 'Almost ready...', delay: 3000 },
    ];

    loadingSteps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingText(step.text);
        setProgress((index + 1) / loadingSteps.length);
        
        // Complete loading after last step
        if (index === loadingSteps.length - 1) {
          setTimeout(() => {
            if (onLoadComplete) {
              onLoadComplete();
            }
          }, 500);
        }
      }, step.delay);
    });

    // Cleanup timer if component unmounts
    return () => {
      // Clear any pending timeouts
    };
  }, [fadeAnim, onLoadComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Icon name="zap" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>Business Pro</Text>
          <Text style={styles.appTagline}>Professional Business Management</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color="#FFFFFF" 
            style={styles.spinner}
          />
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.loadingText}>{loadingText}</Text>
          
          {debug && (
            <Text style={styles.debugText}>
              Debug Mode: {Math.round(progress * 100)}% Complete
            </Text>
          )}
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Business Pro</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 24,
  },
  progressBarContainer: {
    width: 200,
    marginBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  debugText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default SplashScreen;