// hooks/useTogglePurchasedWithNotifications.ts
import { useCallback } from 'react';
import { useShoppingListProductCell } from '@/stores/ShoppingListStore';
import { useUser } from '@clerk/clerk-expo';
import { useShoppingListData } from '@/stores/ShoppingListsStore';
import { notifyCollaborators } from '@/utils/notifyCollaborators';

/**
 * Helper hook that toggles purchased status WITH collaborator notifications
 * 
 * Usage:
 * const togglePurchased = useTogglePurchasedWithNotifications(listId, productId);
 * await togglePurchased(); // Automatically handles notification
 */
export function useTogglePurchasedWithNotifications(listId: string, productId: string) {
  const { user } = useUser();
  
  // Get product data using the correct hook
  const [name] = useShoppingListProductCell(listId, productId, 'name');
  const [isPurchased, setIsPurchased] = useShoppingListProductCell(listId, productId, 'isPurchased');
  
  const listData = useShoppingListData(listId);

  return useCallback(
    async () => {
      if (!name) return;

      const newPurchasedState = !isPurchased;
      
      // Toggle the purchased status
      setIsPurchased(newPurchasedState);

      // Notify collaborators
      if (listData?.collaborators && listData.collaborators.length > 0) {
        try {
          await notifyCollaborators({
            listId,
            listName: listData.name || 'Shopping List',
            emoji: listData.emoji || '🛒',
            action: newPurchasedState ? 'marked_purchased' : 'marked_unpurchased',
            itemName: name,
            currentUserId: user?.id || '',
            currentUserName: user?.firstName || user?.username || 'Someone',
            collaborators: listData.collaborators,
          });
          
          console.log('✅ Notified collaborators about purchase toggle:', name);
        } catch (error) {
          console.error('❌ Failed to notify collaborators:', error);
        }
      }
    },
    [name, isPurchased, setIsPurchased, listData, user, listId]
  );
}