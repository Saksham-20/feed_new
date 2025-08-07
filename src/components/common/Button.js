import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

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
    border: '#E5E7EB',
  }
};

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'medium', // small, medium, large
  leftIcon,
  rightIcon,
  style,
  textStyle,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? '#93C5FD' : theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600',
          }
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? '#FCA5A5' : theme.colors.secondary,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600',
          }
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? theme.colors.border : theme.colors.primary,
          },
          text: {
            color: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
            fontWeight: '600',
          }
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: isDisabled ? '#F9FAFB' : 'rgba(0, 122, 255, 0.1)',
            borderWidth: 0,
          },
          text: {
            color: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
            fontWeight: '600',
          }
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? '#FCA5A5' : theme.colors.error,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600',
          }
        };
      case 'success':
        return {
          container: {
            backgroundColor: isDisabled ? '#86EFAC' : theme.colors.success,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600',
          }
        };
      default:
        return {
          container: {
            backgroundColor: isDisabled ? '#93C5FD' : theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600',
          }
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            minHeight: 36,
          },
          text: {
            fontSize: 14,
          }
        };
      case 'medium':
        return {
          container: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            minHeight: 48,
          },
          text: {
            fontSize: 16,
          }
        };
      case 'large':
        return {
          container: {
            paddingHorizontal: 24,
            paddingVertical: 16,
            minHeight: 56,
          },
          text: {
            fontSize: 18,
          }
        };
      default:
        return {
          container: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            minHeight: 48,
          },
          text: {
            fontSize: 16,
          }
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variantStyles.text.color}
            style={styles.loader}
          />
        )}
        
        {leftIcon && !loading && (
          <Icon
            name={leftIcon}
            size={sizeStyles.text.fontSize}
            color={variantStyles.text.color}
            style={styles.leftIcon}
          />
        )}
        
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
            textStyle,
          ]}
        >
          {children || title}
        </Text>
        
        {rightIcon && !loading && (
          <Icon
            name={rightIcon}
            size={sizeStyles.text.fontSize}
            color={variantStyles.text.color}
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default Button;