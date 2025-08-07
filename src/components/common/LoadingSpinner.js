import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';

const theme = {
  colors: {
    primary: '#007AFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    surface: '#FFFFFF',
  }
};

const LoadingSpinner = ({
  visible = true,
  text = 'Loading...',
  size = 'large',
  color = theme.colors.primary,
  overlay = false,
  style,
  textStyle,
}) => {
  const spinner = (
    <View style={[styles.container, !overlay && style]}>
      <View style={styles.content}>
        <ActivityIndicator
          size={size}
          color={color}
          style={styles.spinner}
        />
        {text && (
          <Text style={[styles.text, textStyle]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        statusBarTranslucent={true}
      >
        <View style={[styles.overlay, style]}>
          <View style={styles.overlayContent}>
            <ActivityIndicator
              size={size}
              color={color}
              style={styles.spinner}
            />
            {text && (
              <Text style={[styles.overlayText, textStyle]}>
                {text}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return visible ? spinner : null;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  overlayText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default LoadingSpinner;