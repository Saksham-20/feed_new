// src/components/common/NotificationBanner.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const NotificationBanner = ({ notification, onClose, onPress }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return { backgroundColor: '#10B981', icon: 'check-circle' };
      case 'warning':
        return { backgroundColor: '#F59E0B', icon: 'alert-triangle' };
      case 'error':
        return { backgroundColor: '#EF4444', icon: 'alert-circle' };
      default:
        return { backgroundColor: '#6366F1', icon: 'bell' };
    }
  };

  const style = getNotificationStyle();

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: style.backgroundColor },
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Icon name={style.icon} size={20} color="#FFFFFF" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="x" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 44, // Account for status bar
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export { ConnectionStatusBar, NotificationBanner };