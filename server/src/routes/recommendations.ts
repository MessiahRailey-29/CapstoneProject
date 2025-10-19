// server/src/routes/recommendations.ts
import { Router } from 'express';
import { RecommenderService } from '../services/recommenderService';
import { AdvancedRecommenderService } from '../services/advancedRecommenderService';

const router = Router();
const recommender = new RecommenderService();
const advanced = new AdvancedRecommenderService();

// GET /api/recommendations?userId=xxx&limit=10
router.get('/recommendations', async (req, res) => {
  try {
    const { userId, limit } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const recommendations = await recommender.getRecommendations(
      userId as string,
      parseInt(limit as string) || 10
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// POST /api/recommendations/track
router.post('/recommendations/track', async (req, res) => {
  try {
    const { userId, productId, listId, quantity, store, price } = req.body;

    if (!userId || !productId || !listId) {
      return res.status(400).json({
        error: 'userId, productId, and listId are required',
      });
    }

    await recommender.trackPurchase(
      userId,
      productId,
      listId,
      quantity,
      store,
      price
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking purchase:', error);
    res.status(500).json({ error: 'Failed to track purchase' });
  }
});

// POST /api/recommendations/frequently-bought-together
router.post('/recommendations/frequently-bought-together', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    const results = await advanced.getFrequentlyBoughtTogether(productIds);
    res.json(results);
  } catch (error) {
    console.error('Error getting frequently bought together:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// POST /api/recommendations/complete-list
router.post('/recommendations/complete-list', async (req, res) => {
  try {
    const { currentProductIds, userId } = req.body;

    if (!currentProductIds || !userId) {
      return res.status(400).json({
        error: 'currentProductIds and userId are required',
      });
    }

    const results = await advanced.suggestListCompletion(
      currentProductIds,
      userId
    );
    res.json(results);
  } catch (error) {
    console.error('Error getting list completion:', error);
    res.status(500).json({ error: 'Failed to complete list' });
  }
});

// POST /api/recommendations/price-savings
router.post('/recommendations/price-savings', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    const results = await advanced.getPriceSavingsOpportunities(productIds);
    res.json(results);
  } catch (error) {
    console.error('Error getting price savings:', error);
    res.status(500).json({ error: 'Failed to get savings' });
  }
});

// GET /api/recommendations/time-based?userId=xxx
router.get('/recommendations/time-based', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const results = await advanced.getTimeBasedRecommendations(
      userId as string
    );

    const hour = new Date().getHours();
    let context = 'today';
    if (hour >= 6 && hour < 11) context = 'breakfast';
    else if (hour >= 11 && hour < 14) context = 'lunch';
    else if (hour >= 17 && hour < 21) context = 'dinner';
    else if (hour >= 21 || hour < 6) context = 'late night';

    res.json({ suggestions: results, context });
  } catch (error) {
    console.error('Error getting time-based recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// GET /api/recommendations/novelty?userId=xxx
router.get('/recommendations/novelty', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const results = await advanced.getNoveltyRecommendations(userId as string);
    res.json(results);
  } catch (error) {
    console.error('Error getting novelty recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// POST /api/recommendations/budget-aware
router.post('/recommendations/budget-aware', async (req, res) => {
  try {
    const { userId, currentSpent, budgetLimit, recommendations } = req.body;

    if (!userId || currentSpent === undefined || !budgetLimit) {
      return res.status(400).json({
        error: 'userId, currentSpent, and budgetLimit are required',
      });
    }

    const results = await advanced.getBudgetAwareRecommendations(
      userId,
      currentSpent,
      budgetLimit,
      recommendations || []
    );

    res.json(results);
  } catch (error) {
    console.error('Error getting budget-aware recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;