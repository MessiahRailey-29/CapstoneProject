// components/Dashboard/CategoryChart.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { CategoryExpense } from '@/hooks/useExpenseAnalytics';
import { Colors } from '@/constants/Colors'
interface CategoryChartProps {
  categories: CategoryExpense[];
}

export function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
      // Color scheme and styles
      const theme = useColorScheme();
      const colors = Colors[theme ?? 'light'];
      const styles = createStyles(colors);

    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Spending by Category</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No expenses yet. Start shopping to see your category breakdown!
          </ThemedText>
        </View>
      </View>
    );
  }

  const maxAmount = Math.max(...categories.map(c => c.total));
  // Color scheme and styles
      const theme = useColorScheme();
      const colors = Colors[theme ?? 'light'];
      const styles = createStyles(colors);

  return (
    <View style={styles.container}>
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
      </View>
    </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderColor: colors.borderColor,
    borderWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text,
    textAlign: 'center',
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
    color: colors.text,
  },
  chartContainer: {
    gap: 12,
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
    color: colors.text,
  },
  barCount: {
    fontSize: 10,
    color: colors.text,
  },
  barContainer: {
    flex: 1,
    height: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
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
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    width: 50,
    textAlign: 'right',
  },
});
}