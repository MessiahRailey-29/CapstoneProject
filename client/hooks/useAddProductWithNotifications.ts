// hooks/useAddProductWithNotifications.ts
import { useCallback } from 'react';
import { useAddShoppingListProductCallback } from '@/stores/ShoppingListStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@clerk/clerk-expo';
import { useShoppingListData } from '@/stores/ShoppingListsStore';
import { notifyCollaborators } from '@/utils/notifyCollaborators';

/**
 * Helper hook that wraps useAddShoppingListProductCallback with notification support
 * Handles BOTH duplicate warnings AND collaborator notifications
 * 
 * Usage:
 * const addProduct = useAddProductWithNotifications(listId);
 * const productId = await addProduct(name, quantity, units, notes, ...);
 */
export function useAddProductWithNotifications(listId: string) {
  const { user } = useUser();
  const addProduct = useAddShoppingListProductCallback(listId);
  const { createDuplicateWarning } = useNotifications(user?.id || '');
  
  // Get list data for collaborator notifications
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
      category?: string
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
        createDuplicateWarning // Automatically pass notification function
      );

      // If product was added successfully, notify collaborators
      if (productId && listData?.collaborators && listData.collaborators.length > 0) {
        try {
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