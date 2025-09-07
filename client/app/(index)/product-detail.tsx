import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import Button from '@/components/ui/button';
import { productsApi, DatabaseProduct, ProductPrice } from '@/services/productsApi';
import { useProductPrices } from '@/hooks/useProducts';

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams() as { productId: string };
  const router = useRouter();
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { prices } = useProductPrices(parseInt(productId));

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const fetchedProduct = await productsApi.getProduct(parseInt(productId));
      setProduct(fetchedProduct);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BodyScrollView contentContainerStyle={styles.centerContent}>
        <ThemedText>Loading product...</ThemedText>
      </BodyScrollView>
    );
  }

  if (!product) {
    return (
      <BodyScrollView contentContainerStyle={styles.centerContent}>
        <ThemedText>Product not found</ThemedText>
        <Button onPress={() => router.back()} variant="ghost">
          Go Back
        </Button>
      </BodyScrollView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: product.name,
          headerLargeTitle: false,
        }} 
      />
      <BodyScrollView contentContainerStyle={styles.container}>
        <View style={styles.productInfo}>
          <ThemedText type="title" style={styles.productName}>
            {product.name}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.category}>
            Category: {product.category}
          </ThemedText>
        </View>

        <View style={styles.pricesSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Prices
          </ThemedText>
          
          {prices.length > 0 ? (
            prices.map((price) => (
              <View key={price.id} style={styles.priceItem}>
                <ThemedText type="defaultSemiBold">
                  {price.store}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.priceValue}>
                  ₱{price.price.toFixed(2)}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText style={styles.noPrices}>
              No prices available for this product
            </ThemedText>
          )}
        </View>

        <View style={styles.actions}>
          <Button onPress={() => router.back()}>
            Add to Shopping List
          </Button>
        </View>
      </BodyScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  productInfo: {
    marginBottom: 24,
  },
  productName: {
    marginBottom: 8,
  },
  category: {
    color: 'gray',
  },
  pricesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  priceValue: {
    color: '#007AFF',
  },
  noPrices: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 24,
  },
});