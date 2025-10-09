// app/(home)/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-expo';
import { useExpenseAnalytics } from '@/hooks/useExpenseAnalytics';
import { ExpenseCard } from '@/components/Dashboard/ExpenseCard';
import { CategoryChart } from '@/components/Dashboard/CategoryChart';
import { MonthlyTrend } from '@/components/Dashboard/MonthlyTrend';
import { useInventoryStorageCounts } from '@/stores/InventoryStore';
import { StorageOverview } from '@/components/Dashboard/StorageOverview';

export default function Homepage() {
  const router = useRouter();
  const { user } = useUser();
  const [refreshing, setRefreshing] = React.useState(false);
  const storageCounts = useInventoryStorageCounts();
  const analytics = useExpenseAnalytics();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const monthTrend = analytics.previousMonthSpent !== 0
    ? ((analytics.currentMonthSpent - analytics.previousMonthSpent) / analytics.previousMonthSpent) * 100
    : 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Home",
          headerLargeTitle: true,
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome back, {user?.firstName || 'Friend'}!
          </ThemedText>
          <ThemedText style={styles.welcomeSubtext}>
            Here's your grocery spending overview
          </ThemedText>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.cardsGrid}>
          <View style={styles.cardColumn}>
            <ExpenseCard
              title="This Month"
              amount={analytics.currentMonthSpent}
              icon="calendar"
              subtitle={`${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
              trend={monthTrend}
              color="#007AFF"
            />
          </View>
          
          <View style={styles.cardColumn}>
            <ExpenseCard
              title="Total Spent"
              amount={analytics.totalSpent}
              icon="chart.bar"
              subtitle={`${analytics.totalItems} items purchased`}
              color="#34C759"
            />
          </View>
        </View>

        <View style={styles.cardsGrid}>
          <View style={styles.cardColumn}>
            <ExpenseCard
              title="Last Month"
              amount={analytics.previousMonthSpent}
              icon="clock"
              subtitle={new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', { month: 'long' })}
              color="#FF9500"
            />
          </View>
          
          <View style={styles.cardColumn}>
            <ExpenseCard
              title="Avg per Item"
              amount={analytics.averageItemPrice}
              icon="cart"
              subtitle="Average price"
              color="#AF52DE"
            />
          </View>
        </View>
        {/* Storage Overview */}
        <View style={styles.section}>
          <StorageOverview storageCounts={storageCounts} />
        </View>
        {/* Category Breakdown Chart */}
        <View style={styles.section}>
          <CategoryChart categories={analytics.categoryBreakdown} />
        </View>

        {/* Monthly Trend Chart */}
        <View style={styles.section}>
          <MonthlyTrend monthlyData={analytics.monthlyTrend} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsCard}>
            <ThemedText style={styles.actionsTitle}>Quick Actions</ThemedText>
            
            <View style={styles.quickActions}>
              <Button 
                onPress={() => router.push('/(index)/(tabs)/shopping-lists')}
                style={styles.actionButton}
              >
                View Shopping Lists
              </Button>
              
              <Button 
                onPress={() => router.push('/(index)/list/new')}
                variant="outline"
                style={styles.actionButton}
              >
                Create New List
              </Button>
              
              <Button 
                onPress={() => router.push('/(index)/(tabs)/inventory')}
                variant="outline"
                style={styles.actionButton}
              >
                View Inventory
              </Button>
              
              <Button 
                onPress={() => router.push('/(index)/(tabs)/product-browser')}
                variant="outline"
                style={styles.actionButton}
              >
                Browse Products
              </Button>
            </View>
          </View>
        </View>

        {/* Empty State */}
        {analytics.totalItems === 0 && (
          <View style={styles.emptyStateContainer}>
            <ThemedText style={styles.emptyStateTitle}>
              Start Your First Shopping Trip!
            </ThemedText>
            <ThemedText style={styles.emptyStateText}>
              Create a shopping list, add products, and use "Shop Now" to track your expenses.
            </ThemedText>
            <Button
              onPress={() => router.push('/(index)/list/new')}
              style={styles.emptyStateButton}
            >
              Create Your First List
            </Button>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 24,
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 28,
    marginBottom: 4,
  },
  welcomeSubtext: {
    color: '#666',
    fontSize: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cardColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActions: {
    gap: 10,
  },
  actionButton: {
    width: '100%',
  },
  emptyStateContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});