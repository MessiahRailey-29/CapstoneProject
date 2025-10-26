// server/src/generateTestData.ts
import dotenv from 'dotenv';
import { connectDB } from './db';
import { PurchaseHistory, UserProfile } from './models/ml';

dotenv.config();

async function generateTestData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set');
    }

    await connectDB(mongoUri);

    console.log('🎲 Generating test purchase data for Batangas...');

    const testUsers = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'];
    
    // Batangas city locations for realistic distribution
    const batangasLocations = [
      'Batangas City, Batangas, PH',
      'Batangas City, Batangas, PH', // More users in capital
      'Lipa City, Batangas, PH',
      'Tanauan City, Batangas, PH',
      'Santo Tomas, Batangas, PH',
    ];

    // Stores matching each location
    const storesByLocation: Record<string, string[]> = {
      'Batangas City, Batangas, PH': [
        'SM City Batangas',
        'Puregold - Batangas City',
        "Robinson's Place Batangas",
        'Metro Gaisano Batangas',
        'Batangas City Public Market'
      ],
      'Lipa City, Batangas, PH': [
        'SM City Lipa',
        "Robinson's Place Lipa",
        'Puregold Lipa',
        'WalterMart Lipa'
      ],
      'Tanauan City, Batangas, PH': [
        'Puregold Tanauan',
        'Citi Mall Tanauan'
      ],
      'Santo Tomas, Batangas, PH': [
        'WalterMart Santo Tomas'
      ],
    };

    // Create user profiles with Batangas locations
    console.log('👥 Creating user profiles...');
    for (let i = 0; i < testUsers.length; i++) {
      const userId = testUsers[i];
      const location = batangasLocations[i];
      
      await UserProfile.findOneAndUpdate(
        { userId },
        {
          userId,
          location,
          preferences: {
            favoriteCategories: ['Beverages', 'Instant Noodles', 'Dairy'],
            budgetRange: { min: 0, max: 5000 },
            preferredStores: storesByLocation[location]?.slice(0, 2) || [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { upsert: true }
      );
      console.log(`   ✓ ${userId} - ${location}`);
    }

    console.log(`✅ Created ${testUsers.length} user profiles across Batangas`);

    // Generate random purchases over the last 30 days
    console.log('🛒 Generating purchase history...');
    const productIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const prices: { [key: number]: number } = {
      1: 75,
      2: 110,
      3: 15,
      4: 89,
      5: 95,
      6: 85,
      7: 120,
      8: 280,
      9: 52,
      10: 185,
    };

    let purchaseCount = 0;

    for (let i = 0; i < 150; i++) {
      const userIndex = Math.floor(Math.random() * testUsers.length);
      const userId = testUsers[userIndex];
      const location = batangasLocations[userIndex];
      const stores = storesByLocation[location] || ['SM City Batangas'];
      
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const store = stores[Math.floor(Math.random() * stores.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const basePrice = prices[productId] || 100;
      const priceVariation = basePrice * (0.9 + Math.random() * 0.2); // ±10% variation

      await PurchaseHistory.create({
        userId,
        productId,
        listId: `list_${i}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        store,
        price: Math.round(priceVariation * 100) / 100,
        location,
        timestamp,
      });

      purchaseCount++;
    }

    console.log(`✅ Generated ${purchaseCount} test purchases`);

    // Show summary
    console.log('\n📊 Data Summary:');
    for (let i = 0; i < testUsers.length; i++) {
      const userId = testUsers[i];
      const location = batangasLocations[i];
      const count = await PurchaseHistory.countDocuments({ userId });
      console.log(`   ${userId} (${location}): ${count} purchases`);
    }

    // Show location distribution
    console.log('\n📍 Location Distribution:');
    const uniqueLocations = [...new Set(batangasLocations)];
    for (const loc of uniqueLocations) {
      const count = await PurchaseHistory.countDocuments({ location: loc });
      console.log(`   ${loc}: ${count} purchases`);
    }

    console.log('\n🎉 Test data generation complete for Batangas!');
    console.log('\nNow you can test recommendations:');
    console.log('  curl "http://localhost:3000/api/recommendations?userId=user_1&limit=10"');
    console.log('  curl "http://localhost:3000/api/recommendations?userId=user_3&limit=10"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test data generation failed:', error);
    process.exit(1);
  }
}

generateTestData();