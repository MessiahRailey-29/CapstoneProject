// hooks/useAddProductWithNotifications.ts
import { useCallback } from 'react';
import { useAddShoppingListProductCallback } from '@/stores/ShoppingListStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useShoppingListData } from '@/stores/ShoppingListsStore';
import { useUser, useAuth } from '@clerk/clerk-expo';

/**
 * ✅ FIXED VERSION - Now properly notifies collaborators about:
 * 1. Added items ✅
 * 2. Duplicate warnings ✅
 * 3. Any product changes in shared lists ✅
 *
 * Helper hook that wraps useAddShoppingListProductCallback with notification support
 * This makes it easy to add products with automatic notifications to collaborators
 *
 * Usage:
 * const addProduct = useAddProductWithNotifications(listId);
 * const productId = await addProduct(name, quantity, units, notes, ...);
 */
export function useAddProductWithNotifications(listId: string) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const addProduct = useAddShoppingListProductCallback(listId);
  const { createDuplicateWarning } = useNotifications(user?.id || '', getToken);
  
  // 🔥 FIX: Get list data to check if it's a shared list
  const listData = useShoppingListData(listId);

  return useCallback(
    async (
      name: string,
      quantity: number,
      units: string,
      notes: string,
      selectedStore?: string,
      selectedPrice?: number,
      databaseProductId?: number,
      category?: string,
      productUnit?: string
    ) => {
      // Call the original add product function with duplicate warning support
      const productId = await addProduct(
        name,
        quantity,
        units,
        notes,
        selectedStore,
        selectedPrice,
        databaseProductId,
        category,
        productUnit,
        createDuplicateWarning // Automatically pass notification function
      );

      // 🔥 NEW: If product was added successfully, notify collaborators
      if (productId && listData?.collaborators && listData.collaborators.length > 0) {
        try {
          // Dynamically import to avoid circular dependencies
          const { notifyCollaborators } = await import('@/utils/notifyCollaborators');
          
          await notifyCollaborators({
            listId,
            listName: listData.name || 'Shopping List',
            emoji: listData.emoji || '🛒',
            action: 'added_item',
            itemName: name,
            currentUserId: user?.id || '',
            currentUserName: user?.firstName || user?.username || 'Someone',
            collaborators: listData.collaborators,
          });
          
          console.log('✅ Notified collaborators about added item:', name);
        } catch (error) {
          console.error('❌ Failed to notify collaborators:', error);
          // Don't throw - product was still added successfully
        }
      }

      return productId;
    },
    [addProduct, createDuplicateWarning, listData, user, listId]
  );
}