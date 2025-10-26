// app/(home)/category-products.tsx
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View, Pressable, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { useProducts } from '@/hooks/useProducts';
import { DatabaseProduct } from '@/services/productsApi';
import { Ionicons } from '@expo/vector-icons';

function ProductItem({ 
  product, 
  categoryColor,
  onPress 
}: { 
  product: DatabaseProduct;
  categoryColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.productItem,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.productIconContainer, { backgroundColor: categoryColor + '20' }]}>
        <Text style={styles.productIcon}>📦</Text>
      </View>
      
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <Text style={styles.productId}>Product ID: {product.id}</Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color="#C0C0C0" />
          </Pressable>
        );
}

export default function CategoryProductsScreen() {
  const router = useRouter();
  const { categoryName, categoryIcon, categoryColor } = useLocalSearchParams() as { 
    categoryName: string; 
    categoryIcon: string;
    categoryColor: string;
  };
  
  const { products } = useProducts();

  // Filter products by category
  const categoryProducts = useMemo(() => {
    return products.filter(p => p.category === categoryName);
  }, [products, categoryName]);

  const handleProductPress = (product: DatabaseProduct) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id.toString() }
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: categoryName,
          headerLargeTitle: false,
          headerStyle: {
            backgroundColor: categoryColor,
          },
          headerTintColor: '#fff',
        }} 
      />
      <View style={styles.container}>
        {/* Category Header */}
        <View style={[styles.categoryHeader, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryHeaderIcon}>{categoryIcon}</Text>
          <View style={styles.categoryHeaderInfo}>
            <ThemedText style={styles.categoryHeaderTitle}>{categoryName}</ThemedText>
            <Text style={styles.categoryHeaderCount}>
              {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
            </Text>
          </View>
        </View>

        {/* Products List */}
        <FlatList
          data={categoryProducts}
          renderItem={({ item }) => (
            <ProductItem 
              product={item}
              categoryColor={categoryColor}
              onPress={() => handleProductPress(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <BodyScrollView contentContainerStyle={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <ThemedText style={styles.emptyText}>
                No products in this category
              </ThemedText>
            </BodyScrollView>
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  categoryHeaderIcon: {
    fontSize: 48,
  },
  categoryHeaderInfo: {
    flex: 1,
  },
  categoryHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  categoryHeaderCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIcon: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productId: {
    fontSize: 12,
    color: '#666',
  },
  arrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: '#C0C0C0',
    fontWeight: '400',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});