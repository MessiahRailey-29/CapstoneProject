// server/src/services/recommenderService.ts
import {
  PurchaseHistory,
  UserProfile,
  ProductSeasonality,
  ProductTrends,
  LocationProductStats,
} from '../models/ml';
import { Product, Price } from '../models';

interface Recommendation {
  productId: number;
  productName: string;
  category: string;
  score: number;
  reasons: string[];
  store: string;
  price: number;
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
      this.getTrendingProducts(),
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
   * Seasonal recommendations
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

    return seasonal
      .map((item) => {
        const product = productMap.get(item.productId);
        const priceInfo = priceMap.get(item.productId);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          score: item.seasonalityScore,
          reasons: [`Popular in ${currentSeason}`, 'Seasonal item'],
          store: priceInfo?.store || 'Multiple stores',
          price: priceInfo?.minPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Location-based recommendations
   */
  private async getLocationBasedRecommendations(
    userId: string
  ): Promise<Recommendation[]> {
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile?.location) {
      return [];
    }

    const stats = await LocationProductStats.find({
      location: userProfile.location,
      uniqueUsers: { $gte: 3 },
    })
      .sort({ purchaseCount: -1 })
      .limit(20);

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
          score: Math.min(item.uniqueUsers / 20, 1),
          reasons: [
            `Popular in ${userProfile.location}`,
            `${item.uniqueUsers} nearby users bought this`,
          ],
          store: 'Multiple stores',
          price: item.avgPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Peer-based collaborative filtering
   */
  private async getPeerRecommendations(userId: string): Promise<Recommendation[]> {
    const userProducts = await PurchaseHistory.distinct('productId', { userId });

    if (userProducts.length < 3) {
      return [];
    }

    const similarUsers = await PurchaseHistory.aggregate([
      {
        $match: {
          userId: { $ne: userId },
          productId: { $in: userProducts },
        },
      },
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

    return recommendations
      .map((item: any) => {
        const product = productMap.get(item._id);
        if (!product) return null;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          score: Math.min(item.peerCount / similarUsers.length, 1),
          reasons: [
            'Users similar to you bought this',
            `${item.peerCount} similar users purchased`,
          ],
          store: item.commonStore || 'Multiple stores',
          price: item.avgPrice || 0,
        };
      })
      .filter((item): item is Recommendation => item !== null);
  }

  /**
   * Trending products
   */
  private async getTrendingProducts(): Promise<Recommendation[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await PurchaseHistory.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo },
        },
      },
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
          score: Math.min(item.recentPurchases / 50, 1),
          reasons: [
            'Trending this week',
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
    await PurchaseHistory.create({
      userId,
      productId,
      listId,
      quantity,
      store,
      price,
      timestamp: new Date(),
    });
  }

  /**
   * Get current season for Philippines
   */
  private getCurrentSeason(month: number): string {
    if (month >= 11 || month <= 2) return 'dry_cool';
    if (month >= 3 && month <= 5) return 'dry_hot';
    return 'wet';
  }
}