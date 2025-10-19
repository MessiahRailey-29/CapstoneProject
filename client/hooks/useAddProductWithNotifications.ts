// hooks/useAddProductWithNotifications.ts
import { useCallback } from 'react';
import { useAddShoppingListProductCallback } from '@/stores/ShoppingListStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@clerk/clerk-expo';

/**
 * Helper hook that wraps useAddShoppingListProductCallback with notification support
 * This makes it easy to add products with automatic duplicate warning notifications
 * 
 * Usage:
 * const addProduct = useAddProductWithNotifications(listId);
 * const productId = await addProduct(name, quantity, units, notes, ...);
 */
export function useAddProductWithNotifications(listId: string) {
  const { user } = useUser();
  const addProduct = useAddShoppingListProductCallback(listId);
  const { createDuplicateWarning } = useNotifications(user?.id || '');

  return useCallback(
    async (
      name: string,
      quantity: number,
      units: string,
      notes: string,
      selectedStore?: string,
      selectedPrice?: number,
      databaseProductId?: number,
      category?: string
    ) => {
      // Call the original add product function with duplicate warning support
      return await addProduct(
        name,
        quantity,
        units,
        notes,
        selectedStore,
        selectedPrice,
        databaseProductId,
        category,
        createDuplicateWarning // Automatically pass notification function
      );
    },
    [addProduct, createDuplicateWarning]
  );
}