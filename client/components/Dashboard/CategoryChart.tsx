// components/Dashboard/CategoryChart.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { CategoryExpense } from '@/hooks/useExpenseAnalytics';
import { Colors } from '@/constants/Colors'
import { LinearGradient } from 'expo-linear-gradient';
interface CategoryChartProps {
  categories: CategoryExpense[];
}

export function CategoryChart({ categories }: CategoryChartProps) {

  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);
  if (categories.length === 0) {
    return (
      <LinearGradient
      colors={['#a855f7', '#c084fc', '#a855f7', '#7e22ce']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <ThemedText style={styles.title}>Spending by Category</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No expenses yet. Start shopping to see your category breakdown!
          </ThemedText>
        </View>
      </LinearGradient>
    );
  }
  const maxAmount = Math.max(...categories.map(c => c.total));
  return (
    <LinearGradient
      colors={['#a855f7', '#c084fc', '#a855f7', '#7e22ce']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ThemedText style={styles.title}>Spending by Category</ThemedText>
      {/* Legend */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.legendContainer}
      >
        {categories.map((category, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: category.color }]} />
            <ThemedText style={styles.legendText}>{category.category}</ThemedText>
          </View>
        ))}
      </ScrollView>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <LinearGradient
          colors={['rgba(17, 26, 46,0.25)', 'rgba(199,237,204,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chartCardContainer}
        >
          {categories.map((category, index) => {
            const barWidth = (category.total / maxAmount) * 100;
            return (
              <View key={index} style={styles.barRow}>
                <View style={styles.barLabelContainer}>
                  <ThemedText style={styles.barLabel} numberOfLines={1}>
                    {category.category}
                  </ThemedText>
                  <ThemedText style={styles.barCount}>
                    {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                  </ThemedText>
                </View>

                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${barWidth}%`,
                        backgroundColor: category.color
                      }
                    ]}
                  >
                    <ThemedText style={styles.barValue}>
                      ₱{category.total.toFixed(0)}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={styles.percentage}>
                  {category.percentage.toFixed(1)}%
                </ThemedText>
              </View>
            );
          })}
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
    title: {
      fontSize: 18,
      color: '#fff',
      fontWeight: '700',
      marginBottom: 16,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 7,
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: '#fff',
      textAlign: 'center',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 7,
    },
    legendContainer: {
      marginBottom: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 2,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 7,
    },
    chartContainer: {
      gap: 12,
    },
    chartCardContainer: {
      borderRadius: 12,
      padding: 10,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    barLabelContainer: {
      width: 80,
    },
    barLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 4,
    },
    barCount: {
      fontSize: 10,
      color: '#ffffffc0',
    },
    barContainer: {
      flex: 1,
      height: 32,
      backgroundColor: '#f0f0f0ce',
      borderRadius: 6,
      borderColor: '#00000084',
      borderWidth: 0.7,
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      justifyContent: 'center',
      paddingHorizontal: 8,
      minWidth: 40,
    },
    barValue: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 7,
    },
    percentage: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffffc0',
      width: 50,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 4,
      textAlign: 'right',
    },
  });
}