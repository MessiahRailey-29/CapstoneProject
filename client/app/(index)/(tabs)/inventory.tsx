// app/(home)/(tabs)/inventory.tsx - Updated with swipe-to-delete
import React, { useState, useRef } from "react";
import { StyleSheet, View, FlatList, Text, Pressable, ScrollView, Animated, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { 
  useInventoryItemIdsByStorage, 
  useInventoryItemCell, 
  useDelInventoryItemCallback,
  useInventoryStorageCounts,
  StorageLocation 
} from "@/stores/InventoryStore";
import { getStorageDisplayInfo } from "@/utils/storageMapping";
import { IconSymbol } from "@/components/ui/IconSymbol";
import * as Haptics from "expo-haptics";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const STORAGE_LOCATIONS = getStorageDisplayInfo();

function InventoryItem({ itemId, storage }: { itemId: string; storage: StorageLocation }) {
  const [name] = useInventoryItemCell(itemId, "name");
  const [quantity] = useInventoryItemCell(itemId, "quantity");
  const [units] = useInventoryItemCell(itemId, "units");
  const [category] = useInventoryItemCell(itemId, "category");
  const [selectedStore] = useInventoryItemCell(itemId, "selectedStore");
  const [selectedPrice] = useInventoryItemCell(itemId, "selectedPrice");
  const [purchasedAt] = useInventoryItemCell(itemId, "purchasedAt");
  const [storageLocation, setStorageLocation] = useInventoryItemCell(itemId, "storageLocation");
  const deleteItem = useDelInventoryItemCallback(itemId);

  const swipeableRef = useRef<Swipeable>(null);

  const formattedDate = new Date(purchasedAt as string).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${name}" from your inventory?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            deleteItem();
            console.log('🗑️ Deleted inventory item:', itemId);
          },
        },
      ]
    );
  };

  const handleChangeStorage = (newStorage: StorageLocation) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStorageLocation(newStorage);
  };

  // Render right actions (delete button)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
          <Pressable
            style={styles.deleteButtonSwipe}
            onPress={handleDelete}
          >
            <IconSymbol name="trash" size={24} color="#FFFFFF" />
            <ThemedText style={styles.deleteText}>Delete</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              <ThemedText style={styles.itemName}>{name}</ThemedText>
              {/* Storage Badge */}
              <View style={styles.storageBadgeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {STORAGE_LOCATIONS.map((loc) => (
                    <Pressable
                      key={loc.name}
                      onPress={() => handleChangeStorage(loc.name)}
                      style={[
                        styles.storageBadge,
                        storageLocation === loc.name && {
                          backgroundColor: loc.color,
                        },
                      ]}
                    >
                      <Text style={styles.storageBadgeIcon}>{loc.icon}</Text>
                      {storageLocation === loc.name && (
                        <Text style={styles.storageBadgeText}>{loc.name}</Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
          
          <View style={styles.itemDetails}>
            <Text style={styles.itemDetailText}>
              {quantity} {units}
            </Text>
            {category ? (
              <Text style={styles.itemDetailText}> • {category}</Text>
            ) : null}
          </View>

          {selectedStore ? (
            <Text style={styles.itemStore}>
              From: {selectedStore}
              {selectedPrice ? ` - ₱${selectedPrice.toFixed(2)}` : ''}
            </Text>
          ) : null}

          <Text style={styles.itemDate}>Purchased: {formattedDate}</Text>
        </View>
      </View>
    </Swipeable>
  );
}

export default function InventoryScreen() {
  const [selectedStorage, setSelectedStorage] = useState<StorageLocation>("Refrigerator");
  const itemIds = useInventoryItemIdsByStorage(selectedStorage);
  const storageCounts = useInventoryStorageCounts();

  const totalItems = Object.values(storageCounts).reduce((sum, count) => sum + count, 0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Storage Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {STORAGE_LOCATIONS.map((storage) => {
              const count = storageCounts[storage.name];
              const isActive = selectedStorage === storage.name;
              
              return (
                <Pressable
                  key={storage.name}
                  onPress={() => {
                    if (process.env.EXPO_OS === "ios") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedStorage(storage.name);
                  }}
                  style={[
                    styles.tab,
                    isActive && { 
                      backgroundColor: storage.color,
                      borderColor: storage.color,
                    },
                  ]}
                >
                  <Text style={[
                    styles.tabIcon,
                    isActive && styles.tabIconActive
                  ]}>
                    {storage.icon}
                  </Text>
                  <ThemedText style={[
                    styles.tabText,
                    isActive && styles.tabTextActive
                  ]}>
                    {storage.name}
                  </ThemedText>
                  <View style={[
                    styles.badge,
                    isActive && styles.badgeActive
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      isActive && styles.badgeTextActive
                    ]}>
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Items List */}
        {totalItems === 0 ? (
          <BodyScrollView
            contentContainerStyle={styles.emptyContainer}
          >
            <Text style={styles.emptyIcon}>🛒</Text>
            <ThemedText style={styles.emptyTitle}>No items yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Items you purchase from your shopping lists will appear here
            </ThemedText>
          </BodyScrollView>
        ) : itemIds.length === 0 ? (
          <BodyScrollView
            contentContainerStyle={styles.emptyContainer}
          >
            <Text style={styles.emptyIcon}>
              {STORAGE_LOCATIONS.find(s => s.name === selectedStorage)?.icon}
            </Text>
            <ThemedText style={styles.emptyTitle}>
              No items in {selectedStorage}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Items will appear here when you add them to this storage location
            </ThemedText>
          </BodyScrollView>
        ) : (
          <FlatList
            data={itemIds}
            renderItem={({ item: itemId }) => (
              <InventoryItem itemId={itemId} storage={selectedStorage} />
            )}
            keyExtractor={(itemId) => itemId}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  badgeTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    gap: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemHeaderLeft: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
  },
  storageBadgeContainer: {
    maxWidth: '100%',
  },
  storageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 6,
    gap: 4,
  },
  storageBadgeIcon: {
    fontSize: 14,
  },
  storageBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDetailText: {
    fontSize: 14,
    color: "#666",
  },
  itemStore: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  itemDate: {
    fontSize: 12,
    color: "#999",
  },
  // Swipe action styles
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteButtonSwipe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});