import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export interface PasswordStrength {
  score: number; // 0-6
  feedback: string[];
  isStrong: boolean;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, feedback: ['Password is required'], isStrong: false };
  }

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score++;
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include uppercase letters (A-Z)');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include lowercase letters (a-z)');
  }

  // Number check
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include numbers (0-9)');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Include special characters (!@#$%^&*)');
  }

  // Common patterns check (reduces score)
  const commonPatterns = [
    /^123|234|345|456|567|678|789/,
    /^abc|bcd|cde|def/i,
    /password/i,
    /qwerty/i,
    /111|222|333|444|555|666|777|888|999|000/,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns (123, abc, password)');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters (aaa, 111)');
  }

  const isStrong = score >= 4 && feedback.length === 0;

  return { score, feedback, isStrong };
}

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({ password, showRequirements = true }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password);
  
  const getStrengthColor = () => {
    if (strength.score === 0) return '#EF4444'; // red
    if (strength.score <= 2) return '#F59E0B'; // orange
    if (strength.score <= 4) return '#EAB308'; // yellow
    if (strength.score <= 5) return '#84CC16'; // lime
    return '#22C55E'; // green
  };

  const getStrengthLabel = () => {
    if (strength.score === 0) return 'Very Weak';
    if (strength.score <= 2) return 'Weak';
    if (strength.score <= 4) return 'Medium';
    if (strength.score <= 5) return 'Strong';
    return 'Very Strong';
  };

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View 
            style={[
              styles.barFill, 
              { 
                width: `${(strength.score / 6) * 100}%`,
                backgroundColor: getStrengthColor()
              }
            ]} 
          />
        </View>
        <ThemedText style={[styles.label, { color: getStrengthColor() }]}>
          {getStrengthLabel()}
        </ThemedText>
      </View>

      {/* Requirements */}
      {showRequirements && (
        <View style={styles.requirements}>
          <ThemedText style={styles.requirementsTitle}>
            Password Requirements:
          </ThemedText>
          <RequirementItem met={password.length >= 8} text="At least 8 characters" />
          <RequirementItem met={/[A-Z]/.test(password)} text="Uppercase letter (A-Z)" />
          <RequirementItem met={/[a-z]/.test(password)} text="Lowercase letter (a-z)" />
          <RequirementItem met={/\d/.test(password)} text="Number (0-9)" />
          <RequirementItem 
            met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} 
            text="Special character (!@#$%^&*)" 
          />
        </View>
      )}

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <View style={styles.feedback}>
          {strength.feedback.map((item, index) => (
            <ThemedText key={index} style={styles.feedbackText}>
              • {item}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementItem}>
      <ThemedText style={[styles.requirementIcon, met && styles.requirementMet]}>
        {met ? '✓' : '○'}
      </ThemedText>
      <ThemedText style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },
  barContainer: {
    marginBottom: 12,
  },
  barBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  requirements: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.5,
  },
  requirementText: {
    fontSize: 12,
    opacity: 0.7,
  },
  requirementMet: {
    opacity: 1,
    color: '#22C55E',
  },
  feedback: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderRadius: 6,
    padding: 10,
  },
  feedbackText: {
    fontSize: 11,
    color: '#92400E',
    marginBottom: 2,
  },
});