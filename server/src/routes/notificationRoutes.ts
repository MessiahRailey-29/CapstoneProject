// server/src/routes/notificationRoutes.ts
import express from 'express';
import { Notification, NotificationSettings, ShoppingSchedule, LowStockTracking } from '../models/notification';
import { sendPushNotification } from '../services/pushNotificationService';

const router = express.Router();

// Get user's notifications
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '50', unreadOnly = 'false' } = req.query;

    const query: any = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

// Get user's notification settings
router.get('/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;

    let settings = await NotificationSettings.findOne({ userId });

    // Create default settings if none exist
    if (!settings) {
      settings = await NotificationSettings.create({
        userId,
        enabled: true,
        preferences: {
          shoppingReminders: true,
          lowStockAlerts: true,
          duplicateWarnings: true,
          priceDrops: true,
          sharedListUpdates: true,
        },
        reminderTiming: {
          hoursBefore: 2,
          daysOfWeek: [],
        },
        lowStockThreshold: {
          daysAfterLastPurchase: 14,
        },
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
    });
  }
});

// Update notification settings
router.put('/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
    });
  }
});

// Register push token
router.post('/:userId/push-token', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pushToken } = req.body;

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      { pushToken, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register push token',
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark as read',
    });
  }
});

// Mark all as read
router.patch('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all as read',
    });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

