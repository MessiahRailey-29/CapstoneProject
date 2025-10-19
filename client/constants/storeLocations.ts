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
  // ========== BATANGAS CITY ==========
  {
    id: 'sm-batangas',
    name: 'SM City Batangas',
    address: 'Pastor Village, Pallocan West, Batangas City',
    latitude: 13.7565,
    longitude: 121.0583,
    hours: '10:00 AM - 9:00 PM',
    phone: '(043) 300-3000',
    categories: ['Groceries', 'Fresh Produce', 'Meat', 'Dairy', 'Beverages', 'Household'],
    averagePrice: 'Medium',
    icon: '🏬',
  },
  {
    id: 'puregold-batangas',
    name: 'Puregold - Batangas City',
    address: 'Kumintang Ibaba, Batangas City',
    latitude: 13.7543,
    longitude: 121.0526,
    hours: '8:00 AM - 10:00 PM',
    phone: '(043) 723-5678',
    categories: ['Groceries', 'Fresh Produce', 'Household', 'Snacks'],
    averagePrice: 'Low',
    icon: '🛒',
  },
  {
    id: 'robinsons-batangas',
    name: "Robinson's Place Batangas",
    address: 'Kumintang Ilaya, Batangas City',
    latitude: 13.7598,
    longitude: 121.0551,
    hours: '10:00 AM - 9:00 PM',
    phone: '(043) 300-5000',
    categories: ['Groceries', 'Fresh Produce', 'Premium Items', 'Dairy'],
    averagePrice: 'High',
    icon: '🏪',
  },
  {
    id: 'metro-batangas',
    name: 'Metro Gaisano Batangas',
    address: 'D. Silang Street, Batangas City',
    latitude: 13.7565,
    longitude: 121.0583,
    hours: '9:00 AM - 9:00 PM',
    phone: '(043) 740-1234',
    categories: ['Groceries', 'Household', 'Fresh Produce'],
    averagePrice: 'Medium',
    icon: '🏬',
  },
  {
    id: 'palengke-batangas',
    name: 'Batangas City Public Market',
    address: 'P. Burgos Street, Batangas City',
    latitude: 13.7565,
    longitude: 121.0584,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Meat', 'Vegetables', 'Fruits', 'Fish'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'baycity-mall-batangas',
    name: 'Bay City Mall',
    address: 'Diversion Road, Alangilan, Batangas City',
    latitude: 13.7739,
    longitude: 121.0732,
    hours: '9:00 AM - 9:00 PM',
    categories: ['Groceries', 'Retail', 'Household'],
    averagePrice: 'Medium',
    icon: '🏬',
  },
  {
    id: 'caedo-center-batangas',
    name: 'Caedo Commercial Center',
    address: 'Kumintang Ilaya, Batangas City',
    latitude: 13.7605,
    longitude: 121.0580,
    hours: '9:00 AM - 8:00 PM',
    categories: ['Groceries', 'Retail', 'Appliances'],
    averagePrice: 'Medium',
    icon: '🏬',
  },
  {
    id: 'nuciti-batangas',
    name: 'Nuciti Central Mall',
    address: 'JP Laurel Highway, Batangas City',
    latitude: 13.7560,
    longitude: 121.0570,
    hours: '10:00 AM - 9:00 PM',
    categories: ['Groceries', 'Household', 'Retail'],
    averagePrice: 'Medium',
    icon: '🏬',
  },

  // ========== LIPA CITY ==========
  {
    id: 'sm-lipa',
    name: 'SM City Lipa',
    address: 'Marawoy, Lipa City',
    latitude: 13.9409,
    longitude: 121.1636,
    hours: '10:00 AM - 9:00 PM',
    phone: '(043) 756-6000',
    categories: ['Groceries', 'Fresh Produce', 'Meat', 'Dairy', 'Beverages'],
    averagePrice: 'Medium',
    icon: '🏬',
  },
  {
    id: 'robinsons-lipa',
    name: "Robinson's Place Lipa",
    address: 'JP Laurel Highway, Lipa City',
    latitude: 13.9411,
    longitude: 121.1626,
    hours: '10:00 AM - 9:00 PM',
    phone: '(043) 756-7000',
    categories: ['Groceries', 'Fresh Produce', 'Premium Items'],
    averagePrice: 'High',
    icon: '🏪',
  },
  {
    id: 'puregold-lipa',
    name: 'Puregold Lipa',
    address: 'CM Recto Avenue, Lipa City',
    latitude: 13.9398,
    longitude: 121.1643,
    hours: '8:00 AM - 10:00 PM',
    phone: '(043) 756-8888',
    categories: ['Groceries', 'Fresh Produce', 'Household'],
    averagePrice: 'Low',
    icon: '🛒',
  },
  {
    id: 'waltermart-lipa',
    name: 'WalterMart Lipa',
    address: 'Ayala Highway, Lipa City',
    latitude: 13.9444,
    longitude: 121.1620,
    hours: '9:00 AM - 9:00 PM',
    phone: '(043) 740-5555',
    categories: ['Groceries', 'Household', 'Fresh Produce'],
    averagePrice: 'Medium',
    icon: '🏬',
  },

  // ========== TANAUAN CITY ==========
  {
    id: 'puregold-tanauan',
    name: 'Puregold Tanauan',
    address: 'JP Laurel Highway, Tanauan City',
    latitude: 14.0855,
    longitude: 121.1503,
    hours: '8:00 AM - 10:00 PM',
    phone: '(043) 778-1234',
    categories: ['Groceries', 'Fresh Produce', 'Household'],
    averagePrice: 'Low',
    icon: '🛒',
  },
  {
    id: 'citi-mall-tanauan',
    name: 'Citi Mall Tanauan',
    address: 'Pagaspas, Tanauan City',
    latitude: 14.0864,
    longitude: 121.1489,
    hours: '10:00 AM - 9:00 PM',
    phone: '(043) 778-5678',
    categories: ['Groceries', 'Household', 'Fresh Produce'],
    averagePrice: 'Medium',
    icon: '🏬',
  },

  // ========== STO. TOMAS ==========
  {
    id: 'waltermart-sto-tomas',
    name: 'WalterMart Santo Tomas',
    address: 'National Highway, Santo Tomas, Batangas',
    latitude: 14.1078,
    longitude: 121.1416,
    hours: '9:00 AM - 9:00 PM',
    phone: '(043) 778-9999',
    categories: ['Groceries', 'Household', 'Fresh Produce'],
    averagePrice: 'Medium',
    icon: '🏬',
  },

  // ========== CALACA ==========
  {
    id: 'puregold-calaca',
    name: 'Puregold Calaca',
    address: 'Barangay Poblacion, Calaca, Batangas',
    latitude: 13.9352,
    longitude: 120.8085,
    hours: '8:00 AM - 10:00 PM',
    phone: '(043) 727-1234',
    categories: ['Groceries', 'Fresh Produce', 'Household'],
    averagePrice: 'Low',
    icon: '🛒',
  },

  // ========== BALAYAN ==========
  {
    id: 'savemore-balayan',
    name: 'SaveMore Balayan',
    address: 'Poblacion, Balayan, Batangas',
    latitude: 13.9384,
    longitude: 120.7327,
    hours: '8:00 AM - 9:00 PM',
    phone: '(043) 727-5555',
    categories: ['Groceries', 'Household', 'Fresh Produce'],
    averagePrice: 'Low',
    icon: '🛒',
  },

  // ========== LEMERY ==========
  {
    id: 'puregold-lemery',
    name: 'Puregold Lemery',
    address: 'Poblacion, Lemery, Batangas',
    latitude: 13.9173,
    longitude: 120.8932,
    hours: '8:00 AM - 10:00 PM',
    phone: '(043) 411-1234',
    categories: ['Groceries', 'Fresh Produce', 'Household'],
    averagePrice: 'Low',
    icon: '🛒',
  },

  // ========== TAAL ==========
  {
    id: 'taal-public-market',
    name: 'Taal Public Market',
    address: 'P. Torres Street, Poblacion, Taal, Batangas',
    latitude: 13.8819,
    longitude: 120.9238,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Fish', 'Meat', 'Vegetables', 'Local Delicacies'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'savemore-taal',
    name: 'SaveMore Taal',
    address: 'Barangay Bihis, Taal, Batangas',
    latitude: 13.8825,
    longitude: 120.9261,
    hours: '8:00 AM - 9:00 PM',
    phone: '(043) 740-9876',
    categories: ['Groceries', 'Fresh Produce', 'Household'],
    averagePrice: 'Low',
    icon: '🛒',
  },

  // ========== MABINI ==========
  {
    id: 'mabini-public-market',
    name: 'Mabini Public Market',
    address: 'Barangay Poblacion, Mabini, Batangas',
    latitude: 13.7524,
    longitude: 120.9081,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Fish', 'Vegetables', 'Fruits', 'Meat'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'savemore-mabini',
    name: 'SaveMore Mabini',
    address: 'National Road, Barangay Anilao, Mabini, Batangas',
    latitude: 13.7489,
    longitude: 120.9084,
    hours: '8:00 AM - 9:00 PM',
    phone: '(043) 740-2222',
    categories: ['Groceries', 'Household', 'Fresh Produce'],
    averagePrice: 'Low',
    icon: '🛒',
  },

  // ========== AGONCILLO ==========
  {
    id: 'agoncillo-public-market',
    name: 'Agoncillo Public Market',
    address: 'Poblacion, Agoncillo, Batangas',
    latitude: 13.9298,
    longitude: 120.9415,
    hours: '5:00 AM - 6:00 PM',
    categories: ['Fresh Produce', 'Vegetables', 'Fish', 'Fruits', 'Meat'],
    averagePrice: 'Low',
    icon: '🏪',
  },
  {
    id: 'savemore-agoncillo',
    name: 'SaveMore Agoncillo',
    address: 'Barangay Pansipit, Agoncillo, Batangas',
    latitude: 13.9321,
    longitude: 120.9438,
    hours: '8:00 AM - 9:00 PM',
    phone: '(043) 726-4567',
    categories: ['Groceries', 'Fresh Produce', 'Household'],
    averagePrice: 'Low',
    icon: '🛒',
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