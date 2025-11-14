// hooks/useRemoveProductWithNotifications.ts
import { useCallback } from 'react';
import { useDelShoppingListProductCallback } from '@/stores/ShoppingListStore';
import { useUser } from '@clerk/clerk-expo';
import { useShoppingListData } from '@/stores/ShoppingListsStore';
import { notifyCollaborators } from '@/utils/notifyCollaborators';

/**
 * Helper hook that removes products WITH collaborator notifications
 * 
 * Usage:
 * const removeProduct = useRemoveProductWithNotifications(listId, productId);
 * await removeProduct(productName); // Pass the product name for notification
 */
export function useRemoveProductWithNotifications(listId: string, productId: string) {
  const { user } = useUser();
  const removeProduct = useDelShoppingListProductCallback(listId, productId);
  const listData = useShoppingListData(listId);

  return useCallback(
    async (productName: string) => {
      // Remove the product
      removeProduct();

      // Notify collaborators
      if (listData?.collaborators && listData.collaborators.length > 0) {
        try {
          await notifyCollaborators({
            listId,
            listName: listData.name || 'Shopping List',
            emoji: listData.emoji || '🛒',
            action: 'removed_item',
            itemName: productName,
            currentUserId: user?.id || '',
            currentUserName: user?.firstName || user?.username || 'Someone',
            collaborators: listData.collaborators,
          });
          
          console.log('✅ Notified collaborators about removed item:', productName);
        } catch (error) {
          console.error('❌ Failed to notify collaborators:', error);
        }
      }
    },
    [removeProduct, listData, user, listId]
  );
}