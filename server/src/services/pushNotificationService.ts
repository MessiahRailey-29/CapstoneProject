// server/src/services/pushNotificationService.ts
// IMPROVED HYBRID VERSION: Better Expo token detection
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

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
 * Detect if token is an Expo Push Token
 */
function isExpoToken(pushToken: string): boolean {
  // Check if it starts with ExponentPushToken
  if (pushToken.startsWith('ExponentPushToken[')) {
    return true;
  }
  
  // Also check if it's a valid Expo token format
  return Expo.isExpoPushToken(pushToken);
}

/**
 * Send via Expo Push Service
 */
async function sendViaExpo(pushToken: string, notification: PushNotificationData): Promise<boolean> {
  try {
    console.log('📲 Using Expo Push Service');
    
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`❌ Invalid Expo push token: ${pushToken}`);
      return false;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: notification.sound ?? 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      badge: notification.badge,
      priority: notification.priority ?? 'high',
    };

    console.log('📤 Sending via Expo Push Service...');
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    const ticket = ticketChunk[0];

    if (ticket.status === 'error') {
      console.error(`❌ Expo error:`, ticket.message);
      if (ticket.details) {
        console.error('Error details:', ticket.details);
      }
      return false;
    }

    console.log(`✅ Sent via Expo Push Service! Ticket ID:`, ticket.id);
    return true;
  } catch (error) {
    console.error('❌ Error in sendViaExpo:', error);
    return false;
  }
}

/**
 * Send via Firebase Cloud Messaging (for native FCM tokens only)
 */
async function sendViaFCM(fcmToken: string, notification: PushNotificationData): Promise<boolean> {
  try {
    console.log('🔥 Using Firebase Cloud Messaging');
    
    if (!admin.apps.length) {
      console.error('❌ Firebase Admin is not initialized');
      return false;
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data ? {
        ...Object.keys(notification.data).reduce((acc, key) => {
          acc[key] = String(notification.data[key]);
          return acc;
        }, {} as Record<string, string>)
      } : {},
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: notification.sound ?? 'default',
          channelId: 'default',
          priority: notification.priority === 'high' ? 'high' : 'default',
        },
      },
    };

    console.log('📤 Sending via Firebase FCM...');
    const response = await admin.messaging().send(message);
    console.log('✅ Sent via Firebase FCM! Message ID:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Error in sendViaFCM:', error);
    
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      console.log('📱 FCM token is invalid - should remove from database');
    }
    
    return false;
  }
}

/**
 * Main function: Send push notification using the appropriate service
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
    console.log('Token preview:', pushToken.substring(0, 40) + '...');
    console.log('Title:', notification.title);
    console.log('Body:', notification.body);
    console.log('');

    // Detect token type
    const useExpo = isExpoToken(pushToken);
    
    if (useExpo) {
      console.log('✅ Detected: EXPO PUSH TOKEN');
      console.log('   Will use Expo Push Service');
      console.log('');
      return await sendViaExpo(pushToken, notification);
    } else {
      console.log('✅ Detected: FCM TOKEN');
      console.log('   Will use Firebase Cloud Messaging');
      console.log('');
      
      // Check if Firebase is available
      if (!admin.apps.length) {
        console.error('❌ Firebase not initialized but token is FCM format');
        console.error('   Cannot send notification');
        return false;
      }
      
      return await sendViaFCM(pushToken, notification);
    }
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
    console.log(`📱 Sending batch of ${notifications.length} notifications...`);
    
    // Group by token type
    const expoNotifications = notifications.filter(n => isExpoToken(n.pushToken));
    const fcmNotifications = notifications.filter(n => !isExpoToken(n.pushToken));

    console.log(`   Expo tokens: ${expoNotifications.length}`);
    console.log(`   FCM tokens: ${fcmNotifications.length}`);

    // Send via Expo for Expo tokens
    if (expoNotifications.length > 0) {
      console.log('📲 Sending Expo notifications...');
      
      const messages: ExpoPushMessage[] = expoNotifications
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

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        const successCount = ticketChunk.filter(t => t.status === 'ok').length;
        const errorCount = ticketChunk.filter(t => t.status === 'error').length;
        console.log(`   ✅ Expo Batch: Success ${successCount}, Errors ${errorCount}`);
      }
    }

    // Send via FCM for native tokens
    if (fcmNotifications.length > 0 && admin.apps.length > 0) {
      console.log('🔥 Sending FCM notifications...');
      
      const messages: admin.messaging.Message[] = fcmNotifications.map(({ pushToken, notification }) => ({
        token: pushToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data ? {
          ...Object.keys(notification.data).reduce((acc, key) => {
            acc[key] = String(notification.data[key]);
            return acc;
          }, {} as Record<string, string>)
        } : {},
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          notification: {
            sound: notification.sound ?? 'default',
            channelId: 'default',
          },
        },
      }));

      const batchSize = 500;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const response = await admin.messaging().sendEach(batch);
        console.log(`   ✅ FCM Batch: Success ${response.successCount}, Failure ${response.failureCount}`);
      }
    }
    
    console.log('✅ Batch sending complete!');
  } catch (error) {
    console.error('❌ Error in sendPushNotificationBatch:', error);
  }
}