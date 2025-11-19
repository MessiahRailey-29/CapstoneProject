// app/(home)/(tabs)/inventory.tsx - Fixed version with proper gesture handling
import React, { useState, useRef, useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList, Text, Pressable, ScrollView, Animated, Alert, useColorScheme, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { 
  useInventoryItemIdsByStorage, 
  useInventoryItemCell, 
  useDelInventoryItemCallback,
  useDelAllInventoryItemsCallback,
  useInventoryStorageCounts,
  StorageLocation 
} from "@/stores/InventoryStore";
import { getStorageDisplayInfo } from "@/utils/storageMapping";
import { IconSymbol } from "@/components/ui/IconSymbol";
import * as Haptics from "expo-haptics";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import TextInput from '@/components/ui/text-input';
import { Colors } from '@/constants/Colors'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import CustomAlert from "@/components/ui/CustomAlert";

const STORAGE_LOCATIONS = getStorageDisplayInfo();

// Storage configuration with enhanced visuals
const STORAGE_CONFIG = [
  { 
    name: 'Refrigerator' as StorageLocation, 
    image: require('@/assets/images/refrigerator-icon.png'),
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#44A08D'],
    description: 'Fresh foods, dairy & beverages',
  },
  { 
    name: 'Freezer' as StorageLocation, 
    image: require('@/assets/images/freezer-chest-icon.png'),
    color: '#4A90E2',
    gradient: ['#4A90E2', '#357ABD'],
    description: 'Frozen meals, ice cream & meats',
  },
  { 
    name: 'Pantry' as StorageLocation, 
    image: require('@/assets/images/pantry-drawer-icon.png'),
    color: '#F4A460',
    gradient: ['#F4A460', '#CD853F'],
    description: 'Dry goods, canned items & snacks',
  },
  { 
    name: 'Other' as StorageLocation, 
    image: require('@/assets/images/table-other-icon.png'),
    color: '#95A5A6',
    gradient: ['#95A5A6', '#7F8C8D'],
    description: 'Miscellaneous items',
  },
];

// Hook to filter inventory items by search query
function useFilteredInventoryItems(itemIds: string[], searchQuery: string): string[] {
  return useMemo(() => {
    if (!searchQuery.trim()) return itemIds;
    // We can't filter here without accessing the data, so we'll return all IDs
    // and let the component handle it, but we memoize to prevent unnecessary recalculations
    return itemIds;
  }, [itemIds, searchQuery]);
}

// Wrapper component that checks if item matches search
function SearchableInventoryItem({ 
  itemId, 
  storage, 
  searchQuery,
  showStorage = false 
}: { 
  itemId: string; 
  storage: StorageLocation; 
  searchQuery: string;
  showStorage?: boolean;
}) {
  const [name] = useInventoryItemCell(itemId, "name");
  const [category] = useInventoryItemCell(itemId, "category");
  
  // Memoize the match check to prevent unnecessary re-renders
  const matches = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const itemName = (name as string || '').toLowerCase();
    const itemCategory = (category as string || '').toLowerCase();
    return itemName.includes(query) || itemCategory.includes(query);
  }, [searchQuery, name, category]);
  
  if (!matches) return null;
  
  return <InventoryItem itemId={itemId} storage={storage} showStorage={showStorage} />;
}

// Memoized version to prevent unnecessary re-renders
const MemoizedSearchableInventoryItem = React.memo(SearchableInventoryItem);

function InventoryItem({ itemId, storage, showStorage = false }: { itemId: string; storage: StorageLocation; showStorage?: boolean }) {
  const [name] = useInventoryItemCell(itemId, "name");
  const [quantity] = useInventoryItemCell(itemId, "quantity");
  const [units] = useInventoryItemCell(itemId, "units");
  const [category] = useInventoryItemCell(itemId, "category");
  const [selectedStore] = useInventoryItemCell(itemId, "selectedStore");
  const [selectedPrice] = useInventoryItemCell(itemId, "selectedPrice");
  const [purchasedAt] = useInventoryItemCell(itemId, "purchasedAt");
  const [storageLocation, setStorageLocation] = useInventoryItemCell(itemId, "storageLocation");
  const deleteItem = useDelInventoryItemCallback(itemId);

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

    //color scheme and styles
    const scheme = useColorScheme();
    const colors = Colors[scheme ?? 'light'];
    const styles = useMemo(() => createStyles(colors), [colors]);

  const swipeableRef = useRef<Swipeable>(null);

  const formattedDate = new Date(purchasedAt as string).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = useCallback(() => {
    showCustomAlert(
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
  }, [name, deleteItem, itemId]);

  const handleChangeStorage = useCallback((newStorage: StorageLocation) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStorageLocation(newStorage);
  }, []);

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
                      <Image
                      source={typeof loc.image === 'string' ? { uri: loc.image } : loc.image}
                      style={styles.storageBadgeIcon}/>
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
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable 
      style={[styles.categoryCard, { borderLeftColor: storage.color }]}
      onPress={onPress}
      android_ripple={{ color: storage.color + '20' }}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconNameContainer}>
          <View style={styles.categoryIconWrapper}>
            <Image source={storage.image} style={styles.categoryIconImage} resizeMode="contain" />
            {count > 0 && (
              <View style={[styles.categoryCountBadge, { backgroundColor: storage.color }]}>
                <Text style={styles.categoryCountText}>{count}</Text>
              </View>
            )}
          </View>
          <ThemedText style={styles.categoryName}>{storage.name}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.categoryDescription}>{storage.description}</ThemedText>

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
        <Text style={[styles.viewItemsText, { color: storage.color }]}>{count > 0 ? `View ${count} item${count !== 1 ? 's' : ''}` : 'Empty'}</Text>
      </View>
    </Pressable>
  );
}


