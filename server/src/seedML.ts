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

// Enhanced location stats for Batangas cities
const locationStats = [
  // Batangas City
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 1, purchaseCount: 150, uniqueUsers: 45, avgPrice: 74.5, popularStores: ['SM City Batangas', 'Puregold'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 2, purchaseCount: 120, uniqueUsers: 38, avgPrice: 109.5, popularStores: ['Robinson\'s Place', 'SM City Batangas'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 3, purchaseCount: 200, uniqueUsers: 65, avgPrice: 15.0, popularStores: ['Palengke', 'Puregold'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 4, purchaseCount: 95, uniqueUsers: 32, avgPrice: 88.5, popularStores: ['SM City Batangas', 'Metro Gaisano'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 5, purchaseCount: 110, uniqueUsers: 35, avgPrice: 94.5, popularStores: ['Robinson\'s Place', 'SM City Batangas'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 6, purchaseCount: 85, uniqueUsers: 28, avgPrice: 80.0, popularStores: ['Puregold', 'Metro Gaisano'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 7, purchaseCount: 75, uniqueUsers: 25, avgPrice: 112.0, popularStores: ['SM City Batangas'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 8, purchaseCount: 130, uniqueUsers: 42, avgPrice: 272.0, popularStores: ['Palengke', 'Robinson\'s Place'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 9, purchaseCount: 180, uniqueUsers: 55, avgPrice: 52.0, popularStores: ['Puregold', 'SM City Batangas'] },
  { location: 'Batangas City, Batangas, PH', city: 'Batangas City', productId: 10, purchaseCount: 70, uniqueUsers: 22, avgPrice: 182.0, popularStores: ['Robinson\'s Place'] },

  // Lipa City
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 1, purchaseCount: 140, uniqueUsers: 42, avgPrice: 75.0, popularStores: ['SM City Lipa', 'Robinson\'s Place Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 2, purchaseCount: 115, uniqueUsers: 36, avgPrice: 110.0, popularStores: ['Robinson\'s Place Lipa', 'Puregold Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 3, purchaseCount: 190, uniqueUsers: 62, avgPrice: 14.5, popularStores: ['Puregold Lipa', 'WalterMart Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 4, purchaseCount: 90, uniqueUsers: 30, avgPrice: 89.0, popularStores: ['SM City Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 5, purchaseCount: 105, uniqueUsers: 33, avgPrice: 95.0, popularStores: ['Robinson\'s Place Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 6, purchaseCount: 80, uniqueUsers: 26, avgPrice: 81.0, popularStores: ['Puregold Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 7, purchaseCount: 72, uniqueUsers: 24, avgPrice: 115.0, popularStores: ['SM City Lipa', 'Robinson\'s Place Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 8, purchaseCount: 125, uniqueUsers: 40, avgPrice: 275.0, popularStores: ['Robinson\'s Place Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 9, purchaseCount: 175, uniqueUsers: 53, avgPrice: 51.5, popularStores: ['Puregold Lipa', 'SM City Lipa'] },
  { location: 'Lipa City, Batangas, PH', city: 'Lipa City', productId: 10, purchaseCount: 68, uniqueUsers: 21, avgPrice: 185.0, popularStores: ['Robinson\'s Place Lipa'] },

  // Tanauan City
  { location: 'Tanauan City, Batangas, PH', city: 'Tanauan City', productId: 1, purchaseCount: 95, uniqueUsers: 28, avgPrice: 76.0, popularStores: ['Puregold Tanauan', 'Citi Mall Tanauan'] },
  { location: 'Tanauan City, Batangas, PH', city: 'Tanauan City', productId: 2, purchaseCount: 80, uniqueUsers: 25, avgPrice: 111.0, popularStores: ['Citi Mall Tanauan'] },
  { location: 'Tanauan City, Batangas, PH', city: 'Tanauan City', productId: 3, purchaseCount: 135, uniqueUsers: 42, avgPrice: 15.5, popularStores: ['Puregold Tanauan'] },
  { location: 'Tanauan City, Batangas, PH', city: 'Tanauan City', productId: 4, purchaseCount: 62, uniqueUsers: 20, avgPrice: 90.0, popularStores: ['Citi Mall Tanauan'] },
  { location: 'Tanauan City, Batangas, PH', city: 'Tanauan City', productId: 5, purchaseCount: 75, uniqueUsers: 23, avgPrice: 96.0, popularStores: ['Puregold Tanauan'] },

  // Santo Tomas
  { location: 'Santo Tomas, Batangas, PH', city: 'Santo Tomas', productId: 1, purchaseCount: 70, uniqueUsers: 22, avgPrice: 74.0, popularStores: ['WalterMart Santo Tomas'] },
  { location: 'Santo Tomas, Batangas, PH', city: 'Santo Tomas', productId: 3, purchaseCount: 100, uniqueUsers: 32, avgPrice: 14.0, popularStores: ['WalterMart Santo Tomas'] },
  { location: 'Santo Tomas, Batangas, PH', city: 'Santo Tomas', productId: 9, purchaseCount: 85, uniqueUsers: 27, avgPrice: 50.0, popularStores: ['WalterMart Santo Tomas'] },

  // Calaca
  { location: 'Calaca, Batangas, PH', city: 'Calaca', productId: 1, purchaseCount: 55, uniqueUsers: 18, avgPrice: 73.0, popularStores: ['Puregold Calaca'] },
  { location: 'Calaca, Batangas, PH', city: 'Calaca', productId: 3, purchaseCount: 88, uniqueUsers: 28, avgPrice: 14.5, popularStores: ['Puregold Calaca'] },
  
  // Lemery
  { location: 'Lemery, Batangas, PH', city: 'Lemery', productId: 1, purchaseCount: 60, uniqueUsers: 19, avgPrice: 75.5, popularStores: ['Puregold Lemery'] },
  { location: 'Lemery, Batangas, PH', city: 'Lemery', productId: 3, purchaseCount: 92, uniqueUsers: 30, avgPrice: 15.0, popularStores: ['Puregold Lemery'] },
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

    console.log('📍 Inserting Batangas location stats...');
    const statsWithTimestamp = locationStats.map((stat) => ({
      ...stat,
      lastUpdated: new Date(),
    }));
    await LocationProductStats.insertMany(statsWithTimestamp);
    console.log(`✅ Inserted ${locationStats.length} location stats across Batangas cities`);

    // Show summary by city
    const cities = [...new Set(locationStats.map(s => s.city))];
    console.log('\n📊 Location Coverage:');
    for (const city of cities) {
      const count = locationStats.filter(s => s.city === city).length;
      console.log(`   ${city}: ${count} product stats`);
    }

    console.log('\n🎉 ML data seed completed successfully for Batangas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ ML data seed failed:', error);
    process.exit(1);
  }
}

seedMLData();