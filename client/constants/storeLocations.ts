// constants/storeLocations.ts

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  phone?: string;
  categories: string[];
  averagePrice: 'Low' | 'Medium' | 'High';
  icon: string;
}

/**
 * Store locations in Batangas Province
 * Covers major cities: Batangas City, Lipa, Tanauan, Calaca, etc.
 */
export const STORE_LOCATIONS: StoreLocation[] = [
  // ========== TANAUAN CITY ==========
  {
    id: 'tanauan-public-market',
    name: 'Tanauan City Public Market',
    address: 'JP Laurel Highway, Poblacion, Tanauan City',
    latitude: 14.0855,
    longitude: 121.1489,
    hours: '4:00 AM - 6:00 PM',
    phone: '(043) 778-2345',
    categories: ['Fresh Produce', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Dry Goods'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'sambat-public-market',
    name: 'Sambat Public Market',
    address: 'Barangay Sambat, Tanauan City',
    latitude: 14.0892,
    longitude: 121.1456,
    hours: '5:00 AM - 5:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Fruits', 'Fish', 'Local Products'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  
  // ========== SANTO TOMAS ==========
  {
    id: 'sto-tomas-public-market',
    name: 'Santo Tomas Public Market',
    address: 'National Highway, Poblacion, Santo Tomas, Batangas',
    latitude: 14.1078,
    longitude: 121.1416,
    hours: '4:00 AM - 6:00 PM',
    phone: '(043) 756-3456',
    categories: ['Fresh Produce', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Poultry'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'san-felix-market',
    name: 'San Felix Public Market',
    address: 'Barangay San Felix, Santo Tomas, Batangas',
    latitude: 14.1125,
    longitude: 121.1389,
    hours: '5:00 AM - 5:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Fruits', 'Local Delicacies'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== MALVAR ==========
  {
    id: 'malvar-public-market',
    name: 'Malvar Public Market',
    address: 'Poblacion, Malvar, Batangas',
    latitude: 14.0445,
    longitude: 121.1568,
    hours: '4:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Meat', 'Fish', 'Vegetables', 'Fruits'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== LIPA CITY ==========
  {
    id: 'lipa-public-market',
    name: 'Lipa City Public Market',
    address: 'CM Recto Avenue, Poblacion, Lipa City',
    latitude: 13.9411,
    longitude: 121.1636,
    hours: '4:00 AM - 7:00 PM',
    phone: '(043) 756-1234',
    categories: ['Fresh Produce', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Dry Goods', 'Local Delicacies'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'marawoy-market',
    name: 'Marawoy Public Market',
    address: 'Barangay Marawoy, Lipa City',
    latitude: 13.9429,
    longitude: 121.1615,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Fruits', 'Fish'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== BATANGAS CITY ==========
  {
    id: 'batangas-grand-terminal',
    name: 'Batangas Grand Terminal Market',
    address: 'P. Burgos Street, Poblacion, Batangas City',
    latitude: 13.7565,
    longitude: 121.0584,
    hours: '4:00 AM - 7:00 PM',
    phone: '(043) 723-4567',
    categories: ['Fresh Produce', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Dry Goods', 'Household'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'pallocan-market',
    name: 'Pallocan Public Market',
    address: 'Pallocan West, Batangas City',
    latitude: 13.7543,
    longitude: 121.0598,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Meat', 'Fish'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'libjo-market',
    name: 'Libjo Public Market',
    address: 'Barangay Libjo, Batangas City',
    latitude: 13.7389,
    longitude: 121.0421,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Fish', 'Vegetables', 'Fruits'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== BAUAN ==========
  {
    id: 'bauan-public-market',
    name: 'Bauan Public Market',
    address: 'Poblacion, Bauan, Batangas',
    latitude: 13.7920,
    longitude: 121.0094,
    hours: '4:00 AM - 6:00 PM',
    phone: '(043) 727-6789',
    categories: ['Fresh Produce', 'Fish', 'Meat', 'Vegetables', 'Fruits', 'Seafood'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== SAN JUAN (LAIYA) ==========
  {
    id: 'san-juan-public-market',
    name: 'San Juan Public Market',
    address: 'Poblacion, San Juan, Batangas',
    latitude: 13.8294,
    longitude: 121.3982,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Fish', 'Seafood', 'Vegetables', 'Fruits'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== ROSARIO ==========
  {
    id: 'rosario-public-market',
    name: 'Rosario Public Market',
    address: 'National Highway, Poblacion, Rosario, Batangas',
    latitude: 13.8456,
    longitude: 121.2056,
    hours: '4:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Meat', 'Fish', 'Vegetables', 'Fruits'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== TALISAY ==========
  {
    id: 'talisay-public-market',
    name: 'Talisay Public Market',
    address: 'Poblacion, Talisay, Batangas',
    latitude: 14.1056,
    longitude: 120.9225,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Fish', 'Vegetables', 'Fruits', 'Local Products'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== TAAL ==========
  {
    id: 'taal-heritage-market',
    name: 'Taal Heritage Public Market',
    address: 'P. Torres Street, Poblacion, Taal, Batangas',
    latitude: 13.8819,
    longitude: 120.9238,
    hours: '4:00 AM - 6:00 PM',
    phone: '(043) 740-9988',
    categories: ['Fresh Produce', 'Fish', 'Meat', 'Vegetables', 'Local Delicacies', 'Tapa'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== LEMERY ==========
  {
    id: 'lemery-public-market',
    name: 'Lemery Public Market',
    address: 'Poblacion, Lemery, Batangas',
    latitude: 13.9173,
    longitude: 120.8932,
    hours: '4:00 AM - 6:00 PM',
    phone: '(043) 411-2345',
    categories: ['Fresh Produce', 'Fish', 'Meat', 'Vegetables', 'Fruits'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== CALACA ==========
  {
    id: 'calaca-public-market',
    name: 'Calaca Public Market',
    address: 'Poblacion, Calaca, Batangas',
    latitude: 13.9352,
    longitude: 120.8085,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Fish', 'Vegetables', 'Fruits', 'Meat'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== CUENCA ==========
  {
    id: 'cuenca-public-market',
    name: 'Cuenca Public Market',
    address: 'Poblacion, Cuenca, Batangas',
    latitude: 13.9076,
    longitude: 121.0524,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Fruits', 'Meat', 'Coffee Beans'],
    averagePrice: 'Low',
    icon: '🏪',
  },

  // ========== IBAAN ==========
  {
    id: 'ibaan-public-market',
    name: 'Ibaan Public Market',
    address: 'Poblacion, Ibaan, Batangas',
    latitude: 13.8215,
    longitude: 121.1341,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Fruits', 'Fish', 'Meat'],
    averagePrice: 'Low',
    icon: '🏪',
  },
];

/**
 * Get store by name (matches your product data)
 */
export function getStoreByName(storeName: string): StoreLocation | undefined {
  const normalized = storeName.toLowerCase().trim();
  
  return STORE_LOCATIONS.find(store => 
    store.name.toLowerCase().includes(normalized) ||
    normalized.includes(store.name.toLowerCase().split(' ')[0]) ||
    normalized.includes(store.name.toLowerCase().split('-')[0])
  );
}

/**
 * Get stores that sell specific categories
 */
export function getStoresByCategory(category: string): StoreLocation[] {
  return STORE_LOCATIONS.filter(store =>
    store.categories.some(cat => 
      cat.toLowerCase().includes(category.toLowerCase())
    )
  );
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get nearest stores to a location
 */
export function getNearestStores(
  userLat: number,
  userLon: number,
  limit: number = 5
): (StoreLocation & { distance: number })[] {
  return STORE_LOCATIONS.map(store => ({
    ...store,
    distance: calculateDistance(userLat, userLon, store.latitude, store.longitude),
  }))
  .sort((a, b) => a.distance - b.distance)
  .slice(0, limit);
}

/**
 * Group products by their stores
 */
export interface ProductsByStore {
  store: StoreLocation;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    units: string;
    productUnit?: string;
  }>;
  totalPrice: number;
  productCount: number;
}

export function groupProductsByStore(
  products: Array<{
    id: string;
    name: string;
    selectedStore: string;
    selectedPrice: number;
    quantity: number;
    units: string;
    productUnit?: string;
  }>
): ProductsByStore[] {
  const storeMap = new Map<string, ProductsByStore>();

  products.forEach(product => {
    const store = getStoreByName(product.selectedStore);
    
    if (store) {
      if (!storeMap.has(store.id)) {
        storeMap.set(store.id, {
          store,
          products: [],
          totalPrice: 0,
          productCount: 0,
        });
      }

      const storeData = storeMap.get(store.id)!;
      storeData.products.push({
        id: product.id,
        name: product.name,
        price: product.selectedPrice,
        quantity: product.quantity,
        units: product.units,
        productUnit: product.productUnit,
      });
      storeData.totalPrice += product.selectedPrice * product.quantity;
      storeData.productCount++;
    }
  });

  return Array.from(storeMap.values()).sort((a, b) => b.totalPrice - a.totalPrice);
}

/**
 * Open directions in maps app
 */
export function openDirections(store: StoreLocation, fromLat?: number, fromLon?: number) {
  const destination = `${store.latitude},${store.longitude}`;
  const origin = fromLat && fromLon ? `${fromLat},${fromLon}` : '';
  
  // iOS
  const appleMapsUrl = `maps://maps.apple.com/?daddr=${destination}&saddr=${origin}`;
  
  // Android/Web
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin ? `&origin=${origin}` : ''}`;
  
  return {
    apple: appleMapsUrl,
    google: googleMapsUrl,
  };
}

/**
 * Optimize route for multiple stores (simple greedy algorithm)
 */
export function optimizeRoute(
  stores: StoreLocation[],
  startLat: number,
  startLon: number
): StoreLocation[] {
  if (stores.length <= 1) return stores;

  const optimized: StoreLocation[] = [];
  const remaining = [...stores];
  let currentLat = startLat;
  let currentLon = startLon;

  while (remaining.length > 0) {
    // Find nearest store
    let nearestIndex = 0;
    let shortestDistance = Infinity;

    remaining.forEach((store, index) => {
      const distance = calculateDistance(
        currentLat,
        currentLon,
        store.latitude,
        store.longitude
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = index;
      }
    });

    // Add nearest store to optimized route
    const nearestStore = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nearestStore);
    currentLat = nearestStore.latitude;
    currentLon = nearestStore.longitude;
  }

  return optimized;
}

/**
 * Get stores by city/municipality
 */
export function getStoresByCity(city: string): StoreLocation[] {
  return STORE_LOCATIONS.filter(store =>
    store.address.toLowerCase().includes(city.toLowerCase())
  );
}

/**
 * Get cities with stores
 */
export function getCitiesWithStores(): string[] {
  const cities = new Set<string>();
  STORE_LOCATIONS.forEach(store => {
    const cityMatch = store.address.match(/,\s*([^,]+),\s*Batangas/);
    if (cityMatch) {
      cities.add(cityMatch[1]);
    }
  });
  return Array.from(cities).sort();
}