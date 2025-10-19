// app/(home)/(tabs)/product-browser.tsx
import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, Pressable, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import TextInput from '@/components/ui/text-input';
import { useProducts } from '@/hooks/useProducts';
import { DatabaseProduct } from '@/services/productsApi';

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<string, { icon: string; color: string; gradient: string[]; description: string }> = {
  'Beverages': { 
    icon: '🥤', 
    color: '#FF6B6B', 
    gradient: ['#FF6B6B', '#FF8E8E'],
    description: 'Soft drinks, juices & more'
  },
  'Dairy': { 
    icon: '🥛', 
    color: '#4ECDC4', 
    gradient: ['#4ECDC4', '#6FE7DD'],
    description: 'Milk, cheese & dairy products'
  },
  'Instant Noodles': { 
    icon: '🍜', 
    color: '#FFE66D', 
    gradient: ['#FFE66D', '#FFF0A0'],
    description: 'Quick meals & noodles'
  },
  'Canned Goods': { 
    icon: '🥫', 
    color: '#95E1D3', 
    gradient: ['#95E1D3', '#B3EDE3'],
    description: 'Preserved foods & canned items'
  },
  'Coffee': { 
    icon: '☕', 
    color: '#A8763E', 
    gradient: ['#A8763E', '#C69461'],
    description: 'Coffee, tea & hot beverages'
  },
  'Fruits': { 
    icon: '🍎', 
    color: '#FFA07A', 
    gradient: ['#FFA07A', '#FFB89A'],
    description: 'Fresh fruits & produce'
  },
  'Vegetables': { 
    icon: '🥬', 
    color: '#90EE90', 
    gradient: ['#90EE90', '#A8F3A8'],
    description: 'Fresh vegetables & greens'
  },
  'Meat': { 
    icon: '🥩', 
    color: '#FF6347', 
    gradient: ['#FF6347', '#FF8570'],
    description: 'Chicken, pork, beef & more'
  },
  'Bread': { 
    icon: '🍞', 
    color: '#F4A460', 
    gradient: ['#F4A460', '#F7BC84'],
    description: 'Bread, pastries & bakery'
  },
  'Household': { 
    icon: '🧼', 
    color: '#87CEEB', 
    gradient: ['#87CEEB', '#A5DCF0'],
    description: 'Cleaning & home essentials'
  },
  'Snacks': { 
    icon: '🍿', 
    color: '#DDA0DD', 
    gradient: ['#DDA0DD', '#E8BBE8'],
    description: 'Chips, crackers & treats'
  },
  'Other': { 
    icon: '📦', 
    color: '#C0C0C0', 
    gradient: ['#C0C0C0', '#D8D8D8'],
    description: 'Other products & items'
  },
};

interface CategoryData {
  name: string;
  icon: string;
  color: string;
  gradient: string[];
  description: string;
  count: number;
  products: DatabaseProduct[];
}

function CategoryCard({ 
  category, 
  onPress 
}: { 
  category: CategoryData; 
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCard,
        { borderColor: category.color },
        pressed && styles.pressed,
      ]}
    >
      {/* Icon Area with Gradient Background */}
      <View style={[
        styles.iconArea, 
        { backgroundColor: category.gradient[1] + '40' }
      ]}>
        <Text style={styles.categoryIconLarge}>{category.icon}</Text>
        <View style={[styles.countBadge, { backgroundColor: category.color }]}>
          <Text style={styles.countText}>{category.count}</Text>
        </View>
      </View>

      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        
        {/* View Button */}
        <View style={[styles.viewButton, { backgroundColor: category.color }]}>
          <Text style={styles.viewButtonText}>Browse {category.count} item(s)</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProductBrowserScreen() {
  const router = useRouter();
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Group products by category
  const categories = useMemo((): CategoryData[] => {
    const categoryMap = new Map<string, DatabaseProduct[]>();
    
    products.forEach(product => {
      const category = product.category || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(product);
    });

    const allCategories: CategoryData[] = Array.from(categoryMap.entries()).map(([name, prods]) => {
      const config = CATEGORY_CONFIG[name] || CATEGORY_CONFIG['Other'];
      return {
        name,
        icon: config.icon,
        color: config.color,
        gradient: config.gradient,
        description: config.description,
        count: prods.length,
        products: prods,
      };
    });

    return allCategories.sort((a, b) => b.count - a.count);
  }, [products]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.products.some(p => p.name.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const handleCategoryPress = (category: CategoryData) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Navigate to category products view
    router.push({
      pathname: '/category-products',
      params: { 
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
      }
    });
  };

  if (loading) {
    return (
      <BodyScrollView contentContainerStyle={styles.centerContent}>
        <Text style={styles.loadingIcon}>📦</Text>
        <ThemedText style={styles.loadingText}>Loading catalog...</ThemedText>
      </BodyScrollView>
    );
  }

  if (error) {
    return (
      <BodyScrollView contentContainerStyle={styles.centerContent}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </BodyScrollView>
    );
  }

  const totalProducts = products.length;

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: "Product Catalog",
          headerLargeTitle: true,
        }} 
      />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.catalogTitle}>
            Browse by Category
          </ThemedText>
          <ThemedText style={styles.catalogSubtitle}>
            {totalProducts} products • {categories.length} categories
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search categories or products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Categories Grid */}
        <FlatList
          data={filteredCategories}
          renderItem={({ item }) => (
            <CategoryCard 
              category={item} 
              onPress={() => handleCategoryPress(item)}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <ThemedText style={styles.emptyTitle}>No Categories Found</ThemedText>
              <ThemedText style={styles.emptyText}>
                Try a different search term
              </ThemedText>
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </>
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  catalogTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  catalogSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  gridRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  iconArea: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryIconLarge: {
    fontSize: 64,
  },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  countText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  categoryInfo: {
    padding: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
    lineHeight: 18,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 28,
    lineHeight: 24,
  },
  clearButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});