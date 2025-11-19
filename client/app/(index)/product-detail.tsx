import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { BodyScrollView } from '@/components/ui/BodyScrollView';
import Button from '@/components/ui/button';
import { productsApi, DatabaseProduct, ProductPrice } from '@/services/productsApi';
import { useProductPrices } from '@/hooks/useProducts';
import ShoppingListSelectorModal from '@/components/ShoppingListSelectorModal';
import { Colors } from '@/constants/Colors';

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams() as { productId: string };
  const router = useRouter();
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { prices } = useProductPrices(parseInt(productId));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<{ price: number; store: string } | null>(null);

  //colors and schemes
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const styles = createStyles(colors);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const fetchedProduct = await productsApi.getProduct(parseInt(productId));
      setProduct(fetchedProduct);

      // Set default price if available
      if (prices.length > 0) {
        setSelectedPrice({ price: prices[0].price, store: prices[0].store });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = () => {
    // Use first price as default if none selected
    const priceToUse = selectedPrice || (prices.length > 0 ? { price: prices[0].price, store: prices[0].store } : { price: 0, store: 'Unknown' });
    setSelectedPrice(priceToUse);
    setModalVisible(true);
  };

  const handlePriceSelect = (price: number, store: string) => {
    setSelectedPrice({ price, store });
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
              <Pressable
                key={price.id}
                style={[
                  styles.priceItem,
                  selectedPrice?.store === price.store && selectedPrice?.price === price.price && styles.priceItemSelected
                ]}
                onPress={() => handlePriceSelect(price.price, price.store)}
              >
                <ThemedText type="defaultSemiBold">
                  {price.store}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.priceValue}>
                  ₱{price.price.toFixed(2)}
                </ThemedText>
              </Pressable>
            ))
          ) : (
            <ThemedText style={styles.noPrices}>
              No prices available for this product
            </ThemedText>
          )}
        </View>

        <View style={styles.actions}>
          <Button onPress={handleAddToList}>
            Add to Shopping List
          </Button>
        </View>
      </BodyScrollView>

      {/* Shopping List Selector Modal */}
      {product && selectedPrice && (
        <ShoppingListSelectorModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          productId={product.id}
          productName={product.name}
          price={selectedPrice.price}
          store={selectedPrice.store}
          onSuccess={() => {
            setModalVisible(false);
          }}
        />
      )}
    </>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.mainBackground,
      flex: 1
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
    },
    productInfo: {
      marginTop: 8,
      marginBottom: 24,
    },
    productName: {
      marginBottom: 8,
      color: colors.text,
      lineHeight: 32
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
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    priceItemSelected: {
      backgroundColor: '#e3f2fd20',
      borderColor: '#007AFF',
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
}