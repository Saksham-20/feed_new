// src/components/common/ConnectionStatusBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ConnectionStatusBar = ({ status }) => {
  if (status === 'online') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          color: '#EF4444',
          icon: 'wifi-off',
          text: 'No Internet Connection'
        };
      case 'error':
        return {
          color: '#F59E0B',
          icon: 'alert-triangle',
          text: 'Connection Error'
        };
      default:
        return {
          color: '#6B7280',
          icon: 'loader',
          text: 'Connecting...'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.color }]}>
      <Icon name={config.icon} size={16} color="#FFFFFF" />
      <Text style={styles.text}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ConnectionStatusBar;