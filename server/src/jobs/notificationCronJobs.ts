// server/src/jobs/notificationCronJobs.ts
import cron from 'node-cron';
import { Notification, NotificationSettings, ShoppingSchedule, LowStockTracking } from '../models/notification';

/**
 * Shopping Reminder Cron Job
 * Runs every hour to check for reminders based on user's configured hoursBefore setting
 * Since users only pick dates (not times), we calculate from the start of the scheduled date (00:00)
 */
export function startShoppingReminderCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 [CRON] Checking for shopping reminders...');
    
    try {
      // Use UTC+8 timezone (Philippines)
      const now = new Date();
      const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      
      console.log(`📅 [CRON] Current PH Time: ${phTime.toISOString()}`);
      
      // Find all pending schedules (not completed, reminder not sent yet)
      const schedules = await ShoppingSchedule.find({
        scheduledDate: { $gte: phTime }, // Only future schedules
        reminderSent: false,
        completed: false,
      });

      console.log(`📋 [CRON] Found ${schedules.length} pending schedule(s)`);

      for (const schedule of schedules) {
        try {
          // Get user's notification settings
          const settings = await NotificationSettings.findOne({ userId: schedule.userId });
          
          // Skip if user has notifications disabled
          if (!settings?.enabled || settings?.preferences?.shoppingReminders === false) {
            console.log(`⏭️ [CRON] Skipping schedule ${schedule._id} - notifications disabled for user`);
            continue;
          }

          // Get user's configured hoursBefore (default to 24 hours if not set)
          const hoursBefore = settings.reminderTiming?.hoursBefore ?? 24;
          
          // Get the scheduled date and normalize to start of day (00:00) in PH timezone
          const scheduledDate = new Date(schedule.scheduledDate);
          const scheduledDateStart = new Date(
            scheduledDate.getFullYear(),
            scheduledDate.getMonth(),
            scheduledDate.getDate(),
            0, 0, 0, 0 // Start of day: 00:00:00
          );
          
          // Calculate when the reminder should be sent (X hours before start of scheduled date)
          const reminderTime = new Date(scheduledDateStart.getTime() - (hoursBefore * 60 * 60 * 1000));
          
          // Calculate the end of the reminder window (1 hour after reminder time, to catch it in this cron run)
          const reminderWindowEnd = new Date(reminderTime.getTime() + (60 * 60 * 1000));
          
          console.log(`⏰ [CRON] Schedule ${schedule._id}:`);
          console.log(`   - Scheduled date (start of day): ${scheduledDateStart.toISOString()}`);
          console.log(`   - Remind ${hoursBefore}h before at: ${reminderTime.toISOString()}`);
          console.log(`   - Reminder window: ${reminderTime.toISOString()} to ${reminderWindowEnd.toISOString()}`);
          console.log(`   - Current time: ${phTime.toISOString()}`);
          
          // Check if current time is within the reminder window
          if (phTime >= reminderTime && phTime < reminderWindowEnd) {
            // Calculate hours until the shopping date (from start of day)
            const hoursUntil = Math.round((scheduledDateStart.getTime() - phTime.getTime()) / (1000 * 60 * 60));
            
            // Create notification message based on time remaining
            let message = '';
            if (hoursUntil <= 1) {
              message = 'Your shopping day is today!';
            } else if (hoursUntil < 24) {
              message = `Your shopping day starts in ${hoursUntil} hours!`;
            } else {
              const daysUntil = Math.round(hoursUntil / 24);
              message = `Your shopping day is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}!`;
            }

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
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            });
            
            schedule.reminderSent = true;
            await schedule.save();
            
            console.log(`✅ [CRON] Sent reminder for schedule ${schedule._id} (${hoursBefore}h before shopping date)`);
            
            // TODO: Send push notification here if user has push token
            if (settings.pushToken) {
              console.log(`📲 [CRON] Would send push notification to: ${settings.pushToken.substring(0, 20)}...`);
              // await sendPushNotification(settings.pushToken, notification);
            }
          } else if (phTime < reminderTime) {
            const hoursUntilReminder = Math.round((reminderTime.getTime() - phTime.getTime()) / (1000 * 60 * 60));
            console.log(`⏳ [CRON] Too early - reminder will be sent in ${hoursUntilReminder} hours`);
          } else {
            console.log(`⏰ [CRON] Missed reminder window - was supposed to send between ${reminderTime.toISOString()} and ${reminderWindowEnd.toISOString()}`);
          }
        } catch (error) {
          console.error(`❌ [CRON] Error processing schedule ${schedule._id}:`, error);
        }
      }
      
      console.log('✅ [CRON] Shopping reminder check completed');
    } catch (error) {
      console.error('❌ [CRON] Error in shopping reminder cron:', error);
    }
  });

  console.log('🚀 Shopping reminder cron job started (runs every hour)');
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
            await Notification.create({
              userId: tracking.userId,
              type: 'low_stock',
              title: '📦 Low Stock Alert',
              message: `You might be running low on ${tracking.productName}`,
              data: { 
                productId: tracking.productId, 
                productName: tracking.productName 
              },
              isRead: false,
              isSent: true,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
 * Call this function in your server's index.ts after MongoDB connection
 * 
 * Usage:
 * import { startAllNotificationCrons } from './jobs/notificationCronJobs';
 * 
 * // After MongoDB connects:
 * await connectDB(mongoUri);
 * startAllNotificationCrons();
 */
export function startAllNotificationCrons() {
  console.log('\n🔔 ====== Starting Notification Cron Jobs ======\n');
  
  startShoppingReminderCron();
  startLowStockAlertCron();
  startNotificationCleanupCron();
  
  console.log('\n✅ All notification cron jobs are now running!');
  console.log('📅 Schedule:');
  console.log('   - Shopping Reminders: Every hour (0 * * * *)');
  console.log('   - Low Stock Alerts: Daily at 9 AM (0 9 * * *)');
  console.log('   - Cleanup: Daily at midnight (0 0 * * *)\n');
}