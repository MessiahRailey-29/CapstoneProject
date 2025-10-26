// components/Dashboard/ShoppingListExpenses.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAllShoppingListExpenses, ShoppingListExpense } from '@/hooks/useShoppingListExpenses';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { borderColor, Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export function ShoppingListExpenses() {
  const router = useRouter();
  const expenses = useAllShoppingListExpenses();
  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  if (expenses.lists.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Shopping Lists Budget</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Create shopping lists with budgets to track your planned spending!
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Shopping Lists Budget</ThemedText>
        <Pressable
          onPress={() => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push('/(index)/(tabs)/shopping-lists');
          }}
        >
          <Ionicons name="chevron-forward" size={22} color="#C0C0C0" />
        </Pressable>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: '#007AFF' }]}>
          <ThemedText style={styles.summaryLabel}>Total Budget</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{expenses.totalBudget.toFixed(2)}
          </ThemedText>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: '#34C759' }]}>
          <ThemedText style={styles.summaryLabel}>Projected</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{expenses.totalProjected.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {expenses.overBudgetLists > 0 && (
        <View style={styles.warningBanner}>
          <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
          <ThemedText style={styles.warningText}>
            {expenses.overBudgetLists} {expenses.overBudgetLists === 1 ? 'list is' : 'lists are'} over budget
          </ThemedText>
        </View>
      )}

      {/* Lists */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listsContainer}
      >
        {expenses.lists.slice(0, 5).map((list) => (
          <ListExpenseCard key={list.listId} list={list} router={router} />
        ))}
      </ScrollView>
    </View>
  );
}

function ListExpenseCard({
  list,
  router
}: {
  list: ShoppingListExpense;
  router: any;
}) {

  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  return (
    <Pressable
      style={[
        styles.listCard,
        { borderTopColor: list.color, borderTopWidth: 4 },
        list.overBudget && styles.listCardOverBudget,
      ]}
      onPress={() => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push(`/list/${list.listId}`);
      }}
    >
      <View style={styles.listHeader}>
        <ThemedText style={styles.listEmoji}>{list.emoji}</ThemedText>
        <ThemedText style={styles.listName} numberOfLines={1}>
          {list.listName}
        </ThemedText>
      </View>

      <View style={styles.listStats}>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Budget:</ThemedText>
          <ThemedText style={styles.statValue}>
            ₱{list.budget.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Projected:</ThemedText>
          <ThemedText style={[
            styles.statValue,
            list.overBudget && styles.statValueOverBudget,
          ]}>
            ₱{list.projectedTotal.toFixed(2)}
          </ThemedText>
        </View>

        {list.budget > 0 && (
          <>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(list.budgetUsedPercentage, 100)}%`,
                    backgroundColor: list.overBudget ? '#FF3B30' : '#34C759',
                  }
                ]}
              />
            </View>

            <ThemedText style={[
              styles.budgetRemaining,
              list.overBudget && styles.budgetRemainingNegative,
            ]}>
              {list.overBudget ? '₱' : '₱'}
              {Math.abs(list.budgetRemaining).toFixed(2)}
              {list.overBudget ? ' over' : ' left'}
            </ThemedText>
          </>
        )}

        <ThemedText style={styles.itemCount}>
          {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
        </ThemedText>
      </View>

      {list.status === 'ongoing' && (
        <View style={styles.ongoingBadge}>
          <ThemedText style={styles.ongoingText}>Shopping 🛍️</ThemedText>
        </View>
      )}

      {list.status === 'completed' && (
        <View style={styles.completedBadge}>
          <ThemedText style={styles.completedText}>Completed ✓</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderColor: colors.borderColor,
      borderWidth: 1,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
    },
    viewAllText: {
      fontSize: 14,
      color: '#007AFF',
      fontWeight: '600',
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: '#999',
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderColor: colors.borderColor,
      borderWidth: 0.5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      padding: 12,
      borderLeftWidth: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: '700',
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      gap: 8,
    },
    warningIcon: {
      fontSize: 20,
    },
    warningText: {
      fontSize: 14,
      color: '#856404',
      fontWeight: '600',
    },
    listsContainer: {
      gap: 12,
    },
    listCard: {
      width: 200,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      borderColor: colors.borderColor,
      borderWidth: 0.7,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    listCardOverBudget: {
      backgroundColor: '#FFF5F5',
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    listEmoji: {
      fontSize: 24,
    },
    listName: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    listStats: {
      gap: 8,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    statValueOverBudget: {
      color: '#FF3B30',
    },
    progressBar: {
      height: 6,
      backgroundColor: '#E5E5EA',
      borderRadius: 3,
      overflow: 'hidden',
      marginVertical: 4,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    budgetRemaining: {
      fontSize: 12,
      color: '#34C759',
      fontWeight: '600',
    },
    budgetRemainingNegative: {
      color: '#FF3B30',
    },
    itemCount: {
      fontSize: 12,
      color: '#999',
    },
    ongoingBadge: {
      marginTop: 8,
      backgroundColor: '#34C759',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    ongoingText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
    },
    completedBadge: {
      marginTop: 8,
      backgroundColor: '#8E8E93',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    completedText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
    },
  });
}