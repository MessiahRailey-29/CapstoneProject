// utils/notifyCollaborators.ts
import { useUser } from '@clerk/clerk-expo';
import { useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://192.168.1.142:3000';

interface ListCollaborator {
  userId: string;
  nickname: string;
}

interface NotifyCollaboratorsParams {
  listId: string;
  listName: string;
  emoji: string;
  action: 'added_item' | 'removed_item' | 'updated_item' | 'marked_purchased' | 'marked_unpurchased' | 'updated_list';
  itemName?: string;
  currentUserId: string;
  currentUserName: string;
  collaborators: ListCollaborator[];
}

/**
 * Notify all collaborators (except the current user) about changes to a shared list
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

  // Filter out the current user from collaborators
  const otherCollaborators = collaborators.filter(c => c.userId !== currentUserId);

  if (otherCollaborators.length === 0) {
    console.log('No collaborators to notify');
    return;
  }

  // Generate notification message based on action
  let message = '';
  switch (action) {
    case 'added_item':
      message = `${currentUserName} added "${itemName}" to ${listName}`;
      break;
    case 'removed_item':
      message = `${currentUserName} removed "${itemName}" from ${listName}`;
      break;
    case 'updated_item':
      message = `${currentUserName} updated "${itemName}" in ${listName}`;
      break;
    case 'marked_purchased':
      message = `${currentUserName} marked "${itemName}" as purchased in ${listName}`;
      break;
    case 'marked_unpurchased':
      message = `${currentUserName} unmarked "${itemName}" in ${listName}`;
      break;
    case 'updated_list':
      message = `${currentUserName} updated ${listName}`;
      break;
  }

  console.log(`📢 Notifying ${otherCollaborators.length} collaborator(s):`, message);

  // Send notification to each collaborator
  const results = await Promise.allSettled(
    otherCollaborators.map(async (collaborator) => {
      try {
        const response = await fetch(`${API_URL}/api/notifications/${collaborator.userId}/shared-list-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listId,
            listName,
            emoji,
            message,
            action,
            itemName,
            updatedBy: currentUserName,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ Notified collaborator ${collaborator.nickname} (${collaborator.userId})`);
          return { success: true, collaborator: collaborator.nickname };
        } else {
          console.error(`❌ Failed to notify ${collaborator.nickname}:`, data.error);
          return { success: false, collaborator: collaborator.nickname, error: data.error };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Network error notifying ${collaborator.nickname}:`, errorMessage);
        return { success: false, collaborator: collaborator.nickname, error: errorMessage };
      }
    })
  );

  // Log summary
  const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
  const failed = results.length - successful;
  
  if (failed > 0) {
    console.warn(`⚠️ Notification summary: ${successful} succeeded, ${failed} failed`);
  } else {
    console.log(`✅ All ${successful} notifications sent successfully`);
  }
}

/**
 * Hook to easily use notification in components
 */
export function useCollaboratorNotifications() {
  const { user } = useUser();
  
  const notify = useCallback(async (params: Omit<NotifyCollaboratorsParams, 'currentUserId' | 'currentUserName'>) => {
    if (!user?.id) {
      console.warn('⚠️ No user ID available for notifications');
      return;
    }

    const currentUserName = user.firstName || user.username || 'Someone';

    await notifyCollaborators({
      ...params,
      currentUserId: user.id,
      currentUserName,
    });
  }, [user]);

  return { notifyCollaborators: notify };
}

/**
 * Hook for cleaner integration - provides convenience methods
 */
interface UseListNotificationsParams {
  listId: string;
  listName: string;
  emoji: string;
  collaborators: Array<{ userId: string; nickname: string }>;
}

export function useListNotifications(params: UseListNotificationsParams) {
  const { user } = useUser();
  const { listId, listName, emoji, collaborators } = params;

  const notifyAction = useCallback(async (action: string, itemName?: string) => {
    if (!user?.id || !collaborators || collaborators.length === 0) {
      return;
    }

    const currentUserName = user.firstName || user.username || 'Someone';

    await notifyCollaborators({
      listId,
      listName,
      emoji: emoji || '🛒',
      action: action as any,
      itemName,
      currentUserId: user.id,
      currentUserName,
      collaborators,
    });
  }, [user, listId, listName, emoji, collaborators]);

  return {
    notifyItemAdded: useCallback((itemName: string) => notifyAction('added_item', itemName), [notifyAction]),
    notifyItemRemoved: useCallback((itemName: string) => notifyAction('removed_item', itemName), [notifyAction]),
    notifyItemUpdated: useCallback((itemName: string) => notifyAction('updated_item', itemName), [notifyAction]),
    notifyItemPurchased: useCallback((itemName: string) => notifyAction('marked_purchased', itemName), [notifyAction]),
    notifyItemUnpurchased: useCallback((itemName: string) => notifyAction('marked_unpurchased', itemName), [notifyAction]),
    notifyListUpdated: useCallback(() => notifyAction('updated_list'), [notifyAction]),
  };
}