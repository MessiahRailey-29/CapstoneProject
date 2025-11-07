// server/src/services/pushNotificationService.ts
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Send a push notification to a single device
 */
export async function sendPushNotification(
  pushToken: string,
  notification: PushNotificationData
): Promise<boolean> {
  try {
    // Check that the token is a valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`❌ Push token ${pushToken} is not a valid Expo push token`);
      return false;
    }

    // Construct the message
    const message: ExpoPushMessage = {
      to: pushToken,
      sound: notification.sound ?? 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      badge: notification.badge,
      priority: notification.priority ?? 'high',
    };

    // Send the notification
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    
    // Check the ticket for errors
    const ticket = ticketChunk[0];
    if (ticket.status === 'error') {
      console.error(`❌ Error sending push notification:`, ticket.message);
      if (ticket.details?.error === 'DeviceNotRegistered') {
        console.log('📱 Device token is no longer valid - should remove from database');
        // TODO: Remove invalid token from NotificationSettings
      }
      return false;
    }

    console.log(`✅ Push notification sent successfully:`, ticket.id);
    return true;
  } catch (error) {
    console.error('❌ Error in sendPushNotification:', error);
    return false;
  }
}

/**
 * Send push notifications to multiple devices
 */
export async function sendPushNotificationBatch(
  notifications: Array<{ pushToken: string; notification: PushNotificationData }>
): Promise<void> {
  try {
    // Filter valid tokens and create messages
    const messages: ExpoPushMessage[] = notifications
      .filter(({ pushToken }) => Expo.isExpoPushToken(pushToken))
      .map(({ pushToken, notification }) => ({
        to: pushToken,
        sound: notification.sound ?? 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
        badge: notification.badge,
        priority: notification.priority ?? 'high',
      }));

    // Expo recommends sending notifications in chunks of 100
    const chunks = expo.chunkPushNotifications(messages);
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        
        // Log any errors
        ticketChunk.forEach((ticket, index) => {
          if (ticket.status === 'error') {
            console.error(`❌ Error sending notification ${index}:`, ticket.message);
          }
        });
      } catch (error) {
        console.error('❌ Error sending chunk:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error in sendPushNotificationBatch:', error);
  }
}

/**
 * Check receipt status for sent notifications
 * Call this later to see if notifications were delivered
 */
export async function checkNotificationReceipts(receiptIds: string[]): Promise<void> {
  try {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    
    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        
        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];
          
          if (receipt.status === 'error') {
            console.error(`❌ Receipt error for ${receiptId}:`, receipt.message);
            
            if (receipt.details?.error === 'DeviceNotRegistered') {
              console.log('📱 Device token is no longer valid');
              // TODO: Remove invalid token from database
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching receipts:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error in checkNotificationReceipts:', error);
  }
}