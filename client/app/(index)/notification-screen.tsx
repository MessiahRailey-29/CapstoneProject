// app/(index)/notification-screen.tsx
import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  useColorScheme
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@clerk/clerk-expo';
// ✅ CHANGED: Use TinyBase hook for real-time notifications
import { useNotificationsFromStore } from '@/hooks/useNotificationsFromStore';
import { useShoppingListData } from '@/stores/ShoppingListsStore';
import { Colors } from '@/constants/Colors';
import CustomAlert, { AlertButton } from '@/components/ui/CustomAlert';

// Component to display notification with shopping list details
function NotificationItem({
  notification,
  onPress,
  onDelete
}: {
  notification: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const listId = notification.listId; // ✅ CHANGED: Direct access from TinyBase row
  const listData = useShoppingListData(listId || '');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shopping_reminder':
        return '🛒';
      case 'low_stock':
        return '📦';
      case 'duplicate_warning':
        return '⚠️';
      case 'price_drop':
        return '💰';
      case 'shared_list_update':
        return '👥';
      default:
        return '🔔';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatScheduledDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };



  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = createStyles(colors);

  const isShoppingReminder = notification.type === 'shopping_reminder';
  const hasListData = listData && listData.name;

  return (
    <TouchableOpacity
      style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
      onPress={onPress}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText style={styles.notificationIcon}>
            {isShoppingReminder && hasListData ? listData.emoji : getNotificationIcon(notification.type)}
          </ThemedText>

          <View style={styles.notificationTextContainer}>
            {isShoppingReminder && hasListData && (
              <ThemedText style={styles.listName}>
                {listData.name}
              </ThemedText>
            )}

            <ThemedText style={styles.notificationTitle}>
              {notification.title}
            </ThemedText>

            <ThemedText style={styles.notificationMessage}>
              {notification.message}
            </ThemedText>

            {isShoppingReminder && notification.scheduledDate && (
              <View style={styles.dateContainer}>
                <ThemedText style={styles.scheduledDate}>
                  📅 {formatScheduledDate(notification.scheduledDate)}
                </ThemedText>
              </View>
            )}

            <ThemedText style={styles.notificationTime}>
              {formatDate(notification.createdAt)}
            </ThemedText>
          </View>

          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <ThemedText style={styles.deleteButtonText}>×</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const userId = useMemo(() => user?.id || '', [user?.id]);

  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = createStyles(colors);

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);

  const showCustomAlert = (title: string, message: string, buttons?: any[]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(
      buttons || [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
    );
    setCustomAlertVisible(true);
  };

  // ✅ CHANGED: Use TinyBase hook for real-time updates
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationsFromStore(userId);

  const [refreshing, setRefreshing] = useState(false);

  // ✅ CHANGED: No need to fetch - TinyBase syncs automatically
  const onRefresh = async () => {
    setRefreshing(true);
    // Just wait a moment for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleNotificationPress = async (notificationId: string, listId: string) => {
    await markAsRead(notificationId);

    if (listId && typeof listId === 'string') {
      router.push(`/(index)/list/${listId}`);
    } else {
      console.log('No listId in notification');
    }
  };

  const handleClearAll = () => {
    showCustomAlert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Notifications',
          headerRight: () =>
            notifications.length > 0 ? (
              <TouchableOpacity onPress={handleClearAll}>
                <ThemedText style={styles.clearAllButton}>Clear All</ThemedText>
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>
            {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up!'}
          </ThemedText>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <ThemedText style={styles.markAllButton}>Mark All Read</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyIcon}>🔔</ThemedText>
              <ThemedText style={styles.emptyTitle}>No Notifications</ThemedText>
              <ThemedText style={styles.emptyText}>
                You're all caught up! We'll notify you about shopping reminders, low stock, and more.
              </ThemedText>
            </View>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification.id, notification.listId)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))
          )}
        </ScrollView>
      </View>
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
        onClose={() => setCustomAlertVisible(false)}
      />
    </>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainBackground
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderBottomColor,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    markAllButton: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '600',
    },
    clearAllButton: {
      color: '#FF3B30',
      fontSize: 14,
      fontWeight: '600',
      marginRight: 8,
    },
    scrollView: {
      flex: 1,
    },
    notificationCard: {
      backgroundColor: colors.background,
      marginHorizontal: 16,
      marginVertical: 6,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 7,
      borderColor: colors.borderColor,
      borderWidth: 0.7
    },
    unreadCard: {
      backgroundColor: colors.mainBackground,
      borderLeftWidth: 4,
      borderLeftColor: '#007AFF',
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    notificationIcon: {
      fontSize: 28,
      marginRight: 12,
    },
    notificationTextContainer: {
      flex: 1,
    },
    listName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
      color: '#000',
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    notificationMessage: {
      fontSize: 14,
      color: colors.exposedGhost,
      marginBottom: 6,
      lineHeight: 20,
    },
    notificationTime: {
      fontSize: 12,
      color: colors.exposedGhost,
    },
    dateContainer: {
      marginTop: 4,
      marginBottom: 4,
    },
    scheduledDate: {
      fontSize: 13,
      fontWeight: '600',
      color: '#007AFF',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#007AFF',
      marginLeft: 8,
    },
    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },
    deleteButtonText: {
      fontSize: 24,
      color: '#999',
      fontWeight: '300',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      marginTop: 64,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: colors.exposedGhost,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}