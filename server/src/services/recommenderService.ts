// server/src/services/recommenderService.ts
import {
  PurchaseHistory,
  UserProfile,
  ProductSeasonality,
  ProductTrends,
  LocationProductStats,
} from '../models/ml.js';
import { Product, Price } from '../models/index.js';

interface Recommendation {
  productId: number;
  productName: string;
  category: string;
  unit: string;
  score: number;
  reasons: string[];
  store: string;
  price: number;
}

// Helper function to extract city from full location string
function extractCity(location: string): string {
  // Extract city name from format like "Batangas City, Batangas, PH"
  const parts = location.split(',');
  return parts[0]?.trim() || 'Batangas City';
}

export class RecommenderService {
  /**
   * Main recommendation engine
   */
  async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    // Gather all recommendation signals in parallel
    const [
      personalHistory,
      seasonalProducts,
      locationProducts,
      peerProducts,
      trendingProducts,
    ] = await Promise.all([
      this.getPersonalHistoryRecommendations(userId),
      this.getSeasonalRecommendations(),
      this.getLocationBasedRecommendations(userId),
      this.getPeerRecommendations(userId),
      this.getTrendingProducts(userId),
    ]);

    // Combine and score recommendations
    const combined = this.combineRecommendations([
      { recommendations: personalHistory, weight: 0.35 },
      { recommendations: seasonalProducts, weight: 0.20 },
      { recommendations: locationProducts, weight: 0.15 },
      { recommendations: peerProducts, weight: 0.20 },
      { recommendations: trendingProducts, weight: 0.10 },
    ]);

