// src/styles/theme.js

export const theme = {
  colors: {
    // Primary colors
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#60A5FA',
    
    // Secondary colors
    secondary: '#7C3AED',
    secondaryDark: '#6D28D9',
    secondaryLight: '#A78BFA',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Status colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // Border colors
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',
    
    // Input colors
    inputBackground: '#FFFFFF',
    inputBorder: '#D1D5DB',
    inputBorderFocus: '#2563EB',
    inputText: '#1F2937',
    inputPlaceholder: '#9CA3AF',
    
    // Button colors
    buttonPrimary: '#2563EB',
    buttonPrimaryHover: '#1D4ED8',
    buttonSecondary: '#6B7280',
    buttonSecondaryHover: '#4B5563',
    buttonDanger: '#EF4444',
    buttonDangerHover: '#DC2626',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.25)',
  },
  
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 4,
    },
    xl: {
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 5,
    },
  },
  
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
};

// Dark theme variant
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textLight: '#94A3B8',
    border: '#475569',
    borderLight: '#334155',
    borderDark: '#64748B',
    inputBackground: '#334155',
    inputBorder: '#475569',
    inputText: '#F8FAFC',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
};

// Common styles - define these as functions to avoid circular reference
export const getCommonStyles = () => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    shadowOffset: theme.shadows.base.shadowOffset,
    shadowOpacity: theme.shadows.base.shadowOpacity,
    shadowRadius: theme.shadows.base.shadowRadius,
    elevation: theme.shadows.base.elevation,
  },
  
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    fontSize: theme.fontSizes.base,
    color: theme.colors.inputText,
  },
  
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium,
  },
  
  title: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  
  subtitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
  },
  
  bodyText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    lineHeight: theme.lineHeights.normal * theme.fontSizes.base,
  },
  
  captionText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

// Alternative: Export common styles as a separate object
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  
  bodyText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  
  captionText: {
    fontSize: 14,
    color: '#64748B',
  },
};