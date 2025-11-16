// components/Dashboard/WeeklyShoppingListSummary.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWeeklyShoppingAnalytics } from '@/hooks/useWeeklyShoppingAnalytics';
import { ShoppingListExpense } from '@/hooks/useShoppingListExpenses';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DayWithLists {
  dayName: string;
  dayNumber: number;
  date: Date;
  isToday: boolean;
  lists: ShoppingListExpense[];
}

export function WeeklyShoppingListSummary() {
  const router = useRouter();
  const weeklyData = useWeeklyShoppingAnalytics();
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Organize lists by day of the week
  const weekDays = useMemo<DayWithLists[]>(() => {
    const days: DayWithLists[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate all 7 days of the week (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weeklyData.weekStart);
      currentDate.setDate(weeklyData.weekStart.getDate() + i);
      
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = currentDate.getDate();
      const isToday = currentDate.getTime() === today.getTime();

      // Filter lists for this specific day
      const listsForDay = weeklyData.thisWeekLists.filter(list => {
        if (!list.shoppingDate) return false;
        const listDate = new Date(list.shoppingDate);
        listDate.setHours(0, 0, 0, 0);
        return listDate.getTime() === currentDate.getTime();
      });

      days.push({
        dayName,
        dayNumber,
        date: currentDate,
        isToday,
        lists: listsForDay,
      });
    }

    return days;
  }, [weeklyData.thisWeekLists, weeklyData.weekStart]);

  const budgetDifference = weeklyData.totalWeeklyProjected - weeklyData.totalWeeklyBudget;
  const isOverBudget = budgetDifference > 0;

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#a855f7', colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>This Week's Shopping</ThemedText>
          <ThemedText style={styles.weekRange}>{weekRange}</ThemedText>
        </View>
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

      {/* Weekly Summary Cards */}
      <View style={styles.summaryRow}>
        <LinearGradient
          colors={[colors.gradientCard1, colors.gradientCard2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderLeftColor: '#6366f1' }]}
        >
          <ThemedText style={styles.summaryLabel}>Weekly Budget</ThemedText>
          <ThemedText style={styles.summaryValue}>
            ₱{weeklyData.totalWeeklyBudget.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.summarySubtext}>
            {weeklyData.weeklyListCount} {weeklyData.weeklyListCount === 1 ? 'list' : 'lists'}
          </ThemedText>
        </LinearGradient>

        <LinearGradient
          colors={[colors.gradientCard1, colors.gradientCard2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderLeftColor: isOverBudget ? '#ef4444' : '#22c55e' }]}
        >
          <ThemedText style={styles.summaryLabel}>Projected Total</ThemedText>
          <ThemedText style={[styles.summaryValue, isOverBudget && styles.overBudgetText]}>
            ₱{weeklyData.totalWeeklyProjected.toFixed(2)}
          </ThemedText>
          <ThemedText style={[styles.summarySubtext, isOverBudget && styles.overBudgetText]}>
            {isOverBudget ? `₱${budgetDifference.toFixed(2)} over` : `₱${Math.abs(budgetDifference).toFixed(2)} under`}
          </ThemedText>
        </LinearGradient>
      </View>

      {weeklyData.weeklyOverBudgetCount > 0 && (
        <View style={styles.warningBanner}>
          <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
          <ThemedText style={styles.warningText}>
            {weeklyData.weeklyOverBudgetCount} {weeklyData.weeklyOverBudgetCount === 1 ? 'list is' : 'lists are'} over budget this week
          </ThemedText>
        </View>
      )}

      {/* Week Calendar View */}
      {weeklyData.weeklyListCount === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No shopping lists scheduled for this week
          </ThemedText>
          <Pressable
            onPress={() => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(index)/list/new');
            }}
            style={styles.emptyButton}
          >
            <ThemedText style={styles.emptyButtonText}>Create Shopping List</ThemedText>
          </Pressable>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekContainer}
        >
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              {/* Day Header */}
              <LinearGradient
                colors={day.isToday 
                  ? ['#6366f1', '#8b5cf6'] 
                  : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.dayHeader, day.isToday && styles.dayHeaderToday]}
              >
                <ThemedText style={[styles.dayName, day.isToday && styles.dayNameToday]}>
                  {day.dayName}
                </ThemedText>
                <ThemedText style={[styles.dayNumber, day.isToday && styles.dayNumberToday]}>
                  {day.dayNumber}
                </ThemedText>
                {day.isToday && (
                  <View style={styles.todayDot} />
                )}
              </LinearGradient>

              {/* Lists for this day */}
              <View style={styles.dayListsContainer}>
                {day.lists.length === 0 ? (
                  <View style={styles.noListsContainer}>
                    <ThemedText style={styles.noListsText}>—</ThemedText>
                  </View>
                ) : (
                  day.lists.map((list) => (
                    <Pressable
                      key={list.listId}
                      onPress={() => {
                        if (process.env.EXPO_OS === "ios") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push(`/list/${list.listId}`);
                      }}
                    >
                      <LinearGradient
                        colors={
                          list.overBudget
                            ? ["#FF5F6D", "#FFC371"]
                            : ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.listCard,
                          {
                            borderLeftColor: list.color,
                            borderLeftWidth: 3,
                          }
                        ]}
                      >
                        <View style={styles.listHeader}>
                          <ThemedText style={styles.listEmoji}>{list.emoji}</ThemedText>
                          <ThemedText style={styles.listName} numberOfLines={2}>
                            {list.listName}
                          </ThemedText>
                        </View>

                        <View style={styles.listStats}>
                          <View style={styles.statRow}>
                            <ThemedText style={styles.statLabel}>Budget:</ThemedText>
                            <ThemedText style={styles.statValue}>
                              ₱{list.budget.toFixed(0)}
                            </ThemedText>
                          </View>

                          <View style={styles.statRow}>
                            <ThemedText style={styles.statLabel}>Projected:</ThemedText>
                            <ThemedText style={[
                              styles.statValue,
                              list.overBudget && styles.statValueOverBudget,
                            ]}>
                              ₱{list.projectedTotal.toFixed(0)}
                            </ThemedText>
                          </View>

                          <ThemedText style={styles.itemCount}>
                            {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
                          </ThemedText>
                        </View>

                        {list.status === 'ongoing' && (
                          <View style={styles.ongoingBadge}>
                            <ThemedText style={styles.ongoingText}>Shopping</ThemedText>
                          </View>
                        )}

                        {list.status === 'completed' && (
                          <View style={styles.completedBadge}>
                            <ThemedText style={styles.completedText}>Done ✓</ThemedText>
                          </View>
                        )}
                      </LinearGradient>
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          ))}
        </ScrollView>
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
      color: '#fff',
      fontWeight: '700',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    weekRange: {
      fontSize: 12,
      color: '#fff',
      opacity: 0.8,
      marginTop: 2,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      color: '#ffffffa5',
      textAlign: 'center',
      marginBottom: 16,
    },
    emptyButton: {
      backgroundColor: '#6366f1',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    emptyButtonText: {
      color: '#fff',
      fontWeight: '600',
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
      shadowOpacity: 0.2,
      shadowRadius: 4,
      padding: 12,
      borderLeftWidth: 4,
    },
    summaryLabel: {
      fontSize: 11,
      color: '#fff',
      marginBottom: 4,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    summaryValue: {
      fontSize: 18,
      color: '#fff',
      fontWeight: '700',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    summarySubtext: {
      fontSize: 10,
      color: '#fff',
      marginTop: 2,
      opacity: 0.8,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    overBudgetText: {
      color: '#ef4444',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
      marginBottom: 12,
      gap: 8,
    },
    warningIcon: {
      fontSize: 16,
    },
    warningText: {
      fontSize: 12,
      color: '#856404',
      fontWeight: '600',
    },
    weekContainer: {
      gap: 8,
      paddingBottom: 8,
    },
    dayColumn: {
      width: 140,
    },
    dayHeader: {
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      position: 'relative',
    },
    dayHeaderToday: {
      borderWidth: 2,
      borderColor: '#fff',
    },
    dayName: {
      fontSize: 12,
      color: '#fff',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 2,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    dayNameToday: {
      color: '#fff',
      fontWeight: '700',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    dayNumber: {
      fontSize: 20,
      color: '#fff',
      fontWeight: '700',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    dayNumberToday: {
      color: '#fff',
      fontSize: 22,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    todayDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#22c55e',
    },
    dayListsContainer: {
      gap: 8,
    },
    noListsContainer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    noListsText: {
      fontSize: 24,
      color: '#fff',
      opacity: 0.3,
    },
    listCard: {
      borderRadius: 10,
      padding: 10,
      marginBottom: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    listEmoji: {
      fontSize: 18,
    },
    listName: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    listStats: {
      gap: 4,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 10,
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    statValue: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    statValueOverBudget: {
      color: '#FF3B30',
    },
    itemCount: {
      fontSize: 10,
      color: '#ffffffff',
      marginTop: 2,
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    ongoingBadge: {
      marginTop: 6,
      backgroundColor: '#34C759',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    ongoingText: {
      fontSize: 9,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
    completedBadge: {
      marginTop: 6,
      backgroundColor: '#8E8E93',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    completedText: {
      fontSize: 9,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      textShadowRadius: 3,
    },
  });
}