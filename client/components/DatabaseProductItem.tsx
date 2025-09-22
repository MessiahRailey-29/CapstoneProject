import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { DatabaseProduct } from '@/services/productsApi';
import { useProductPrices } from '@/hooks/useProducts';

interface DatabaseProductItemProps {
  product: DatabaseProduct;
  onPress: (product: DatabaseProduct) => void;
}

export default function DatabaseProductItem({ product, onPress }: DatabaseProductItemProps) {
  const { prices, loading, error } = useProductPrices(product.id);
  
  console.log(`🏪 DatabaseProductItem for product ${product.id} (${product.name}):`, {
    pricesCount: prices.length,
    loading,
    error,
    prices: prices
  });
  
  const lowestPrice = prices.length > 0 
    ? Math.min(...prices.map(p => p.price))
    : null;

  console.log(`💰 Lowest price for ${product.name}:`, lowestPrice);

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(product)}
    >
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            {product.name}
          </ThemedText>
          <ThemedText type="default" style={styles.category}>
            {product.category}
          </ThemedText>
        </View>
        
        <View style={styles.priceInfo}>
          {loading ? (
            <ThemedText type="default" style={styles.loadingText}>
              Loading...
            </ThemedText>
          ) : error ? (
            <ThemedText type="default" style={styles.errorText}>
              Error loading
            </ThemedText>
          ) : lowestPrice !== null ? (
            <ThemedText type="defaultSemiBold" style={styles.price}>
              ₱{lowestPrice.toFixed(2)}
            </ThemedText>
          ) : (
            <ThemedText type="default" style={styles.noPrice}>
              No price
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: 'gray',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    color: '#007AFF',
  },
  loadingText: {
    fontSize: 12,
    color: 'gray',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
  },
  noPrice: {
    fontSize: 12,
    color: 'gray',
  },
});