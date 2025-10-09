// utils/storageMapping.ts

export type StorageLocation = "Refrigerator" | "Freezer" | "Pantry" | "Other";

export interface StorageRule {
  storage: StorageLocation;
  shelfLife?: string; // Optional: "3-5 days", "1 week", etc.
  temperature?: string; // Optional: "2-4°C", "Below 0°C", etc.
}

/**
 * Comprehensive mapping of product categories to storage locations
 * Based on food safety guidelines and best practices
 */
export const CATEGORY_STORAGE_MAP: Record<string, StorageRule> = {
  // === REFRIGERATOR (Fresh, perishable items) ===
  'Meat': {
    storage: 'Refrigerator',
    shelfLife: '1-2 days',
    temperature: '2-4°C',
  },
  'Poultry': {
    storage: 'Refrigerator',
    shelfLife: '1-2 days',
    temperature: '2-4°C',
  },
  'Fish': {
    storage: 'Refrigerator',
    shelfLife: '1-2 days',
    temperature: '2-4°C',
  },
  'Seafood': {
    storage: 'Refrigerator',
    shelfLife: '1-2 days',
    temperature: '2-4°C',
  },
  'Dairy': {
    storage: 'Refrigerator',
    shelfLife: '5-7 days',
    temperature: '2-4°C',
  },
  'Eggs': {
    storage: 'Refrigerator',
    shelfLife: '3-5 weeks',
    temperature: '2-4°C',
  },
  'Vegetables': {
    storage: 'Refrigerator',
    shelfLife: '3-7 days',
    temperature: '4-7°C',
  },
  'Fruits': {
    storage: 'Refrigerator',
    shelfLife: '3-7 days',
    temperature: '4-7°C',
  },
  'Fresh Herbs': {
    storage: 'Refrigerator',
    shelfLife: '3-5 days',
    temperature: '2-4°C',
  },
  'Deli Meats': {
    storage: 'Refrigerator',
    shelfLife: '3-5 days',
    temperature: '2-4°C',
  },
  'Cheese': {
    storage: 'Refrigerator',
    shelfLife: '1-4 weeks',
    temperature: '2-4°C',
  },
  'Tofu': {
    storage: 'Refrigerator',
    shelfLife: '3-5 days',
    temperature: '2-4°C',
  },
  'Prepared Foods': {
    storage: 'Refrigerator',
    shelfLife: '3-4 days',
    temperature: '2-4°C',
  },
  'Leftovers': {
    storage: 'Refrigerator',
    shelfLife: '3-4 days',
    temperature: '2-4°C',
  },

  // === FREEZER (Long-term storage) ===
  'Frozen Foods': {
    storage: 'Freezer',
    shelfLife: '3-12 months',
    temperature: 'Below -18°C',
  },
  'Ice Cream': {
    storage: 'Freezer',
    shelfLife: '2-3 months',
    temperature: 'Below -18°C',
  },
  'Frozen Meat': {
    storage: 'Freezer',
    shelfLife: '6-12 months',
    temperature: 'Below -18°C',
  },
  'Frozen Vegetables': {
    storage: 'Freezer',
    shelfLife: '8-12 months',
    temperature: 'Below -18°C',
  },
  'Frozen Fruits': {
    storage: 'Freezer',
    shelfLife: '8-12 months',
    temperature: 'Below -18°C',
  },
  'Frozen Seafood': {
    storage: 'Freezer',
    shelfLife: '3-6 months',
    temperature: 'Below -18°C',
  },

  // === PANTRY (Dry, shelf-stable items) ===
  'Beverages': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Canned Goods': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Instant Noodles': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Pasta': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Rice': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Grains': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Bread': {
    storage: 'Pantry',
    shelfLife: '5-7 days',
    temperature: 'Room temperature',
  },
  'Baking Supplies': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Spices': {
    storage: 'Pantry',
    shelfLife: '1-3 years',
    temperature: 'Room temperature',
  },
  'Condiments': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Sauces': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Oils': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Snacks': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Coffee': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Tea': {
    storage: 'Pantry',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Cereal': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Nuts': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },
  'Dried Fruits': {
    storage: 'Pantry',
    shelfLife: '6-12 months',
    temperature: 'Room temperature',
  },

  // === OTHER (Non-food items) ===
  'Household': {
    storage: 'Other',
    shelfLife: 'Varies',
    temperature: 'Room temperature',
  },
  'Cleaning Supplies': {
    storage: 'Other',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Personal Care': {
    storage: 'Other',
    shelfLife: '1-2 years',
    temperature: 'Room temperature',
  },
  'Pet Supplies': {
    storage: 'Other',
    shelfLife: 'Varies',
    temperature: 'Room temperature',
  },
  'Paper Products': {
    storage: 'Other',
    shelfLife: 'Indefinite',
    temperature: 'Room temperature',
  },
};

