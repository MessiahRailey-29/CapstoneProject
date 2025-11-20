// app/(home)/(tabs)/index.tsx
import React, { useMemo, useState, memo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, useColorScheme } from 'react-native';
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
import { useRecommendations } from '@/hooks/useRecommendations';
import RecommendationsByStrategy from '@/components/RecommendationsByStrategy';
import ShoppingListSelectorModal from '@/components/ShoppingListSelectorModal';
import { recommendationsApi } from '@/services/recommendationsApi';
import { NotificationBell } from '@/components/NotificationBell';
import { useNickname } from '@/hooks/useNickname';
import { ShoppingListExpenses } from '@/components/Dashboard/ShoppingListExpenses';
import { WeeklyShoppingListSummary } from '@/components/Dashboard/WeeklyShoppingListSummary';
import { WeeklyPurchaseSummary } from '@/components/Dashboard/WeeklyPurchaseSummary';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Memoize static components
const MemoizedExpenseCard = memo(ExpenseCard);
const MemoizedCategoryChart = memo(CategoryChart);
const MemoizedMonthlyTrend = memo(MonthlyTrend);
const MemoizedStorageOverview = memo(StorageOverview);
const MemoizedRecommendations = memo(RecommendationsByStrategy);
const MemoizedShoppingListExpenses = memo(ShoppingListExpenses);
const MemoizedWeeklyShoppingListSummary = memo(WeeklyShoppingListSummary);
const MemoizedWeeklyPurchaseSummary = memo(WeeklyPurchaseSummary);

export default function Homepage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = useMemo(() => user?.id || 'user_1', [user?.id]);
  const [refreshing, setRefreshing] = useState(false);
  const storageCounts = useInventoryStorageCounts();
  const analytics = useExpenseAnalytics();
  const insets = useSafeAreaInsets();

  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Get nickname with auto-refresh
  const { nickname } = useNickname();

  // Modal state for product selection
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: number;
    productName: string;
    price: number;
    store: string;
    unit?: string;
  } | null>(null);

  // Get ML recommendations
  const { recommendations, loading: recsLoading, refresh: refreshRecs } = useRecommendations(
    userId,
    20
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshRecs();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshRecs]);

  const monthTrend = useMemo(() => 
    analytics.previousMonthSpent !== 0
      ? ((analytics.currentMonthSpent - analytics.previousMonthSpent) / analytics.previousMonthSpent) * 100
      : 0,
    [analytics.currentMonthSpent, analytics.previousMonthSpent]
  );

  // Handle product selection → open modal instead of directly adding
  const handleProductSelect = useCallback(
    (productId: number, productName: string, price: number, store: string, unit?: string) => {
      setSelectedProduct({ productId, productName, price, store, unit });
      setModalVisible(true);
    },
    []
  );

  // Handle successful add to shopping list
  const handleAddSuccess = useCallback(async () => {
    if (user?.id && selectedProduct) {
      await recommendationsApi.trackPurchase(
        user.id,
        selectedProduct.productId,
        'tracked',
        1,
        selectedProduct.store,
        selectedProduct.price
      );
      refreshRecs();
    }
  }, [user?.id, selectedProduct, refreshRecs]);

  const handleCloseModal = useCallback(() => setModalVisible(false), []);

  // Memoize action handlers
  const navigateToShoppingLists = useCallback(() => router.push('/(index)/(tabs)/shopping-lists'), [router]);
  const navigateToNewList = useCallback(() => router.push('/(index)/list/new'), [router]);
  const navigateToInventory = useCallback(() => router.push('/(index)/(tabs)/inventory'), [router]);
  const navigateToProductBrowser = useCallback(() => router.push('/(index)/(tabs)/product-browser'), [router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Home',
          headerLargeTitle: true,
          headerRight: () => <NotificationBell />,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 100}]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeText}>
            Hey there, {nickname}!
          </ThemedText>
          <ThemedText style={styles.welcomeSubtext}>Here's your grocery spending overview</ThemedText>
        </View>

        {/* NEW: Weekly Shopping List Summary */}
        <View style={styles.section}>
          <MemoizedWeeklyShoppingListSummary />
        </View>

        {/* NEW: Weekly Purchase Summary */}
        <View style={styles.section}>
          <MemoizedWeeklyPurchaseSummary />
        </View>

        {/* 1. Monthly Trend Chart */}
        <View style={styles.section}>
          <MemoizedMonthlyTrend monthlyData={analytics.monthlyTrend} />
        </View>

        {/* 2. Category Breakdown Chart */}
        <View style={styles.section}>
          <MemoizedCategoryChart categories={analytics.categoryBreakdown} />
        </View>

        {/* 3. Shopping Lists Budget Tracking */}
        <View style={styles.section}>
          <MemoizedShoppingListExpenses />
        </View>

        {/* 4. Quick Stats Cards */}
        <View style={styles.cardsGrid}>
          <View style={styles.cardColumn}>
            <MemoizedExpenseCard
              title="This Month"
              amount={analytics.currentMonthSpent}
              icon="calendar"
              subtitle={`${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
              trend={monthTrend}
              color="#007AFF"
            />
          </View>

          <View style={styles.cardColumn}>
            <MemoizedExpenseCard
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
            <MemoizedExpenseCard
              title="Last Month"
              amount={analytics.previousMonthSpent}
              icon="clock"
              subtitle={new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', {
                month: 'long',
              })}
              color="#FF9500"
            />
          </View>

          <View style={styles.cardColumn}>
            <MemoizedExpenseCard
              title="Avg per Item"
              amount={analytics.averageItemPrice}
              icon="cart"
              subtitle="Average price"
              color="#AF52DE"
            />
          </View>
        </View>

        {/* 5. Storage Overview */}
        <View style={styles.section}>
          <MemoizedStorageOverview storageCounts={storageCounts} />
        </View>

        {/* 6. ML Recommendations by Strategy */}
        <MemoizedRecommendations
          recommendations={recommendations}
          onProductSelect={handleProductSelect}
          loading={recsLoading}
        />


        {/* Empty State */}
        {analytics.totalItems === 0 && (
          <View style={styles.emptyStateContainer}>
            <ThemedText style={styles.emptyStateTitle}>Start Your First Shopping Trip!</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              Create a shopping list, add products, and use "Shop Now" to track your expenses.
            </ThemedText>
            <Button onPress={navigateToNewList} style={styles.emptyStateButton}>
              Create Your First List
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Shopping List Selector Modal */}
      {selectedProduct && (
        <ShoppingListSelectorModal
          visible={modalVisible}
          onClose={handleCloseModal}
          productId={selectedProduct.productId}
          productName={selectedProduct.productName}
          price={selectedProduct.price}
          store={selectedProduct.store}
          productUnit={selectedProduct.unit}
          onSuccess={handleAddSuccess}
        />
      )}
    </>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: 12,
      backgroundColor: colors.mainBackground,
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
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
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
      backgroundColor: colors.background,
      borderColor: colors.borderColor,
      borderWidth: 1,
      borderRadius: 12,
      padding: 32,
      alignItems: 'center',
      marginTop: 24,
      shadowColor: colors.shadowColor,
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
}