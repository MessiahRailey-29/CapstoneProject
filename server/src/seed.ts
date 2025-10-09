// server/src/seed.ts
import dotenv from 'dotenv';
import { connectDB } from './db';
import { Product, Price } from './models';

dotenv.config();

const products = [
  { id: 1, name: 'Coke 1.5L', category: 'Beverages' },
  { id: 2, name: 'Bear Brand Powdered Milk 320g', category: 'Dairy' },
  { id: 3, name: 'Lucky Me Pancit Canton', category: 'Instant Noodles' },
  { id: 4, name: 'Century Tuna 180g', category: 'Canned Goods' },
  { id: 5, name: 'Nescafe Classic 50g', category: 'Coffee' },
  { id: 6, name: 'Royal Banana (1 kg)', category: 'Fruits' },
  { id: 7, name: 'White Onion (1 kg)', category: 'Vegetables' },
  { id: 8, name: 'Chicken Breast (1 kg)', category: 'Meat' },
  { id: 9, name: 'Gardenia Classic White Bread', category: 'Bread' },
  { id: 10, name: 'Surf Powder Detergent 1kg', category: 'Household' }
];

const prices = [
  { id: 1, product_id: 1, store: 'SM Supermarket', price: 75.00 },
  { id: 2, product_id: 1, store: 'Puregold', price: 73.00 },
  { id: 3, product_id: 1, store: "Robinson's Supermarket", price: 76.50 },
  { id: 4, product_id: 2, store: 'SM Supermarket', price: 110.00 },
  { id: 5, product_id: 2, store: 'Puregold', price: 108.50 },
  { id: 6, product_id: 2, store: 'Mercury Drug', price: 112.00 },
  { id: 7, product_id: 3, store: 'SM Supermarket', price: 15.00 },
  { id: 8, product_id: 3, store: 'Puregold', price: 14.50 },
  { id: 9, product_id: 3, store: '7-Eleven', price: 16.00 },
  { id: 10, product_id: 4, store: 'SM Supermarket', price: 89.00 },
  { id: 11, product_id: 4, store: 'Puregold', price: 87.50 },
  { id: 12, product_id: 4, store: "Robinson's Supermarket", price: 90.00 },
  { id: 13, product_id: 5, store: 'SM Supermarket', price: 95.00 },
  { id: 14, product_id: 5, store: 'Puregold', price: 93.00 },
  { id: 15, product_id: 5, store: 'Mercury Drug', price: 97.00 },
  { id: 16, product_id: 6, store: 'SM Supermarket', price: 85.00 },
  { id: 17, product_id: 6, store: 'Puregold', price: 80.00 },
  { id: 18, product_id: 6, store: 'Palengke', price: 75.00 },
  { id: 19, product_id: 7, store: 'SM Supermarket', price: 120.00 },
  { id: 20, product_id: 7, store: 'Puregold', price: 115.00 },
  { id: 21, product_id: 7, store: 'Palengke', price: 100.00 },
  { id: 22, product_id: 8, store: 'SM Supermarket', price: 280.00 },
  { id: 23, product_id: 8, store: 'Puregold', price: 275.00 },
  { id: 24, product_id: 8, store: 'Palengke', price: 260.00 },
  { id: 25, product_id: 9, store: 'SM Supermarket', price: 52.00 },
  { id: 26, product_id: 9, store: 'Puregold', price: 51.50 },
  { id: 27, product_id: 9, store: '7-Eleven', price: 54.00 },
  { id: 28, product_id: 10, store: 'SM Supermarket', price: 185.00 },
  { id: 29, product_id: 10, store: 'Puregold', price: 180.00 },
  { id: 30, product_id: 10, store: "Robinson's Supermarket", price: 188.00 }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set');
    }

    await connectDB(mongoUri);

    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Price.deleteMany({});

    console.log('📦 Inserting products...');
    await Product.insertMany(products);
    console.log(`✅ Inserted ${products.length} products`);

    console.log('💰 Inserting prices...');
    await Price.insertMany(prices);
    console.log(`✅ Inserted ${prices.length} prices`);

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();