// server/src/jobs/notificationCronJobs.ts
import cron from 'node-cron';
import { Notification, NotificationSettings, ShoppingSchedule, LowStockTracking } from '../models/notification';
import { sendPushNotification } from '../services/pushNotificationService';
import { addNotificationToTinyBase } from '../utils/notificationHelpers';

/**
 * ✅ Check a single schedule and send notification if it's time
 * This is called IMMEDIATELY after scheduling AND by the cron job
 * Returns true if notification was sent
 */
export async function checkSingleSchedule(schedule: any): Promise<boolean> {
  try {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    console.log(`🔍 Checking schedule ${schedule._id} for user ${schedule.userId}`);
    
    // Get user's notification settings
    const settings = await NotificationSettings.findOne({ userId: schedule.userId });
    
    if (!settings?.enabled || settings?.preferences?.shoppingReminders === false) {
      console.log(`⏭️ Skipping - notifications disabled for user`);
      return false;
    }

    const hoursBefore = settings.reminderTiming?.hoursBefore ?? 2;
    
    const scheduledDate = new Date(schedule.scheduledDate);
    const scheduledDateStart = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      0, 0, 0, 0
    );
    
    // Skip if shopping date has already passed
    const dayAfterShopping = new Date(scheduledDateStart.getTime() + (24 * 60 * 60 * 1000));
    if (phTime >= dayAfterShopping) {
      console.log(`⏭️ Skipping - shopping date has passed`);
      schedule.completed = true;
      await schedule.save();
      return false;
    }
    
    // Calculate when reminder should be sent
    const reminderTime = new Date(scheduledDateStart.getTime() - (hoursBefore * 60 * 60 * 1000));
    const timeSinceReminder = phTime.getTime() - reminderTime.getTime();
    
    // ✅ CHANGED: Extended grace period to 2 hours for better delivery
    const GRACE_PERIOD_MS = 120 * 60 * 1000; // 2 hours
    
    console.log(`⏰ Schedule check:`, {
      scheduledDate: scheduledDateStart.toISOString(),
      reminderTime: reminderTime.toISOString(),
      currentTime: phTime.toISOString(),
      minutesSinceReminder: (timeSinceReminder / (1000 * 60)).toFixed(1),
      hoursSinceReminder: (timeSinceReminder / (1000 * 60 * 60)).toFixed(2),
      shouldSend: timeSinceReminder >= 0 && timeSinceReminder < GRACE_PERIOD_MS
    });
    
    // Check if we should send the reminder now
    if (timeSinceReminder >= 0 && timeSinceReminder < GRACE_PERIOD_MS) {
      const hoursUntil = Math.round((scheduledDateStart.getTime() - phTime.getTime()) / (1000 * 60 * 60));
        
      let message = '';
      if (hoursUntil <= 1) {
        message = 'Your shopping day is today!';
      } else if (hoursUntil < 24) {
        message = `Your shopping day starts in ${hoursUntil} hours!`;
      } else {
        const daysUntil = Math.round(hoursUntil / 24);
        message = `Your shopping day is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}!`;
      }

      console.log('✅ Sending notification NOW:', message);

      // ✅ Add to GLOBAL TinyBase store (instant sync via WebSocket)
      const notificationId = await addNotificationToTinyBase(schedule.listId, {
        userId: schedule.userId,
        type: 'shopping_reminder',
        title: '🛒 Shopping Reminder',
        message: message,
        scheduledDate: schedule.scheduledDate,
      });

      // Fallback to MongoDB if TinyBase not available
      if (!notificationId) {
        console.log('⚠️ TinyBase store not active, creating in MongoDB');
        await Notification.create({
          userId: schedule.userId,
          type: 'shopping_reminder',
          title: '🛒 Shopping Reminder',
          message: message,
          data: { 
            listId: schedule.listId, 
            scheduledDate: schedule.scheduledDate,
            hoursBefore: hoursBefore
          },
          isRead: false,
          isSent: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }
      
      // Mark as sent
      schedule.reminderSent = true;
      await schedule.save();
      
      console.log(`✅ Reminder sent for schedule ${schedule._id}`);
      
      // Send push notification
      if (settings.pushToken) {
        await sendPushNotification(settings.pushToken, {
          title: '🛒 Shopping Reminder',
          body: message,
          data: { 
            listId: schedule.listId,
            notificationId: notificationId || 'unknown',
            scheduledDate: schedule.scheduledDate,
            type: 'shopping_reminder'
          },
          badge: 1,
          priority: 'high',
        });
        console.log(`📲 Push notification sent`);
      }
      
      return true;
    } else if (timeSinceReminder < 0) {
      const minutesUntilReminder = Math.round(Math.abs(timeSinceReminder) / (1000 * 60));
      const hoursUntilReminder = Math.round(minutesUntilReminder / 60);
      
      if (hoursUntilReminder > 0) {
        console.log(`⏳ Too early - reminder will be sent in ${hoursUntilReminder}h ${minutesUntilReminder % 60}m`);
      } else {
        console.log(`⏳ Too early - reminder will be sent in ${minutesUntilReminder} minutes`);
      }
      return false;
    } else {
      const minutesSinceReminder = Math.round(timeSinceReminder / (1000 * 60));
      const hoursSinceReminder = Math.round(timeSinceReminder / (1000 * 60 * 60));
      console.log(`⏰ Missed window - was ${hoursSinceReminder}h ${minutesSinceReminder % 60}m ago (grace period: 2 hours)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking schedule:`, error);
    return false;
  }
}

/**
 * Main cron job - checks ALL pending schedules
 * Runs every 1 minute to catch reminders quickly
 */
export async function checkShoppingReminders() {
  console.log('🔔 [CRON] Checking for shopping reminders...');
  
  try {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    console.log(`📅 [CRON] Current PH Time: ${phTime.toISOString()}`);
    
    const schedules = await ShoppingSchedule.find({
      scheduledDate: { $gte: phTime },
      reminderSent: false,
      completed: false,
    });

    console.log(`📋 [CRON] Found ${schedules.length} pending schedule(s)`);

    let sentCount = 0;
    for (const schedule of schedules) {
      const wasSent = await checkSingleSchedule(schedule);
      if (wasSent) sentCount++;
    }
    
    console.log(`✅ [CRON] Sent ${sentCount} reminder(s)`);
  } catch (error) {
    console.error('❌ [CRON] Error in shopping reminder cron:', error);
  }
}

/**
 * ✅ Run every 1 minute to catch reminders quickly
 * Combined with immediate check after scheduling, this provides near-instant delivery
 */
export function startShoppingReminderCron() {
  cron.schedule('* * * * *', checkShoppingReminders);
  console.log('🚀 Shopping reminder cron job started (runs every 1 minute)');
  console.log('   Note: Reminders are also checked IMMEDIATELY when scheduled!');
}

/**
 * Low Stock Alert Cron Job
 * Runs daily at 9 AM to check for items that might be running low
 * Based on purchase patterns and user's threshold settings
 */
export function startLowStockAlertCron() {
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 [CRON] Checking for low stock items...');
    
    try {
      const now = new Date();
      
      // Find all tracking records where next purchase is due
      const trackings = await LowStockTracking.find({
        nextExpectedPurchase: { $lte: now },
        reminderSent: false,
      });

      console.log(`📋 [CRON] Found ${trackings.length} low stock items`);

      for (const tracking of trackings) {
        try {
          // Get user's notification settings
          const settings = await NotificationSettings.findOne({ userId: tracking.userId });
          
          // Check if user wants low stock alerts
          if (settings?.enabled && settings?.preferences?.lowStockAlerts) {
            // ✅ Add to global TinyBase store
            await addNotificationToTinyBase('', {
              userId: tracking.userId,
              type: 'low_stock',
              title: '📦 Low Stock Alert',
              message: `You might be running low on ${tracking.productName}`,
              productName: tracking.productName,
            });
            
            tracking.reminderSent = true;
            await tracking.save();
            
            console.log(`✅ [CRON] Sent low stock alert for ${tracking.productName}`);
          } else {
            console.log(`⏭️ [CRON] Skipping low stock alert for ${tracking.userId} - notifications disabled`);
          }
        } catch (error) {
          console.error(`❌ [CRON] Error processing tracking ${tracking._id}:`, error);
        }
      }
      
      console.log('✅ [CRON] Low stock check completed');
    } catch (error) {
      console.error('❌ [CRON] Error in low stock cron:', error);
    }
  });

  console.log('🚀 Low stock alert cron job started (runs daily at 9 AM)');
}

