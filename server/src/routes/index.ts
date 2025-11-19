// server/src/routes/index.ts
import { Router } from 'express';
import { Product, Price, ShoppingList } from '../models';
import syncRoutes from './sync';
import recommendationsRoutes from './recommendations';
import mongoose from 'mongoose';

const router = Router();

// Middleware to check database connection
const checkDB = (req: any, res: any, next: any) => {
  console.log('🔍 DB Check - Connection state:', mongoose.connection.readyState);
  
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not available',
      message: 'MongoDB connection state: ' + mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// ===== Routes that DON'T need DB check =====
router.use(syncRoutes);


// ===== Routes that NEED DB check =====
// Products Routes
router.get('/products', checkDB, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    console.log(`✅ Fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', checkDB, async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.get('/products/:id/prices', checkDB, async (req, res) => {
  try {
    const prices = await Price.find({ 
      product_id: parseInt(req.params.id) 
    }).sort({ price: 1 });
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Shopping Lists Routes
router.get('/lists/:userId', checkDB, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.params.userId })
      .sort({ updatedAt: -1 })
      .select('-__v');
    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.get('/lists/:userId/:listId', checkDB, async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ 
      listId: req.params.listId,
      userId: req.params.userId 
    }).select('-__v');
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

router.post('/lists', checkDB, async (req, res) => {
  try {
    const list = new ShoppingList(req.body);
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

router.put('/lists/:listId', checkDB, async (req, res) => {
  try {
    const list = await ShoppingList.findOneAndUpdate(
      { listId: req.params.listId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

router.delete('/lists/:listId', checkDB, async (req, res) => {
  try {
    const list = await ShoppingList.findOneAndDelete({ 
      listId: req.params.listId 
    });
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Recommendations Routes (with checkDB on each route)
router.use(recommendationsRoutes);

export default router;