    // Sort and limit
    const final = combined
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return final;
  }

  /**
   * Personal purchase history-based recommendations
   */
  private async getPersonalHistoryRecommendations(
    userId: string
  ): Promise<Recommendation[]> {
    const history = await PurchaseHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$productId',
          purchaseCount: { $sum: 1 },
          lastPurchased: { $max: '$timestamp' },
          avgPrice: { $avg: '$price' },
          commonStore: { $first: '$store' },
        },
      },
      { $sort: { purchaseCount: -1, lastPurchased: -1 } },
      { $limit: 20 },
    ]);

    const productIds = history.map((h: any) => h._id);
    const products = await Product.find({ id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return history
      .map((item: any) => {
        const product = productMap.get(item._id);
        if (!product) return null;

        const daysSinceLastPurchase =
          (Date.now() - new Date(item.lastPurchased).getTime()) /
          (1000 * 60 * 60 * 24);

        const frequencyScore = Math.min(item.purchaseCount / 10, 1);
        const recencyScore = Math.max(0, 1 - daysSinceLastPurchase / 90);

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          score: frequencyScore * 0.6 + recencyScore * 0.4,
          reasons: [
            `You buy this often (${item.purchaseCount}x)`,
            daysSinceLastPurchase < 7
              ? 'Purchased recently'
              : `Last bought ${Math.floor(daysSinceLastPurchase)} days ago`,
          ],
          store: item.commonStore || 'Multiple stores',
          price: item.avgPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Seasonal recommendations (Philippine weather patterns)
   */
  private async getSeasonalRecommendations(): Promise<Recommendation[]> {
    const currentSeason = this.getCurrentSeason(new Date().getMonth() + 1);

    const seasonal = await ProductSeasonality.find({ season: currentSeason })
      .sort({ seasonalityScore: -1 })
      .limit(20);

    const productIds = seasonal.map((s) => s.productId);
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

    const seasonName = this.getSeasonDisplayName(currentSeason);

    return seasonal
      .map((item) => {
        const product = productMap.get(item.productId);
        const priceInfo = priceMap.get(item.productId);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          score: item.seasonalityScore,
          reasons: [`Perfect for ${seasonName}`, 'Seasonal favorite'],
          store: priceInfo?.store || 'Multiple stores',
          price: priceInfo?.minPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Location-based recommendations (Batangas cities)
   */
  private async getLocationBasedRecommendations(
    userId: string
  ): Promise<Recommendation[]> {
    const userProfile = await UserProfile.findOne({ userId });
    
    // Default to Batangas City if no profile found
    const userLocation = userProfile?.location || 'Batangas City, Batangas, PH';
    const userCity = extractCity(userLocation);

    // First try to get city-specific stats
    let stats = await LocationProductStats.find({
      city: userCity,
      uniqueUsers: { $gte: 3 },
    })
      .sort({ purchaseCount: -1 })
      .limit(20);

    // If not enough city-specific data, fall back to full location
    if (stats.length < 5) {
      stats = await LocationProductStats.find({
        location: { $regex: userCity, $options: 'i' },
        uniqueUsers: { $gte: 3 },
      })
        .sort({ purchaseCount: -1 })
        .limit(20);
    }

    const productIds = stats.map((s) => s.productId);
    const products = await Product.find({ id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return stats
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          score: Math.min(item.uniqueUsers / 20, 1),
          reasons: [
            `Popular in ${userCity}`,
            `${item.uniqueUsers} nearby shoppers bought this`,
          ],
          store: item.popularStores?.[0] || 'Multiple stores',
          price: item.avgPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Peer-based collaborative filtering (location-aware)
   */
  private async getPeerRecommendations(userId: string): Promise<Recommendation[]> {
    const userProducts = await PurchaseHistory.distinct('productId', { userId });
    const userProfile = await UserProfile.findOne({ userId });
    const userCity = userProfile?.location ? extractCity(userProfile.location) : null;

    if (userProducts.length < 3) {
      return [];
    }

    // Find similar users (optionally from same city for better relevance)
    const matchQuery: any = {
      userId: { $ne: userId },
      productId: { $in: userProducts },
    };

    // If user has a location, prefer peers from same city
    if (userCity) {
      const sameLocationUsers = await UserProfile.find({
        location: { $regex: userCity, $options: 'i' },
        userId: { $ne: userId }
      }).distinct('userId');

      if (sameLocationUsers.length > 0) {
        matchQuery.userId = { $in: sameLocationUsers };
      }
    }

    const similarUsers = await PurchaseHistory.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$userId',
          overlap: { $sum: 1 },
        },
      },
      {
        $match: {
          overlap: { $gte: 3 },
        },
      },
      {
        $sort: { overlap: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    if (similarUsers.length === 0) {
      return [];
    }

    const similarUserIds = similarUsers.map((u: any) => u._id);

    const recommendations = await PurchaseHistory.aggregate([
      {
        $match: {
          userId: { $in: similarUserIds },
          productId: { $nin: userProducts },
        },
      },
      {
        $group: {
          _id: '$productId',
          peerCount: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          commonStore: { $first: '$store' },
        },
      },
      {
        $sort: { peerCount: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    const productIds = recommendations.map((r: any) => r._id);
    const products = await Product.find({ id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const locationSuffix = userCity ? ` from ${userCity}` : '';

    return recommendations
      .map((item: any) => {
        const product = productMap.get(item._id);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          score: Math.min(item.peerCount / similarUsers.length, 1),
          reasons: [
            `Shoppers like you${locationSuffix} love this`,
            `${item.peerCount} similar shoppers purchased`,
          ],
          store: item.commonStore || 'Multiple stores',
          price: item.avgPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Trending products (location-aware)
   */
  private async getTrendingProducts(userId?: string): Promise<Recommendation[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Try to get location-specific trends if user provided
    let matchQuery: any = {
      timestamp: { $gte: sevenDaysAgo },
    };

    if (userId) {
      const userProfile = await UserProfile.findOne({ userId });
      if (userProfile?.location) {
        const userCity = extractCity(userProfile.location);
        matchQuery.location = { $regex: userCity, $options: 'i' };
      }
    }

    const trending = await PurchaseHistory.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$productId',
          recentPurchases: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 1,
          recentPurchases: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
        },
      },
      {
        $sort: { recentPurchases: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    const productIds = trending.map((t: any) => t._id);
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

    return trending
      .map((item: any) => {
        const product = productMap.get(item._id);
        const priceInfo = priceMap.get(item._id);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          score: Math.min(item.recentPurchases / 50, 1),
          reasons: [
            'Trending this week in Batangas',
            `${item.recentPurchases} recent purchases`,
          ],
          store: priceInfo?.store || 'Multiple stores',
          price: priceInfo?.minPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Combine multiple recommendation sources
   */
  private combineRecommendations(
    sources: Array<{ recommendations: Recommendation[]; weight: number }>
  ): Recommendation[] {
    const scoreMap = new Map<number, {
      recommendation: Recommendation;
      totalScore: number;
      reasons: Set<string>;
    }>();

    sources.forEach(({ recommendations, weight }) => {
      recommendations.forEach((rec) => {
        const existing = scoreMap.get(rec.productId);
        const weightedScore = rec.score * weight;

        if (existing) {
          existing.totalScore += weightedScore;
          rec.reasons.forEach((reason) => existing.reasons.add(reason));
        } else {
          scoreMap.set(rec.productId, {
            recommendation: rec,
            totalScore: weightedScore,
            reasons: new Set(rec.reasons),
          });
        }
      });
    });

    return Array.from(scoreMap.values()).map(
      ({ recommendation, totalScore, reasons }) => ({
        ...recommendation,
        score: totalScore,
        reasons: Array.from(reasons),
      })
    );
  }

  /**
   * Track purchase for ML learning
   */
  async trackPurchase(
    userId: string,
    productId: number,
    listId: string,
    quantity: number = 1,
    store?: string,
    price?: number
  ): Promise<void> {
    // Get user's location for better tracking
    const userProfile = await UserProfile.findOne({ userId });
    const location = userProfile?.location || 'Batangas City, Batangas, PH';

    await PurchaseHistory.create({
      userId,
      productId,
      listId,
      quantity,
      store,
      price,
      location,
      timestamp: new Date(),
    });

    // Update location stats
    await this.updateLocationStats(location, productId, store);
  }

  /**
   * Update location statistics
   */
  private async updateLocationStats(
    location: string,
    productId: number,
    store?: string
  ): Promise<void> {
    const city = extractCity(location);

    await LocationProductStats.findOneAndUpdate(
      { location, city, productId },
      {
        $inc: { purchaseCount: 1 },
        $addToSet: store ? { popularStores: store } : {},
        $set: { lastUpdated: new Date() },
      },
      { upsert: true }
    );
  }

  /**
   * Get current season for Philippines (Batangas climate)
   */
  private getCurrentSeason(month: number): string {
    // November - February: Cool dry season (Amihan)
    if (month >= 11 || month <= 2) return 'dry_cool';
    // March - May: Hot dry season (Summer)
    if (month >= 3 && month <= 5) return 'dry_hot';
    // June - October: Wet season (Southwest Monsoon/Habagat)
    return 'wet';
  }

  /**
   * Get display name for season
   */
  private getSeasonDisplayName(season: string): string {
    const names: Record<string, string> = {
      'dry_cool': 'cool season (Amihan)',
      'dry_hot': 'summer season',
      'wet': 'rainy season (Habagat)',
      'all-year': 'any season',
    };
    return names[season] || season;
  }
}