/**
 * Cleanup Expired Notifications Cron Job
 * Runs daily at midnight to clean up old notifications
 * MongoDB TTL index handles this automatically, but this is a backup
 */
export function startNotificationCleanupCron() {
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 [CRON] Cleaning up expired notifications...');
    
    try {
      const now = new Date();
      
      const result = await Notification.deleteMany({
        expiresAt: { $lte: now }
      });
      
      console.log(`✅ [CRON] Deleted ${result.deletedCount} expired notifications`);
    } catch (error) {
      console.error('❌ [CRON] Error cleaning up notifications:', error);
    }
  });

  console.log('🚀 Notification cleanup cron job started (runs daily at midnight)');
}

/**
 * Start all notification cron jobs
 */
export function startAllNotificationCrons() {
  console.log('\n🔔 ====== Starting Notification Cron Jobs ======\n');
  
  startShoppingReminderCron();
  startLowStockAlertCron();
  startNotificationCleanupCron();
  
  console.log('\n✅ All notification cron jobs are now running!');
  console.log('📅 Schedule:');
  console.log('   - Shopping Reminders: Every 1 minute (* * * * *)');
  console.log('   - PLUS: Immediate check when scheduled!');
  console.log('   - Low Stock Alerts: Daily at 9 AM (0 9 * * *)');
  console.log('   - Cleanup: Daily at midnight (0 0 * * *)\n');
}