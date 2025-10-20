// app/(index)/notification-screen.tsx
import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Button,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@clerk/clerk-expo';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const userId = useMemo(() => user?.id || '', [user?.id]);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications,
  } = useNotifications(userId);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

const handleNotificationPress = async (notificationId: string, data: any) => {
  await markAsRead(notificationId);

  if (data?.listId && typeof data.listId === 'string') {
    router.push(`/(index)/list/${data.listId}`);
  } else {
    console.log('No listId in notification data:', data);
  }
};

  const handleClearAll = () => {
    Alert.alert(
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
        {/* Header Stats */}
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
              <TouchableOpacity
                key={notification._id}
                style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
                onPress={() => handleNotificationPress(notification._id, notification.data)}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <ThemedText style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </ThemedText>
                    <View style={styles.notificationTextContainer}>
                      <ThemedText style={styles.notificationTitle}>
                        {notification.title}
                      </ThemedText>
                      <ThemedText style={styles.notificationMessage}>
                        {notification.message}
                      </ThemedText>
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
                    deleteNotification(notification._id);
                  }}
                >
                  <ThemedText style={styles.deleteButtonText}>×</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f8ff',
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
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
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
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  settingsButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});