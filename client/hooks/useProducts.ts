import { useState, useEffect } from 'react';
import { productsApi, DatabaseProduct, ProductPrice } from '@/services/productsApi';

export const useProducts = () => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadProducts();
      setInitialized(true);
    }
  }, [initialized]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedProducts = await productsApi.getAllProducts();
      setProducts(fetchedProducts);
      
      if (fetchedProducts.length === 0) {
        console.log('⚠️ No products loaded - API might not be configured or database is empty');
      } else {
        console.log(`✅ Successfully loaded ${fetchedProducts.length} products from database`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('❌ Products loading failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string) => {
    return productsApi.searchProducts(products, query);
  };

  return {
    products,
    loading,
    error,
    searchProducts,
    refetch: loadProducts,
    hasProducts: products.length > 0,
    isApiConfigured: Boolean(process.env.EXPO_PUBLIC_API_BASE_URL && 
      process.env.EXPO_PUBLIC_API_BASE_URL == 'https://groceries-shopping-list-server.chaeyoungs202.workers.dev')
  };
};

export const useProductPrices = (productId: number | null) => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      console.log('🎯 useProductPrices: Starting to fetch prices for product:', productId);
      setLoading(true);
      setError(null);
      
      productsApi.getProductPrices(productId)
        .then(fetchedPrices => {
          console.log('✅ useProductPrices: Successfully fetched prices:', fetchedPrices);
          setPrices(fetchedPrices);
        })
        .catch(error => {
          console.error('❌ useProductPrices: Failed to load prices:', error);
          setError(error instanceof Error ? error.message : String(error));
          setPrices([]);
        })
        .finally(() => {
          console.log('🏁 useProductPrices: Finished loading prices for product:', productId);
          setLoading(false);
        });
    } else {
      console.log('🎯 useProductPrices: No productId provided, clearing prices');
      setPrices([]);
      setError(null);
    }
  }, [productId]);

  return { prices, loading, error };
};