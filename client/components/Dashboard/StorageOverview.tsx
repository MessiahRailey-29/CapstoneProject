// components/Dashboard/StorageOverview.tsx
import React from 'react';
import { StyleSheet, View, Pressable, Text, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface StorageOverviewProps {
  storageCounts: {
    Refrigerator: number;
    Freezer: number;
    Pantry: number;
    Other: number;
  };
}

const STORAGE_CONFIG = [
  { name: 'Refrigerator', icon: '❄️', color: '#4ECDC4', description: 'Fresh foods' },
  { name: 'Freezer', icon: '🧊', color: '#4A90E2', description: 'Frozen items' },
  { name: 'Pantry', icon: '📦', color: '#F4A460', description: 'Dry goods' },
  { name: 'Other', icon: '📍', color: '#95A5A6', description: 'Miscellaneous' },
];

export function StorageOverview({ storageCounts }: StorageOverviewProps) {
  const router = useRouter();
  const totalItems = Object.values(storageCounts).reduce((sum, count) => sum + count, 0);

  // Color scheme and styles
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  const handleStoragePress = (storageName: string) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(index)/(tabs)/inventory');
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#3183eeff', '#4376b9', '#639eebff', colors.background, '#4376b9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Storage Overview</ThemedText>
        <ThemedText style={styles.totalItems}>{totalItems} items</ThemedText>
      </View>

      <View style={styles.storageGrid}>
        {STORAGE_CONFIG.map((storage) => {
          const count = storageCounts[storage.name as keyof typeof storageCounts] || 0;

          return (
            <Pressable
              key={storage.name}
              onPress={() => handleStoragePress(storage.name)}
              style={[styles.storageCard, { borderLeftColor: storage.color }]}
            >
              <View style={styles.storageHeader}>
                <Text style={styles.storageIcon}>{storage.icon}</Text>
                <View style={[styles.countBadge, { backgroundColor: storage.color }]}>
                  <ThemedText style={styles.countText}>{count}</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.storageName}>{storage.name}</ThemedText>
              <ThemedText style={styles.storageDescription}>
                {storage.description}
              </ThemedText>

              {count > 0 && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(count / totalItems) * 100}%`,
                        backgroundColor: storage.color
                      }
                    ]}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
    },
    totalItems: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '600',
    },
    storageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    storageCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.background,
      borderColor: colors.borderColor,
      borderWidth: 0.5,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 4,
    },
    storageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    storageIcon: {
      fontSize: 28,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 32,
      alignItems: 'center',
    },
    countText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
    storageName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    storageDescription: {
      fontSize: 12,
      color: '#999',
      marginBottom: 8,
    },
    progressBar: {
      height: 4,
      backgroundColor: '#E5E5EA',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
  });
}