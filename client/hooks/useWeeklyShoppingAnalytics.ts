// hooks/useWeeklyShoppingAnalytics.ts
import { useMemo } from 'react';
import { useAllShoppingListExpenses, ShoppingListExpense } from './useShoppingListExpenses';

export interface WeeklyShoppingAnalytics {
  thisWeekLists: ShoppingListExpense[];
  totalWeeklyBudget: number;
  totalWeeklyProjected: number;
  weeklyOverBudgetCount: number;
  weeklyListCount: number;
  weekStart: Date;
  weekEnd: Date;
}

export function useWeeklyShoppingAnalytics(): WeeklyShoppingAnalytics {
  const allExpenses = useAllShoppingListExpenses();

  return useMemo(() => {
    const now = new Date();
    
    // Calculate week start (Sunday) and end (Saturday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Filter lists with shopping dates in current week
    const thisWeekLists = allExpenses.lists.filter(list => {
      if (!list.shoppingDate) return false;
      
      const shoppingDate = new Date(list.shoppingDate);
      return shoppingDate >= weekStart && shoppingDate <= weekEnd;
    });

    // Calculate weekly totals
    const totalWeeklyBudget = thisWeekLists.reduce((sum, list) => sum + list.budget, 0);
    const totalWeeklyProjected = thisWeekLists.reduce((sum, list) => sum + list.projectedTotal, 0);
    const weeklyOverBudgetCount = thisWeekLists.filter(list => list.overBudget).length;

    return {
      thisWeekLists,
      totalWeeklyBudget,
      totalWeeklyProjected,
      weeklyOverBudgetCount,
      weeklyListCount: thisWeekLists.length,
      weekStart,
      weekEnd,
    };
  }, [allExpenses]);
}