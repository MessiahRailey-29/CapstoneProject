// components/NotificationBell.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
// ✅ CHANGED: Use TinyBase hook instead of REST API hook
import { useNotificationsFromStore } from '@/hooks/useNotificationsFromStore';
import { Colors } from '@/constants/Colors';

import { ViewStyle } from 'react-native';

interface NotificationBellProps {
  style?: ViewStyle;
}

export function NotificationBell({ style }: NotificationBellProps) {
  const router = useRouter();
  const { user } = useUser();

  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const userId = useMemo(() => user?.id || '', [user?.id]);
  // ✅ CHANGED: Now using TinyBase store for real-time updates
  const { unreadCount } = useNotificationsFromStore(userId);

  const handlePress = () => {
    router.push('/(index)/notification-screen');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {/* Bell Icon - Simple SVG-like drawing */}
        <View style={[styles.bellIcon, { transform: [{ rotate: '-180deg' }] }]}>
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

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      padding: 8,
      marginTop: 5,
      marginRight: 16
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
      width: 5,
      height: 4,
      backgroundColor: colors.tabBarActiveBorderColorHome,
      borderRadius: 8,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 10,
    },
    bellBody: {
      width: 20,
      height: 19,
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      borderColor: colors.tabBarActiveBorderColorHome,
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
      backgroundColor: colors.tabBarActiveBorderColorHome,
      borderRadius: 3,
      position: 'absolute',
      bottom: 0,
      left: 9.4,
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
}