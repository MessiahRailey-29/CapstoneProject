// app/(home)/(tabs)/inventory.tsx - Fixed version
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

// Storage configuration with enhanced visuals
const STORAGE_CONFIG = [
  { 
    name: 'Refrigerator' as StorageLocation, 
    icon: '❄️', 
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#44A08D'],
    description: 'Fresh foods, dairy & beverages',
    illustration: '🥛🥗🧃'
  },
  { 
    name: 'Freezer' as StorageLocation, 
    icon: '🧊', 
    color: '#4A90E2',
    gradient: ['#4A90E2', '#357ABD'],
    description: 'Frozen meals, ice cream & meats',
    illustration: '🍦🥩🍕'
  },
  { 
    name: 'Pantry' as StorageLocation, 
    icon: '📦', 
    color: '#F4A460',
    gradient: ['#F4A460', '#CD853F'],
    description: 'Dry goods, canned items & snacks',
    illustration: '🍝🥫🍪'
  },
  { 
    name: 'Other' as StorageLocation, 
    icon: '📍', 
    color: '#95A5A6',
    gradient: ['#95A5A6', '#7F8C8D'],
    description: 'Miscellaneous items',
    illustration: '🧴🧻🧽'
  },
];

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

function StorageCategoryCard({ 
  storage, 
  count, 
  totalItems,
  onPress 
}: { 
  storage: typeof STORAGE_CONFIG[0]; 
  count: number;
  totalItems: number;
  onPress: () => void;
}) {
  const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;

  return (
    <Pressable 
      style={[styles.categoryCard, { borderLeftColor: storage.color }]}
      onPress={onPress}
      android_ripple={{ color: storage.color + '20' }}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconContainer}>
          <Text style={styles.categoryIcon}>{storage.icon}</Text>
          <Text style={styles.categoryIllustration}>{storage.illustration}</Text>
        </View>
        
        <View style={[styles.categoryCountBadge, { backgroundColor: storage.color }]}>
          <Text style={styles.categoryCountText}>{count}</Text>
        </View>
      </View>

      <View style={styles.categoryInfo}>
        <ThemedText style={styles.categoryName}>{storage.name}</ThemedText>
        <ThemedText style={styles.categoryDescription}>{storage.description}</ThemedText>
      </View>

      {count > 0 && (
        <View style={styles.categoryProgressContainer}>
          <View style={styles.categoryProgressBar}>
            <View 
              style={[
                styles.categoryProgressFill,
                { 
                  width: `${percentage}%`,
                  backgroundColor: storage.color 
                }
              ]}
            />
          </View>
          <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
        </View>
      )}

      <View style={styles.categoryFooter}>
        <Text style={[styles.viewItemsText, { color: storage.color }]}>
          {count > 0 ? `View ${count} item${count !== 1 ? 's' : ''}` : 'Empty'} →
        </Text>
      </View>
    </Pressable>
  );
}

export default function InventoryScreen() {
  const [selectedStorage, setSelectedStorage] = useState<StorageLocation | null>(null);
  
  // ✅ CRITICAL FIX: Always call ALL hooks unconditionally at the top
  const storageCounts = useInventoryStorageCounts();
  
  // Get item IDs for all storages (we'll filter which ones to display)
  const refrigeratorIds = useInventoryItemIdsByStorage('Refrigerator');
  const freezerIds = useInventoryItemIdsByStorage('Freezer');
  const pantryIds = useInventoryItemIdsByStorage('Pantry');
  const otherIds = useInventoryItemIdsByStorage('Other');

  // Select which items to display based on selected storage
  const getItemIds = () => {
    if (!selectedStorage) return [];
    switch (selectedStorage) {
      case 'Refrigerator': return refrigeratorIds;
      case 'Freezer': return freezerIds;
      case 'Pantry': return pantryIds;
      case 'Other': return otherIds;
      default: return [];
    }
  };

  const itemIds = getItemIds();
  const totalItems = Object.values(storageCounts).reduce((sum, count) => sum + count, 0);

  const handleStorageSelect = (storage: StorageLocation) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedStorage(storage);
  };

  const handleBackToCategories = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedStorage(null);
  };

  // Category Overview View
  if (!selectedStorage) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <ThemedText style={styles.headerTitle}>My Inventory</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {totalItems} item{totalItems !== 1 ? 's' : ''} stored
            </ThemedText>
          </View>

          {totalItems === 0 ? (
            <BodyScrollView contentContainerStyle={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <ThemedText style={styles.emptyTitle}>No items yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Items you purchase from your shopping lists will appear here
              </ThemedText>
            </BodyScrollView>
          ) : (
            <ScrollView 
              contentContainerStyle={styles.categoriesContainer}
              showsVerticalScrollIndicator={false}
            >
              {STORAGE_CONFIG.map((storage) => {
                const count = storageCounts[storage.name];
                return (
                  <StorageCategoryCard
                    key={storage.name}
                    storage={storage}
                    count={count}
                    totalItems={totalItems}
                    onPress={() => handleStorageSelect(storage.name)}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
      </GestureHandlerRootView>
    );
  }

  // Items List View
  const currentStorage = STORAGE_CONFIG.find(s => s.name === selectedStorage);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Back Button & Header */}
        <View style={[styles.itemsHeader, { backgroundColor: currentStorage?.color + '15' }]}>
          <Pressable 
            style={styles.backButton}
            onPress={handleBackToCategories}
          >
            <IconSymbol name="chevron.left" size={24} color={currentStorage?.color} />
            <Text style={[styles.backButtonText, { color: currentStorage?.color }]}>
              Back
            </Text>
          </Pressable>

          <View style={styles.itemsHeaderInfo}>
            <Text style={styles.storageHeaderIcon}>{currentStorage?.icon}</Text>
            <View>
              <ThemedText style={styles.itemsHeaderTitle}>{selectedStorage}</ThemedText>
              <ThemedText style={styles.itemsHeaderSubtitle}>
                {itemIds.length} item{itemIds.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Items List */}
        {itemIds.length === 0 ? (
          <BodyScrollView contentContainerStyle={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{currentStorage?.icon}</Text>
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
  headerSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    padding: 16,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 48,
  },
  categoryIllustration: {
    fontSize: 20,
    opacity: 0.6,
  },
  categoryCountBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  categoryInfo: {
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  categoryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  categoryProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewItemsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsHeader: {
    padding: 16,
    paddingTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageHeaderIcon: {
    fontSize: 40,
  },
  itemsHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  itemsHeaderSubtitle: {
    fontSize: 14,
    color: '#666',
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