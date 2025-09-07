import { useState, useEffect } from 'react';
import { productsApi, DatabaseProduct, ProductPrice } from '@/services/productsApi';

export const useProducts = () => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productsApi.getAllProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
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
    refetch: loadProducts
  };
};

export const useProductPrices = (productId: number | null) => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      productsApi.getProductPrices(productId)
        .then(setPrices)
        .finally(() => setLoading(false));
    } else {
      setPrices([]);
    }
  }, [productId]);

  return { prices, loading };
};