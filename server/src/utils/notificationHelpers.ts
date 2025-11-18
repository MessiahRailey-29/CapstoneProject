// server/src/utils/notificationHelpers.ts
import { getGlobalNotificationsStore } from '../syncServer';

/**
 * ✅ FIXED: Add notification to GLOBAL TinyBase store
 * This will instantly sync to all connected clients via WebSocket
 * No longer adds to list-specific stores - uses a shared notifications store
 */
export async function addNotificationToTinyBase(
  listId: string,
  notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    productName?: string;
    scheduledDate?: Date | string;
  }
): Promise<string | null> {
  try {
    // ✅ CHANGED: Get the GLOBAL notifications store instead of list-specific store
    const store = getGlobalNotificationsStore();
    
    if (!store) {
      console.log('⚠️ Global notifications store not available yet');
      return null;
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔔 Adding notification to GLOBAL notifications store`);
    
    // Add notification to the GLOBAL TinyBase store
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
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    console.log(`✅ Notification added to GLOBAL store - will sync instantly via WebSocket!`);
    console.log(`   Notification ID: ${notificationId}`);
    console.log(`   User ID: ${notification.userId}`);
    console.log(`   Type: ${notification.type}`);
    
    return notificationId;
    
  } catch (error) {
    console.error('❌ Error adding notification to TinyBase:', error);
    return null;
  }
}