export default function InventoryScreen() {
  const [selectedStorage, setSelectedStorage] = useState<StorageLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const deleteAllItems = useDelAllInventoryItemsCallback();
  const insets = useSafeAreaInsets();

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

  // Refs for TextInputs to maintain focus
  const searchInputRef = useRef<any>(null);

    //color scheme and styles
    const scheme = useColorScheme();
    const colors = Colors[scheme ?? 'light'];
    const styles = useMemo(() => createStyles(colors), [colors]);
  
  // Debounce search to prevent re-render on every keystroke
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 150); // 150ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // ✅ CRITICAL FIX: Always call ALL hooks unconditionally at the top
  const storageCounts = useInventoryStorageCounts();
  
  // Get item IDs for all storages
  const refrigeratorIds = useInventoryItemIdsByStorage('Refrigerator');
  const freezerIds = useInventoryItemIdsByStorage('Freezer');
  const pantryIds = useInventoryItemIdsByStorage('Pantry');
  const otherIds = useInventoryItemIdsByStorage('Other');

  // Get all items for global search - memoized to prevent recreation
  const allItemIds = useMemo(
    () => [...refrigeratorIds, ...freezerIds, ...pantryIds, ...otherIds],
    [refrigeratorIds, freezerIds, pantryIds, otherIds]
  );

  // Determine if showing search results (needed for handleDeleteAll)
  const showingSearchResults = searchQuery && !selectedStorage;

  // Select which items to display
  const getItemIds = () => {
    if (searchQuery && !selectedStorage) {
      // Global search - show all items
      return allItemIds;
    }
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

  const handleStorageSelect = useCallback((storage: StorageLocation) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedStorage(storage);
  }, []);

  const handleBackToCategories = useCallback(() => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedStorage(null);
  }, []);

  const handleDeleteAll = useCallback(() => {
    const itemsToDelete = getItemIds();
    
    if (itemsToDelete.length === 0) return;

    const locationText = selectedStorage 
      ? `in ${selectedStorage}` 
      : showingSearchResults 
        ? 'matching your search' 
        : 'in your inventory';

    showCustomAlert(
      "Delete All Items",
      `Are you sure you want to delete all ${itemsToDelete.length} item${itemsToDelete.length !== 1 ? 's' : ''} ${locationText}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteAllItems(itemsToDelete);
            console.log(`🗑️ Deleted ${itemsToDelete.length} items ${locationText}`);
          },
        },
      ]
    );
  }, [getItemIds, selectedStorage, showingSearchResults, deleteAllItems]);

  const currentStorage = STORAGE_CONFIG.find(s => s.name === selectedStorage);

  // Category View with Global Search
  if (!selectedStorage && !showingSearchResults) {
    return (
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <ThemedText style={styles.headerSubtitle}>
              {totalItems} total items stored
            </ThemedText>
          </View>

          {/* Global Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              placeholder="Search all items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
          </View>

          <ScrollView contentContainerStyle={[styles.categoriesContainer,{paddingBottom: insets.bottom + 130}]}>
            {STORAGE_CONFIG.map((storage) => (
              <StorageCategoryCard
                key={storage.name}
                storage={storage}
                count={storageCounts[storage.name] || 0}
                totalItems={totalItems}
                onPress={() => handleStorageSelect(storage.name)}
              />
            ))}
          </ScrollView>
        </View>
    );
  }

  // Global Search Results View
  if (showingSearchResults) {
    return (
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.itemsHeader}>
            <View style={styles.searchHeaderContent}>
              <View>
                <ThemedText style={styles.itemsHeaderTitle}>Search Results</ThemedText>
                <ThemedText style={styles.itemsHeaderSubtitle}>
                  {itemIds.length} item{itemIds.length !== 1 ? 's' : ''} found
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              placeholder="Search all items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
            {itemIds.length > 0 && (
              <Pressable
                onPress={handleDeleteAll}
                style={styles.deleteAllButtonInventory}
              >
                <IconSymbol name="trash" size={16} color="#FF3B30" />
                <Text style={styles.deleteAllButtonTextInventory}>
                  Delete All ({itemIds.length})
                </Text>
              </Pressable>
            )}
          </View>

          {/* Search Results */}
          <FlatList
            key={`global-search-${!!debouncedSearch}`}
            data={itemIds}
            extraData={debouncedSearch}
            removeClippedSubviews={false}
            renderItem={({ item: itemId }) => (
              <MemoizedSearchableInventoryItem 
                itemId={itemId} 
                storage={'Other' as StorageLocation}
                searchQuery={debouncedSearch}
                showStorage={true}
              />
            )}
            keyExtractor={(itemId) => itemId}
            contentContainerStyle={[itemIds.length === 0 ? styles.emptyContainer : styles.listContent, {paddingBottom: insets.bottom + 130}]}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            ListEmptyComponent={() => (
              <View style={styles.emptyStateInner}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <ThemedText style={styles.emptyTitle}>No items found</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Try a different search term
                </ThemedText>
              </View>
            )}
          />
        </View>
    );
  }

  // Items List View (When storage selected)
  return (
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.itemsHeader}>
          <Pressable 
            onPress={handleBackToCategories}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <View style={styles.itemsHeaderInfo}>
            <Image source={currentStorage?.image} style={{ width: 70, height: 70, borderRadius: 8 }} resizeMode="contain" />
            <View>
              <ThemedText style={styles.itemsHeaderTitle}>
                {selectedStorage}
              </ThemedText>
              <ThemedText style={styles.itemsHeaderSubtitle}>
                {itemIds.length} item{itemIds.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Search Bar within storage */}
        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            placeholder={`Search in ${selectedStorage}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
          {itemIds.length > 0 && (
            <Pressable
              onPress={handleDeleteAll}
              style={styles.deleteAllButtonInventory}
            >
              <IconSymbol name="trash" size={16} color="#FF3B30" />
              <Text style={styles.deleteAllButtonTextInventory}>
                Delete All ({itemIds.length})
              </Text>
            </Pressable>
          )}
        </View>

        {/* Items List */}
        <FlatList
          key={`storage-search-${selectedStorage}-${!!debouncedSearch}`}
          data={itemIds}
          extraData={debouncedSearch}
          removeClippedSubviews={false}
          renderItem={({ item: itemId }) => (
            <MemoizedSearchableInventoryItem 
              itemId={itemId} 
              storage={selectedStorage} 
              searchQuery={debouncedSearch}
              showStorage={false}
            />
          )}
          keyExtractor={(itemId) => itemId}
          contentContainerStyle={itemIds.length === 0 ? styles.emptyContainer : styles.listContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          ListEmptyComponent={() => {
            if (searchQuery) {
              return (
                <View style={styles.emptyStateInner}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <ThemedText style={styles.emptyTitle}>No items found</ThemedText>
                  <ThemedText style={styles.emptySubtitle}>
                    Try a different search term
                  </ThemedText>
                </View>
              );
            }
            return (
              <View style={styles.emptyStateInner}>
                <Image 
                source={currentStorage?.image} 
                style={{ width: 80, height: 80, marginBottom: 16 }} 
                resizeMode="contain" 
                />
                <ThemedText style={styles.emptyTitle}>
                  No items in {selectedStorage}
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Items will appear here when you add them to this storage location
                </ThemedText>
              </View>
            );
          }}
        />
        <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
        onClose={() => setCustomAlertVisible(false)}
      />
      </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainBackground,
  },
  headerSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  searchInput: {
    marginBottom: 0,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 13,
  },
  searchHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    padding: 16,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    borderColor: colors.borderColor,
    borderWidth: 1,
    shadowColor: colors.shadowColor,
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
    marginBottom: 5,
  },
  categoryIconNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconWrapper: {
    position: 'relative',
  },
  categoryIconImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  categoryCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
categoryCountText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 12,
},
categoryName: {
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 40,
},

  categoryInfo: {
    marginBottom: 16,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.exposedGhost,
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
    color: colors.exposedGhost,
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
    color: colors.text
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
    lineHeight: 39
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
    paddingBottom: 175
  },
  emptyStateInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 39
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  itemContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: colors.borderColor,
    borderWidth: 1,
    shadowColor: colors.shadowColor,
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
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  storageBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
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
  deleteAllButtonInventory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 8,
  },
  deleteAllButtonTextInventory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
}