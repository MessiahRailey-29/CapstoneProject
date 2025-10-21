// hooks/useShoppingListExpenses.ts
import { useMemo } from 'react';
import { 
  useShoppingListIds, 
  useShoppingListsValues 
} from '@/stores/ShoppingListsStore';

export interface ShoppingListExpense {
  listId: string;
  listName: string;
  emoji: string;
  color: string;
  budget: number;
  projectedTotal: number;
  itemCount: number;
  status: 'regular' | 'ongoing' | 'completed';
  overBudget: boolean;
  budgetRemaining: number;
  budgetUsedPercentage: number;
  shoppingDate: string | null;
  storeBreakdown: { store: string; total: number; itemCount: number }[];
}

export interface AllListsExpenses {
  totalBudget: number;
  totalProjected: number;
  lists: ShoppingListExpense[];
  overBudgetLists: number;
  activeListsTotal: number;
  completedListsTotal: number;
}

export function useAllShoppingListExpenses(): AllListsExpenses {
  const listIds = useShoppingListIds();
  const listsValues = useShoppingListsValues();

  return useMemo(() => {
    const lists: ShoppingListExpense[] = [];
    let totalBudget = 0;
    let totalProjected = 0;
    let overBudgetCount = 0;
    let activeListsTotal = 0;
    let completedListsTotal = 0;

    listIds.forEach((listId, index) => {
      try {
        const listData = listsValues[index];
        if (!listData || !listData.values) return;

        const values = listData.values;
        const products = listData.tables?.products || {};
        
        let projectedTotal = 0;
        const storeMap = new Map<string, { total: number; count: number }>();

        // Calculate projected total from products
        Object.values(products).forEach((product: any) => {
          if (!product) return;
          
          const price = product.selectedPrice || 0;
          const quantity = product.quantity || 1;
          const store = product.selectedStore || 'Unknown';
          const total = price * quantity;
          
          projectedTotal += total;

          if (store) {
            const current = storeMap.get(store) || { total: 0, count: 0 };
            storeMap.set(store, {
              total: current.total + total,
              count: current.count + 1,
            });
          }
        });

        const budget = values.budget || 0;
        const budgetRemaining = budget - projectedTotal;
        const overBudget = budget > 0 && projectedTotal > budget;
        const budgetUsedPercentage = budget > 0 ? (projectedTotal / budget) * 100 : 0;
        const status = values.status || 'regular';

        if (overBudget) overBudgetCount++;
        
        totalBudget += budget;
        totalProjected += projectedTotal;

        if (status === 'completed') {
          completedListsTotal += projectedTotal;
        } else {
          activeListsTotal += projectedTotal;
        }

        const storeBreakdown = Array.from(storeMap.entries()).map(([store, data]) => ({
          store,
          total: data.total,
          itemCount: data.count,
        }));

        lists.push({
          listId,
          listName: values.name || 'Unnamed List',
          emoji: values.emoji || '🛒',
          color: values.color || '#007AFF',
          budget,
          projectedTotal,
          itemCount: Object.keys(products).length,
          status,
          overBudget,
          budgetRemaining,
          budgetUsedPercentage,
          shoppingDate: values.shoppingDate,
          storeBreakdown,
        });
      } catch (error) {
        console.error('Error calculating list expenses:', error);
      }
    });

    return {
      totalBudget,
      totalProjected,
      lists: lists.sort((a, b) => b.projectedTotal - a.projectedTotal),
      overBudgetLists: overBudgetCount,
      activeListsTotal,
      completedListsTotal,
    };
  }, [listIds, listsValues]);
}