// components/Dashboard/MonthlyTrend.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MonthlyExpense } from '@/hooks/useExpenseAnalytics';
import { Colors } from '@/constants/Colors';

interface MonthlyTrendProps {
  monthlyData: MonthlyExpense[];
}


export function MonthlyTrend({ monthlyData }: MonthlyTrendProps) {
  if (monthlyData.length === 0) {

    const maxAmount = Math.max(...monthlyData.map(m => m.total));
        // Color scheme and styles
      const theme = useColorScheme();
      const colors = Colors[theme ?? 'light'];
      const styles = createStyles(colors);

    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Monthly Spending Trend</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No data yet. Your monthly spending will appear here!
          </ThemedText>
        </View>
      </View>
    );
  }



  const maxAmount = Math.max(...monthlyData.map(m => m.total));
        // Color scheme and styles
      const theme = useColorScheme();
      const colors = Colors[theme ?? 'light'];
      const styles = createStyles(colors);


  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Monthly Spending Trend</ThemedText>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartContainer}
      >
        {monthlyData.map((month, index) => {
          const barHeight = (month.total / maxAmount) * 150;
          const isCurrentMonth = index === monthlyData.length - 1;
          
          return (
            <View key={index} style={styles.monthColumn}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: barHeight,
                      backgroundColor: isCurrentMonth ? '#007AFF' : '#E5E5EA'
                    }
                  ]}
                >
                  <ThemedText style={[
                    styles.barAmount,
                    { color: isCurrentMonth ? '#fff' : '#333' }
                  ]}>
                    ₱{month.total >= 1000 
                      ? `${(month.total / 1000).toFixed(1)}k` 
                      : month.total.toFixed(0)
                    }
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.monthLabel} numberOfLines={1}>
                {month.month.split(' ')[0]}
              </ThemedText>
              
              <ThemedText style={styles.itemCount}>
                {month.itemCount} {month.itemCount === 1 ? 'item' : 'items'}
              </ThemedText>
            </View>
          );
        })}
      </ScrollView>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Average/Month</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{(monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length).toFixed(2)}
          </ThemedText>
        </View>
        
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Highest</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{Math.max(...monthlyData.map(m => m.total)).toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Lowest</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{Math.min(...monthlyData.map(m => m.total)).toFixed(2)}
          </ThemedText>
        </View>
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
    color: '#999',
    textAlign: 'center',
  },
  chartContainer: {
    paddingVertical: 16,
    gap: 16,
  },
  monthColumn: {
    alignItems: 'center',
    width: 70,
  },
  barWrapper: {
    height: 170,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 50,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 30,
  },
  barAmount: {
    fontSize: 11,
    fontWeight: '700',
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  itemCount: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
}