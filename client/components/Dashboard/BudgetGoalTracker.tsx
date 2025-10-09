// components/Dashboard/BudgetGoalTracker.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface BudgetGoalTrackerProps {
  spent: number;
  budget: number;
}

export function BudgetGoalTracker({ spent, budget }: BudgetGoalTrackerProps) {
  if (budget === 0) {
    return null;
  }

  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = Math.max(budget - spent, 0);
  const isOverBudget = spent > budget;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Monthly Budget</ThemedText>
        <ThemedText style={[
          styles.amount,
          isOverBudget && styles.overBudget
        ]}>
          ₱{spent.toFixed(2)} / ₱{budget.toFixed(2)}
        </ThemedText>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { 
              width: `${percentage}%`,
              backgroundColor: isOverBudget ? '#FF3B30' : 
                percentage > 80 ? '#FF9500' : '#34C759'
            }
          ]}
        />
      </View>

      {/* Status */}
      <View style={styles.footer}>
        {isOverBudget ? (
          <ThemedText style={styles.overBudgetText}>
            ⚠️ Over budget by ₱{(spent - budget).toFixed(2)}
          </ThemedText>
        ) : (
          <ThemedText style={styles.remainingText}>
            ✓ ₱{remaining.toFixed(2)} remaining ({(100 - percentage).toFixed(1)}%)
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  overBudget: {
    color: '#FF3B30',
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  overBudgetText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
});