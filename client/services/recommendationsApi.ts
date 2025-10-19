// client/services/recommendationsApi.ts
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

console.log('🔗 API URL:', API_URL); // Debug log

export interface Recommendation {
  productId: number;
  productName: string;
  category: string;
  score: number;
  reasons: string[];
  store: string;
  price: number;
}

export const recommendationsApi = {
  // Get recommendations
  async getRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const url = `${API_URL}/recommendations?userId=${userId}&limit=${limit}`;
      
      // 🔍 DEBUG: Log everything
      console.log('=== DEBUG INFO ===');
      console.log('API_URL:', API_URL);
      console.log('Full URL:', url);
      console.log('userId:', userId);
      console.log('==================');

      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Response body:', text);
        return [];
      }

      const data = await response.json();
      console.log('✅ Success! Data:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      return [];
    }
  },

  // Track purchase
  async trackPurchase(
    userId: string,
    productId: number,
    listId: string,
    quantity: number = 1,
    store?: string,
    price?: number
  ): Promise<void> {
    try {
      await fetch(`${API_URL}/recommendations/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, listId, quantity, store, price }),
      });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  },

  // Get frequently bought together
  async getFrequentlyBoughtTogether(productIds: number[]): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_URL}/recommendations/frequently-bought-together`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds }),
        }
      );
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  // Get price savings
  async getPriceSavings(productIds: number[]): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_URL}/recommendations/price-savings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds }),
        }
      );
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  // Get time-based recommendations
  async getTimeBasedRecommendations(userId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_URL}/recommendations/time-based?userId=${userId}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { suggestions: [], context: 'today' };
    }
  },
};