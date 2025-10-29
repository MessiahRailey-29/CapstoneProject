import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ClerkAPIError } from '@clerk/types';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ErrorDisplayProps {
  errors: ClerkAPIError[];
  style?: any;
}

export function ErrorDisplay({ errors, style }: ErrorDisplayProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (errors.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [errors]);

  if (errors.length === 0) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {errors.map((error, index) => (
        <View key={error.code || index} style={styles.errorCard}>
          <View style={styles.iconContainer}>
            <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
          </View>
          <View style={styles.errorContent}>
            <ThemedText style={styles.errorTitle}>
              {getErrorTitle(error.code)}
            </ThemedText>
            <ThemedText style={styles.errorMessage}>
              {error.longMessage || error.message}
            </ThemedText>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

// Helper function to provide user-friendly error titles
function getErrorTitle(code?: string): string {
  const errorTitles: Record<string, string> = {
    'form_identifier_not_found': 'Account Not Found',
    'form_password_incorrect': 'Incorrect Password',
    'form_param_format_invalid': 'Invalid Format',
    'form_password_pwned': 'Weak Password',
    'form_password_length_too_short': 'Password Too Short',
    'form_identifier_exists': 'Account Already Exists',
    'form_code_incorrect': 'Invalid Code',
    'session_exists': 'Already Signed In',
  };

  return errorTitles[code || ''] || 'Error';
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 24,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
});