// server/src/routes/notificationRoutes.ts
import express from 'express';
import { Notification, NotificationSettings, ShoppingSchedule, LowStockTracking } from '../models/notification';

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
    const { listId, scheduledDate } = req.body;

    // Create expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const notification = new Notification({
      userId: userId,
      type: 'shopping_reminder',
      title: '🛒 Shopping Reminder',
      message: `Time to go shopping!`,
      data: { listId },
      isRead: false,
      isSent: false,
      scheduledFor: new Date(scheduledDate),
      createdAt: new Date(),
      expiresAt: expiresAt,
    });

    await notification.save();
    
    // 🐛 DEBUG LOG
    console.log('✅ Created shopping reminder:', {
      userId,
      isRead: notification.isRead,
      _id: notification._id
    });

    res.json({ success: true, notification });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('❌ Error creating reminder:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Create duplicate warning
router.post('/:userId/duplicate-warning', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productName, listId } = req.body;

    // Create expiration date (30 days from now)
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
    
    // 🐛 DEBUG LOG
    console.log('✅ Created duplicate warning:', {
      userId,
      productName,
      isRead: notification.isRead,
      _id: notification._id
    });

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

    // Find or create tracking record
    let tracking = await LowStockTracking.findOne({ userId, productId });

    if (tracking) {
      // Calculate average purchase interval
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
      // First purchase - create tracking record
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

export default router;