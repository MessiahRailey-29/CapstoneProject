// components/Dashboard/ExpenseCard.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

type ValidIconName = 
  | "calendar"
  | "chart.bar"
  | "clock"
  | "cart"
  | "bag"
  | "dollarsign.circle"
  | "arrow.up"
  | "arrow.down";

interface ExpenseCardProps {
  title: string;
  amount: number;
  icon?: ValidIconName;
  subtitle?: string;
  trend?: number;
  color?: string;
}

export function ExpenseCard({ 
  title, 
  amount, 
  icon, 
  subtitle, 
  trend,
  color = '#007AFF' 
}: ExpenseCardProps) {
  const trendUp = trend && trend > 0;
  const trendDown = trend && trend < 0;

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {icon && <IconSymbol name={icon} size={24} color={color} />}
      </View>
      
      <ThemedText style={styles.amount}>₱{amount.toFixed(2)}</ThemedText>
      
      {subtitle && (
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      )}

      {trend !== undefined && trend !== 0 && (
        <View style={styles.trendContainer}>
          <IconSymbol 
            name={trendUp ? "arrow.up" : "arrow.down"} 
            size={16} 
            color={trendUp ? "#34C759" : "#FF3B30"} 
          />
          <ThemedText style={[
            styles.trendText,
            { color: trendUp ? "#34C759" : "#FF3B30" }
          ]}>
            {Math.abs(trend).toFixed(1)}% from last month
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});