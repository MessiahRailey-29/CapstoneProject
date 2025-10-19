// client/services/productsApi.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface DatabaseProduct {
  id: number;
  name: string;
  category: string;
}

export interface ProductPrice {
  id: number;
  product_id: number;
  store: string;
  price: number;
}

const isApiAvailable = () => {
  return Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0);
};

export const productsApi = {
  async getAllProducts(): Promise<DatabaseProduct[]> {
    if (!isApiAvailable()) {
      console.log('⚠️ Products API not configured, returning empty array');
      return [];
    }

    try {
      const url = `${API_BASE_URL}/products`; // ✅ REMOVED /api
      console.log('🔍 Fetching products from:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Products API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Products API response data:', data);
      
      const products = Array.isArray(data) ? data : [];
      console.log(`✅ Loaded ${products.length} products`);
      
      return products;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return [];
    }
  },

  async getProduct(id: number): Promise<DatabaseProduct | null> {
    if (!isApiAvailable()) {
      console.log('⚠️ Products API not configured');
      return null;
    }

    try {
      const url = `${API_BASE_URL}/products/${id}`; // ✅ REMOVED /api
      console.log('🔍 Fetching product:', id, 'from:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Product API response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ Product ${id} not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const product = await response.json();
      console.log('📦 Product API response:', product);
      
      return product;
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      return null;
    }
  },

  async getProductPrices(productId: number): Promise<ProductPrice[]> {
    if (!isApiAvailable()) {
      console.log('⚠️ Products API not configured');
      return [];
    }

    try {
      const url = `${API_BASE_URL}/products/${productId}/prices`; // ✅ REMOVED /api
      console.log('💰 Fetching prices for product:', productId, 'from:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Prices API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Prices API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Prices API response data:', data);
      
      const prices = Array.isArray(data) ? data : [];
      console.log(`💰 Loaded ${prices.length} prices for product ${productId}`);
      
      return prices;
    } catch (error) {
      console.error('❌ Error fetching prices for product', productId, ':', error);
      return [];
    }
  },

  searchProducts(products: DatabaseProduct[], query: string): DatabaseProduct[] {
    if (!query.trim()) return products;
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  }
};