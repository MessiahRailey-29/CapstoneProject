// hooks/useWeeklyPurchaseAnalytics.ts
import { useMemo } from 'react';
import { usePurchaseHistoryItems } from '@/stores/PurchaseHistoryStore';

export interface WeeklyPurchaseSummary {
  totalWeeklySpent: number;
  weeklyItemCount: number;
  categoryBreakdown: {
    category: string;
    total: number;
    count: number;
    percentage: number;
    color: string; // Changed from ColorValue to string
  }[];
  storeBreakdown: { store: string; total: number; count: number; percentage: number }[];
  weekStart: Date;
  weekEnd: Date;
  dailySpending: { day: string; total: number; count: number }[];
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

export function useWeeklyPurchaseAnalytics(): WeeklyPurchaseSummary {
  const allPurchases = usePurchaseHistoryItems();

  return useMemo(() => {
    const now = new Date();
    
    // Calculate week start (Sunday) and end (Saturday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Filter purchases from this week
    const weeklyPurchases = allPurchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchasedAt as string);
      return purchaseDate >= weekStart && purchaseDate <= weekEnd;
    });

    if (weeklyPurchases.length === 0) {
      return {
        totalWeeklySpent: 0,
        weeklyItemCount: 0,
        categoryBreakdown: [],
        storeBreakdown: [],
        weekStart,
        weekEnd,
        dailySpending: [],
      };
    }

    // Calculate total spent
    const totalWeeklySpent = weeklyPurchases.reduce((sum, purchase) => {
      const price = (purchase.selectedPrice as number) || 0;
      const quantity = (purchase.quantity as number) || 1;
      return sum + (price * quantity);
    }, 0);

    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    weeklyPurchases.forEach(purchase => {
      const category = (purchase.category as string) || 'Other';
      const price = (purchase.selectedPrice as number) || 0;
      const quantity = (purchase.quantity as number) || 1;
      const total = price * quantity;

      const existing = categoryMap.get(category) || { total: 0, count: 0 };
      categoryMap.set(category, {
        total: existing.total + total,
        count: existing.count + 1,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: (data.total / totalWeeklySpent) * 100,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'],
      }))
      .sort((a, b) => b.total - a.total);

    // Store breakdown
    const storeMap = new Map<string, { total: number; count: number }>();
    weeklyPurchases.forEach(purchase => {
      const store = (purchase.selectedStore as string) || 'Unknown';
      const price = (purchase.selectedPrice as number) || 0;
      const quantity = (purchase.quantity as number) || 1;
      const total = price * quantity;

      const existing = storeMap.get(store) || { total: 0, count: 0 };
      storeMap.set(store, {
        total: existing.total + total,
        count: existing.count + 1,
      });
    });

    const storeBreakdown = Array.from(storeMap.entries())
      .map(([store, data]) => ({
        store,
        total: data.total,
        count: data.count,
        percentage: (data.total / totalWeeklySpent) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    // Daily spending breakdown
    const dailyMap = new Map<string, { total: number; count: number }>();
    weeklyPurchases.forEach(purchase => {
      const date = new Date(purchase.purchasedAt as string);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const price = (purchase.selectedPrice as number) || 0;
      const quantity = (purchase.quantity as number) || 1;
      const total = price * quantity;

      const existing = dailyMap.get(dayKey) || { total: 0, count: 0 };
      dailyMap.set(dayKey, {
        total: existing.total + total,
        count: existing.count + 1,
      });
    });

    const dailySpending = Array.from(dailyMap.entries())
      .map(([day, data]) => ({
        day,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

    return {
      totalWeeklySpent,
      weeklyItemCount: weeklyPurchases.length,
      categoryBreakdown,
      storeBreakdown,
      weekStart,
      weekEnd,
      dailySpending,
    };
  }, [allPurchases]);
}
