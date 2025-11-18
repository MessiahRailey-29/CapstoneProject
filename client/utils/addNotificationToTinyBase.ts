// utils/addNotificationToTinyBase.ts
import { getGlobalNotificationsStore } from '@/hooks/useNotificationsFromStore';

interface NotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  productName?: string;
  scheduledDate?: Date | string;
}

export async function addNotificationToTinyBase(
  listId: string,
  notification: NotificationParams
): Promise<string | null> {
  try {
    const store = getGlobalNotificationsStore();
    
    if (!store) {
      console.warn('⚠️ Global notifications store not ready yet');
      return null;
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔔 Adding notification to GLOBAL TinyBase store for user: ${notification.userId}`);
    
    store.setRow('notifications', notificationId, {
      id: notificationId,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      listId: listId,
      productName: notification.productName || '',
      scheduledDate: notification.scheduledDate 
        ? (typeof notification.scheduledDate === 'string' 
            ? notification.scheduledDate 
            : notification.scheduledDate.toISOString())
        : '',
      isRead: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
    });
    
    console.log(`✅ Notification added to GLOBAL store - ID: ${notificationId}`);
    
    return notificationId;
    
  } catch (error) {
    console.error('❌ Error adding notification to TinyBase:', error);
    return null;
  }
}