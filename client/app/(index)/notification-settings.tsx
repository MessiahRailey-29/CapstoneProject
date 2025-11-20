// app/(index)/notification-settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNotifications } from '@/hooks/useNotifications';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function NotificationSettingsScreen() {

  const insets = useSafeAreaInsets();

  // color scheme for styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors, insets);

  const { user } = useUser();
  const { getToken } = useAuth();
  const { settings, updateSettings, expoPushToken, loading } = useNotifications(user?.id || '', getToken);


  const hasInitialized = useRef(false);

  const [localSettings, setLocalSettings] = useState({
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
      daysOfWeek: [] as number[],
    },
    lowStockThreshold: {
      daysAfterLastPurchase: 14,
    },
  });

  // Update local settings only once when server settings first load
  useEffect(() => {
    if (settings && !hasInitialized.current) {
      console.log('📥 Initializing settings from server');
      setLocalSettings({
        enabled: settings.enabled ?? true,
        preferences: {
          shoppingReminders: settings.preferences?.shoppingReminders ?? true,
          lowStockAlerts: settings.preferences?.lowStockAlerts ?? true,
          duplicateWarnings: settings.preferences?.duplicateWarnings ?? true,
          priceDrops: settings.preferences?.priceDrops ?? true,
          sharedListUpdates: settings.preferences?.sharedListUpdates ?? true,
        },
        reminderTiming: {
          hoursBefore: settings.reminderTiming?.hoursBefore ?? 2,
          daysOfWeek: settings.reminderTiming?.daysOfWeek ?? [],
        },
        lowStockThreshold: {
          daysAfterLastPurchase: settings.lowStockThreshold?.daysAfterLastPurchase ?? 14,
        },
      });
      hasInitialized.current = true;
      console.log('✅ Settings initialized');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!settings]); // Only re-run when settings goes from null to loaded

  const handleMasterToggle = async () => {
    const newValue = !localSettings.enabled;

    console.log('Toggle master:', newValue);

    // Update local state immediately for responsive UI
    setLocalSettings(prev => ({ ...prev, enabled: newValue }));

    // Update server
    try {
      await updateSettings({ enabled: newValue });
      console.log('✅ Master toggle updated on server');
    } catch (error) {
      console.error('❌ Error updating master toggle:', error);
      // Revert on error
      setLocalSettings(prev => ({ ...prev, enabled: !newValue }));
    }
  };

  const handlePreferenceToggle = async (key: string) => {
    console.log('Toggle preference:', key);

    const newPreferences = {
      ...localSettings.preferences,
      [key]: !localSettings.preferences[key as keyof typeof localSettings.preferences],
    };

    // Update local state immediately
    setLocalSettings(prev => ({ ...prev, preferences: newPreferences }));

    // Update server
    try {
      await updateSettings({ preferences: newPreferences });
      console.log('✅ Preference updated on server:', key);
    } catch (error) {
      console.error('❌ Error updating preference:', error);
      // Revert on error
      setLocalSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: !newPreferences[key as keyof typeof newPreferences],
        },
      }));
    }
  };

  const handleHoursChange = async (direction: 'increase' | 'decrease') => {
    const currentHours = localSettings.reminderTiming.hoursBefore;
    let newHours = currentHours;

    if (direction === 'increase' && currentHours < 24) {
      newHours = currentHours + 1;
    } else if (direction === 'decrease' && currentHours > 0) {
      newHours = currentHours - 1;
    }

    if (newHours !== currentHours) {
      const newReminderTiming = { ...localSettings.reminderTiming, hoursBefore: newHours };
      setLocalSettings(prev => ({ ...prev, reminderTiming: newReminderTiming }));
      await updateSettings({ reminderTiming: newReminderTiming });
    }
  };

  const handleDaysChange = async (direction: 'increase' | 'decrease') => {
    const currentDays = localSettings.lowStockThreshold.daysAfterLastPurchase;
    let newDays = currentDays;

    if (direction === 'increase' && currentDays < 90) {
      newDays = currentDays + 7;
    } else if (direction === 'decrease' && currentDays > 7) {
      newDays = currentDays - 7;
    }

    if (newDays !== currentDays) {
      const newThreshold = { daysAfterLastPurchase: newDays };
      setLocalSettings(prev => ({ ...prev, lowStockThreshold: newThreshold }));
      await updateSettings({ lowStockThreshold: newThreshold });
    }
  };

  const handleDayOfWeekToggle = async (day: number) => {
    const currentDays = localSettings.reminderTiming.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();

    const newReminderTiming = { ...localSettings.reminderTiming, daysOfWeek: newDays };
    setLocalSettings(prev => ({ ...prev, reminderTiming: newReminderTiming }));
    await updateSettings({ reminderTiming: newReminderTiming });
  };

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  if (loading && !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Notification Settings',
          presentation: 'modal',
        }}
      />

      <ScrollView style={[styles.container, {}]}>
        {/* Master Toggle */}
        <View style={styles.section}>
          <View style={styles.masterToggle}>
            <View style={styles.masterTextContainer}>
              <ThemedText style={styles.masterTitle}>Enable Notifications</ThemedText>
              <ThemedText style={styles.masterSubtitle}>
                Receive all notification types
              </ThemedText>
            </View>
            <Switch
              value={localSettings.enabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: '#d1d1d6', true: '#34C759' }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d1d6"
            />
          </View>
        </View>

        {/* Push Token Info */}
        {expoPushToken && (
          <View style={styles.infoBox}>
            <ThemedText style={styles.infoText}>
              ✅ Push notifications are enabled on this device
            </ThemedText>
          </View>
        )}

        {/* Notification Types */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notification Types</ThemedText>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>🛒 Shopping Reminders</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Get notified before your scheduled shopping trips
              </ThemedText>
            </View>
            <Switch
              value={localSettings.preferences.shoppingReminders}
              onValueChange={() => handlePreferenceToggle('shoppingReminders')}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#d1d1d6', true: '#34C759' }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d1d6"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>📦 Low Stock Alerts</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Remind you when items might be running low
              </ThemedText>
            </View>
            <Switch
              value={localSettings.preferences.lowStockAlerts}
              onValueChange={() => handlePreferenceToggle('lowStockAlerts')}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#d1d1d6', true: '#34C759' }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d1d6"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>⚠️ Duplicate Warnings</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Alert when adding items already in your list
              </ThemedText>
            </View>
            <Switch
              value={localSettings.preferences.duplicateWarnings}
              onValueChange={() => handlePreferenceToggle('duplicateWarnings')}
              disabled={!localSettings.enabled}
              trackColor={{ false: '#d1d1d6', true: '#34C759' }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d1d6"
            />
          </View>
        </View>

        {/* Reminder Timing */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Reminder Timing</ThemedText>

          <View style={styles.valueRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Hours Before Shopping</ThemedText>
              <ThemedText style={styles.settingDescription}>
                How early to remind you before scheduled shopping
              </ThemedText>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  localSettings.reminderTiming.hoursBefore <= 0 && styles.stepperButtonDisabled,
                ]}
                onPress={() => handleHoursChange('decrease')}
                disabled={localSettings.reminderTiming.hoursBefore <= 0}
              >
                <ThemedText style={styles.stepperButtonText}>−</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.stepperValue}>
                {localSettings.reminderTiming.hoursBefore}h
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  localSettings.reminderTiming.hoursBefore >= 24 && styles.stepperButtonDisabled,
                ]}
                onPress={() => handleHoursChange('increase')}
                disabled={localSettings.reminderTiming.hoursBefore >= 24}
              >
                <ThemedText style={styles.stepperButtonText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Low Stock Threshold */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Low Stock Settings</ThemedText>

          <View style={styles.valueRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Days After Last Purchase</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Remind after this many days since last buying an item
              </ThemedText>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  localSettings.lowStockThreshold.daysAfterLastPurchase <= 7 &&
                  styles.stepperButtonDisabled,
                ]}
                onPress={() => handleDaysChange('decrease')}
                disabled={localSettings.lowStockThreshold.daysAfterLastPurchase <= 7}
              >
                <ThemedText style={styles.stepperButtonText}>−</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.stepperValue}>
                {localSettings.lowStockThreshold.daysAfterLastPurchase}d
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  localSettings.lowStockThreshold.daysAfterLastPurchase >= 90 &&
                  styles.stepperButtonDisabled,
                ]}
                onPress={() => handleDaysChange('increase')}
                disabled={localSettings.lowStockThreshold.daysAfterLastPurchase >= 90}
              >
                <ThemedText style={styles.stepperButtonText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>About Notifications</ThemedText>
          <ThemedText style={styles.infoDescription}>
            • Shopping reminders help you prepare for your trips{'\n'}
            • Low stock alerts track purchase patterns{'\n'}
            • Duplicate warnings prevent buying items twice{'\n'}
            • Price drops notify you of savings{'\n'}
            • Shared list updates keep everyone in sync
          </ThemedText>
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(colors: typeof Colors.light, insets) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.mainBackground,
      flex: 1,
      paddingBottom: insets.bottom + 130
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 16,
      borderBottomColor: colors.borderBottomColor,
      borderBottomWidth: 1,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.exposedGhost,
    },
    section: {
      backgroundColor: colors.background,
      marginBottom: 16,
      paddingVertical: 16,
    },
    masterToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    masterTextContainer: {
      flex: 1,
      marginRight: 12,
    },
    masterTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    masterSubtitle: {
      fontSize: 14,
      color: colors.exposedGhost,
    },
    infoBox: {
      backgroundColor: '#e8f5e9',
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#34C759',
    },
    infoText: {
      fontSize: 14,
      color: '#2e7d32',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.exposedGhost,
      lineHeight: 18,
    },
    valueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    stepperButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: colors.borderColor,
    },
    stepperButtonDisabled: {
      opacity: 0.3,
    },
    stepperButtonText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#007AFF',
    },
    stepperValue: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: 12,
      minWidth: 40,
      textAlign: 'center',
    },
    daysContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    dayButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 22,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    dayButtonActive: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    dayButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
    },
    dayButtonTextActive: {
      color: '#fff',
    },
    infoSection: {
      backgroundColor: colors.background,
      padding: 16,
      marginBottom: 32,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    infoDescription: {
      fontSize: 14,
      color: colors.exposedGhost,
      lineHeight: 22,
    },
  });
}