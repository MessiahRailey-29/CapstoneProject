// server/src/jobs/notificationCronJobs.ts
import cron from 'node-cron';
import { Notification, NotificationSettings, ShoppingSchedule, LowStockTracking } from '../models/notification';

/**
 * Shopping Reminder Cron Job
 * Runs every hour to check for upcoming shopping trips
 * Sends reminders based on user's preferred timing (default: 2 hours before)
 */
export function startShoppingReminderCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 [CRON] Checking for shopping reminders...');
    
    try {
      const now = new Date();
      
      // Find all schedules that are upcoming and haven't sent reminder yet
      const schedules = await ShoppingSchedule.find({
        scheduledDate: { $gte: now },
        reminderSent: false,
        completed: false,
      });

      console.log(`📋 [CRON] Found ${schedules.length} upcoming shopping schedules`);

      for (const schedule of schedules) {
        try {
          // Get user's notification settings
          const settings = await NotificationSettings.findOne({ userId: schedule.userId });
          const hoursBefore = settings?.reminderTiming?.hoursBefore || 2;
          
          // Calculate when to send the reminder
          const reminderTime = new Date(schedule.scheduledDate);
          reminderTime.setHours(reminderTime.getHours() - hoursBefore);
          
          // If it's time to send the reminder
          if (now >= reminderTime) {
            // Check if user wants shopping reminders
            if (settings?.enabled && settings?.preferences?.shoppingReminders !== false) {
              await Notification.create({
                userId: schedule.userId,
                type: 'shopping_reminder',
                title: '🛒 Shopping Reminder',
                message: `Your shopping trip is scheduled in ${hoursBefore} hours!`,
                data: { 
                  listId: schedule.listId, 
                  scheduledDate: schedule.scheduledDate 
                },
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              });
              
              schedule.reminderSent = true;
              await schedule.save();
              
              console.log(`✅ [CRON] Sent shopping reminder for schedule ${schedule._id}`);
            } else {
              console.log(`⏭️ [CRON] Skipping reminder for ${schedule.userId} - notifications disabled`);
            }
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