// server/src/models/index.ts
import mongoose from 'mongoose';

// Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
});

// Price Schema
const PriceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  store: { type: String, required: true },
  price: { type: Number, required: true },
});

// Shopping List Schema
const ShoppingListSchema = new mongoose.Schema({
  listId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  emoji: { type: String, default: '🛒' },
  color: { type: String, default: '#007AFF' },
  shoppingDate: { type: Date },
  budget: { type: Number, default: 0 },
  status: { type: String, default: 'regular' }, // 🆕 Added: 'regular', 'ongoing', 'completed'
  completedAt: { type: Date },
  valuesCopy: { type: String, default: '{}' }, // 🆕 Added: TinyBase sync data
  products: [{
    id: String,
    name: String,
    quantity: Number,
    units: String,
    isPurchased: { type: Boolean, default: false },
    category: { type: String, default: '' },
    notes: { type: String, default: '' },
    selectedStore: { type: String, default: '' },
    selectedPrice: { type: Number, default: 0 },
    databaseProductId: { type: Number, default: 0 },
    createdBy: String,
    createdAt: Date,
    updatedAt: Date,
  }],
  collaborators: [{
    userId: String,
    nickname: String,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
ProductSchema.index({ name: 1 });
PriceSchema.index({ product_id: 1 });
ShoppingListSchema.index({ userId: 1 });
ShoppingListSchema.index({ listId: 1 });

// ✅ Fixed: Prevent overwrite errors during hot-reload
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Price = mongoose.models.Price || mongoose.model('Price', PriceSchema);
export const ShoppingList = mongoose.models.ShoppingList || mongoose.model('ShoppingList', ShoppingListSchema);