// Schedule shopping reminder
router.post('/:userId/schedule-reminder', async (req, res) => {
  try {
    const { userId } = req.params;
    const { listId, listName, emoji, scheduledDate } = req.body;

    console.log('\n🔔 ========================================');
    console.log('🔔 SCHEDULE REMINDER REQUEST');
    console.log('🔔 ========================================');
    console.log('User ID:', userId);
    console.log('List ID:', listId);
    console.log('List Name:', listName);
    console.log('Scheduled Date:', scheduledDate);
    console.log('Current Time (Server):', new Date().toISOString());
    console.log('Current Time (PH):', new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

    // Delete any existing schedules for this list
    const deleteResult = await ShoppingSchedule.deleteMany({
      userId,
      listId
    });
    
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} old schedule(s) for list ${listId}`);
    }

    // Create a schedule record
    const schedule = new ShoppingSchedule({
      userId,
      listId,
      scheduledDate: new Date(scheduledDate),
      reminderSent: false,
      approachingReminderSent: false,
      createdAt: new Date()
    });

    await schedule.save();
    
    console.log('✅ Created shopping schedule:', {
      _id: schedule._id,
      userId,
      listId,
      scheduledDate: schedule.scheduledDate.toISOString()
    });

    // ⚡ IMMEDIATELY check if this reminder should be sent NOW
    console.log('\n⚡ ========================================');
    console.log('⚡ IMMEDIATE NOTIFICATION CHECK');
    console.log('⚡ ========================================');
    console.log('Checking if notification should be sent right now...');
    
    const { checkSingleSchedule } = await import('../jobs/notificationCronJobs.js');
    const wasSentNow = await checkSingleSchedule(schedule);

    if (wasSentNow) {
      console.log('\n🎉 ========================================');
      console.log('🎉 NOTIFICATION SENT IMMEDIATELY!');
      console.log('🎉 ========================================');
      console.log('✅ The notification was delivered instantly!');
      console.log('✅ User should see it in their app now!');
      console.log('✅ No waiting required!');
      console.log('========================================\n');
      
      res.json({ 
        success: true, 
        schedule,
        sentImmediately: true,
        message: '🎉 Reminder sent immediately! Check your notifications.',
        deliveryStatus: 'instant'
      });
    } else {
      console.log('\n📅 ========================================');
      console.log('📅 SCHEDULED FOR LATER');
      console.log('📅 ========================================');
      console.log('ℹ️ Notification will be sent at the scheduled time');
      console.log('ℹ️ Cron job will check every minute');
      console.log('ℹ️ 2-hour grace period ensures delivery');
      console.log('========================================\n');
      
      res.json({ 
        success: true, 
        schedule,
        sentImmediately: false,
        message: 'Shopping reminder scheduled successfully',
        deliveryStatus: 'scheduled'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('\n❌ ========================================');
    console.error('❌ ERROR SCHEDULING REMINDER');
    console.error('❌ ========================================');
    console.error('Error:', errorMessage);
    console.error('Stack:', error);
    console.error('========================================\n');
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      deliveryStatus: 'failed'
    });
  }
});

// Cancel reminder
router.post('/:userId/cancel-reminder', async (req, res) => {
  try {
    const { userId } = req.params;
    const { listId } = req.body;

    const result = await ShoppingSchedule.deleteMany({
      userId,
      listId
    });

    console.log(`✅ Cancelled schedule for list ${listId}`);

    res.json({
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('❌ Error cancelling schedule:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Create duplicate warning with push notification
router.post('/:userId/duplicate-warning', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productName, listId } = req.body;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const notification = new Notification({
      userId: userId,
      type: 'duplicate_warning',
      title: '⚠️ Duplicate Item',
      message: `You already have ${productName} in your list`,
      data: { productName, listId },
      isRead: false,
      isSent: false,
      createdAt: new Date(),
      expiresAt: expiresAt,
    });

    await notification.save();
    
    console.log('✅ Created duplicate warning:', {
      userId,
      productName,
      _id: notification._id
    });

    // Send push notification
    const settings = await NotificationSettings.findOne({ userId });
    
    if (settings?.pushToken && settings.enabled && settings.preferences?.duplicateWarnings) {
      console.log('📱 Sending push notification for duplicate warning...');
      
      const sent = await sendPushNotification(settings.pushToken, {
        title: '⚠️ Duplicate Item',
        body: `You already have ${productName} in your list`,
        data: { 
          notificationId: notification._id.toString(),
          listId,
          type: 'duplicate_warning'
        },
        priority: 'high',
      });
      
      if (sent) {
        notification.isSent = true;
        await notification.save();
        console.log('✅ Push notification sent');
      }
    }

    res.json({ success: true, notification });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('❌ Error creating duplicate warning:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Track purchase for low stock monitoring
router.post('/:userId/track-purchase', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, productName } = req.body;

    let tracking = await LowStockTracking.findOne({ userId, productId });

    if (tracking) {
      const daysSinceLastPurchase = Math.floor(
        (Date.now() - tracking.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (tracking.averagePurchaseInterval) {
        tracking.averagePurchaseInterval = Math.round(
          (tracking.averagePurchaseInterval + daysSinceLastPurchase) / 2
        );
      } else {
        tracking.averagePurchaseInterval = daysSinceLastPurchase;
      }

      tracking.lastPurchaseDate = new Date();
      tracking.nextExpectedPurchase = new Date(
        Date.now() + tracking.averagePurchaseInterval * 24 * 60 * 60 * 1000
      );
      tracking.reminderSent = false;
      tracking.updatedAt = new Date();
      await tracking.save();
    } else {
      tracking = await LowStockTracking.create({
        userId,
        productId,
        productName,
        lastPurchaseDate: new Date(),
        reminderSent: false,
      });
    }

    res.json({
      success: true,
      tracking,
    });
  } catch (error) {
    console.error('Error tracking purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track purchase',
    });
  }
});

// Create shared list update notification with push notification
router.post('/:userId/shared-list-update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { listId, listName, emoji, message, action, itemName, updatedBy } = req.body;

    // Check if user has shared list update notifications enabled
    const settings = await NotificationSettings.findOne({ userId });
    
    if (!settings?.enabled || settings.preferences?.sharedListUpdates === false) {
      console.log(`⏭️ Skipping notification for ${userId} - shared list updates disabled`);
      return res.json({ 
        success: true, 
        message: 'Notification skipped - user preference' 
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const notification = new Notification({
      userId: userId,
      type: 'shared_list_update',
      title: `${emoji} ${listName}`,
      message: message,
      data: { 
        listId, 
        listName, 
        action, 
        itemName, 
        updatedBy 
      },
      isRead: false,
      isSent: false,
      createdAt: new Date(),
      expiresAt: expiresAt,
    });

    await notification.save();
    
    console.log('✅ Created shared list update notification:', {
      userId,
      listName,
      action,
      _id: notification._id
    });

    // Send push notification if user has push token
    if (settings?.pushToken) {
      console.log('📱 Sending push notification for shared list update...');
      
      const sent = await sendPushNotification(settings.pushToken, {
        title: `${emoji} ${listName}`,
        body: message,
        data: { 
          notificationId: notification._id.toString(),
          listId,
          type: 'shared_list_update',
          action
        },
        priority: 'default', // Lower priority than reminders
      });
      
      if (sent) {
        notification.isSent = true;
        await notification.save();
        console.log('✅ Push notification sent');
      }
    }

    res.json({ success: true, notification });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('❌ Error creating shared list update notification:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 🧪 TEST PUSH: Send a test push notification
router.post('/:userId/test-push', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🧪 TEST: Sending test push notification to user:', userId);

    // Get user's notification settings and push token
    const settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
      console.log('❌ No notification settings found for user');
      return res.status(404).json({
        success: false,
        error: 'No notification settings found. Please enable notifications first.',
      });
    }

    console.log('📋 Settings found:', {
      enabled: settings.enabled,
      hasPushToken: !!settings.pushToken,
      pushToken: settings.pushToken ? settings.pushToken.substring(0, 20) + '...' : 'none',
    });

    if (!settings.pushToken) {
      console.log('❌ No push token registered');
      return res.status(400).json({
        success: false,
        error: 'No push token registered. Please open the app and allow notifications.',
      });
    }

    if (!settings.enabled) {
      console.log('⚠️ Notifications are disabled for this user');
      return res.status(400).json({
        success: false,
        error: 'Notifications are disabled. Please enable them in settings.',
      });
    }

    // Send the test push notification
    console.log('📱 Attempting to send push notification...');
    console.log('Push token:', settings.pushToken);

    const sent = await sendPushNotification(settings.pushToken, {
      title: '🧪 Test Notification',
      body: 'If you see this, push notifications are working! 🎉',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
      priority: 'high',
    });

    if (sent) {
      console.log('✅ Test push notification sent successfully!');

      // Also create a notification in the database
      const notification = await Notification.create({
        userId,
        type: 'shopping_reminder',
        title: '🧪 Test Notification',
        message: 'This is a test notification to verify push notifications are working.',
        data: { test: true },
        isRead: false,
        isSent: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return res.json({
        success: true,
        message: 'Test push notification sent successfully!',
        notification,
        pushToken: settings.pushToken.substring(0, 20) + '...',
      });
    } else {
      console.log('❌ Failed to send push notification');
      return res.status(500).json({
        success: false,
        error: 'Failed to send push notification. Check server logs for details.',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in test-push endpoint:', errorMessage);
    console.error('Stack:', error);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// 🔍 DEBUG ENDPOINT: Check notification settings and push token
router.get('/:userId/debug', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 DEBUG: Checking notification setup for user:', userId);
    const settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
      return res.json({
        success: false,
        message: 'No notification settings found',
        userId,
        hasSettings: false,
      });
    }

    return res.json({
      success: true,
      userId,
      hasSettings: true,
      settings: {
        enabled: settings.enabled,
        hasPushToken: !!settings.pushToken,
        pushTokenPreview: settings.pushToken ? settings.pushToken.substring(0, 30) + '...' : null,
        preferences: settings.preferences,
        reminderTiming: settings.reminderTiming,
        lastUpdated: settings.updatedAt,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in debug endpoint:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// 🎯 MANUAL TRIGGER: Force check for reminders NOW (for testing)
router.post('/admin/trigger-reminders', async (req, res) => {
  try {
    console.log('🔔 MANUAL TRIGGER: Forcing shopping reminder check...');
    const { checkShoppingReminders } = await import('../jobs/notificationCronJobs.js');
    await checkShoppingReminders();
    console.log('✅ Manual reminder check completed');
    
    res.json({
      success: true,
      message: 'Reminder check triggered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in manual trigger:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;