// components/DatabaseProductItem.tsx
import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DatabaseProduct } from '@/services/productsApi';

// Category configuration
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  'Beverages': { icon: '🥤', color: '#FF6B6B' },
  'Dairy': { icon: '🥛', color: '#4ECDC4' },
  'Instant Noodles': { icon: '🍜', color: '#FFE66D' },
  'Canned Goods': { icon: '🥫', color: '#95E1D3' },
  'Coffee': { icon: '☕', color: '#A8763E' },
  'Fruits': { icon: '🍎', color: '#FFA07A' },
  'Vegetables': { icon: '🥬', color: '#90EE90' },
  'Meat': { icon: '🥩', color: '#FF6347' },
  'Bread': { icon: '🍞', color: '#F4A460' },
  'Household': { icon: '🧼', color: '#87CEEB' },
  'Snacks': { icon: '🍿', color: '#DDA0DD' },
  'Other': { icon: '📦', color: '#C0C0C0' },
};

interface DatabaseProductItemProps {
  product: DatabaseProduct;
  onPress: (product: DatabaseProduct) => void;
  viewMode?: 'list' | 'grid';
}

export default function DatabaseProductItem({ 
  product, 
  onPress,
  viewMode = 'list'
}: DatabaseProductItemProps) {
  const categoryInfo = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG['Other'];

  if (viewMode === 'grid') {
    return (
      <Pressable
        onPress={() => onPress(product)}
        style={({ pressed }) => [
          styles.gridContainer,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.gridContent}>
          {/* Category Icon */}
          <View style={[styles.gridIcon, { backgroundColor: categoryInfo.color + '20' }]}>
            <Text style={styles.gridIconText}>{categoryInfo.icon}</Text>
          </View>

          {/* Product Info */}
          <ThemedText 
            style={styles.gridName} 
            numberOfLines={2}
          >
            {product.name}
          </ThemedText>

          {/* Category Badge */}
          <View style={[styles.gridCategoryBadge, { backgroundColor: categoryInfo.color }]}>
            <Text style={styles.gridCategoryText}>{product.category}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // List view (default)
  return (
    <Pressable
      onPress={() => onPress(product)}
      style={({ pressed }) => [
        styles.listContainer,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.listContent}>
        {/* Category Icon */}
        <View style={[styles.listIcon, { backgroundColor: categoryInfo.color + '20' }]}>
          <Text style={styles.listIconText}>{categoryInfo.icon}</Text>
        </View>

        {/* Product Info */}
        <View style={styles.listInfo}>
          <ThemedText style={styles.listName} numberOfLines={2}>
            {product.name}
          </ThemedText>
          <View style={styles.listCategoryContainer}>
            <View style={[styles.listCategoryBadge, { backgroundColor: categoryInfo.color }]}>
              <Text style={styles.listCategoryText}>{product.category}</Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // List View Styles
  listContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  listIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconText: {
    fontSize: 28,
  },
  listInfo: {
    flex: 1,
    gap: 6,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
  },
  listCategoryContainer: {
    flexDirection: 'row',
  },
  listCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  arrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    color: '#C0C0C0',
    fontWeight: '300',
  },

  // Grid View Styles
  gridContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 6,
  },
  gridContent: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  gridIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconText: {
    fontSize: 32,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 36,
  },
  gridCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Shared
  pressed: {
    opacity: 0.7,
  },
});