// server/src/models/ml.ts
import mongoose from 'mongoose';

// Purchase History Schema - Track what users buy
const PurchaseHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  productId: { type: Number, required: true, index: true },
  listId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  store: { type: String },
  price: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
});

// User Profile Schema - Extended user information
const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String },
  location: { type: String, default: 'Tunasan, Calabarzon, PH' },
  preferences: {
    favoriteCategories: [{ type: String }],
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 }
    },
    dietaryRestrictions: [{ type: String }],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Product Seasonality Schema
const ProductSeasonalitySchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  season: { 
    type: String, 
    required: true,
    enum: ['dry_cool', 'dry_hot', 'wet', 'all-year']
  },
  seasonalityScore: { type: Number, default: 0.5, min: 0, max: 1 },
});

// Product Trends Schema
const ProductTrendsSchema = new mongoose.Schema({
  productId: { type: Number, required: true, index: true },
  weekStart: { type: Date, required: true, index: true },
  purchaseCount: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
});

// User Similarity Schema (cached for performance)
const UserSimilaritySchema = new mongoose.Schema({
  user1Id: { type: String, required: true, index: true },
  user2Id: { type: String, required: true },
  similarityScore: { type: Number, required: true },
  computedAt: { type: Date, default: Date.now },
});

// Product Associations Schema (frequently bought together)
const ProductAssociationsSchema = new mongoose.Schema({
  productAId: { type: Number, required: true, index: true },
  productBId: { type: Number, required: true },
  coOccurrenceCount: { type: Number, default: 1 },
  confidenceScore: { type: Number }, // P(B|A)
});

// Location Product Stats Schema
const LocationProductStatsSchema = new mongoose.Schema({
  location: { type: String, required: true, index: true },
  productId: { type: Number, required: true },
  purchaseCount: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
  avgPrice: { type: Number },
  lastUpdated: { type: Date, default: Date.now },
});

// Indexes for better query performance
PurchaseHistorySchema.index({ userId: 1, productId: 1, timestamp: -1 });
PurchaseHistorySchema.index({ timestamp: -1 });
ProductSeasonalitySchema.index({ productId: 1, season: 1 }, { unique: true });
ProductTrendsSchema.index({ productId: 1, weekStart: -1 });
UserSimilaritySchema.index({ user1Id: 1, similarityScore: -1 });
ProductAssociationsSchema.index({ productAId: 1, confidenceScore: -1 });
ProductAssociationsSchema.index({ productAId: 1, productBId: 1 }, { unique: true });
LocationProductStatsSchema.index({ location: 1, productId: 1 }, { unique: true });
LocationProductStatsSchema.index({ location: 1, purchaseCount: -1 });

export const PurchaseHistory = mongoose.model('PurchaseHistory', PurchaseHistorySchema);
export const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
export const ProductSeasonality = mongoose.model('ProductSeasonality', ProductSeasonalitySchema);
export const ProductTrends = mongoose.model('ProductTrends', ProductTrendsSchema);
export const UserSimilarity = mongoose.model('UserSimilarity', UserSimilaritySchema);
export const ProductAssociations = mongoose.model('ProductAssociations', ProductAssociationsSchema);
export const LocationProductStats = mongoose.model('LocationProductStats', LocationProductStatsSchema);