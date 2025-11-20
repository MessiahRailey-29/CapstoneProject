// app/(index)/list/[listId]/shopping-guide.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, Alert, useColorScheme } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Button from '@/components/ui/button';
import StoreMapView from '@/components/StoreMapView';
import { 
  useShoppingListProductIds, 
  useShoppingListStore
} from '@/stores/ShoppingListStore';
import { 
  groupProductsByStore, 
  optimizeRoute,
  StoreLocation,
  ProductsByStore,
  calculateDistance
} from '@/constants/storeLocations';
import { useAddInventoryItemsCallback } from '@/stores/InventoryStore';
import { useUser } from '@clerk/clerk-expo';
import CustomAlert from '@/components/ui/CustomAlert';
import { Colors } from '@/constants/Colors';

// Extended type with distance
interface StoreWithDistance extends StoreLocation {
  distance?: number;
}

interface ProductsByStoreWithDistance extends Omit<ProductsByStore, 'store'> {
  store: StoreWithDistance;
}

function StoreCard({ 
  storeData, 
  onShopAtStore,
  index,
  isSelected
}: { 
  storeData: ProductsByStoreWithDistance;
  onShopAtStore: (storeData: ProductsByStoreWithDistance, index: number) => void;
  index: number;
  isSelected: boolean;
}) {
  const { store, products, totalPrice, productCount } = storeData;
    // color scheme + styles
    const scheme = useColorScheme();
    const colors = Colors[scheme ?? "light"];
    const styles = createStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.storeCard,
        isSelected && styles.storeCardSelected,
        pressed && styles.storeCardPressed,
      ]}
      onPress={() => onShopAtStore(storeData, index)}
    >
      {/* Stop Badge */}
      <View style={[styles.stopBadge, isSelected && styles.stopBadgeSelected]}>
        <Text style={[styles.stopText, isSelected && styles.stopTextSelected]}>Stop {index + 1}</Text>
      </View>

      {/* Store Header */}
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeIcon}>{store.icon}</Text>
          <View style={styles.storeDetails}>
            <ThemedText style={styles.storeName}>{store.name}</ThemedText>
            <View style={styles.storeMetaRow}>
              <IconSymbol name="location.fill" size={12} color="#666" />
              <Text style={styles.storeAddress}>{store.address}</Text>
            </View>
            <View style={styles.storeMetaRow}>
              <IconSymbol name="clock.fill" size={12} color="#007AFF" />
              <Text style={styles.storeHours}>{store.hours}</Text>
            </View>
            {store.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <IconSymbol name="map.fill" size={12} color="#34C759" />
                <Text style={styles.storeDistance}>{store.distance.toFixed(1)} km away</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
        <View style={styles.productsSummary}>
          <View style={styles.summaryBadge}>
            <IconSymbol name="cart.fill" size={14} color="#007AFF" />
            <Text style={styles.summaryBadgeText}>
              {productCount} {productCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₱{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.productsList}>
          {products.slice(0, 3).map((product, idx) => (
            <View key={idx} style={styles.productRow}>
              <View style={styles.productDot} />
              <Text style={styles.productName} numberOfLines={1}>
                {product.name} {product.productUnit && `(${product.productUnit})`}
              </Text>
              <Text style={styles.productPrice}>
                ₱{product.price.toFixed(2)} × {product.quantity}
              </Text>
            </View>
          ))}
          {products.length > 3 && (
            <Text style={styles.moreProducts}>
              +{products.length - 3} more {products.length - 3 === 1 ? 'item' : 'items'}
            </Text>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionButton}>
        <IconSymbol name="map.fill" size={16} color="#007AFF" />
        <Text style={styles.actionButtonText}>
          {isSelected ? 'Viewing on Map' : 'View on Map'}
        </Text>
        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#34C759" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function ShoppingGuideScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };
  const { user } = useUser();
  
  const productIds = useShoppingListProductIds(listId);
  const addInventoryItems = useAddInventoryItemsCallback();
  
  const store = useShoppingListStore(listId);

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

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeGroups, setStoreGroups] = useState<ProductsByStoreWithDistance[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [optimizedStores, setOptimizedStores] = useState<StoreLocation[]>([]);

  console.log("🗺️ SHOPPING GUIDE SCREEN LOADED");

  const productsData = useMemo(() => {
    if (!store || !productIds || productIds.length === 0) {
      return [];
    }

    return productIds.map(productId => {
      const product = store.getRow("products", productId);

      return {
        id: productId,
        name: (product?.name as string) || '',
        quantity: (product?.quantity as number) || 0,
        units: (product?.units as string) || '',
        category: (product?.category as string) || '',
        selectedStore: (product?.selectedStore as string) || '',
        selectedPrice: (product?.selectedPrice as number) || 0,
        databaseProductId: (product?.databaseProductId as number) || 0,
        productUnit: (product?.units as string) || '',
        notes: (product?.notes as string) || '',
      };
    });
  }, [store, productIds]);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showCustomAlert('Permission Denied', 'Location permission is needed to show nearby stores on the map');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log("📍 User location:", location.coords);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group products by store and calculate distances
  useEffect(() => {
    if (productsData.length > 0) {
      let groups: ProductsByStoreWithDistance[] = groupProductsByStore(productsData).map(group => ({
        ...group,
        store: { ...group.store }
      }));
      
      console.log("🏪 Grouped into", groups.length, "stores");

      // Add distance info if we have user location
      if (userLocation) {
        groups = groups.map(group => ({
          ...group,
          store: {
            ...group.store,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              group.store.latitude,
              group.store.longitude
            )
          }
        }));

        // Optimize route
        const stores = groups.map(g => g.store);
        const optimized = optimizeRoute(stores, userLocation.latitude, userLocation.longitude);
        setOptimizedStores(optimized);
        
        console.log("🗺️ Optimized route for", optimized.length, "stores");

        // Reorder groups by optimized route
        groups = optimized.map(store => 
          groups.find(g => g.store.id === store.id)!
        ).filter(Boolean);
      } else {
        setOptimizedStores(groups.map(g => g.store));
      }

      setStoreGroups(groups);
    }
  }, [productsData.length, userLocation]);

  const handleShopAtStore = (storeData: ProductsByStoreWithDistance, index: number) => {
    console.log("📍 Selected store:", storeData.store.name);

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Update selected store index to show only this store on map
    setSelectedStoreIndex(index);
  };

  // Get the currently selected store for the map
  const selectedStore = storeGroups[selectedStoreIndex];
  const currentStoreForMap = selectedStore ? [selectedStore.store] : [];

  const totalCost = storeGroups.reduce((sum, group) => sum + group.totalPrice, 0);
  const totalItems = productsData.length;
  const totalStores = storeGroups.length;

    // color scheme + styles
    const scheme = useColorScheme();
    const colors = Colors[scheme ?? "light"];
    const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Shopping Guide',
          headerLargeTitle: false,
        }}
      />

      <View style={styles.container}>
        {/* Map View - Shows only selected store */}
        {!loading && currentStoreForMap.length > 0 && (
          <View style={styles.mapContainer}>
            <StoreMapView
              stores={currentStoreForMap}
              userLocation={userLocation}
              onStorePress={(store) => {
                console.log("📍 Tapped on store:", store.name);
              }}
            />
          </View>
        )}

        {/* Summary Header */}
        <View style={styles.summaryHeader}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <IconSymbol name="building.2.fill" size={18} color="#007AFF" />
              <View style={styles.summaryItemContent}>
                <Text style={styles.summaryItemLabel}>Stores</Text>
                <Text style={styles.summaryItemValue}>{totalStores}</Text>
              </View>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <IconSymbol name="cart.fill" size={18} color="#FF9500" />
              <View style={styles.summaryItemContent}>
                <Text style={styles.summaryItemLabel}>Items</Text>
                <Text style={styles.summaryItemValue}>{totalItems}</Text>
              </View>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <IconSymbol name="dollarsign.circle.fill" size={18} color="#34C759" />
              <View style={styles.summaryItemContent}>
                <Text style={styles.summaryItemLabel}>Total</Text>
                <Text style={styles.summaryItemValue}>₱{totalCost.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Store List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading your shopping guide...</ThemedText>
            </View>
          ) : storeGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <ThemedText style={styles.emptyText}>
                No stores found. Make sure products have store information.
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.instructionBanner}>
                <IconSymbol name="hand.tap.fill" size={20} color="#007AFF" />
                <Text style={styles.instructionText}>
                  Tap a store to view it on the map
                </Text>
              </View>
              
              {storeGroups.map((storeData, index) => (
                <StoreCard
                  key={storeData.store.id}
                  storeData={storeData}
                  onShopAtStore={handleShopAtStore}
                  index={index}
                  isSelected={selectedStoreIndex === index}
                />
              ))}
            </>
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
    backgroundColor: colors.mainBackground,
  },
  mapContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapOverlayCard: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  mapOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mapOverlayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  mapOverlayStoreName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  mapOverlayDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapOverlayDistanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  summaryHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryItemContent: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: 11,
    color: colors.ghost,
    fontWeight: '500',
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.ghost,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  instructionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  storeCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  storeCardSelected: {
    borderColor: '#007AFF',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  storeCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  stopBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  stopBadgeSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  stopTextSelected: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stopText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  storeHeader: {
    marginBottom: 16,
  },
  storeInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  storeIcon: {
    fontSize: 40,
    marginTop: 4,
  },
  storeDetails: {
    flex: 1,
    gap: 6,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    color: colors.text
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeAddress: {
    fontSize: 13,
    color: colors.ghost,
    flex: 1,
  },
  storeHours: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  storeDistance: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '700',
  },
  productsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    marginBottom: 12,
  },
  productsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  summaryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  productsList: {
    gap: 6,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  productDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  productName: {
    fontSize: 14,
    flex: 1,
    color: colors.text,
  },
  productPrice: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
  },
  moreProducts: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    fontStyle: 'italic',
    paddingLeft: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '700',
  },
  checkmarkBadge: {
    marginLeft: 4,
  },
});
}