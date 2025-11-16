// components/Dashboard/ShoppingListExpenses.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAllShoppingListExpenses, ShoppingListExpense } from '@/hooks/useShoppingListExpenses';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { backgroundColors, borderColor, Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function ShoppingListExpenses() {
  const router = useRouter();
  const expenses = useAllShoppingListExpenses();
  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  if (expenses.lists.length === 0) {
    return (
      <LinearGradient
      colors={['#d48d00', '#ffbf00', '#d48d00', '#d48d00', colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
        <ThemedText style={styles.title}>Shopping Lists Budget</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Create shopping lists with budgets to track your planned spending!
          </ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#d48d00', '#ffbf00', '#d48d00', '#d48d00', colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
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
        <LinearGradient
          colors={[colors.gradientCard1, colors.gradientCard2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderLeftColor: '#007AFF' }]}>
          <ThemedText style={styles.summaryLabel}>Total Budget</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{expenses.totalBudget.toFixed(2)}
          </ThemedText>
        </LinearGradient>

        <LinearGradient
          colors={[colors.gradientCard1, colors.gradientCard2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }} style={[styles.summaryCard, { borderLeftColor: '#34C759' }]}>
          <ThemedText style={styles.summaryLabel}>Projected</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{expenses.totalProjected.toFixed(2)}
          </ThemedText>
        </LinearGradient>
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
    </LinearGradient>
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
    <LinearGradient
      colors={
        list.overBudget
          ? ["#FF5F6D", "#FFC371"]
          : [list.color,"rgba(195, 185, 255, 0.8)", "rgba(195, 185, 255, 0.8)", list.color]
      }
      start={{ x: 2, y: 3 }}
      end={{ x: 0, y: 0 }}
      style={[, styles.listCard,
        {
          backgroundColor: "rgba(150, 150, 150, 0.5)",
          borderTopColor: list.color,
          borderTopWidth: 4
        },
        list.overBudget && styles.listCardOverBudget
      ]}>
      <Pressable
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
                {backgroundColor: list.overBudget ?'#FF3B30' : '#34C759'}
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
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      color: '#fff',
      fontWeight: '700',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
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
      color: '#ffffffa5',
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      borderRadius: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      padding: 12,
      borderLeftWidth: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: '#fff',
      marginBottom: 4,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
    },
    summaryValue: {
      fontSize: 20,
      color: '#fff',
      fontWeight: '700',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
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
      paddingBottom: 8,
    },
    listCard: {
      marginVertical: 4,
      marginHorizontal: 6,
      width: 200,
      borderRadius: 16,
      padding: 16,
      borderWidth: 0.7,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    listCardOverBudget: {
      opacity: 0.9,
      borderColor: 'red',
    },
    listHeader: {
      color: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    listEmoji: {
      fontSize: 24,
      paddingBottom: 7
    },
    listName: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
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
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
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
      alignSelf: "flex-start",
      borderRadius: 8,
      padding: 4,
      fontSize: 12,
      color: '#fff',
      fontWeight: '600',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
    },
    budgetRemainingNegative: {
    },
    itemCount: {
      fontSize: 12,
      color: "#222",
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
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
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
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 2,
    },
  });
}