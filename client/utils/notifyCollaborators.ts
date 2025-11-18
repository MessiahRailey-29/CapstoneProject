// utils/notifyCollaborators.ts
import { useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { addNotificationToTinyBase } from './addNotificationToTinyBase';

interface Collaborator {
  userId: string;
  nickname?: string; // Optional nickname
  email?: string; // Optional email
  name?: string; // Optional name
}

interface NotifyCollaboratorsParams {
  listId: string;
  listName: string;
  emoji: string;
  action: 'added_item' | 'removed_item' | 'marked_purchased' | 'marked_unpurchased' | 'updated_list';
  itemName: string;
  currentUserId: string;
  currentUserName: string;
  collaborators: Collaborator[];
}

/**
 * ✅ Main function that notifies all collaborators (except current user)
 * by adding notifications to TinyBase store
 * 
 * This function can be called directly or imported dynamically
 */
export async function notifyCollaborators(params: NotifyCollaboratorsParams): Promise<void> {
  const {
    listId,
    listName,
    emoji,
    action,
    itemName,
    currentUserId,
    currentUserName,
    collaborators,
  } = params;

  // Filter out current user from notifications
  const otherCollaborators = collaborators.filter(c => c.userId !== currentUserId);

  if (otherCollaborators.length === 0) {
    console.log('⏭️ No other collaborators to notify');
    return;
  }

  // Create notification message based on action type
  const messages: Record<typeof action, string> = {
    added_item: `${currentUserName} added "${itemName}" to ${emoji} ${listName}`,
    removed_item: `${currentUserName} removed "${itemName}" from ${emoji} ${listName}`,
    marked_purchased: `${currentUserName} marked "${itemName}" as purchased in ${emoji} ${listName}`,
    marked_unpurchased: `${currentUserName} unmarked "${itemName}" in ${emoji} ${listName}`,
    updated_list: `${currentUserName} updated ${emoji} ${listName} (${itemName})`,
  };

  const message = messages[action] || `${currentUserName} updated ${emoji} ${listName}`;
  
  // Set notification title based on action
  const titles: Record<typeof action, string> = {
    added_item: 'Item Added',
    removed_item: 'Item Removed',
    marked_purchased: 'Item Purchased',
    marked_unpurchased: 'Item Unmarked',
    updated_list: 'List Updated',
  };
  
  const title = titles[action] || 'List Update';

  console.log(`📢 Notifying ${otherCollaborators.length} collaborator(s) about: ${action}`);

  // Send notification to each collaborator via TinyBase
  const notificationPromises = otherCollaborators.map(async (collaborator) => {
    try {
      const notificationId = await addNotificationToTinyBase(listId, {
        userId: collaborator.userId,
        type: action,
        title: title,
        message: message,
        productName: itemName,
      });
      
      if (notificationId) {
        console.log(`✅ Notified ${collaborator.name || collaborator.email} (ID: ${notificationId})`);
      } else {
        console.warn(`⚠️ Failed to create notification for ${collaborator.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to notify ${collaborator.email}:`, error);
    }
  });

  // Wait for all notifications to be sent
  await Promise.all(notificationPromises);
  console.log('✅ All collaborator notifications completed');
}

/**
 * ✅ React hook for convenient access to notification functions
 * Automatically handles current user context from Clerk
 * 
 * Usage:
 * ```tsx
 * const listNotifications = useListNotifications({
 *   listId: 'list-123',
 *   listName: 'Groceries',
 *   emoji: '🛒',
 *   collaborators: [...],
 * });
 * 
 * await listNotifications.notifyItemAdded('Milk');
 * await listNotifications.notifyItemPurchased('Eggs');
 * ```
 */
export function useListNotifications(params: {
  listId: string;
  listName: string;
  emoji: string;
  collaborators: Collaborator[];
}) {
  const { user } = useUser();
  const { listId, listName, emoji, collaborators } = params;

  // Get current user info with fallbacks
  const currentUserId = user?.id || '';
  const currentUserName = user?.firstName || user?.username || 'Someone';

  // Memoize notification functions to prevent unnecessary re-renders
  const notifyItemAdded = useCallback(async (itemName: string) => {
    await notifyCollaborators({
      listId,
      listName,
      emoji,
      action: 'added_item',
      itemName,
      currentUserId,
      currentUserName,
      collaborators,
    });
  }, [listId, listName, emoji, currentUserId, currentUserName, collaborators]);

  const notifyItemRemoved = useCallback(async (itemName: string) => {
    await notifyCollaborators({
      listId,
      listName,
      emoji,
      action: 'removed_item',
      itemName,
      currentUserId,
      currentUserName,
      collaborators,
    });
  }, [listId, listName, emoji, currentUserId, currentUserName, collaborators]);

  const notifyItemPurchased = useCallback(async (itemName: string) => {
    await notifyCollaborators({
      listId,
      listName,
      emoji,
      action: 'marked_purchased',
      itemName,
      currentUserId,
      currentUserName,
      collaborators,
    });
  }, [listId, listName, emoji, currentUserId, currentUserName, collaborators]);

  const notifyItemUnpurchased = useCallback(async (itemName: string) => {
    await notifyCollaborators({
      listId,
      listName,
      emoji,
      action: 'marked_unpurchased',
      itemName,
      currentUserId,
      currentUserName,
      collaborators,
    });
  }, [listId, listName, emoji, currentUserId, currentUserName, collaborators]);

  const notifyListUpdated = useCallback(async (changes: string) => {
    await notifyCollaborators({
      listId,
      listName,
      emoji,
      action: 'updated_list',
      itemName: changes,
      currentUserId,
      currentUserName,
      collaborators,
    });
  }, [listId, listName, emoji, currentUserId, currentUserName, collaborators]);

  return {
    notifyItemAdded,
    notifyItemRemoved,
    notifyItemPurchased,
    notifyItemUnpurchased,
    notifyListUpdated,
  };
}