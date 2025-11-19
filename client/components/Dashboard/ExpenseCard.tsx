// components/Dashboard/ExpenseCard.tsx
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors'
import { formatCurrency } from "@/utils/formatCurrency";

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

  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);


  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {icon && <IconSymbol name={icon} size={24} color={color} />}
      </View>

      <ThemedText style={styles.amount}>₱{formatCurrency(amount)}</ThemedText>

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

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 0.5,
      borderColor: colors.borderColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 14,
      color: colors.exposedGhost,
      fontWeight: '500',
    },
    amount: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      color: colors.exposedGhost,
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
      textShadowColor: colors.oppositeBackground,
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
  });
}