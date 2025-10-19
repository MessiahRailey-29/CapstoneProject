// server/src/seedML.ts
import dotenv from 'dotenv';
import { connectDB } from './db';
import { ProductSeasonality, LocationProductStats } from './models/ml';

dotenv.config();

const seasonalityData = [
  { productId: 2, season: 'dry_cool', seasonalityScore: 0.8 },
  { productId: 5, season: 'dry_cool', seasonalityScore: 0.9 },
  { productId: 9, season: 'dry_cool', seasonalityScore: 0.7 },
  { productId: 1, season: 'dry_hot', seasonalityScore: 0.95 },
  { productId: 6, season: 'dry_hot', seasonalityScore: 0.85 },
  { productId: 7, season: 'dry_hot', seasonalityScore: 0.7 },
  { productId: 3, season: 'wet', seasonalityScore: 0.9 },
  { productId: 4, season: 'wet', seasonalityScore: 0.8 },
  { productId: 8, season: 'wet', seasonalityScore: 0.75 },
  { productId: 10, season: 'wet', seasonalityScore: 0.7 },
  { productId: 1, season: 'all-year', seasonalityScore: 0.9 },
  { productId: 2, season: 'all-year', seasonalityScore: 0.85 },
  { productId: 3, season: 'all-year', seasonalityScore: 0.9 },
  { productId: 4, season: 'all-year', seasonalityScore: 0.8 },
  { productId: 5, season: 'all-year', seasonalityScore: 0.85 },
  { productId: 6, season: 'all-year', seasonalityScore: 0.8 },
  { productId: 7, season: 'all-year', seasonalityScore: 0.75 },
  { productId: 8, season: 'all-year', seasonalityScore: 0.9 },
  { productId: 9, season: 'all-year', seasonalityScore: 0.95 },
  { productId: 10, season: 'all-year', seasonalityScore: 0.7 },
];

const locationStats = [
  { location: 'Tunasan, Calabarzon, PH', productId: 1, purchaseCount: 150, uniqueUsers: 45, avgPrice: 74.5 },
  { location: 'Tunasan, Calabarzon, PH', productId: 2, purchaseCount: 120, uniqueUsers: 38, avgPrice: 109.5 },
  { location: 'Tunasan, Calabarzon, PH', productId: 3, purchaseCount: 200, uniqueUsers: 65, avgPrice: 15.0 },
  { location: 'Tunasan, Calabarzon, PH', productId: 4, purchaseCount: 95, uniqueUsers: 32, avgPrice: 88.5 },
  { location: 'Tunasan, Calabarzon, PH', productId: 5, purchaseCount: 110, uniqueUsers: 35, avgPrice: 94.5 },
  { location: 'Tunasan, Calabarzon, PH', productId: 6, purchaseCount: 85, uniqueUsers: 28, avgPrice: 80.0 },
  { location: 'Tunasan, Calabarzon, PH', productId: 7, purchaseCount: 75, uniqueUsers: 25, avgPrice: 112.0 },
  { location: 'Tunasan, Calabarzon, PH', productId: 8, purchaseCount: 130, uniqueUsers: 42, avgPrice: 272.0 },
  { location: 'Tunasan, Calabarzon, PH', productId: 9, purchaseCount: 180, uniqueUsers: 55, avgPrice: 52.0 },
  { location: 'Tunasan, Calabarzon, PH', productId: 10, purchaseCount: 70, uniqueUsers: 22, avgPrice: 182.0 },
];

async function seedMLData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set');
    }

    await connectDB(mongoUri);

    console.log('🗑️  Clearing existing ML data...');
    await ProductSeasonality.deleteMany({});
    await LocationProductStats.deleteMany({});

    console.log('🌦️  Inserting seasonality data...');
    await ProductSeasonality.insertMany(seasonalityData);
    console.log(`✅ Inserted ${seasonalityData.length} seasonality records`);

    console.log('📍 Inserting location stats...');
    const statsWithTimestamp = locationStats.map((stat) => ({
      ...stat,
      lastUpdated: new Date(),
    }));
    await LocationProductStats.insertMany(statsWithTimestamp);
    console.log(`✅ Inserted ${locationStats.length} location stats`);

    console.log('\n🎉 ML data seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ ML data seed failed:', error);
    process.exit(1);
  }
}

seedMLData();