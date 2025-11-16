// components/Dashboard/MonthlyTrend.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MonthlyExpense } from '@/hooks/useExpenseAnalytics';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface MonthlyTrendProps {
  monthlyData: MonthlyExpense[];
}


export function MonthlyTrend({ monthlyData }: MonthlyTrendProps) {
  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  if (monthlyData.length === 0) {

    const maxAmount = Math.max(...monthlyData.map(m => m.total));

    return (
    <LinearGradient
      colors={['#4CAF50', '#A5D6A7', '#81C784', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <ThemedText style={styles.title}>Monthly Spending Trend</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No data yet. Your monthly spending will appear here!
          </ThemedText>
        </View>
      </LinearGradient>
    );
  }

  const maxAmount = Math.max(...monthlyData.map(m => m.total));

  return (
    <LinearGradient
      colors={['#4CAF50', '#A5D6A7', '#81C784', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <ThemedText style={styles.title}>Monthly Spending Trend</ThemedText>
        <View style={styles.trendIndicator}>
          <ThemedText style={styles.trendText}>
            {monthlyData.length >= 2 && monthlyData[monthlyData.length - 1].total > monthlyData[monthlyData.length - 2].total ? '📈' : '📉'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.chartBackground}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}
        >
          {monthlyData.map((month, index) => {
            const barHeight = (month.total / maxAmount) * 120;
            const isCurrentMonth = index === monthlyData.length - 1;
            const barGradientColors = isCurrentMonth
              ? ['#8BC34A', '#4CAF50'] as const
              : ['#A5D6A7', '#81C784'] as const;

            return (
              <View key={index} style={styles.monthColumn}>
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={barGradientColors}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 40),
                      }
                    ]}
                  >
                    <View style={styles.barContent}>
                      <ThemedText style={styles.barAmount}>
                        ₱{month.total >= 1000
                          ? `${(month.total / 1000).toFixed(1)}k`
                          : month.total.toFixed(0)
                        }
                      </ThemedText>
                      {isCurrentMonth && (
                        <View style={styles.currentBadge}>
                          <ThemedText style={styles.currentBadgeText}>Now</ThemedText>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.monthInfo}>
                  <ThemedText style={styles.monthLabel} numberOfLines={1}>
                    {month.month.split(' ')[0]}
                  </ThemedText>
                  <ThemedText style={styles.itemCount}>
                    {month.itemCount} {month.itemCount === 1 ? 'item' : 'items'}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Enhanced Summary Stats */}
      <View style={styles.summaryContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'rgba(199,237,204,0.3)']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <ThemedText style={styles.summaryEmoji}>📊</ThemedText>
            </View>
            <ThemedText style={styles.summaryLabel}>Average</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ₱{(monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length).toFixed(0)}
            </ThemedText>
          </View>

          <View style={[styles.summaryItem, styles.summaryDivider]}>
            <View style={styles.summaryIcon}>
              <ThemedText style={styles.summaryEmoji}>🚀</ThemedText>
            </View>
            <ThemedText style={styles.summaryLabel}>Highest</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ₱{Math.max(...monthlyData.map(m => m.total)).toFixed(0)}
            </ThemedText>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <ThemedText style={styles.summaryEmoji}>💎</ThemedText>
            </View>
            <ThemedText style={styles.summaryLabel}>Lowest</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ₱{Math.min(...monthlyData.map(m => m.total)).toFixed(0)}
            </ThemedText>
          </View>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      borderRadius: 16,
      padding: 20,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
      lineHeight: 30
    },
    trendIndicator: {
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(129,199,132,0.6)',
    },
    trendText: {
      fontSize: 18,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    chartBackground: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(129,199,132,0.3)',
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      fontSize: 16,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    chartContainer: {
      paddingVertical: 8,
      gap: 20,
    },
    monthColumn: {
      alignItems: 'center',
      width: 80,
    },
    barWrapper: {
      height: 140,
      justifyContent: 'flex-end',
      marginBottom: 12,
    },
    bar: {
      width: 50,
      borderRadius: 25,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    barContent: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    barAmount: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    currentBadge: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: 'rgba(76,175,80,0.4)',
    },
    currentBadgeText: {
      fontSize: 8,
      fontWeight: '600',
      color: '#2E7D32',
    },
    monthInfo: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 8,
      padding: 8,
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(129,199,132,0.3)',
    },
    monthLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 2,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    itemCount: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.8)',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    summaryContainer: {
      marginTop: 8,
    },
    summaryCard: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    summaryItem: {
      alignItems: 'center',
      flex: 1,
    },
    summaryDivider: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    summaryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'rgba(129,199,132,0.4)',
    },
    summaryEmoji: {
      fontSize: 16,
    },
    summaryLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
      fontWeight: '500',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
  });
}