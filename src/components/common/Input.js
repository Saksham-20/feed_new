import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const theme = {
  colors: {
    primary: '#007AFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    surface: '#FFFFFF',
    error: '#EF4444',
  }
};

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  secureTextEntry = false,
  multiline = false,
  numberOfLines,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  error,
  disabled = false,
  style,
  inputStyle,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute',
    left: leftIcon ? 50 : 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textSecondary, isFocused ? theme.colors.primary : theme.colors.textSecondary],
    }),
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const containerBorderColor = error 
    ? theme.colors.error 
    : isFocused 
      ? theme.colors.primary 
      : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputContainer,
        { borderColor: containerBorderColor },
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        disabled && styles.inputContainerDisabled,
        style
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon 
              name={leftIcon} 
              size={20} 
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </View>
        )}

        <View style={styles.textInputWrapper}>
          {label && (
            <Animated.Text style={labelStyle}>
              {label}{required && ' *'}
            </Animated.Text>
          )}
          
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={isFocused ? '' : placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            style={[
              styles.textInput,
              leftIcon && styles.textInputWithLeftIcon,
              rightIcon && styles.textInputWithRightIcon,
              multiline && styles.textInputMultiline,
              disabled && styles.textInputDisabled,
              inputStyle
            ]}
            {...props}
          />
        </View>

        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Icon 
              name={rightIcon} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  leftIconContainer: {
    marginRight: 12,
  },
  rightIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  textInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 0,
    margin: 0,
  },
  textInputWithLeftIcon: {
    paddingLeft: 0,
  },
  textInputWithRightIcon: {
    paddingRight: 0,
  },
  textInputMultiline: {
    textAlignVertical: 'top',
    paddingTop: 16,
    paddingBottom: 16,
  },
  textInputDisabled: {
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 6,
  },
});

export default Input;