// hooks/useNotifications.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, AppState } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from app.json extra config, with fallback
// Get API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://192.168.1.142:3000';

console.log('📡 API_URL configured as:', API_URL);

interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isSent: boolean;
  createdAt: string;
}

interface NotificationSettings {
  enabled: boolean;
  preferences: {
    shoppingReminders: boolean;
    lowStockAlerts: boolean;
    duplicateWarnings: boolean;
    priceDrops: boolean;
    sharedListUpdates: boolean;
  };
  reminderTiming: {
    hoursBefore: number;
    daysOfWeek: number[];
  };
  lowStockThreshold: {
    daysAfterLastPurchase: number;
  };
  pushToken?: string;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    // Skip in Expo Go - only works in development builds
    if (!Device.isDevice) {
      console.log('⚠️ Push notifications require a physical device');
      return;
    }

    if (Constants.appOwnership === 'expo') {
      console.log('⚠️ Push notifications require a development build (not available in Expo Go)');
      return;
    }

    try {
      console.log('📱 Requesting notification permissions...');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('Current permission status:', existingStatus);

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('New permission status:', status);
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permission not granted for push notifications');
        return;
      }

      console.log('✅ Notification permissions granted');
      console.log('🔑 Getting Expo push token...');
      console.log('EAS Project ID:', Constants.expoConfig?.extra?.eas?.projectId);

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      const token = tokenData.data;
      console.log('✅ Got push token:', token.substring(0, 30) + '...');
      setExpoPushToken(token);

      // Send token to server
      console.log('📤 Sending push token to server...');
      const response = await fetch(`${API_URL}/api/notifications/${userId}/push-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushToken: token }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('✅ Push token registered on server:', data.success);

      if (Platform.OS === 'android') {
        console.log('🤖 Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        console.log('✅ Android notification channel configured');
      }

      console.log('✅ Push notifications registered successfully');
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  }, [userId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!userId) {
      console.log('⚠️ Skipping fetch - no userId');
      return;
    }
    
    setLoading(true);
    try {
      console.log('📥 Fetching notifications for user:', userId);
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}?limit=50&unreadOnly=${unreadOnly}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        console.log(`✅ Fetched ${data.notifications.length} notifications`);
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
        console.log(`📊 Unread count: ${unread}`);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!userId) {
      console.log('⚠️ Skipping settings fetch - no userId');
      return;
    }
    
    try {
      console.log('⚙️ Fetching notification settings...');
      const response = await fetch(`${API_URL}/api/notifications/${userId}/settings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        console.log('✅ Settings fetched:', {
          enabled: data.settings.enabled,
          hasPushToken: !!data.settings.pushToken,
        });
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
    }
  }, [userId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        { method: 'PATCH' }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}/read-all`,
        { method: 'PATCH' }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, [notifications]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}/settings`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
    }
  }, [userId]);

  // Schedule shopping reminder
  const scheduleShoppingReminder = useCallback(async (listId: string, scheduledDate: Date) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}/schedule-reminder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId, scheduledDate: scheduledDate.toISOString() }),
        }
      );
      const data = await response.json();

      if (data.success && data.notification) {
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error scheduling reminder:', error);
      return false;
    }
  }, [userId, fetchNotifications]);

  // Cancel shopping reminder
  const cancelShoppingReminder = useCallback(async (listId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}/cancel-reminder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId }),
        }
      );
      const data = await response.json();

      if (data.success) {
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error cancelling reminder:', error);
      return false;
    }
  }, [userId, fetchNotifications]);

  // Create duplicate warning
  const createDuplicateWarning = useCallback(async (productName: string, listId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}/duplicate-warning`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName, listId }),
        }
      );
      const data = await response.json();

      if (data.success) {
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error creating duplicate warning:', error);
      return false;
    }
  }, [userId, fetchNotifications]);

  // Track purchase for low stock
  const trackPurchase = useCallback(async (productId: number, productName: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${userId}/track-purchase`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, productName }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Tracked purchase: ${productName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error tracking purchase:', error);
      return false;
    }
  }, [userId]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const deletePromises = notifications.map(n => deleteNotification(n._id));
      await Promise.all(deletePromises);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error clearing all notifications:', error);
    }
  }, [notifications, deleteNotification]);

  // Get unread notifications only
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  // Check if has unread by type
  const hasUnreadByType = useCallback((type: string) => {
    return notifications.some(n => !n.isRead && n.type === type);
  }, [notifications]);

  // Initialize - run only when userId changes
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ Skipping initialization - no userId');
      return;
    }
    
    console.log('🚀 Initializing notifications for userId:', userId);
    
    // Only register push notifications if not in Expo Go
    if (Constants.appOwnership !== 'expo' && Device.isDevice) {
      registerForPushNotifications();
    } else {
      console.log('⚠️ Skipping push notification registration (Expo Go or not a device)');
    }
    
    fetchNotifications();
    fetchSettings();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only re-run when userId changes

  // Listen for notifications
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
      if (userId) {
        fetchNotifications();
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('👆 Notification clicked:', response);
        const data = response.notification.request.content.data;
        
        if (data.listId) {
          console.log('Navigate to list:', data.listId);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only re-run when userId changes

  // Update badge count
  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount);
  }, [unreadCount]);

  // Auto-refresh notifications every 30 seconds when app is active
  useEffect(() => {
    if (!userId) return;
    
    console.log('🔄 Setting up auto-refresh for notifications');
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [userId, fetchNotifications]);

  // Refresh when app comes to foreground
  useEffect(() => {
    if (!userId) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active - refreshing notifications');
        fetchNotifications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId, fetchNotifications]);

  return {
    // State
    notifications,
    settings,
    unreadCount,
    loading,
    expoPushToken,
    
    // Fetchers
    fetchNotifications,
    fetchSettings,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    
    // Notification creators
    scheduleShoppingReminder,
    cancelShoppingReminder,
    createDuplicateWarning,
    trackPurchase,
    
    // Helpers
    getUnreadNotifications,
    hasUnreadByType,
  };
}