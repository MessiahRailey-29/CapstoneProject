// app/(home)/(tabs)/product-browser.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, View, Pressable, Text, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import TextInput from '@/components/ui/text-input';
import { useProducts } from '@/hooks/useProducts';
import { DatabaseProduct } from '@/services/productsApi';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    color: '#c7b24c',
    gradient: ['#c7b24c', '#FFF0A0'],
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
    color: '#75c075',
    gradient: ['#75c075', '#A8F3A8'],
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
  'Fish & Seafood':{
    icon: '🐟',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#ffd0ff'],
    description: 'Fish, shrimps, shellfish, and more.'
    },
  'Baby Products':{
    icon: '👶🏻',
    color: '#e3c78f',
    gradient: ['#e3c78f', '#ffefce'],
    description: 'Baby foods and items.'
  },
  'Eggs':{
    icon: '🥚',
    color: '#b88829',
    gradient: ['#b88829', '#fff1d5'],
    description: 'Brown and white eggs.'
  },
  'Condiments & Sauces':{
    icon: '🧂',
    color: '#b82929',
    gradient: ['#b82929', '#ffa8a8'],
    description: 'Ketchup, salt, mustard, and more.'
  },
  'Personal Care':{
    icon: '🧼',
    color: '#29b854',
    gradient: ['#29b854', '#96d8ff'],
    description: 'Soap, shampoo, cleansers, and more.'
  },
  'Bread & Bakery':{
    icon: '🍞',
    color: '#dca836',
    gradient: ['#dca836', '#ffe6b0'],
    description: 'Wheat bread, loaf bread, and more.'
  },
  'Frozen Goods':{
    icon: '🧊',
    color: '#3683dc',
    gradient: ['#3683dc', '#add3ff'],
    description: 'Ready to cook frozen products'
  },
  'Rice & Grains':{
    icon: '🌾',
    color: '#d1dc36',
    gradient: ['#d1dc36', '#7dffb1'],
    description: 'Rice, brown rice, and more.'
  },
  'Cooking Oil':{
    icon: '🛢️',
    color: '#e0c438',
    gradient: ['#e0c438', '#ffeac7'],
    description: 'Vegetable, palm, olive, and more.'
  },
  'Candy & Sweets':{
    icon: '🍬',
    color: '#c43a3a',
    gradient: ['#c43a3a', '#D8D8D8'],
    description: 'Candies for everyone.'
  },
  'Pasta':{
    icon: '🍝',
    color: '#c4c43a',
    gradient: ['#c4c43a', '#ef6a6a'],
    description: 'Penne, macaroni, and spagetti'
  }
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
  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);
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

function ProductCardWithPrices({
  product,
  onPress,
}: {
  product: DatabaseProduct;
  onPress: () => void;
}) {
  // This component would need a hook to fetch prices per product
  // For now, we'll simplify to just show the product without detailed pricing
  const categoryConfig = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG['Other'];
  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.productCard,
        { borderLeftColor: categoryConfig.color },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.productHeader}>
        <Text style={styles.productIcon}>{categoryConfig.icon}</Text>
        <View style={styles.productInfo}>
          <ThemedText style={styles.productName} numberOfLines={2}>
            {product.name} {product.unit && `(${product.unit})`}
          </ThemedText>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
      </View>

      <View style={styles.productFooter}>
        <Text style={[styles.viewDetailsText, { color: categoryConfig.color }]}>
          Tap to view prices
        </Text>
      </View>
    </Pressable>
  );
}

function ProductCard({
  product,
  onPress,
}: {
  product: DatabaseProduct;
  onPress: () => void;
}) {
  return <ProductCardWithPrices product={product} onPress={onPress} />;
}

export default function ProductBrowserScreen() {
  const router = useRouter();
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  //color scheme and styles
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  // Filter products by search (search shows actual products, not categories)
  const searchResults = useMemo(() => {
    if (!searchQuery) return null;

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleCategoryPress = useCallback((category: CategoryData) => {
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
  }, [router]);

  const handleProductPress = useCallback((product: DatabaseProduct) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigate to product details or add to list
    router.push({
      pathname: '/product-detail',
      params: {
        productId: product.id,
        productName: product.name,
      }
    });
  }, [router]);

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
          <ThemedText style={styles.catalogSubtitle}>
            {totalProducts} products • {categories.length} categories
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Show search results (products) OR categories */}
        {searchQuery ? (
          // SEARCH RESULTS - Show Products
          <FlatList
            key="products-list" // Add key to force re-render when switching views
            data={searchResults}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.productListContent}
            ListHeaderComponent={() => (
              <View style={styles.resultsHeader}>
                <ThemedText style={styles.resultsCount}>
                  {searchResults?.length || 0} product{searchResults?.length !== 1 ? 's' : ''} found
                </ThemedText>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <ThemedText style={styles.emptyTitle}>No Products Found</ThemedText>
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
        ) : (
          // DEFAULT VIEW - Show Categories
          <FlatList
            key="categories-grid" // Add key to force re-render when switching views
            data={categories}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => handleCategoryPress(item)}
              />
            )}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            keyExtractor={(item) => item.name}
            contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom + 130}]}
          />
        )}
      </View>
    </>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.mainBackground,
    },
    headerSection: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    catalogSubtitle: {
      fontSize: 15,
      color: colors.exposedGhost,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    searchInput: {
      marginBottom: 0,
      borderColor: colors.borderColor,
      borderWidth: 1,
      borderRadius: 13,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    resultsCount: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.exposedGhost,
    },
    listContent: {
      paddingTop: 20,
      paddingBottom: 100,
    },
    productListContent: {
      paddingBottom: 100,
    },
    gridRow: {
      paddingHorizontal: 16,
      gap: 16,
    },
    categoryCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      marginBottom: 16,
      overflow: 'hidden',
      borderColor: colors.borderColor,
      borderWidth: 2,
      shadowColor: colors.shadowColor,
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
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    countText: {
      lineHeight: 36,
      fontSize: 16,
      fontWeight: '800',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: {width:0,height:1},
      textShadowRadius: 4
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
      color: colors.text,
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
      borderColor: '#000000ab',
      borderWidth: 0.7
    },
    viewButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: {width:0,height:1},
      textShadowRadius: 1
    },
    productCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderColor: colors.borderColor,
      borderWidth: 1,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 12,
    },
    productIcon: {
      fontSize: 40,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    productCategory: {
      fontSize: 13,
      color: '#666',
    },
    productFooter: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderBottomColor,
    },
    viewDetailsText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
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
}