// app/(index)/list/[listId]/shopping-guide.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, Alert } from 'react-native';
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
  index
}: { 
  storeData: ProductsByStoreWithDistance;
  onShopAtStore: (storeData: ProductsByStoreWithDistance, index: number) => void;
  index: number;
}) {
  const { store, products, totalPrice, productCount } = storeData;

  return (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.stopBadge}>
          <Text style={styles.stopText}>Stop {index + 1}</Text>
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeIcon}>{store.icon}</Text>
          <View style={styles.storeDetails}>
            <ThemedText style={styles.storeName}>{store.name}</ThemedText>
            <Text style={styles.storeAddress}>{store.address}</Text>
            <Text style={styles.storeHours}>⏰ {store.hours}</Text>
            {store.distance !== undefined && (
              <Text style={styles.storeDistance}>📍 {store.distance.toFixed(1)} km away</Text>
            )}
          </View>
        </View>
      </View>

      {/* Products at this store */}
      <View style={styles.productsSection}>
        <ThemedText style={styles.sectionTitle}>
          {productCount} {productCount === 1 ? 'item' : 'items'} • ₱{totalPrice.toFixed(2)}
        </ThemedText>
        
        {products.map((product, idx) => (
          <View key={idx} style={styles.productRow}>
            <Text style={styles.productName}>• {product.name}</Text>
            <Text style={styles.productPrice}>
              ₱{product.price.toFixed(2)} × {product.quantity}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.shopHereButton}>
        <Button
          onPress={() => onShopAtStore(storeData, index)}
          style={styles.selectStoreBtn}
        >
          <IconSymbol name="location.fill" size={18} color="#007AFF" />
          <Text style={styles.selectStoreText}>View on Map</Text>
        </Button>
      </View>
    </View>
  );
}

export default function ShoppingGuideScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };
  const { user } = useUser();
  
  const productIds = useShoppingListProductIds(listId);
  const addInventoryItems = useAddInventoryItemsCallback();
  
  // ✅ FIXED: Get store directly instead of calling hooks in a loop
  const store = useShoppingListStore(listId);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeGroups, setStoreGroups] = useState<ProductsByStoreWithDistance[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [optimizedStores, setOptimizedStores] = useState<StoreLocation[]>([]);

  console.log("🗺️ SHOPPING GUIDE SCREEN LOADED");

  // ✅ FIXED: Use useMemo to get products data from store directly
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
          Alert.alert('Permission Denied', 'Location permission is needed to show nearby stores on the map');
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
      
      console.log("🪧 Grouped into", groups.length, "stores");

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

    // Show alert with store information
    Alert.alert(
      `Shop at ${storeData.store.name}`,
      `${storeData.store.address}\n\n${storeData.productCount} items • ₱${storeData.totalPrice.toFixed(2)}\n\nThe map will now focus on this store.`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (process.env.EXPO_OS === 'ios') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  // Get the currently selected store for the map
  const selectedStore = storeGroups[selectedStoreIndex];
  const currentStoreForMap = selectedStore ? [selectedStore.store] : [];

  const totalCost = storeGroups.reduce((sum, group) => sum + group.totalPrice, 0);
  const totalItems = productsData.length;

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
            <View style={styles.mapHeader}>
              <ThemedText style={styles.mapHeaderText}>
                📍 Store {selectedStoreIndex + 1} of {storeGroups.length}
              </ThemedText>
            </View>
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
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Current Store:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {selectedStore?.store.name || 'None'}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Items at this store:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {selectedStore?.productCount || 0}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Cost at this store:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ₱{selectedStore?.totalPrice.toFixed(2) || '0.00'}
            </ThemedText>
          </View>
        </View>

        {/* Store List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
              <ThemedText style={styles.instructionText}>
                📍 Tap a store card to view it on the map
              </ThemedText>
              {storeGroups.map((storeData, index) => (
                <View 
                  key={storeData.store.id}
                  style={[
                    styles.storeCardWrapper,
                    selectedStoreIndex === index && styles.selectedStoreWrapper
                  ]}
                >
                  <StoreCard
                    storeData={storeData}
                    onShopAtStore={(data) => handleShopAtStore(data, index)}
                    index={index}
                  />
                </View>
              ))}
            </>
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
  mapContainer: {
    height: 250,
    width: '100%',
  },
  mapHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: '#007AFF',
  },
  summaryHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
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
    color: '#666',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  storeCardWrapper: {
    marginBottom: 16,
  },
  selectedStoreWrapper: {
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 4,
  },
  stopBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stopText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    marginBottom: 16,
  },
  storeInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  storeIcon: {
    fontSize: 32,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  storeHours: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  storeDistance: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  productsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 14,
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  shopHereButton: {
    marginTop: 8,
  },
  selectStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  selectStoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
  },
});