/**
 * Get storage location for a product based on its category
 */
export function getStorageForCategory(category: string): StorageLocation {
  const rule = CATEGORY_STORAGE_MAP[category];
  
  if (rule) {
    return rule.storage;
  }
  
  // Fallback: Try to match partial category names
  const categoryLower = category.toLowerCase();
  
  // Check for common keywords
  if (categoryLower.includes('meat') || 
      categoryLower.includes('fish') || 
      categoryLower.includes('chicken') ||
      categoryLower.includes('pork') ||
      categoryLower.includes('beef')) {
    return 'Refrigerator';
  }
  
  if (categoryLower.includes('frozen')) {
    return 'Freezer';
  }
  
  if (categoryLower.includes('fresh') || 
      categoryLower.includes('dairy') ||
      categoryLower.includes('vegetable') ||
      categoryLower.includes('fruit')) {
    return 'Refrigerator';
  }
  
  if (categoryLower.includes('household') || 
      categoryLower.includes('cleaning') ||
      categoryLower.includes('paper')) {
    return 'Other';
  }
  
  // Default to Pantry for food items
  return 'Pantry';
}

/**
 * Get storage rule details for a category
 */
export function getStorageRule(category: string): StorageRule {
  return CATEGORY_STORAGE_MAP[category] || {
    storage: 'Pantry',
    shelfLife: 'Check label',
    temperature: 'Room temperature',
  };
}

/**
 * Get icon for storage location
 */
export function getStorageIcon(storage: StorageLocation): string {
  const icons: Record<StorageLocation, string> = {
    'Refrigerator': '❄️',
    'Freezer': '🧊',
    'Pantry': '📦',
    'Other': '📍',
  };
  return icons[storage];
}

/**
 * Get color for storage location
 */
export function getStorageColor(storage: StorageLocation): string {
  const colors: Record<StorageLocation, string> = {
    'Refrigerator': '#4ECDC4',
    'Freezer': '#4A90E2',
    'Pantry': '#F4A460',
    'Other': '#95A5A6',
  };
  return colors[storage];
}

/**
 * Get all available storage locations
 */
export const ALL_STORAGE_LOCATIONS: StorageLocation[] = [
  'Refrigerator',
  'Freezer',
  'Pantry',
  'Other',
];

/**
 * Get storage location display info
 */
export interface StorageDisplayInfo {
  name: StorageLocation;
  icon: string;
  color: string;
  description: string;
}

export function getStorageDisplayInfo(): StorageDisplayInfo[] {
  return [
    { 
      name: 'Refrigerator', 
      icon: '❄️', 
      color: '#4ECDC4', 
      description: 'Fresh perishables' 
    },
    { 
      name: 'Freezer', 
      icon: '🧊', 
      color: '#4A90E2', 
      description: 'Frozen items' 
    },
    { 
      name: 'Pantry', 
      icon: '📦', 
      color: '#F4A460', 
      description: 'Shelf-stable goods' 
    },
    { 
      name: 'Other', 
      icon: '📍', 
      color: '#95A5A6', 
      description: 'Non-food items' 
    },
  ];
}