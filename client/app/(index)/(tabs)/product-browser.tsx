import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import TextInput from '@/components/ui/text-input';
import DatabaseProductItem from '@/components/DatabaseProductItem';
import { useProducts } from '@/hooks/useProducts';
import { DatabaseProduct } from '@/services/productsApi';

export default function ProductBrowserScreen() {
  const router = useRouter();
  const { products, loading, error, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return searchProducts(searchQuery);
  }, [products, searchQuery, searchProducts]);

  const handleProductPress = (product: DatabaseProduct) => {
    // You can navigate to a product detail screen or add to list
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id.toString() }
    });
  };

  if (loading) {
    return (
      <BodyScrollView contentContainerStyle={styles.centerContent}>
        <ThemedText>Loading products...</ThemedText>
      </BodyScrollView>
    );
  }

  if (error) {
    return (
      <BodyScrollView contentContainerStyle={styles.centerContent}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </BodyScrollView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: "Browse Products",
          headerLargeTitle: true,
        }} 
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>
        
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <DatabaseProductItem 
              product={item} 
              onPress={handleProductPress}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.centerContent}>
              <ThemedText>
                {searchQuery ? 'No products found' : 'No products available'}
              </ThemedText>
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
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    paddingBottom: 100,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  errorText: {
    color: 'red',
  },
});