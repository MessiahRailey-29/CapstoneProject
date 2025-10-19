// components/NotificationBell.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationBell() {
  const router = useRouter();
  const { user } = useUser();

  const userId = useMemo(() => user?.id || '', [user?.id]);
  const { unreadCount } = useNotifications(userId);

  const handlePress = () => {
    router.push('/(index)/notification-screen');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Bell Icon - Simple SVG-like drawing */}
        <View style={styles.bellIcon}>
          <View style={styles.bellTop} />
          <View style={styles.bellBody} />
          <View style={styles.bellClapper} />
        </View>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  bellIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  bellTop: {
    width: 4,
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 10,
  },
  bellBody: {
    width: 20,
    height: 18,
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: '#007AFF',
    borderRadius: 10,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    position: 'absolute',
    top: 3,
    left: 2,
  },
  bellClapper: {
    width: 6,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
    left: 9,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});