// components/Dashboard/WeeklyPurchaseSummary.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWeeklyPurchaseAnalytics } from '@/hooks/useWeeklyPurchaseAnalytics';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function WeeklyPurchaseSummary() {
  const weeklyData = useWeeklyPurchaseAnalytics();
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  if (weeklyData.weeklyItemCount === 0) {
    return (
      <LinearGradient
        colors={['#10b981', '#059669', '#047857', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.title}>Weekly Purchase Summary</ThemedText>
            <ThemedText style={styles.weekRange}>{weekRange}</ThemedText>
          </View>
          <Ionicons name="stats-chart-outline" size={24} color={colors.textSecondary} />
        </View>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No purchases recorded this week yet
          </ThemedText>
        </View>
      </LinearGradient>
    );
  }

  const averageDailySpend = weeklyData.totalWeeklySpent / 7;
  const topCategory = weeklyData.categoryBreakdown[0];
  const topStore = weeklyData.storeBreakdown[0];

  return (
    <LinearGradient
      colors={['#10b981', '#059669', '#047857', colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Weekly Purchase Summary</ThemedText>
          <ThemedText style={styles.weekRange}>{weekRange}</ThemedText>
        </View>
        <Ionicons name="stats-chart-outline" size={24} color={colors.textSecondary} />
      </View>

      {/* Total Summary Cards */}
      <View style={styles.summaryRow}>
        <LinearGradient
          colors={[colors.gradientCard1, colors.gradientCard2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderLeftColor: '#10b981' }]}
        >
          <ThemedText style={styles.summaryLabel}>Total Spent</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{weeklyData.totalWeeklySpent.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.summarySubtext}>
            {weeklyData.weeklyItemCount} items
          </ThemedText>
        </LinearGradient>

        <LinearGradient
          colors={[colors.gradientCard1, colors.gradientCard2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderLeftColor: '#3b82f6' }]}
        >
          <ThemedText style={styles.summaryLabel}>Daily Avg</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{averageDailySpend.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.summarySubtext}>
            per day
          </ThemedText>
        </LinearGradient>
      </View>

      {/* Top Category & Store */}
      {topCategory && topStore && (
        <View style={styles.insightsRow}>
          <LinearGradient
            colors={[colors.gradientCard1, colors.gradientCard2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.insightCard}
          >
            <ThemedText style={styles.insightLabel}>Top Category</ThemedText>
            <ThemedText style={styles.insightValue}>{topCategory.category}</ThemedText>
            <ThemedText style={styles.insightSubtext}>
              ₱{topCategory.total.toFixed(2)} ({topCategory.percentage.toFixed(0)}%)
            </ThemedText>
          </LinearGradient>

          <LinearGradient
            colors={[colors.gradientCard1, colors.gradientCard2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.insightCard}
          >
            <ThemedText style={styles.insightLabel}>Top Store</ThemedText>
            <ThemedText style={styles.insightValue}>{topStore.store}</ThemedText>
            <ThemedText style={styles.insightSubtext}>
              ₱{topStore.total.toFixed(2)} ({topStore.percentage.toFixed(0)}%)
            </ThemedText>
          </LinearGradient>
        </View>
      )}

      {/* Category Breakdown */}
      {weeklyData.categoryBreakdown.length > 0 && (
        <View style={styles.breakdownSection}>
          <ThemedText style={styles.breakdownTitle}>Category Breakdown</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.breakdownScroll}
          >
            {weeklyData.categoryBreakdown.slice(0, 5).map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <ThemedText style={styles.categoryName}>{category.category}</ThemedText>
                <ThemedText style={styles.categoryAmount}>₱{category.total.toFixed(2)}</ThemedText>
                <ThemedText style={styles.categoryCount}>{category.count} items</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Daily Spending Trend */}
      {weeklyData.dailySpending.length > 0 && (
        <View style={styles.breakdownSection}>
          <ThemedText style={styles.breakdownTitle}>Daily Spending</ThemedText>
          <View style={styles.dailyContainer}>
            {weeklyData.dailySpending.map((day, index) => (
              <View key={index} style={styles.dayCard}>
                <ThemedText style={styles.dayName}>{day.day}</ThemedText>
                <ThemedText style={styles.dayAmount}>₱{day.total.toFixed(0)}</ThemedText>
                <ThemedText style={styles.dayCount}>{day.count} items</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: '700',
    },
    weekRange: {
      fontSize: 12,
      color: colors.textSecondary,
      opacity: 0.8,
      marginTop: 2,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.text,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    summaryCard: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 0.5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      padding: 12,
      borderLeftWidth: 4,
    },
    summaryLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: '700',
    },
    summarySubtext: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
      opacity: 0.8,
    },
    insightsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    insightCard: {
      flex: 1,
      borderRadius: 8,
      padding: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    insightLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    insightValue: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '700',
      marginBottom: 2,
    },
    insightSubtext: {
      fontSize: 10,
      color: colors.textSecondary,
      opacity: 0.8,
    },
    breakdownSection: {
      marginTop: 8,
    },
    breakdownTitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 10,
    },
    breakdownScroll: {
      gap: 10,
    },
    categoryCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      padding: 10,
      minWidth: 100,
      alignItems: 'center',
    },
    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 4,
    },
    categoryName: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
      textAlign: 'center',
    },
    categoryAmount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '700',
      marginBottom: 2,
    },
    categoryCount: {
      fontSize: 9,
      color: colors.textSecondary,
      opacity: 0.8,
    },
    dailyContainer: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    dayCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      padding: 8,
      minWidth: 90,
      alignItems: 'center',
    },
    dayName: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    dayAmount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '700',
      marginBottom: 2,
    },
    dayCount: {
      fontSize: 9,
      color: colors.textSecondary,
      opacity: 0.8,
    },
  });
}