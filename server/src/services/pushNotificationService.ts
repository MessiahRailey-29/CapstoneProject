// server/src/services/pushNotificationService.ts
// FINAL VERSION - Explicit type assertions for TypeScript
import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushSuccessTicket, ExpoPushErrorTicket } from 'expo-server-sdk';

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
 * Send push notification via Expo Push Service
 */
export async function sendPushNotification(
  pushToken: string,
  notification: PushNotificationData
): Promise<boolean> {
  try {
    console.log('');
    console.log('📱 ========================================');
    console.log('📱 SENDING PUSH NOTIFICATION');
    console.log('📱 ========================================');
    console.log('Token preview:', String(pushToken).substring(0, 40) + '...');
    console.log('Title:', notification.title);
    console.log('Body:', notification.body);
    console.log('');

    // Validate token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error('❌ Invalid Expo push token format!');
      console.error('Token:', pushToken);
      return false;
    }

    console.log('✅ Token is valid Expo format');
    console.log('📲 Using Expo Push Service');
    console.log('');

    // Construct message
    const message: ExpoPushMessage = {
      to: pushToken,
      sound: notification.sound ?? 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      badge: notification.badge,
      priority: notification.priority ?? 'high',
      channelId: 'default',
    };

    console.log('📤 Sending to Expo Push Service...');
    console.log('Message:', JSON.stringify(message, null, 2));
    console.log('');

    // Send notification
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    const ticket = ticketChunk[0] as ExpoPushTicket;

    console.log('📬 Received response from Expo:');
    console.log(JSON.stringify(ticket, null, 2));
    console.log('');

    // Check result
    if ((ticket as any).status === 'error') {
      const errorTicket = ticket as ExpoPushErrorTicket;
      console.error('❌ Expo returned an error!');
      console.error('Error message:', errorTicket.message);
      
      if (errorTicket.details) {
        console.error('Error details:', errorTicket.details);
      }
      
      if (errorTicket.details && (errorTicket.details as any).error === 'DeviceNotRegistered') {
        console.log('📱 Device token is no longer valid');
        console.log('   This usually means:');
        console.log('   - App was uninstalled and reinstalled');
        console.log('   - Token expired');
        console.log('   - Need to register for notifications again');
      }
      
      console.log('');
      return false;
    }

    if ((ticket as any).status === 'ok') {
      const successTicket = ticket as ExpoPushSuccessTicket;
      console.log('✅ SUCCESS! Push notification sent to Expo!');
      console.log('Ticket ID:', successTicket.id);
      console.log('');
      console.log('📱 The notification should arrive on the device within a few seconds');
      console.log('   If it doesn\'t arrive:');
      console.log('   - Make sure the app is completely closed');
      console.log('   - Check device notification settings');
      console.log('   - Verify Do Not Disturb is OFF');
      console.log('   - Check device internet connection');
      console.log('');
      return true;
    }

    console.warn('⚠️ Unknown ticket status:', (ticket as any).status);
    return false;

  } catch (error: any) {
    console.error('');
    console.error('❌ EXCEPTION in sendPushNotification:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    console.error('');
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
    console.log(`📱 Sending batch of ${notifications.length} notifications...`);

    // Filter valid tokens and create messages
    const messages: ExpoPushMessage[] = notifications
      .filter(({ pushToken }) => {
        if (!Expo.isExpoPushToken(pushToken)) {
          console.warn(`⚠️ Skipping invalid token: ${String(pushToken).substring(0, 20)}...`);
          return false;
        }
        return true;
      })
      .map(({ pushToken, notification }) => ({
        to: pushToken,
        sound: notification.sound ?? 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
        badge: notification.badge,
        priority: notification.priority ?? 'high',
        channelId: 'default',
      }));

    if (messages.length === 0) {
      console.warn('⚠️ No valid tokens to send to');
      return;
    }

    // Expo recommends sending notifications in chunks of 100
    const chunks = expo.chunkPushNotifications(messages);
    console.log(`📦 Split into ${chunks.length} chunk(s)`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`📤 Sending chunk ${i + 1}/${chunks.length} (${chunk.length} notifications)...`);

      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

        // Count results
        const successCount = ticketChunk.filter((t: any) => t.status === 'ok').length;
        const errorCount = ticketChunk.filter((t: any) => t.status === 'error').length;

        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        // Log any errors
        ticketChunk.forEach((ticket: any, index: number) => {
          if (ticket.status === 'error') {
            console.error(`   Error ${index + 1}: ${ticket.message}`);
            if (ticket.details) {
              console.error(`   Details:`, ticket.details);
            }
          }
        });
      } catch (error: any) {
        console.error(`❌ Error sending chunk ${i + 1}:`, error.message);
      }
    }

    console.log('✅ Batch sending complete!');
  } catch (error: any) {
    console.error('❌ Error in sendPushNotificationBatch:', error.message);
    console.error('Stack:', error.stack);
  }
}