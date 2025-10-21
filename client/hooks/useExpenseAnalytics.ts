// hooks/useExpenseAnalytics.ts
import { useMemo } from 'react';
import { usePurchaseHistoryItems } from '@/stores/PurchaseHistoryStore';

export interface CategoryExpense {
  category: string;
  total: number;
  itemCount: number;
  percentage: number;
  color: string;
}

export interface MonthlyExpense {
  month: string;
  total: number;
  itemCount: number;
}

export interface ExpenseAnalytics {
  totalSpent: number;
  totalItems: number;
  categoryBreakdown: CategoryExpense[];
  monthlyTrend: MonthlyExpense[];
  currentMonthSpent: number;
  previousMonthSpent: number;
  averageItemPrice: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Beverages': '#FF6B6B',
  'Dairy': '#4ECDC4',
  'Instant Noodles': '#FFE66D',
  'Canned Goods': '#95E1D3',
  'Coffee': '#A8763E',
  'Fruits': '#FFA07A',
  'Vegetables': '#90EE90',
  'Meat': '#FF6347',
  'Bread': '#F4A460',
  'Household': '#87CEEB',
  'Snacks': '#DDA0DD',
  'Other': '#C0C0C0',
};

export function useExpenseAnalytics(): ExpenseAnalytics {
  const purchaseHistoryItems = usePurchaseHistoryItems();

  return useMemo(() => {
    if (!purchaseHistoryItems || purchaseHistoryItems.length === 0) {
      return {
        totalSpent: 0,
        totalItems: 0,
        categoryBreakdown: [],
        monthlyTrend: [],
        currentMonthSpent: 0,
        previousMonthSpent: 0,
        averageItemPrice: 0,
      };
    }

    // Calculate total spent
    const totalSpent = purchaseHistoryItems.reduce((sum, item) => {
      const price = (item.selectedPrice as number) || 0;
      const quantity = (item.quantity as number) || 1;
      return sum + (price * quantity);
    }, 0);

    const totalItems = purchaseHistoryItems.length;

    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    purchaseHistoryItems.forEach(item => {
      const category = (item.category as string) || 'Other';
      const price = (item.selectedPrice as number) || 0;
      const quantity = (item.quantity as number) || 1;
      const total = price * quantity;

      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          total: existing.total + total,
          count: existing.count + 1,
        });
      } else {
        categoryMap.set(category, { total, count: 1 });
      }
    });

    const categoryBreakdown: CategoryExpense[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        itemCount: data.count,
        percentage: (data.total / totalSpent) * 100,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'],
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly trend
    const monthlyMap = new Map<string, { total: number; count: number }>();
    
    purchaseHistoryItems.forEach(item => {
      const date = new Date(item.purchasedAt as string);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const price = (item.selectedPrice as number) || 0;
      const quantity = (item.quantity as number) || 1;
      const total = price * quantity;

      if (monthlyMap.has(monthKey)) {
        const existing = monthlyMap.get(monthKey)!;
        monthlyMap.set(monthKey, {
          total: existing.total + total,
          count: existing.count + 1,
        });
      } else {
        monthlyMap.set(monthKey, { total, count: 1 });
      }
    });

    const monthlyTrend: MonthlyExpense[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
        return {
          month: monthName,
          total: data.total,
          itemCount: data.count,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    // Current and previous month
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const previousMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthSpent = monthlyMap.get(currentMonthKey)?.total || 0;
    const previousMonthSpent = monthlyMap.get(previousMonthKey)?.total || 0;

    const averageItemPrice = totalSpent / totalItems;

    return {
      totalSpent,
      totalItems,
      categoryBreakdown,
      monthlyTrend,
      currentMonthSpent,
      previousMonthSpent,
      averageItemPrice,
    };
  }, [purchaseHistoryItems]);
}