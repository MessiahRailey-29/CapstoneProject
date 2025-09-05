const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://groceries-shopping-list-server.chaeyoungs202.workers.dev';

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

export const productsApi = {
  async getAllProducts(): Promise<DatabaseProduct[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProduct(id: number): Promise<DatabaseProduct | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const product = await response.json();
      return Object.keys(product).length > 0 ? product : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  async getProductPrices(productId: number): Promise<ProductPrice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prices?product_id=${productId}`);
      if (!response.ok) throw new Error('Failed to fetch prices');
      return await response.json();
    } catch (error) {
      console.error('Error fetching prices:', error);
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