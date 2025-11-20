// server/src/services/advancedRecommenderService.ts
import { PurchaseHistory, ProductAssociations, LocationProductStats, UserProfile } from '../models/ml.js';
import { Product, Price } from '../models/index.js';

// Helper function to extract city from location string
function extractCity(location: string): string {
  const parts = location.split(',');
  return parts[0]?.trim() || 'Batangas City';
}

export class AdvancedRecommenderService {
  /**
   * Frequently bought together recommendations (location-aware)
   */
  async getFrequentlyBoughtTogether(productIds: number[], userId?: string): Promise<any[]> {
    if (productIds.length === 0) return [];

    // Get user location if provided
    let userLocation: string | null = null;
    if (userId) {
      const userProfile = await UserProfile.findOne({ userId });
      userLocation = userProfile?.location || null;
    }

    // Build query - prefer location-specific associations
    const query: any = {
      productAId: { $in: productIds },
      productBId: { $nin: productIds },
    };

    if (userLocation) {
      query.location = { $regex: extractCity(userLocation), $options: 'i' };
    }

    const associations = await ProductAssociations.find(query)
      .sort({ confidenceScore: -1, coOccurrenceCount: -1 })
      .limit(10);

    const associatedProductIds = associations.map((a) => a.productBId);
    const products = await Product.find({ id: { $in: associatedProductIds } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return associations
      .map((assoc) => {
        const product = productMap.get(assoc.productBId);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          confidence: assoc.confidenceScore,
          coOccurrenceCount: assoc.coOccurrenceCount,
        };
      })
      .filter((item) => item !== null);
  }

  /**
   * Smart list completion (location and history aware)
   */
  async suggestListCompletion(
    currentProductIds: number[],
    userId: string,
    limit: number = 5
  ): Promise<any[]> {
    // Get user profile for location context
    const userProfile = await UserProfile.findOne({ userId });
    const userLocation = userProfile?.location;
    const userCity = userLocation ? extractCity(userLocation) : null;

    // Get user's typical shopping patterns
    const userPatterns = await PurchaseHistory.aggregate([
      {
        $match: {
          userId,
          productId: { $nin: currentProductIds },
        },
      },
      {
        $group: {
          _id: '$productId',
          frequency: { $sum: 1 },
        },
      },
      {
        $sort: { frequency: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    // Get products frequently bought with current items
    const associations = await this.getFrequentlyBoughtTogether(currentProductIds, userId);

    // Get location-popular products not in current list
    let locationProducts: any[] = [];
    if (userCity) {
      const locationStats = await LocationProductStats.find({
        city: userCity,
        productId: { $nin: currentProductIds },
        uniqueUsers: { $gte: 3 },
      })
        .sort({ purchaseCount: -1 })
        .limit(10);

      locationProducts = locationStats.map((stat) => ({
        productId: stat.productId,
        localScore: stat.purchaseCount / 100,
      }));
    }

    // Combine and rank
    const scoreMap = new Map<number, number>();

    // Personal history (highest weight)
    userPatterns.forEach((item: any) => {
      scoreMap.set(item._id, item.frequency * 0.5);
    });

    // Associations (medium weight)
    associations.forEach((item: any) => {
      const existing = scoreMap.get(item.productId) || 0;
      scoreMap.set(item.productId, existing + (item.confidence || 0) * 0.3);
    });

    // Location popularity (lower weight)
    locationProducts.forEach((item: any) => {
      const existing = scoreMap.get(item.productId) || 0;
      scoreMap.set(item.productId, existing + item.localScore * 0.2);
    });

    // Get product details
    const sortedProductIds = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);

    const products = await Product.find({ id: { $in: sortedProductIds } });
    
    // Get prices, preferring user's location stores
    const prices = await Price.aggregate([
      { $match: { product_id: { $in: sortedProductIds } } },
      {
        $group: {
          _id: '$product_id',
          minPrice: { $min: '$price' },
          store: { $first: '$store' },
        },
      },
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const priceMap = new Map(prices.map((p: any) => [p._id, p]));

    return sortedProductIds
      .map((productId) => {
        const product = productMap.get(productId);
        const priceInfo = priceMap.get(productId);
        const score = scoreMap.get(productId) || 0;

        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          score,
          store: priceInfo?.store || 'Multiple stores',
          price: priceInfo?.minPrice || 0,
        };
      })
      .filter((item) => item !== null);
  }

  /**
   * Price savings opportunities (location-specific stores)
   */
  async getPriceSavingsOpportunities(productIds: number[], userId?: string): Promise<any[]> {
    if (productIds.length === 0) return [];

    // Get user location for relevant store filtering
    let userCity: string | null = null;
    if (userId) {
      const userProfile = await UserProfile.findOne({ userId });
      if (userProfile?.location) {
        userCity = extractCity(userProfile.location);
      }
    }

    const priceAnalysis = await Price.aggregate([
      {
        $match: {
          product_id: { $in: productIds },
        },
      },
      {
        $group: {
          _id: '$product_id',
          lowestPrice: { $min: '$price' },
          highestPrice: { $max: '$price' },
          prices: { $push: { store: '$store', price: '$price' } },
        },
      },
      {
        $match: {
          $expr: { $gt: ['$highestPrice', '$lowestPrice'] },
        },
      },
    ]);

    const relevantProductIds = priceAnalysis.map((p: any) => p._id);
    const products = await Product.find({ id: { $in: relevantProductIds } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return priceAnalysis.map((item: any) => {
      const product = productMap.get(item._id);
      const potentialSavings = item.highestPrice - item.lowestPrice;
      const savingsPercentage = (potentialSavings / item.highestPrice) * 100;
      
      // Find the store with lowest price
      const bestPriceInfo = item.prices.find((p: any) => p.price === item.lowestPrice);

      // Add location context if available
      let locationNote = '';
      if (userCity && bestPriceInfo?.store) {
        locationNote = ` in ${userCity}`;
      }

      return {
        productId: item._id,
        productName: product?.name || 'Unknown',
        category: product?.category || 'Unknown',
        unit: product?.unit || 'Unknown',
        lowestPrice: item.lowestPrice,
        highestPrice: item.highestPrice,
        bestStore: bestPriceInfo?.store || 'Unknown',
        storeCount: item.prices.length,
        potentialSavings,
        savingsPercentage: Math.round(savingsPercentage),
        locationNote,
      };
    });
  }

  /**
   * Time-based recommendations (location-aware)
   */
  async getTimeBasedRecommendations(userId: string): Promise<any[]> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Get user location
    const userProfile = await UserProfile.findOne({ userId });
    const userCity = userProfile?.location ? extractCity(userProfile.location) : null;

    // Determine time range
    let startHour = 0;
    let endHour = 23;
    let timeContext = 'general';

    if (hour >= 6 && hour < 11) {
      startHour = 6;
      endHour = 11;
      timeContext = 'breakfast';
    } else if (hour >= 11 && hour < 14) {
      startHour = 11;
      endHour = 14;
      timeContext = 'lunch';
    } else if (hour >= 17 && hour < 21) {
      startHour = 17;
      endHour = 21;
      timeContext = 'dinner';
    } else if (hour >= 21 || hour < 6) {
      startHour = 21;
      endHour = 6;
      timeContext = 'late_night';
    }

    // Find purchases in this time range
    const matchQuery: any = { userId };
    if (userCity) {
      matchQuery.location = { $regex: userCity, $options: 'i' };
    }

    const timeBased = await PurchaseHistory.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          hour: { $hour: '$timestamp' },
          dayOfWeek: { $dayOfWeek: '$timestamp' },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ['$hour', startHour] },
              { $lte: ['$hour', endHour] },
              isWeekend
                ? { $in: ['$dayOfWeek', [1, 7]] }
                : { $not: { $in: ['$dayOfWeek', [1, 7]] } },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$productId',
          frequency: { $sum: 1 },
        },
      },
      {
        $sort: { frequency: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const productIds = timeBased.map((t: any) => t._id);
    const products = await Product.find({ id: { $in: productIds } });
    const prices = await Price.aggregate([
      { $match: { product_id: { $in: productIds } } },
      {
        $group: {
          _id: '$product_id',
          minPrice: { $min: '$price' },
          store: { $first: '$store' },
        },
      },
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const priceMap = new Map(prices.map((p: any) => [p._id, p]));

    const locationSuffix = userCity ? ` in ${userCity}` : '';

    return timeBased
      .map((item: any) => {
        const product = productMap.get(item._id);
        const priceInfo = priceMap.get(item._id);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          frequency: item.frequency,
          reason: `You often buy this for ${timeContext}${isWeekend ? ' on weekends' : ''}${locationSuffix}`,
          store: priceInfo?.store || 'Multiple stores',
          price: priceInfo?.minPrice || 0,
        };
      })
      .filter((item) => item !== null);
  }

  /**
   * Novelty recommendations (new products to try - location-specific)
   */
  async getNoveltyRecommendations(userId: string, limit: number = 5): Promise<any[]> {
    // Get products user hasn't bought
    const userProducts = await PurchaseHistory.distinct('productId', { userId });

    // Get user's location
    const userProfile = await UserProfile.findOne({ userId });
    const userLocation = userProfile?.location || 'Batangas City, Batangas, PH';
    const userCity = extractCity(userLocation);

    // Find popular products in user's city that they haven't tried
    const novelties = await LocationProductStats.find({
      productId: { $nin: userProducts },
      uniqueUsers: { $gte: 5 },
      city: userCity,
    })
      .sort({ purchaseCount: -1 })
      .limit(limit);

    const productIds = novelties.map((n) => n.productId);
    const products = await Product.find({ id: { $in: productIds } });
    const prices = await Price.aggregate([
      { $match: { product_id: { $in: productIds } } },
      {
        $group: {
          _id: '$product_id',
          minPrice: { $min: '$price' },
          store: { $first: '$store' },
        },
      },
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const priceMap = new Map(prices.map((p: any) => [p._id, p]));

    return novelties
      .map((item) => {
        const product = productMap.get(item.productId);
        const priceInfo = priceMap.get(item.productId);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          localPopularity: item.purchaseCount,
          uniqueUsers: item.uniqueUsers,
          score: 0.7,
          reasons: [
            'New product to try',
            `${item.uniqueUsers} shoppers in ${userCity} bought this`,
          ],
          store: priceInfo?.store || item.popularStores?.[0] || 'Multiple stores',
          price: priceInfo?.minPrice || 0,
        };
      })
      .filter((item) => item !== null);
  }

  /**
   * Budget-aware recommendations
   */
  async getBudgetAwareRecommendations(
    userId: string,
    currentSpent: number,
    budgetLimit: number,
    recommendations: any[]
  ) {
    const remaining = budgetLimit - currentSpent;

    if (remaining <= 0) {
      return {
        canAfford: [],
        almostAfford: [],
        needMoreBudget: recommendations,
        budgetRemaining: 0,
      };
    }

    const canAfford = recommendations.filter((r) => r.price <= remaining);
    const almostAfford = recommendations.filter(
      (r) => r.price > remaining && r.price <= remaining * 1.2
    );
    const needMoreBudget = recommendations.filter(
      (r) => r.price > remaining * 1.2
    );

    return {
      canAfford,
      almostAfford,
      needMoreBudget,
      budgetRemaining: remaining,
    };
  }
}