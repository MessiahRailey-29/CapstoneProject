// server/src/seed.ts
import dotenv from 'dotenv';
import { connectDB } from './db';
import { Product, Price } from './models';

dotenv.config();

const products = [
  // ========== BEVERAGES ==========
  { id: 1, name: 'Coke 1.5L', category: 'Beverages' },
  { id: 2, name: 'Sprite 1.5L', category: 'Beverages' },
  { id: 3, name: 'Royal True Orange 1.5L', category: 'Beverages' },
  { id: 4, name: 'Pepsi 1.5L', category: 'Beverages' },
  { id: 5, name: 'Mountain Dew 1.5L', category: 'Beverages' },
  { id: 6, name: 'C2 Green Tea Apple 1L', category: 'Beverages' },
  { id: 7, name: 'Zesto Orange 200ml (pack of 10)', category: 'Beverages' },
  { id: 8, name: 'Del Monte Pineapple Juice 1L', category: 'Beverages' },
  { id: 9, name: 'Minute Maid Orange Juice 1L', category: 'Beverages' },
  { id: 10, name: 'Gatorade Blue Bolt 500ml', category: 'Beverages' },
  { id: 11, name: 'Summit Mineral Water 1L', category: 'Beverages' },
  { id: 12, name: 'Wilkins Distilled Water 1L', category: 'Beverages' },

  // ========== DAIRY ==========
  { id: 13, name: 'Bear Brand Powdered Milk 320g', category: 'Dairy' },
  { id: 14, name: 'Alaska Evaporated Milk 370ml', category: 'Dairy' },
  { id: 15, name: 'Nestle Fresh Milk 1L', category: 'Dairy' },
  { id: 16, name: 'Anchor Full Cream Milk Powder 900g', category: 'Dairy' },
  { id: 17, name: 'Magnolia Fresh Milk 1L', category: 'Dairy' },
  { id: 18, name: 'Birch Tree Fortified Powdered Milk 550g', category: 'Dairy' },
  { id: 19, name: 'Nestle All Purpose Cream 250ml', category: 'Dairy' },
  { id: 20, name: 'Magnolia Butter 200g', category: 'Dairy' },
  { id: 21, name: 'Eden Cheese 165g', category: 'Dairy' },
  { id: 22, name: 'Arla Cream Cheese 150g', category: 'Dairy' },
  { id: 23, name: 'Nestle Yogurt Strawberry 80g (pack of 4)', category: 'Dairy' },
  { id: 24, name: 'Selecta Ice Cream Ube 1.3L', category: 'Dairy' },

  // ========== INSTANT NOODLES ==========
  { id: 25, name: 'Lucky Me Pancit Canton Original', category: 'Instant Noodles' },
  { id: 26, name: 'Lucky Me Pancit Canton Chilimansi', category: 'Instant Noodles' },
  { id: 27, name: 'Lucky Me La Paz Batchoy', category: 'Instant Noodles' },
  { id: 28, name: 'Nissin Cup Noodles Seafood 60g', category: 'Instant Noodles' },
  { id: 29, name: 'Payless Instant Pancit Canton', category: 'Instant Noodles' },
  { id: 30, name: 'Quickchow Instant Mami Beef', category: 'Instant Noodles' },

  // ========== CANNED GOODS ==========
  { id: 31, name: 'Century Tuna Flakes in Oil 180g', category: 'Canned Goods' },
  { id: 32, name: 'Argentina Corned Beef 175g', category: 'Canned Goods' },
  { id: 33, name: 'Ligo Sardines in Tomato Sauce 155g', category: 'Canned Goods' },
  { id: 34, name: '555 Tuna Sardines 155g', category: 'Canned Goods' },
  { id: 35, name: 'Mega Sardines Green 155g', category: 'Canned Goods' },
  { id: 36, name: 'CDO Liver Spread 85g', category: 'Canned Goods' },
  { id: 37, name: 'Reno Liver Spread 85g', category: 'Canned Goods' },
  { id: 38, name: 'Del Monte Spaghetti Sauce Filipino Style 500g', category: 'Canned Goods' },
  { id: 39, name: 'Hunt\'s Pork & Beans 230g', category: 'Canned Goods' },
  { id: 40, name: 'Del Monte Pineapple Chunks 227g', category: 'Canned Goods' },
  { id: 41, name: 'Spam Classic 340g', category: 'Canned Goods' },
  { id: 42, name: 'Maling Premium Luncheon Meat 340g', category: 'Canned Goods' },

  // ========== COFFEE ==========
  { id: 43, name: 'Nescafe Classic 50g', category: 'Coffee' },
  { id: 44, name: 'Nescafe 3-in-1 Original 30s', category: 'Coffee' },
  { id: 45, name: 'Great Taste White 3-in-1 30s', category: 'Coffee' },
  { id: 46, name: 'Kopiko Brown Coffee 30s', category: 'Coffee' },
  { id: 47, name: 'San Mig Coffee Barako 10g (10s)', category: 'Coffee' },
  { id: 48, name: 'Milo Powder 300g', category: 'Coffee' },

  // ========== RICE & GRAINS ==========
  { id: 49, name: 'Sinandomeng Rice (1 kg)', category: 'Rice & Grains' },
  { id: 50, name: 'Jasmine Rice (1 kg)', category: 'Rice & Grains' },
  { id: 51, name: 'Dinorado Rice (1 kg)', category: 'Rice & Grains' },
  { id: 52, name: 'Brown Rice (1 kg)', category: 'Rice & Grains' },
  { id: 53, name: 'Malagkit Rice (1 kg)', category: 'Rice & Grains' },

  // ========== FRUITS ==========
  { id: 54, name: 'Royal Banana (1 kg)', category: 'Fruits' },
  { id: 55, name: 'Latundan Banana (1 kg)', category: 'Fruits' },
  { id: 56, name: 'Cavendish Banana (1 kg)', category: 'Fruits' },
  { id: 57, name: 'Mango Manila (1 kg)', category: 'Fruits' },
  { id: 58, name: 'Papaya (1 kg)', category: 'Fruits' },
  { id: 59, name: 'Pineapple Queen (per pc)', category: 'Fruits' },
  { id: 60, name: 'Watermelon (1 kg)', category: 'Fruits' },
  { id: 61, name: 'Apple Fuji (1 kg)', category: 'Fruits' },
  { id: 62, name: 'Orange Imported (1 kg)', category: 'Fruits' },
  { id: 63, name: 'Grapes Red (1 kg)', category: 'Fruits' },
  { id: 64, name: 'Calamansi (1 kg)', category: 'Fruits' },
  { id: 65, name: 'Coconut (per pc)', category: 'Fruits' },

  // ========== VEGETABLES ==========
  { id: 66, name: 'White Onion (1 kg)', category: 'Vegetables' },
  { id: 67, name: 'Red Onion (1 kg)', category: 'Vegetables' },
  { id: 68, name: 'Garlic Native (1 kg)', category: 'Vegetables' },
  { id: 69, name: 'Tomato (1 kg)', category: 'Vegetables' },
  { id: 70, name: 'Potato (1 kg)', category: 'Vegetables' },
  { id: 71, name: 'Carrots (1 kg)', category: 'Vegetables' },
  { id: 72, name: 'Cabbage (1 kg)', category: 'Vegetables' },
  { id: 73, name: 'Lettuce (per head)', category: 'Vegetables' },
  { id: 74, name: 'Cucumber (1 kg)', category: 'Vegetables' },
  { id: 75, name: 'Eggplant (1 kg)', category: 'Vegetables' },
  { id: 76, name: 'Squash (1 kg)', category: 'Vegetables' },
  { id: 77, name: 'Sitaw/String Beans (1 kg)', category: 'Vegetables' },
  { id: 78, name: 'Kangkong (1 bundle)', category: 'Vegetables' },
  { id: 79, name: 'Pechay (1 bundle)', category: 'Vegetables' },
  { id: 80, name: 'Malunggay (1 bundle)', category: 'Vegetables' },
  { id: 81, name: 'Ampalaya/Bitter Gourd (1 kg)', category: 'Vegetables' },
  { id: 82, name: 'Bell Pepper (1 kg)', category: 'Vegetables' },
  { id: 83, name: 'Ginger (1 kg)', category: 'Vegetables' },
  { id: 84, name: 'Green Chili (1 kg)', category: 'Vegetables' },

  // ========== MEAT ==========
  { id: 85, name: 'Chicken Breast (1 kg)', category: 'Meat' },
  { id: 86, name: 'Chicken Drumsticks (1 kg)', category: 'Meat' },
  { id: 87, name: 'Chicken Wings (1 kg)', category: 'Meat' },
  { id: 88, name: 'Chicken Whole (1 kg)', category: 'Meat' },
  { id: 89, name: 'Pork Belly Liempo (1 kg)', category: 'Meat' },
  { id: 90, name: 'Pork Kasim (1 kg)', category: 'Meat' },
  { id: 91, name: 'Pork Chop (1 kg)', category: 'Meat' },
  { id: 92, name: 'Ground Pork (1 kg)', category: 'Meat' },
  { id: 93, name: 'Beef Steak Meat (1 kg)', category: 'Meat' },
  { id: 94, name: 'Ground Beef (1 kg)', category: 'Meat' },
  { id: 95, name: 'Hotdog Purefoods Tender Juicy 1kg', category: 'Meat' },
  { id: 96, name: 'Bacon CDO 200g', category: 'Meat' },

  // ========== FISH & SEAFOOD ==========
  { id: 97, name: 'Bangus/Milkfish (1 kg)', category: 'Fish & Seafood' },
  { id: 98, name: 'Tilapia (1 kg)', category: 'Fish & Seafood' },
  { id: 99, name: 'Galunggong (1 kg)', category: 'Fish & Seafood' },
  { id: 100, name: 'Squid (1 kg)', category: 'Fish & Seafood' },
  { id: 101, name: 'Shrimp Medium (1 kg)', category: 'Fish & Seafood' },
  { id: 102, name: 'Blue Marlin Steak (1 kg)', category: 'Fish & Seafood' },
  { id: 103, name: 'Talakitok (1 kg)', category: 'Fish & Seafood' },

  // ========== EGGS ==========
  { id: 104, name: 'Medium Eggs (1 tray)', category: 'Eggs' },
  { id: 105, name: 'Large Eggs (1 tray)', category: 'Eggs' },
  { id: 106, name: 'Extra Large Eggs (1 tray)', category: 'Eggs' },
  { id: 107, name: 'Quail Eggs (per dozen)', category: 'Eggs' },
  { id: 108, name: 'Salted Eggs (per dozen)', category: 'Eggs' },

  // ========== BREAD & BAKERY ==========
  { id: 109, name: 'Gardenia Classic White Bread', category: 'Bread & Bakery' },
  { id: 110, name: 'Gardenia Wheat Bread', category: 'Bread & Bakery' },
  { id: 111, name: 'Tasty Bread', category: 'Bread & Bakery' },
  { id: 112, name: 'Pan de Sal (10 pcs)', category: 'Bread & Bakery' },
  { id: 113, name: 'Ensaymada (per pc)', category: 'Bread & Bakery' },
  { id: 114, name: 'Spanish Bread (per pc)', category: 'Bread & Bakery' },
  { id: 115, name: 'Monay (per pc)', category: 'Bread & Bakery' },

  // ========== CONDIMENTS & SAUCES ==========
  { id: 116, name: 'UFC Banana Catsup 320g', category: 'Condiments & Sauces' },
  { id: 117, name: 'Papa Banana Catsup 320g', category: 'Condiments & Sauces' },
  { id: 118, name: 'Datu Puti Soy Sauce 385ml', category: 'Condiments & Sauces' },
  { id: 119, name: 'Silver Swan Soy Sauce 385ml', category: 'Condiments & Sauces' },
  { id: 120, name: 'Datu Puti Vinegar 385ml', category: 'Condiments & Sauces' },
  { id: 121, name: 'UFC Vinegar 385ml', category: 'Condiments & Sauces' },
  { id: 122, name: 'Mama Sita\'s Oyster Sauce 405g', category: 'Condiments & Sauces' },
  { id: 123, name: 'Knorr Liquid Seasoning 250ml', category: 'Condiments & Sauces' },
  { id: 124, name: 'Maggi Magic Sarap 50g', category: 'Condiments & Sauces' },
  { id: 125, name: 'Ajinomoto Umami Seasoning 100g', category: 'Condiments & Sauces' },
  { id: 126, name: 'Iodized Salt 1kg', category: 'Condiments & Sauces' },
  { id: 127, name: 'Black Pepper Ground 50g', category: 'Condiments & Sauces' },
  { id: 128, name: 'UFC Gravy Mix 25g', category: 'Condiments & Sauces' },
  { id: 129, name: 'McCormick BBQ Marinade Mix 40g', category: 'Condiments & Sauces' },

  // ========== COOKING OIL ==========
  { id: 130, name: 'Baguio Vegetable Oil 1L', category: 'Cooking Oil' },
  { id: 131, name: 'Minola Premium Cooking Oil 1L', category: 'Cooking Oil' },
  { id: 132, name: 'Golden Fiesta Palm Oil 1L', category: 'Cooking Oil' },
  { id: 133, name: 'Olive Oil Extra Virgin 500ml', category: 'Cooking Oil' },

  // ========== PASTA ==========
  { id: 134, name: 'Royal Spaghetti Pasta 900g', category: 'Pasta' },
  { id: 135, name: 'Royal Elbow Macaroni 400g', category: 'Pasta' },
  { id: 136, name: 'San Remo Penne 500g', category: 'Pasta' },

  // ========== SNACKS ==========
  { id: 137, name: 'Jack n Jill Piattos Cheese 85g', category: 'Snacks' },
  { id: 138, name: 'Oishi Prawn Crackers 90g', category: 'Snacks' },
  { id: 139, name: 'Nova Multigrain Chips 78g', category: 'Snacks' },
  { id: 140, name: 'Chippy BBQ 110g', category: 'Snacks' },
  { id: 141, name: 'Boy Bawang Cornick Adobo 100g', category: 'Snacks' },
  { id: 142, name: 'Skyflakes Crackers 250g', category: 'Snacks' },
  { id: 143, name: 'Fita Crackers 300g', category: 'Snacks' },
  { id: 144, name: 'M.Y. San Grahams 200g', category: 'Snacks' },
  { id: 145, name: 'Oreo Cookies 137g', category: 'Snacks' },
  { id: 146, name: 'Cream-O Cookies 132g', category: 'Snacks' },
  { id: 147, name: 'Rebisco Crackers 250g', category: 'Snacks' },

  // ========== CANDY & SWEETS ==========
  { id: 148, name: 'Storck Knoppers 25g (pack of 8)', category: 'Candy & Sweets' },
  { id: 149, name: 'White Rabbit Candy 227g', category: 'Candy & Sweets' },
  { id: 150, name: 'Hany Candy (per pack)', category: 'Candy & Sweets' },
  { id: 151, name: 'Choc Nut (per pack)', category: 'Candy & Sweets' },

  // ========== HOUSEHOLD ITEMS ==========
  { id: 152, name: 'Surf Powder Detergent 1kg', category: 'Household' },
  { id: 153, name: 'Tide Powder Detergent 1kg', category: 'Household' },
  { id: 154, name: 'Ariel Powder Detergent 1kg', category: 'Household' },
  { id: 155, name: 'Downy Fabric Conditioner 1L', category: 'Household' },
  { id: 156, name: 'Zonrox Bleach 1L', category: 'Household' },
  { id: 157, name: 'Joy Dishwashing Liquid 485ml', category: 'Household' },
  { id: 158, name: 'Domex Toilet Bowl Cleaner 500ml', category: 'Household' },
  { id: 159, name: 'Lysol Disinfectant Spray 400ml', category: 'Household' },
  { id: 160, name: 'Baygon Multi-Insect Killer 600ml', category: 'Household' },
  { id: 161, name: 'Kris Trash Bags Large (10s)', category: 'Household' },

  // ========== PERSONAL CARE ==========
  { id: 162, name: 'Safeguard Bar Soap 135g', category: 'Personal Care' },
  { id: 163, name: 'Palmolive Naturals Bar Soap 115g', category: 'Personal Care' },
  { id: 164, name: 'Colgate Toothpaste 150g', category: 'Personal Care' },
  { id: 165, name: 'Close-Up Toothpaste 160g', category: 'Personal Care' },
  { id: 166, name: 'Oral-B Toothbrush', category: 'Personal Care' },
  { id: 167, name: 'Head & Shoulders Shampoo 340ml', category: 'Personal Care' },
  { id: 168, name: 'Palmolive Shampoo 340ml', category: 'Personal Care' },
  { id: 169, name: 'Cream Silk Conditioner 340ml', category: 'Personal Care' },
  { id: 170, name: 'Modess Napkin Ultra Thin 8s', category: 'Personal Care' },
  { id: 171, name: 'Whisper Napkin Wings 8s', category: 'Personal Care' },
  { id: 172, name: 'Johnson\'s Baby Powder 200g', category: 'Personal Care' },
  { id: 173, name: 'Rexona Deodorant Roll-on 40ml', category: 'Personal Care' },

  // ========== BABY PRODUCTS ==========
  { id: 174, name: 'EQ Diaper Dry Pants Small 14s', category: 'Baby Products' },
  { id: 175, name: 'Pampers Baby Dry Pants Medium 18s', category: 'Baby Products' },
  { id: 176, name: 'Johnson\'s Baby Shampoo 200ml', category: 'Baby Products' },
  { id: 177, name: 'Cerelac Wheat 120g', category: 'Baby Products' },
  { id: 178, name: 'Lactum 3+ 350g', category: 'Baby Products' },

  // ========== FROZEN GOODS ==========
  { id: 179, name: 'Magnolia Chicken Nuggets 200g', category: 'Frozen Goods' },
  { id: 180, name: 'Magnolia Chicken Fries 400g', category: 'Frozen Goods' },
  { id: 181, name: 'Purefoods Chicken Franks 1kg', category: 'Frozen Goods' },
  { id: 182, name: 'Crab Sticks 500g', category: 'Frozen Goods' },
  { id: 183, name: 'Fish Balls 500g', category: 'Frozen Goods' },
  { id: 184, name: 'Squid Balls 500g', category: 'Frozen Goods' },
];

const prices = [
  // ========== BEVERAGES (Products 1-12) ==========
  // Coke 1.5L
  { id: 1, product_id: 1, store: 'SM City Batangas', price: 75.00 },
  { id: 2, product_id: 1, store: 'Puregold - Batangas City', price: 73.00 },
  { id: 3, product_id: 1, store: "Robinson's Place Batangas", price: 76.50 },
  { id: 4, product_id: 1, store: 'SM City Lipa', price: 75.00 },
  { id: 5, product_id: 1, store: 'Puregold Lipa', price: 72.50 },
  { id: 6, product_id: 1, store: 'Batangas City Public Market', price: 70.00 },
  
  // Sprite 1.5L
  { id: 7, product_id: 2, store: 'SM City Batangas', price: 75.00 },
  { id: 8, product_id: 2, store: 'Puregold - Batangas City', price: 73.00 },
  { id: 9, product_id: 2, store: "Robinson's Place Batangas", price: 76.50 },
  
  // Royal True Orange 1.5L
  { id: 10, product_id: 3, store: 'SM City Batangas', price: 65.00 },
  { id: 11, product_id: 3, store: 'Puregold - Batangas City', price: 63.00 },
  { id: 12, product_id: 3, store: 'SM City Lipa', price: 65.00 },
  
  // Pepsi 1.5L
  { id: 13, product_id: 4, store: 'SM City Batangas', price: 74.00 },
  { id: 14, product_id: 4, store: 'Puregold - Batangas City', price: 72.00 },
  { id: 15, product_id: 4, store: "Robinson's Place Lipa", price: 75.50 },
  
  // Mountain Dew 1.5L
  { id: 16, product_id: 5, store: 'SM City Batangas', price: 74.00 },
  { id: 17, product_id: 5, store: 'Puregold Lipa', price: 72.00 },
  { id: 18, product_id: 5, store: 'WalterMart Lipa', price: 73.50 },
  
  // C2 Green Tea Apple 1L
  { id: 19, product_id: 6, store: 'SM City Batangas', price: 38.00 },
  { id: 20, product_id: 6, store: 'Puregold - Batangas City', price: 36.50 },
  { id: 21, product_id: 6, store: 'Puregold Lipa', price: 37.00 },
  
  // Zesto Orange 200ml
  { id: 22, product_id: 7, store: 'SM City Batangas', price: 85.00 },
  { id: 23, product_id: 7, store: 'Puregold - Batangas City', price: 82.00 },
  { id: 24, product_id: 7, store: 'SM City Lipa', price: 85.00 },
  
  // Del Monte Pineapple Juice 1L
  { id: 25, product_id: 8, store: 'SM City Batangas', price: 95.00 },
  { id: 26, product_id: 8, store: "Robinson's Place Batangas", price: 98.00 },
  { id: 27, product_id: 8, store: 'Puregold Lipa', price: 93.00 },
  
  // Minute Maid Orange Juice 1L
  { id: 28, product_id: 9, store: 'SM City Batangas', price: 125.00 },
  { id: 29, product_id: 9, store: "Robinson's Place Batangas", price: 128.00 },
  { id: 30, product_id: 9, store: 'SM City Lipa', price: 125.00 },
  
  // Gatorade Blue Bolt 500ml
  { id: 31, product_id: 10, store: 'SM City Batangas', price: 42.00 },
  { id: 32, product_id: 10, store: 'Puregold - Batangas City', price: 40.00 },
  { id: 33, product_id: 10, store: 'Puregold Lipa', price: 40.50 },
  
  // Summit Mineral Water 1L
  { id: 34, product_id: 11, store: 'SM City Batangas', price: 18.00 },
  { id: 35, product_id: 11, store: 'Puregold - Batangas City', price: 16.50 },
  { id: 36, product_id: 11, store: 'Puregold Lipa', price: 17.00 },
  
  // Wilkins Distilled Water 1L
  { id: 37, product_id: 12, store: 'SM City Batangas', price: 18.00 },
  { id: 38, product_id: 12, store: 'Puregold - Batangas City', price: 16.50 },
  { id: 39, product_id: 12, store: 'SM City Lipa', price: 18.00 },

  // ========== DAIRY (Products 13-24) ==========
  // Bear Brand Powdered Milk 320g
  { id: 40, product_id: 13, store: 'SM City Batangas', price: 110.00 },
  { id: 41, product_id: 13, store: 'Puregold - Batangas City', price: 108.50 },
  { id: 42, product_id: 13, store: "Robinson's Place Batangas", price: 112.00 },
  { id: 43, product_id: 13, store: 'SM City Lipa', price: 110.00 },
  { id: 44, product_id: 13, store: 'Puregold Lipa', price: 108.00 },
  
  // Alaska Evaporated Milk 370ml
  { id: 45, product_id: 14, store: 'SM City Batangas', price: 58.00 },
  { id: 46, product_id: 14, store: 'Puregold - Batangas City', price: 56.50 },
  { id: 47, product_id: 14, store: 'Puregold Lipa', price: 57.00 },
  
  // Nestle Fresh Milk 1L
  { id: 48, product_id: 15, store: 'SM City Batangas', price: 125.00 },
  { id: 49, product_id: 15, store: "Robinson's Place Batangas", price: 128.00 },
  { id: 50, product_id: 15, store: 'SM City Lipa', price: 125.00 },
  
  // Anchor Full Cream Milk Powder 900g
  { id: 51, product_id: 16, store: 'SM City Batangas', price: 550.00 },
  { id: 52, product_id: 16, store: "Robinson's Place Batangas", price: 565.00 },
  { id: 53, product_id: 16, store: 'SM City Lipa', price: 550.00 },
  
  // Magnolia Fresh Milk 1L
  { id: 54, product_id: 17, store: 'SM City Batangas', price: 118.00 },
  { id: 55, product_id: 17, store: 'Puregold - Batangas City', price: 115.00 },
  { id: 56, product_id: 17, store: 'SM City Lipa', price: 118.00 },
  
  // Birch Tree Fortified Powdered Milk 550g
  { id: 57, product_id: 18, store: 'SM City Batangas', price: 285.00 },
  { id: 58, product_id: 18, store: 'Puregold - Batangas City', price: 280.00 },
  { id: 59, product_id: 18, store: 'Puregold Lipa', price: 282.00 },
  
  // Nestle All Purpose Cream 250ml
  { id: 60, product_id: 19, store: 'SM City Batangas', price: 48.00 },
  { id: 61, product_id: 19, store: 'Puregold - Batangas City', price: 46.50 },
  { id: 62, product_id: 19, store: 'SM City Lipa', price: 48.00 },
  
  // Magnolia Butter 200g
  { id: 63, product_id: 20, store: 'SM City Batangas', price: 165.00 },
  { id: 64, product_id: 20, store: "Robinson's Place Batangas", price: 168.00 },
  { id: 65, product_id: 20, store: 'SM City Lipa', price: 165.00 },
  
  // Eden Cheese 165g
  { id: 66, product_id: 21, store: 'SM City Batangas', price: 85.00 },
  { id: 67, product_id: 21, store: 'Puregold - Batangas City', price: 83.00 },
  { id: 68, product_id: 21, store: 'Puregold Lipa', price: 84.00 },
  
  // Arla Cream Cheese 150g
  { id: 69, product_id: 22, store: 'SM City Batangas', price: 135.00 },
  { id: 70, product_id: 22, store: "Robinson's Place Batangas", price: 140.00 },
  { id: 71, product_id: 22, store: 'SM City Lipa', price: 135.00 },
  
  // Nestle Yogurt Strawberry 80g (4s)
  { id: 72, product_id: 23, store: 'SM City Batangas', price: 95.00 },
  { id: 73, product_id: 23, store: "Robinson's Place Batangas", price: 98.00 },
  { id: 74, product_id: 23, store: 'SM City Lipa', price: 95.00 },
  
  // Selecta Ice Cream Ube 1.3L
  { id: 75, product_id: 24, store: 'SM City Batangas', price: 285.00 },
  { id: 76, product_id: 24, store: "Robinson's Place Batangas", price: 290.00 },
  { id: 77, product_id: 24, store: 'SM City Lipa', price: 285.00 },

  // ========== INSTANT NOODLES (Products 25-30) ==========
  // Lucky Me Pancit Canton Original
  { id: 78, product_id: 25, store: 'SM City Batangas', price: 15.00 },
  { id: 79, product_id: 25, store: 'Puregold - Batangas City', price: 14.50 },
  { id: 80, product_id: 25, store: 'Puregold Lipa', price: 14.50 },
  { id: 81, product_id: 25, store: 'Batangas City Public Market', price: 13.50 },
  
  // Lucky Me Pancit Canton Chilimansi
  { id: 82, product_id: 26, store: 'SM City Batangas', price: 15.00 },
  { id: 83, product_id: 26, store: 'Puregold - Batangas City', price: 14.50 },
  { id: 84, product_id: 26, store: 'SM City Lipa', price: 15.00 },
  
  // Lucky Me La Paz Batchoy
  { id: 85, product_id: 27, store: 'SM City Batangas', price: 15.50 },
  { id: 86, product_id: 27, store: 'Puregold - Batangas City', price: 15.00 },
  { id: 87, product_id: 27, store: 'Puregold Lipa', price: 15.00 },
  
  // Nissin Cup Noodles Seafood 60g
  { id: 88, product_id: 28, store: 'SM City Batangas', price: 32.00 },
  { id: 89, product_id: 28, store: 'Puregold - Batangas City', price: 30.50 },
  { id: 90, product_id: 28, store: 'SM City Lipa', price: 32.00 },
  
  // Payless Instant Pancit Canton
  { id: 91, product_id: 29, store: 'Puregold - Batangas City', price: 12.00 },
  { id: 92, product_id: 29, store: 'Puregold Lipa', price: 11.50 },
  { id: 93, product_id: 29, store: 'Batangas City Public Market', price: 11.00 },
  
  // Quickchow Instant Mami Beef
  { id: 94, product_id: 30, store: 'SM City Batangas', price: 14.00 },
  { id: 95, product_id: 30, store: 'Puregold - Batangas City', price: 13.50 },
  { id: 96, product_id: 30, store: 'Puregold Lipa', price: 13.50 },

  // ========== CANNED GOODS (Products 31-42) ==========
  // Century Tuna Flakes in Oil 180g
  { id: 97, product_id: 31, store: 'SM City Batangas', price: 89.00 },
  { id: 98, product_id: 31, store: 'Puregold - Batangas City', price: 87.50 },
  { id: 99, product_id: 31, store: "Robinson's Place Batangas", price: 90.00 },
  { id: 100, product_id: 31, store: 'SM City Lipa', price: 89.00 },
  { id: 101, product_id: 31, store: 'Puregold Lipa', price: 87.00 },
  
  // Argentina Corned Beef 175g
  { id: 102, product_id: 32, store: 'SM City Batangas', price: 55.00 },
  { id: 103, product_id: 32, store: 'Puregold - Batangas City', price: 53.50 },
  { id: 104, product_id: 32, store: 'Puregold Lipa', price: 54.00 },
  
  // Ligo Sardines in Tomato Sauce 155g
  { id: 105, product_id: 33, store: 'SM City Batangas', price: 28.00 },
  { id: 106, product_id: 33, store: 'Puregold - Batangas City', price: 26.50 },
  { id: 107, product_id: 33, store: 'Puregold Lipa', price: 27.00 },
  
  // 555 Tuna Sardines 155g
  { id: 108, product_id: 34, store: 'SM City Batangas', price: 27.00 },
  { id: 109, product_id: 34, store: 'Puregold - Batangas City', price: 25.50 },
  { id: 110, product_id: 34, store: 'Puregold Lipa', price: 26.00 },
  
  // Mega Sardines Green 155g
  { id: 111, product_id: 35, store: 'SM City Batangas', price: 32.00 },
  { id: 112, product_id: 35, store: 'Puregold - Batangas City', price: 30.50 },
  { id: 113, product_id: 35, store: 'Puregold Lipa', price: 31.00 },
  
  // CDO Liver Spread 85g
  { id: 114, product_id: 36, store: 'SM City Batangas', price: 28.00 },
  { id: 115, product_id: 36, store: 'Puregold - Batangas City', price: 27.00 },
  { id: 116, product_id: 36, store: 'SM City Lipa', price: 28.00 },
  
  // Reno Liver Spread 85g
  { id: 117, product_id: 37, store: 'SM City Batangas', price: 26.00 },
  { id: 118, product_id: 37, store: 'Puregold - Batangas City', price: 25.00 },
  { id: 119, product_id: 37, store: 'Puregold Lipa', price: 25.50 },
  
  // Del Monte Spaghetti Sauce Filipino Style 500g
  { id: 120, product_id: 38, store: 'SM City Batangas', price: 78.00 },
  { id: 121, product_id: 38, store: 'Puregold - Batangas City', price: 76.00 },
  { id: 122, product_id: 38, store: 'SM City Lipa', price: 78.00 },
  
  // Hunt's Pork & Beans 230g
  { id: 123, product_id: 39, store: 'SM City Batangas', price: 42.00 },
  { id: 124, product_id: 39, store: 'Puregold - Batangas City', price: 40.50 },
  { id: 125, product_id: 39, store: 'Puregold Lipa', price: 41.00 },
  
  // Del Monte Pineapple Chunks 227g
  { id: 126, product_id: 40, store: 'SM City Batangas', price: 58.00 },
  { id: 127, product_id: 40, store: 'Puregold - Batangas City', price: 56.50 },
  { id: 128, product_id: 40, store: 'SM City Lipa', price: 58.00 },
  
  // Spam Classic 340g
  { id: 129, product_id: 41, store: 'SM City Batangas', price: 245.00 },
  { id: 130, product_id: 41, store: "Robinson's Place Batangas", price: 250.00 },
  { id: 131, product_id: 41, store: 'SM City Lipa', price: 245.00 },
  
  // Maling Premium Luncheon Meat 340g
  { id: 132, product_id: 42, store: 'SM City Batangas', price: 165.00 },
  { id: 133, product_id: 42, store: 'Puregold - Batangas City', price: 162.00 },
  { id: 134, product_id: 42, store: 'Puregold Lipa', price: 163.00 },

  // ========== COFFEE (Products 43-48) ==========
  // Nescafe Classic 50g
  { id: 135, product_id: 43, store: 'SM City Batangas', price: 95.00 },
  { id: 136, product_id: 43, store: 'Puregold - Batangas City', price: 93.00 },
  { id: 137, product_id: 43, store: 'SM City Lipa', price: 95.00 },
  { id: 138, product_id: 43, store: 'Puregold Lipa', price: 93.50 },
  
  // Nescafe 3-in-1 Original 30s
  { id: 139, product_id: 44, store: 'SM City Batangas', price: 195.00 },
  { id: 140, product_id: 44, store: 'Puregold - Batangas City', price: 190.00 },
  { id: 141, product_id: 44, store: 'SM City Lipa', price: 195.00 },
  
  // Great Taste White 3-in-1 30s
  { id: 142, product_id: 45, store: 'SM City Batangas', price: 180.00 },
  { id: 143, product_id: 45, store: 'Puregold - Batangas City', price: 175.00 },
  { id: 144, product_id: 45, store: 'Puregold Lipa', price: 178.00 },
  
  // Kopiko Brown Coffee 30s
  { id: 145, product_id: 46, store: 'SM City Batangas', price: 165.00 },
  { id: 146, product_id: 46, store: 'Puregold - Batangas City', price: 162.00 },
  { id: 147, product_id: 46, store: 'Puregold Lipa', price: 163.00 },
  
  // San Mig Coffee Barako 10g (10s)
  { id: 148, product_id: 47, store: 'SM City Batangas', price: 85.00 },
  { id: 149, product_id: 47, store: 'Puregold - Batangas City', price: 82.00 },
  { id: 150, product_id: 47, store: 'Batangas City Public Market', price: 80.00 },
  
  // Milo Powder 300g
  { id: 151, product_id: 48, store: 'SM City Batangas', price: 185.00 },
  { id: 152, product_id: 48, store: 'Puregold - Batangas City', price: 182.00 },
  { id: 153, product_id: 48, store: 'SM City Lipa', price: 185.00 },

  // ========== RICE & GRAINS (Products 49-53) ==========
  // Sinandomeng Rice (1 kg)
  { id: 154, product_id: 49, store: 'SM City Batangas', price: 58.00 },
  { id: 155, product_id: 49, store: 'Puregold - Batangas City', price: 55.00 },
  { id: 156, product_id: 49, store: 'Batangas City Public Market', price: 52.00 },
  { id: 157, product_id: 49, store: 'SM City Lipa', price: 58.00 },
  { id: 158, product_id: 49, store: 'Puregold Lipa', price: 56.00 },
  
  // Jasmine Rice (1 kg)
  { id: 159, product_id: 50, store: 'SM City Batangas', price: 62.00 },
  { id: 160, product_id: 50, store: 'Puregold - Batangas City', price: 60.00 },
  { id: 161, product_id: 50, store: 'SM City Lipa', price: 62.00 },
  
  // Dinorado Rice (1 kg)
  { id: 162, product_id: 51, store: 'SM City Batangas', price: 75.00 },
  { id: 163, product_id: 51, store: "Robinson's Place Batangas", price: 78.00 },
  { id: 164, product_id: 51, store: 'SM City Lipa', price: 75.00 },
  
  // Brown Rice (1 kg)
  { id: 165, product_id: 52, store: 'SM City Batangas', price: 85.00 },
  { id: 166, product_id: 52, store: "Robinson's Place Batangas", price: 88.00 },
  { id: 167, product_id: 52, store: 'SM City Lipa', price: 85.00 },
  
  // Malagkit Rice (1 kg)
  { id: 168, product_id: 53, store: 'SM City Batangas', price: 68.00 },
  { id: 169, product_id: 53, store: 'Puregold - Batangas City', price: 65.00 },
  { id: 170, product_id: 53, store: 'Batangas City Public Market', price: 62.00 },

  // ========== FRUITS (Products 54-65) ==========
  // Royal Banana (1 kg)
  { id: 171, product_id: 54, store: 'SM City Batangas', price: 85.00 },
  { id: 172, product_id: 54, store: 'Puregold - Batangas City', price: 80.00 },
  { id: 173, product_id: 54, store: 'Batangas City Public Market', price: 75.00 },
  { id: 174, product_id: 54, store: 'SM City Lipa', price: 85.00 },
  { id: 175, product_id: 54, store: 'Taal Public Market', price: 70.00 },
  
  // Latundan Banana (1 kg)
  { id: 176, product_id: 55, store: 'SM City Batangas', price: 80.00 },
  { id: 177, product_id: 55, store: 'Batangas City Public Market', price: 70.00 },
  { id: 178, product_id: 55, store: 'Taal Public Market', price: 65.00 },
  
  // Cavendish Banana (1 kg)
  { id: 179, product_id: 56, store: 'SM City Batangas', price: 95.00 },
  { id: 180, product_id: 56, store: 'Puregold - Batangas City', price: 90.00 },
  { id: 181, product_id: 56, store: 'SM City Lipa', price: 95.00 },
  
  // Mango Manila (1 kg)
  { id: 182, product_id: 57, store: 'SM City Batangas', price: 150.00 },
  { id: 183, product_id: 57, store: 'Batangas City Public Market', price: 120.00 },
  { id: 184, product_id: 57, store: 'Taal Public Market', price: 115.00 },
  
  // Papaya (1 kg)
  { id: 185, product_id: 58, store: 'SM City Batangas', price: 55.00 },
  { id: 186, product_id: 58, store: 'Batangas City Public Market', price: 45.00 },
  { id: 187, product_id: 58, store: 'Taal Public Market', price: 42.00 },
  
  // Pineapple Queen (per pc)
  { id: 188, product_id: 59, store: 'SM City Batangas', price: 80.00 },
  { id: 189, product_id: 59, store: 'Batangas City Public Market', price: 65.00 },
  { id: 190, product_id: 59, store: 'Taal Public Market', price: 60.00 },
  
  // Watermelon (1 kg)
  { id: 191, product_id: 60, store: 'SM City Batangas', price: 65.00 },
  { id: 192, product_id: 60, store: 'Batangas City Public Market', price: 55.00 },
  { id: 193, product_id: 60, store: 'Puregold Lipa', price: 58.00 },
  
  // Apple Fuji (1 kg)
  { id: 194, product_id: 61, store: 'SM City Batangas', price: 220.00 },
  { id: 195, product_id: 61, store: "Robinson's Place Batangas", price: 230.00 },
  { id: 196, product_id: 61, store: 'SM City Lipa', price: 220.00 },
  
  // Orange Imported (1 kg)
  { id: 197, product_id: 62, store: 'SM City Batangas', price: 180.00 },
  { id: 198, product_id: 62, store: "Robinson's Place Batangas", price: 185.00 },
  { id: 199, product_id: 62, store: 'SM City Lipa', price: 180.00 },
  
  // Grapes Red (1 kg)
  { id: 200, product_id: 63, store: 'SM City Batangas', price: 350.00 },
  { id: 201, product_id: 63, store: "Robinson's Place Batangas", price: 365.00 },
  { id: 202, product_id: 63, store: 'SM City Lipa', price: 350.00 },
  
  // Calamansi (1 kg)
  { id: 203, product_id: 64, store: 'Batangas City Public Market', price: 80.00 },
  { id: 204, product_id: 64, store: 'Taal Public Market', price: 75.00 },
  { id: 205, product_id: 64, store: 'Mabini Public Market', price: 78.00 },
  
  // Coconut (per pc)
  { id: 206, product_id: 65, store: 'Batangas City Public Market', price: 35.00 },
  { id: 207, product_id: 65, store: 'Taal Public Market', price: 30.00 },
  { id: 208, product_id: 65, store: 'Mabini Public Market', price: 32.00 },

  // ========== VEGETABLES (Products 66-84) ==========
  // White Onion (1 kg)
  { id: 209, product_id: 66, store: 'SM City Batangas', price: 120.00 },
  { id: 210, product_id: 66, store: 'Puregold - Batangas City', price: 115.00 },
  { id: 211, product_id: 66, store: 'Batangas City Public Market', price: 100.00 },
  { id: 212, product_id: 66, store: 'Taal Public Market', price: 95.00 },
  
  // Red Onion (1 kg)
  { id: 213, product_id: 67, store: 'SM City Batangas', price: 110.00 },
  { id: 214, product_id: 67, store: 'Batangas City Public Market', price: 90.00 },
  { id: 215, product_id: 67, store: 'Taal Public Market', price: 85.00 },
  
  // Garlic Native (1 kg)
  { id: 216, product_id: 68, store: 'SM City Batangas', price: 280.00 },
  { id: 217, product_id: 68, store: 'Puregold - Batangas City', price: 270.00 },
  { id: 218, product_id: 68, store: 'Batangas City Public Market', price: 250.00 },
  
  // Tomato (1 kg)
  { id: 219, product_id: 69, store: 'SM City Batangas', price: 85.00 },
  { id: 220, product_id: 69, store: 'Batangas City Public Market', price: 70.00 },
  { id: 221, product_id: 69, store: 'Taal Public Market', price: 65.00 },
  
  // Potato (1 kg)
  { id: 222, product_id: 70, store: 'SM City Batangas', price: 95.00 },
  { id: 223, product_id: 70, store: 'Puregold - Batangas City', price: 90.00 },
  { id: 224, product_id: 70, store: 'Batangas City Public Market', price: 85.00 },
  
  // Carrots (1 kg)
  { id: 225, product_id: 71, store: 'SM City Batangas', price: 110.00 },
  { id: 226, product_id: 71, store: 'Puregold - Batangas City', price: 105.00 },
  { id: 227, product_id: 71, store: 'Batangas City Public Market', price: 95.00 },
  
  // Cabbage (1 kg)
  { id: 228, product_id: 72, store: 'SM City Batangas', price: 75.00 },
  { id: 229, product_id: 72, store: 'Batangas City Public Market', price: 60.00 },
  { id: 230, product_id: 72, store: 'Taal Public Market', price: 55.00 },
  
  // Lettuce (per head)
  { id: 231, product_id: 73, store: 'SM City Batangas', price: 45.00 },
  { id: 232, product_id: 73, store: 'Puregold - Batangas City', price: 42.00 },
  { id: 233, product_id: 73, store: 'Batangas City Public Market', price: 35.00 },
  
  // Cucumber (1 kg)
  { id: 234, product_id: 74, store: 'SM City Batangas', price: 65.00 },
  { id: 235, product_id: 74, store: 'Batangas City Public Market', price: 50.00 },
  { id: 236, product_id: 74, store: 'Taal Public Market', price: 48.00 },
  
  // Eggplant (1 kg)
  { id: 237, product_id: 75, store: 'SM City Batangas', price: 70.00 },
  { id: 238, product_id: 75, store: 'Batangas City Public Market', price: 55.00 },
  { id: 239, product_id: 75, store: 'Taal Public Market', price: 52.00 },
  
  // Squash (1 kg)
  { id: 240, product_id: 76, store: 'SM City Batangas', price: 55.00 },
  { id: 241, product_id: 76, store: 'Batangas City Public Market', price: 40.00 },
  { id: 242, product_id: 76, store: 'Taal Public Market', price: 38.00 },
  
  // Sitaw/String Beans (1 kg)
  { id: 243, product_id: 77, store: 'SM City Batangas', price: 95.00 },
  { id: 244, product_id: 77, store: 'Batangas City Public Market', price: 75.00 },
  { id: 245, product_id: 77, store: 'Taal Public Market', price: 70.00 },
  
  // Kangkong (1 bundle)
  { id: 246, product_id: 78, store: 'Batangas City Public Market', price: 20.00 },
  { id: 247, product_id: 78, store: 'Taal Public Market', price: 18.00 },
  { id: 248, product_id: 78, store: 'Mabini Public Market', price: 19.00 },
  
  // Pechay (1 bundle)
  { id: 249, product_id: 79, store: 'Batangas City Public Market', price: 20.00 },
  { id: 250, product_id: 79, store: 'Taal Public Market', price: 18.00 },
  { id: 251, product_id: 79, store: 'Mabini Public Market', price: 19.00 },
  
  // Malunggay (1 bundle)
  { id: 252, product_id: 80, store: 'Batangas City Public Market', price: 15.00 },
  { id: 253, product_id: 80, store: 'Taal Public Market', price: 12.00 },
  { id: 254, product_id: 80, store: 'Mabini Public Market', price: 13.00 },
  
  // Ampalaya/Bitter Gourd (1 kg)
  { id: 255, product_id: 81, store: 'SM City Batangas', price: 85.00 },
  { id: 256, product_id: 81, store: 'Batangas City Public Market', price: 65.00 },
  { id: 257, product_id: 81, store: 'Taal Public Market', price: 60.00 },
  
  // Bell Pepper (1 kg)
  { id: 258, product_id: 82, store: 'SM City Batangas', price: 180.00 },
  { id: 259, product_id: 82, store: 'Puregold - Batangas City', price: 170.00 },
  { id: 260, product_id: 82, store: 'Batangas City Public Market', price: 150.00 },
  
  // Ginger (1 kg)
  { id: 261, product_id: 83, store: 'SM City Batangas', price: 160.00 },
  { id: 262, product_id: 83, store: 'Batangas City Public Market', price: 130.00 },
  { id: 263, product_id: 83, store: 'Taal Public Market', price: 125.00 },
  
  // Green Chili (1 kg)
  { id: 264, product_id: 84, store: 'Batangas City Public Market', price: 80.00 },
  { id: 265, product_id: 84, store: 'Taal Public Market', price: 75.00 },
  { id: 266, product_id: 84, store: 'SM City Batangas', price: 95.00 },

  // ========== MEAT (Products 85-96) ==========
  // Chicken Breast (1 kg)
  { id: 267, product_id: 85, store: 'SM City Batangas', price: 280.00 },
  { id: 268, product_id: 85, store: 'Puregold - Batangas City', price: 275.00 },
  { id: 269, product_id: 85, store: 'Batangas City Public Market', price: 260.00 },
  { id: 270, product_id: 85, store: 'SM City Lipa', price: 280.00 },
  { id: 271, product_id: 85, store: 'Taal Public Market', price: 255.00 },
  
  // Chicken Drumsticks (1 kg)
  { id: 272, product_id: 86, store: 'SM City Batangas', price: 240.00 },
  { id: 273, product_id: 86, store: 'Puregold - Batangas City', price: 235.00 },
  { id: 274, product_id: 86, store: 'Batangas City Public Market', price: 220.00 },
  
  // Chicken Wings (1 kg)
  { id: 275, product_id: 87, store: 'SM City Batangas', price: 230.00 },
  { id: 276, product_id: 87, store: 'Puregold - Batangas City', price: 225.00 },
  { id: 277, product_id: 87, store: 'Batangas City Public Market', price: 210.00 },
  
  // Chicken Whole (1 kg)
  { id: 278, product_id: 88, store: 'SM City Batangas', price: 200.00 },
  { id: 279, product_id: 88, store: 'Puregold - Batangas City', price: 195.00 },
  { id: 280, product_id: 88, store: 'Batangas City Public Market', price: 185.00 },
  
  // Pork Belly Liempo (1 kg)
  { id: 281, product_id: 89, store: 'SM City Batangas', price: 380.00 },
  { id: 282, product_id: 89, store: 'Puregold - Batangas City', price: 375.00 },
  { id: 283, product_id: 89, store: 'Batangas City Public Market', price: 360.00 },
  
  // Pork Kasim (1 kg)
  { id: 284, product_id: 90, store: 'SM City Batangas', price: 350.00 },
  { id: 285, product_id: 90, store: 'Puregold - Batangas City', price: 345.00 },
  { id: 286, product_id: 90, store: 'Batangas City Public Market', price: 330.00 },
  
  // Pork Chop (1 kg)
  { id: 287, product_id: 91, store: 'SM City Batangas', price: 360.00 },
  { id: 288, product_id: 91, store: 'Puregold - Batangas City', price: 355.00 },
  { id: 289, product_id: 91, store: 'Batangas City Public Market', price: 340.00 },
  
  // Ground Pork (1 kg)
  { id: 290, product_id: 92, store: 'SM City Batangas', price: 330.00 },
  { id: 291, product_id: 92, store: 'Puregold - Batangas City', price: 325.00 },
  { id: 292, product_id: 92, store: 'Batangas City Public Market', price: 310.00 },
  
  // Beef Steak Meat (1 kg)
  { id: 293, product_id: 93, store: 'SM City Batangas', price: 580.00 },
  { id: 294, product_id: 93, store: "Robinson's Place Batangas", price: 600.00 },
  { id: 295, product_id: 93, store: 'Batangas City Public Market', price: 550.00 },
  
  // Ground Beef (1 kg)
  { id: 296, product_id: 94, store: 'SM City Batangas', price: 520.00 },
  { id: 297, product_id: 94, store: "Robinson's Place Batangas", price: 540.00 },
  { id: 298, product_id: 94, store: 'Batangas City Public Market', price: 500.00 },
  
  // Hotdog Purefoods Tender Juicy 1kg
  { id: 299, product_id: 95, store: 'SM City Batangas', price: 285.00 },
  { id: 300, product_id: 95, store: 'Puregold - Batangas City', price: 280.00 },
  { id: 301, product_id: 95, store: 'SM City Lipa', price: 285.00 },
  
  // Bacon CDO 200g
  { id: 302, product_id: 96, store: 'SM City Batangas', price: 165.00 },
  { id: 303, product_id: 96, store: 'Puregold - Batangas City', price: 162.00 },
  { id: 304, product_id: 96, store: 'SM City Lipa', price: 165.00 },

  // ========== FISH & SEAFOOD (Products 97-103) ==========
  // Bangus/Milkfish (1 kg)
  { id: 305, product_id: 97, store: 'Batangas City Public Market', price: 180.00 },
  { id: 306, product_id: 97, store: 'Taal Public Market', price: 175.00 },
  { id: 307, product_id: 97, store: 'Mabini Public Market', price: 170.00 },
  { id: 308, product_id: 97, store: 'SM City Batangas', price: 200.00 },
  
  // Tilapia (1 kg)
  { id: 309, product_id: 98, store: 'Batangas City Public Market', price: 140.00 },
  { id: 310, product_id: 98, store: 'Taal Public Market', price: 135.00 },
  { id: 311, product_id: 98, store: 'SM City Batangas', price: 160.00 },
  
  // Galunggong (1 kg)
  { id: 312, product_id: 99, store: 'Batangas City Public Market', price: 160.00 },
  { id: 313, product_id: 99, store: 'Mabini Public Market', price: 150.00 },
  { id: 314, product_id: 99, store: 'Taal Public Market', price: 155.00 },
  
  // Squid (1 kg)
  { id: 315, product_id: 100, store: 'Batangas City Public Market', price: 350.00 },
  { id: 316, product_id: 100, store: 'Mabini Public Market', price: 320.00 },
  { id: 317, product_id: 100, store: 'SM City Batangas', price: 380.00 },
  
  // Shrimp Medium (1 kg)
  { id: 318, product_id: 101, store: 'Batangas City Public Market', price: 450.00 },
  { id: 319, product_id: 101, store: 'Mabini Public Market', price: 420.00 },
  { id: 320, product_id: 101, store: 'SM City Batangas', price: 480.00 },
  
  // Blue Marlin Steak (1 kg)
  { id: 321, product_id: 102, store: 'Batangas City Public Market', price: 380.00 },
  { id: 322, product_id: 102, store: 'Mabini Public Market', price: 360.00 },
  { id: 323, product_id: 102, store: 'SM City Batangas', price: 420.00 },
  
  // Talakitok (1 kg)
  { id: 324, product_id: 103, store: 'Batangas City Public Market', price: 220.00 },
  { id: 325, product_id: 103, store: 'Mabini Public Market', price: 200.00 },
  { id: 326, product_id: 103, store: 'Taal Public Market', price: 210.00 },

  // ========== EGGS (Products 104-108) ==========
  // Medium Eggs (1 tray)
  { id: 327, product_id: 104, store: 'SM City Batangas', price: 240.00 },
  { id: 328, product_id: 104, store: 'Puregold - Batangas City', price: 235.00 },
  { id: 329, product_id: 104, store: 'Batangas City Public Market', price: 225.00 },
  
  // Large Eggs (1 tray)
  { id: 330, product_id: 105, store: 'SM City Batangas', price: 260.00 },
  { id: 331, product_id: 105, store: 'Puregold - Batangas City', price: 255.00 },
  { id: 332, product_id: 105, store: 'Batangas City Public Market', price: 245.00 },
  
  // Extra Large Eggs (1 tray)
  { id: 333, product_id: 106, store: 'SM City Batangas', price: 280.00 },
  { id: 334, product_id: 106, store: "Robinson's Place Batangas", price: 285.00 },
  { id: 335, product_id: 106, store: 'SM City Lipa', price: 280.00 },
  
  // Quail Eggs (per dozen)
  { id: 336, product_id: 107, store: 'Batangas City Public Market', price: 45.00 },
  { id: 337, product_id: 107, store: 'Taal Public Market', price: 42.00 },
  { id: 338, product_id: 107, store: 'SM City Batangas', price: 52.00 },
  
  // Salted Eggs (per dozen)
  { id: 339, product_id: 108, store: 'Batangas City Public Market', price: 85.00 },
  { id: 340, product_id: 108, store: 'Taal Public Market', price: 80.00 },
  { id: 341, product_id: 108, store: 'Puregold - Batangas City', price: 88.00 },

  // ========== BREAD & BAKERY (Products 109-115) ==========
  // Gardenia Classic White Bread
  { id: 342, product_id: 109, store: 'SM City Batangas', price: 52.00 },
  { id: 343, product_id: 109, store: 'Puregold - Batangas City', price: 51.50 },
  { id: 344, product_id: 109, store: 'SM City Lipa', price: 52.00 },
  { id: 345, product_id: 109, store: 'Puregold Lipa', price: 51.50 },
  
  // Gardenia Wheat Bread
  { id: 346, product_id: 110, store: 'SM City Batangas', price: 58.00 },
  { id: 347, product_id: 110, store: 'Puregold - Batangas City', price: 57.00 },
  { id: 348, product_id: 110, store: 'SM City Lipa', price: 58.00 },
  
  // Tasty Bread
  { id: 349, product_id: 111, store: 'SM City Batangas', price: 48.00 },
  { id: 350, product_id: 111, store: 'Puregold - Batangas City', price: 47.00 },
  { id: 351, product_id: 111, store: 'Puregold Lipa', price: 47.50 },
  
  // Pan de Sal (10 pcs)
  { id: 352, product_id: 112, store: 'Batangas City Public Market', price: 30.00 },
  { id: 353, product_id: 112, store: 'Taal Public Market', price: 28.00 },
  { id: 354, product_id: 112, store: 'Local Bakery', price: 25.00 },
  
  // Ensaymada (per pc)
  { id: 355, product_id: 113, store: 'Batangas City Public Market', price: 15.00 },
  { id: 356, product_id: 113, store: 'Taal Public Market', price: 12.00 },
  { id: 357, product_id: 113, store: 'Local Bakery', price: 10.00 },
  
  // Spanish Bread (per pc)
  { id: 358, product_id: 114, store: 'Batangas City Public Market', price: 12.00 },
  { id: 359, product_id: 114, store: 'Taal Public Market', price: 10.00 },
  { id: 360, product_id: 114, store: 'Local Bakery', price: 8.00 },
  
  // Monay (per pc)
  { id: 361, product_id: 115, store: 'Batangas City Public Market', price: 10.00 },
  { id: 362, product_id: 115, store: 'Taal Public Market', price: 8.00 },
  { id: 363, product_id: 115, store: 'Local Bakery', price: 7.00 },

  // ========== CONDIMENTS & SAUCES (Products 116-129) ==========
  // UFC Banana Catsup 320g
  { id: 364, product_id: 116, store: 'SM City Batangas', price: 48.00 },
  { id: 365, product_id: 116, store: 'Puregold - Batangas City', price: 46.50 },
  { id: 366, product_id: 116, store: 'Puregold Lipa', price: 47.00 },
  
  // Papa Banana Catsup 320g
  { id: 367, product_id: 117, store: 'SM City Batangas', price: 45.00 },
  { id: 368, product_id: 117, store: 'Puregold - Batangas City', price: 43.50 },
  { id: 369, product_id: 117, store: 'Puregold Lipa', price: 44.00 },
  
  // Datu Puti Soy Sauce 385ml
  { id: 370, product_id: 118, store: 'SM City Batangas', price: 28.00 },
  { id: 371, product_id: 118, store: 'Puregold - Batangas City', price: 27.00 },
  { id: 372, product_id: 118, store: 'Batangas City Public Market', price: 26.00 },
  
  // Silver Swan Soy Sauce 385ml
  { id: 373, product_id: 119, store: 'SM City Batangas', price: 29.00 },
  { id: 374, product_id: 119, store: 'Puregold - Batangas City', price: 28.00 },
  { id: 375, product_id: 119, store: 'Puregold Lipa', price: 28.50 },
  
  // Datu Puti Vinegar 385ml
  { id: 376, product_id: 120, store: 'SM City Batangas', price: 22.00 },
  { id: 377, product_id: 120, store: 'Puregold - Batangas City', price: 21.00 },
  { id: 378, product_id: 120, store: 'Batangas City Public Market', price: 20.00 },
  
  // UFC Vinegar 385ml
  { id: 379, product_id: 121, store: 'SM City Batangas', price: 23.00 },
  { id: 380, product_id: 121, store: 'Puregold - Batangas City', price: 22.00 },
  { id: 381, product_id: 121, store: 'Puregold Lipa', price: 22.50 },
  
  // Mama Sita's Oyster Sauce 405g
  { id: 382, product_id: 122, store: 'SM City Batangas', price: 68.00 },
  { id: 383, product_id: 122, store: 'Puregold - Batangas City', price: 66.00 },
  { id: 384, product_id: 122, store: 'SM City Lipa', price: 68.00 },
  
  // Knorr Liquid Seasoning 250ml
  { id: 385, product_id: 123, store: 'SM City Batangas', price: 42.00 },
  { id: 386, product_id: 123, store: 'Puregold - Batangas City', price: 40.50 },
  { id: 387, product_id: 123, store: 'Puregold Lipa', price: 41.00 },
  
  // Maggi Magic Sarap 50g
  { id: 388, product_id: 124, store: 'SM City Batangas', price: 35.00 },
  { id: 389, product_id: 124, store: 'Puregold - Batangas City', price: 33.50 },
  { id: 390, product_id: 124, store: 'Batangas City Public Market', price: 32.00 },
  
  // Ajinomoto Umami Seasoning 100g
  { id: 391, product_id: 125, store: 'SM City Batangas', price: 42.00 },
  { id: 392, product_id: 125, store: 'Puregold - Batangas City', price: 40.50 },
  { id: 393, product_id: 125, store: 'Puregold Lipa', price: 41.00 },
  
  // Iodized Salt 1kg
  { id: 394, product_id: 126, store: 'SM City Batangas', price: 25.00 },
  { id: 395, product_id: 126, store: 'Puregold - Batangas City', price: 23.50 },
  { id: 396, product_id: 126, store: 'Batangas City Public Market', price: 22.00 },
  
  // Black Pepper Ground 50g
  { id: 397, product_id: 127, store: 'SM City Batangas', price: 65.00 },
  { id: 398, product_id: 127, store: 'Puregold - Batangas City', price: 63.00 },
  { id: 399, product_id: 127, store: 'SM City Lipa', price: 65.00 },
  
  // UFC Gravy Mix 25g
  { id: 400, product_id: 128, store: 'SM City Batangas', price: 18.00 },
  { id: 401, product_id: 128, store: 'Puregold - Batangas City', price: 17.00 },
  { id: 402, product_id: 128, store: 'Puregold Lipa', price: 17.50 },
  
  // McCormick BBQ Marinade Mix 40g
  { id: 403, product_id: 129, store: 'SM City Batangas', price: 28.00 },
  { id: 404, product_id: 129, store: 'Puregold - Batangas City', price: 27.00 },
  { id: 405, product_id: 129, store: 'SM City Lipa', price: 28.00 },

  // ========== COOKING OIL (Products 130-133) ==========
  // Baguio Vegetable Oil 1L
  { id: 406, product_id: 130, store: 'SM City Batangas', price: 145.00 },
  { id: 407, product_id: 130, store: 'Puregold - Batangas City', price: 142.00 },
  { id: 408, product_id: 130, store: 'Puregold Lipa', price: 143.00 },
  
  // Minola Premium Cooking Oil 1L
  { id: 409, product_id: 131, store: 'SM City Batangas', price: 155.00 },
  { id: 410, product_id: 131, store: 'Puregold - Batangas City', price: 152.00 },
  { id: 411, product_id: 131, store: 'SM City Lipa', price: 155.00 },
  
  // Golden Fiesta Palm Oil 1L
  { id: 412, product_id: 132, store: 'SM City Batangas', price: 135.00 },
  { id: 413, product_id: 132, store: 'Puregold - Batangas City', price: 132.00 },
  { id: 414, product_id: 132, store: 'Puregold Lipa', price: 133.00 },
  
  // Olive Oil Extra Virgin 500ml
  { id: 415, product_id: 133, store: 'SM City Batangas', price: 485.00 },
  { id: 416, product_id: 133, store: "Robinson's Place Batangas", price: 495.00 },
  { id: 417, product_id: 133, store: 'SM City Lipa', price: 485.00 },

  // ========== PASTA (Products 134-136) ==========
  // Royal Spaghetti Pasta 900g
  { id: 418, product_id: 134, store: 'SM City Batangas', price: 78.00 },
  { id: 419, product_id: 134, store: 'Puregold - Batangas City', price: 76.00 },
  { id: 420, product_id: 134, store: 'SM City Lipa', price: 78.00 },
  
  // Royal Elbow Macaroni 400g
  { id: 421, product_id: 135, store: 'SM City Batangas', price: 42.00 },
  { id: 422, product_id: 135, store: 'Puregold - Batangas City', price: 40.50 },
  { id: 423, product_id: 135, store: 'Puregold Lipa', price: 41.00 },
  
  // San Remo Penne 500g
  { id: 424, product_id: 136, store: 'SM City Batangas', price: 95.00 },
  { id: 425, product_id: 136, store: "Robinson's Place Batangas", price: 98.00 },
  { id: 426, product_id: 136, store: 'SM City Lipa', price: 95.00 },

  // ========== SNACKS (Products 137-147) ==========
  // Jack n Jill Piattos Cheese 85g
  { id: 427, product_id: 137, store: 'SM City Batangas', price: 42.00 },
  { id: 428, product_id: 137, store: 'Puregold - Batangas City', price: 40.50 },
  { id: 429, product_id: 137, store: 'Puregold Lipa', price: 41.00 },
  
  // Oishi Prawn Crackers 90g
  { id: 430, product_id: 138, store: 'SM City Batangas', price: 35.00 },
  { id: 431, product_id: 138, store: 'Puregold - Batangas City', price: 33.50 },
  { id: 432, product_id: 138, store: 'Puregold Lipa', price: 34.00 },
  
  // Nova Multigrain Chips 78g
  { id: 433, product_id: 139, store: 'SM City Batangas', price: 32.00 },
  { id: 434, product_id: 139, store: 'Puregold - Batangas City', price: 30.50 },
  { id: 435, product_id: 139, store: 'Puregold Lipa', price: 31.00 },
  
  // Chippy BBQ 110g
  { id: 436, product_id: 140, store: 'SM City Batangas', price: 28.00 },
  { id: 437, product_id: 140, store: 'Puregold - Batangas City', price: 26.50 },
  { id: 438, product_id: 140, store: 'Puregold Lipa', price: 27.00 },
  
  // Boy Bawang Cornick Adobo 100g
  { id: 439, product_id: 141, store: 'SM City Batangas', price: 35.00 },
  { id: 440, product_id: 141, store: 'Puregold - Batangas City', price: 33.50 },
  { id: 441, product_id: 141, store: 'Puregold Lipa', price: 34.00 },
  
  // Skyflakes Crackers 250g
  { id: 442, product_id: 142, store: 'SM City Batangas', price: 48.00 },
  { id: 443, product_id: 142, store: 'Puregold - Batangas City', price: 46.50 },
  { id: 444, product_id: 142, store: 'Puregold Lipa', price: 47.00 },
  
  // Fita Crackers 300g
  { id: 445, product_id: 143, store: 'SM City Batangas', price: 52.00 },
  { id: 446, product_id: 143, store: 'Puregold - Batangas City', price: 50.50 },
  { id: 447, product_id: 143, store: 'Puregold Lipa', price: 51.00 },
  
  // M.Y. San Grahams 200g
  { id: 448, product_id: 144, store: 'SM City Batangas', price: 65.00 },
  { id: 449, product_id: 144, store: 'Puregold - Batangas City', price: 63.00 },
  { id: 450, product_id: 144, store: 'SM City Lipa', price: 65.00 },
  
  // Oreo Cookies 137g
  { id: 451, product_id: 145, store: 'SM City Batangas', price: 85.00 },
  { id: 452, product_id: 145, store: 'Puregold - Batangas City', price: 83.00 },
  { id: 453, product_id: 145, store: 'SM City Lipa', price: 85.00 },
  
  // Cream-O Cookies 132g
  { id: 454, product_id: 146, store: 'SM City Batangas', price: 38.00 },
  { id: 455, product_id: 146, store: 'Puregold - Batangas City', price: 36.50 },
  { id: 456, product_id: 146, store: 'Puregold Lipa', price: 37.00 },
  
  // Rebisco Crackers 250g
  { id: 457, product_id: 147, store: 'SM City Batangas', price: 45.00 },
  { id: 458, product_id: 147, store: 'Puregold - Batangas City', price: 43.50 },
  { id: 459, product_id: 147, store: 'Puregold Lipa', price: 44.00 },

  // ========== CANDY & SWEETS (Products 148-151) ==========
  // Storck Knoppers 25g (8s)
  { id: 460, product_id: 148, store: 'SM City Batangas', price: 165.00 },
  { id: 461, product_id: 148, store: "Robinson's Place Batangas", price: 170.00 },
  { id: 462, product_id: 148, store: 'SM City Lipa', price: 165.00 },
  
  // White Rabbit Candy 227g
  { id: 463, product_id: 149, store: 'SM City Batangas', price: 125.00 },
  { id: 464, product_id: 149, store: 'Puregold - Batangas City', price: 122.00 },
  { id: 465, product_id: 149, store: 'SM City Lipa', price: 125.00 },
  
  // Hany Candy (per pack)
  { id: 466, product_id: 150, store: 'Batangas City Public Market', price: 8.00 },
  { id: 467, product_id: 150, store: 'Taal Public Market', price: 7.00 },
  { id: 468, product_id: 150, store: 'Puregold - Batangas City', price: 9.00 },
  
  // Choc Nut (per pack)
  { id: 469, product_id: 151, store: 'Batangas City Public Market', price: 10.00 },
  { id: 470, product_id: 151, store: 'Taal Public Market', price: 9.00 },
  { id: 471, product_id: 151, store: 'SM City Batangas', price: 12.00 },

  // ========== HOUSEHOLD ITEMS (Products 152-161) ==========
  // Surf Powder Detergent 1kg
  { id: 472, product_id: 152, store: 'SM City Batangas', price: 185.00 },
  { id: 473, product_id: 152, store: 'Puregold - Batangas City', price: 180.00 },
  { id: 474, product_id: 152, store: "Robinson's Place Batangas", price: 188.00 },
  { id: 475, product_id: 152, store: 'SM City Lipa', price: 185.00 },
  { id: 476, product_id: 152, store: 'Puregold Lipa', price: 182.00 },
  
  // Tide Powder Detergent 1kg
  { id: 477, product_id: 153, store: 'SM City Batangas', price: 195.00 },
  { id: 478, product_id: 153, store: 'Puregold - Batangas City', price: 190.00 },
  { id: 479, product_id: 153, store: 'SM City Lipa', price: 195.00 },
  
  // Ariel Powder Detergent 1kg
  { id: 480, product_id: 154, store: 'SM City Batangas', price: 198.00 },
  { id: 481, product_id: 154, store: 'Puregold - Batangas City', price: 193.00 },
  { id: 482, product_id: 154, store: 'SM City Lipa', price: 198.00 },
  
  // Downy Fabric Conditioner 1L
  { id: 483, product_id: 155, store: 'SM City Batangas', price: 165.00 },
  { id: 484, product_id: 155, store: 'Puregold - Batangas City', price: 162.00 },
  { id: 485, product_id: 155, store: 'Puregold Lipa', price: 163.00 },
  
  // Zonrox Bleach 1L
  { id: 486, product_id: 156, store: 'SM City Batangas', price: 55.00 },
  { id: 487, product_id: 156, store: 'Puregold - Batangas City', price: 53.00 },
  { id: 488, product_id: 156, store: 'Puregold Lipa', price: 54.00 },
  
  // Joy Dishwashing Liquid 485ml
  { id: 489, product_id: 157, store: 'SM City Batangas', price: 68.00 },
  { id: 490, product_id: 157, store: 'Puregold - Batangas City', price: 66.00 },
  { id: 491, product_id: 157, store: 'Puregold Lipa', price: 67.00 },
  
  // Domex Toilet Bowl Cleaner 500ml
  { id: 492, product_id: 158, store: 'SM City Batangas', price: 78.00 },
  { id: 493, product_id: 158, store: 'Puregold - Batangas City', price: 76.00 },
  { id: 494, product_id: 158, store: 'SM City Lipa', price: 78.00 },
  
  // Lysol Disinfectant Spray 400ml
  { id: 495, product_id: 159, store: 'SM City Batangas', price: 225.00 },
  { id: 496, product_id: 159, store: "Robinson's Place Batangas", price: 230.00 },
  { id: 497, product_id: 159, store: 'SM City Lipa', price: 225.00 },
  
  // Baygon Multi-Insect Killer 600ml
  { id: 498, product_id: 160, store: 'SM City Batangas', price: 185.00 },
  { id: 499, product_id: 160, store: 'Puregold - Batangas City', price: 182.00 },
  { id: 500, product_id: 160, store: 'SM City Lipa', price: 185.00 },
  
  // Kris Trash Bags Large (10s)
  { id: 501, product_id: 161, store: 'SM City Batangas', price: 48.00 },
  { id: 502, product_id: 161, store: 'Puregold - Batangas City', price: 46.50 },
  { id: 503, product_id: 161, store: 'Puregold Lipa', price: 47.00 },

  // ========== PERSONAL CARE (Products 162-173) ==========
  // Safeguard Bar Soap 135g
  { id: 504, product_id: 162, store: 'SM City Batangas', price: 38.00 },
  { id: 505, product_id: 162, store: 'Puregold - Batangas City', price: 36.50 },
  { id: 506, product_id: 162, store: 'Puregold Lipa', price: 37.00 },
  
  // Palmolive Naturals Bar Soap 115g
  { id: 507, product_id: 163, store: 'SM City Batangas', price: 35.00 },
  { id: 508, product_id: 163, store: 'Puregold - Batangas City', price: 33.50 },
  { id: 509, product_id: 163, store: 'Puregold Lipa', price: 34.00 },
  
  // Colgate Toothpaste 150g
  { id: 510, product_id: 164, store: 'SM City Batangas', price: 85.00 },
  { id: 511, product_id: 164, store: 'Puregold - Batangas City', price: 83.00 },
  { id: 512, product_id: 164, store: 'Puregold Lipa', price: 84.00 },
  
  // Close-Up Toothpaste 160g
  { id: 513, product_id: 165, store: 'SM City Batangas', price: 88.00 },
  { id: 514, product_id: 165, store: 'Puregold - Batangas City', price: 86.00 },
  { id: 515, product_id: 165, store: 'Puregold Lipa', price: 87.00 },
  
  // Oral-B Toothbrush
  { id: 516, product_id: 166, store: 'SM City Batangas', price: 65.00 },
  { id: 517, product_id: 166, store: 'Puregold - Batangas City', price: 63.00 },
  { id: 518, product_id: 166, store: 'SM City Lipa', price: 65.00 },
  
  // Head & Shoulders Shampoo 340ml
  { id: 519, product_id: 167, store: 'SM City Batangas', price: 245.00 },
  { id: 520, product_id: 167, store: 'Puregold - Batangas City', price: 240.00 },
  { id: 521, product_id: 167, store: 'SM City Lipa', price: 245.00 },
  
  // Palmolive Shampoo 340ml
  { id: 522, product_id: 168, store: 'SM City Batangas', price: 185.00 },
  { id: 523, product_id: 168, store: 'Puregold - Batangas City', price: 182.00 },
  { id: 524, product_id: 168, store: 'Puregold Lipa', price: 183.00 },
  
  // Cream Silk Conditioner 340ml
  { id: 525, product_id: 169, store: 'SM City Batangas', price: 195.00 },
  { id: 526, product_id: 169, store: 'Puregold - Batangas City', price: 192.00 },
  { id: 527, product_id: 169, store: 'Puregold Lipa', price: 193.00 },
  
  // Modess Napkin Ultra Thin 8s
  { id: 528, product_id: 170, store: 'SM City Batangas', price: 42.00 },
  { id: 529, product_id: 170, store: 'Puregold - Batangas City', price: 40.50 },
  { id: 530, product_id: 170, store: 'Puregold Lipa', price: 41.00 },
  
  // Whisper Napkin Wings 8s
  { id: 531, product_id: 171, store: 'SM City Batangas', price: 45.00 },
  { id: 532, product_id: 171, store: 'Puregold - Batangas City', price: 43.50 },
  { id: 533, product_id: 171, store: 'Puregold Lipa', price: 44.00 },
  
  // Johnson's Baby Powder 200g
  { id: 534, product_id: 172, store: 'SM City Batangas', price: 125.00 },
  { id: 535, product_id: 172, store: 'Puregold - Batangas City', price: 122.00 },
  { id: 536, product_id: 172, store: 'SM City Lipa', price: 125.00 },
  
  // Rexona Deodorant Roll-on 40ml
  { id: 537, product_id: 173, store: 'SM City Batangas', price: 95.00 },
  { id: 538, product_id: 173, store: 'Puregold - Batangas City', price: 93.00 },
  { id: 539, product_id: 173, store: 'Puregold Lipa', price: 94.00 },

  // ========== BABY PRODUCTS (Products 174-178) ==========
  // EQ Diaper Dry Pants Small 14s
  { id: 540, product_id: 174, store: 'SM City Batangas', price: 185.00 },
  { id: 541, product_id: 174, store: 'Puregold - Batangas City', price: 182.00 },
  { id: 542, product_id: 174, store: 'SM City Lipa', price: 185.00 },
  
  // Pampers Baby Dry Pants Medium 18s
  { id: 543, product_id: 175, store: 'SM City Batangas', price: 325.00 },
  { id: 544, product_id: 175, store: "Robinson's Place Batangas", price: 330.00 },
  { id: 545, product_id: 175, store: 'SM City Lipa', price: 325.00 },
  
  // Johnson's Baby Shampoo 200ml
  { id: 546, product_id: 176, store: 'SM City Batangas', price: 165.00 },
  { id: 547, product_id: 176, store: 'Puregold - Batangas City', price: 162.00 },
  { id: 548, product_id: 176, store: 'SM City Lipa', price: 165.00 },
  
  // Cerelac Wheat 120g
  { id: 549, product_id: 177, store: 'SM City Batangas', price: 85.00 },
  { id: 550, product_id: 177, store: 'Puregold - Batangas City', price: 83.00 },
  { id: 551, product_id: 177, store: 'Puregold Lipa', price: 84.00 },
  
  // Lactum 3+ 350g
  { id: 552, product_id: 178, store: 'SM City Batangas', price: 385.00 },
  { id: 553, product_id: 178, store: 'Puregold - Batangas City', price: 380.00 },
  { id: 554, product_id: 178, store: 'SM City Lipa', price: 385.00 },

  // ========== FROZEN GOODS (Products 179-184) ==========
  // Magnolia Chicken Nuggets 200g
  { id: 555, product_id: 179, store: 'SM City Batangas', price: 125.00 },
  { id: 556, product_id: 179, store: 'Puregold - Batangas City', price: 122.00 },
  { id: 557, product_id: 179, store: 'SM City Lipa', price: 125.00 },
  
  // Magnolia Chicken Fries 400g
  { id: 558, product_id: 180, store: 'SM City Batangas', price: 185.00 },
  { id: 559, product_id: 180, store: 'Puregold - Batangas City', price: 182.00 },
  { id: 560, product_id: 180, store: 'SM City Lipa', price: 185.00 },
  
  // Purefoods Chicken Franks 1kg
  { id: 561, product_id: 181, store: 'SM City Batangas', price: 285.00 },
  { id: 562, product_id: 181, store: 'Puregold - Batangas City', price: 280.00 },
  { id: 563, product_id: 181, store: 'SM City Lipa', price: 285.00 },
  
  // Crab Sticks 500g
  { id: 564, product_id: 182, store: 'SM City Batangas', price: 165.00 },
  { id: 565, product_id: 182, store: 'Puregold - Batangas City', price: 162.00 },
  { id: 566, product_id: 182, store: 'Puregold Lipa', price: 163.00 },
  
  // Fish Balls 500g
  { id: 567, product_id: 183, store: 'SM City Batangas', price: 95.00 },
  { id: 568, product_id: 183, store: 'Puregold - Batangas City', price: 92.00 },
  { id: 569, product_id: 183, store: 'Batangas City Public Market', price: 85.00 },
  
  // Squid Balls 500g
  { id: 570, product_id: 184, store: 'SM City Batangas', price: 105.00 },
  { id: 571, product_id: 184, store: 'Puregold - Batangas City', price: 102.00 },
  { id: 572, product_id: 184, store: 'Batangas City Public Market', price: 95.00 },

  // ========== ADDITIONAL PRICES FOR TANAUAN CITY ==========
  // Beverages
  { id: 573, product_id: 1, store: 'Puregold Tanauan', price: 72.50 },
  { id: 574, product_id: 1, store: 'Citi Mall Tanauan', price: 74.00 },
  { id: 575, product_id: 2, store: 'Puregold Tanauan', price: 72.50 },
  { id: 576, product_id: 3, store: 'Puregold Tanauan', price: 63.00 },
  { id: 577, product_id: 4, store: 'Puregold Tanauan', price: 72.00 },
  { id: 578, product_id: 6, store: 'Puregold Tanauan', price: 36.50 },
  { id: 579, product_id: 11, store: 'Puregold Tanauan', price: 16.50 },
  { id: 580, product_id: 12, store: 'Puregold Tanauan', price: 16.50 },
  
  // Dairy
  { id: 581, product_id: 13, store: 'Puregold Tanauan', price: 108.00 },
  { id: 582, product_id: 13, store: 'Citi Mall Tanauan', price: 110.00 },
  { id: 583, product_id: 14, store: 'Puregold Tanauan', price: 56.50 },
  { id: 584, product_id: 15, store: 'Citi Mall Tanauan', price: 125.00 },
  { id: 585, product_id: 17, store: 'Puregold Tanauan', price: 115.00 },
  { id: 586, product_id: 19, store: 'Puregold Tanauan', price: 46.50 },
  { id: 587, product_id: 21, store: 'Puregold Tanauan', price: 83.00 },
  
  // Instant Noodles
  { id: 588, product_id: 25, store: 'Puregold Tanauan', price: 14.50 },
  { id: 589, product_id: 25, store: 'Citi Mall Tanauan', price: 15.00 },
  { id: 590, product_id: 26, store: 'Puregold Tanauan', price: 14.50 },
  { id: 591, product_id: 27, store: 'Puregold Tanauan', price: 15.00 },
  { id: 592, product_id: 28, store: 'Citi Mall Tanauan', price: 31.50 },
  { id: 593, product_id: 29, store: 'Puregold Tanauan', price: 11.50 },
  
  // Canned Goods
  { id: 594, product_id: 31, store: 'Puregold Tanauan', price: 87.00 },
  { id: 595, product_id: 31, store: 'Citi Mall Tanauan', price: 88.50 },
  { id: 596, product_id: 32, store: 'Puregold Tanauan', price: 53.50 },
  { id: 597, product_id: 33, store: 'Puregold Tanauan', price: 26.50 },
  { id: 598, product_id: 34, store: 'Puregold Tanauan', price: 25.50 },
  { id: 599, product_id: 38, store: 'Puregold Tanauan', price: 76.00 },
  { id: 600, product_id: 41, store: 'Citi Mall Tanauan', price: 245.00 },
  
  // Coffee
  { id: 601, product_id: 43, store: 'Puregold Tanauan', price: 93.00 },
  { id: 602, product_id: 43, store: 'Citi Mall Tanauan', price: 95.00 },
  { id: 603, product_id: 44, store: 'Puregold Tanauan', price: 190.00 },
  { id: 604, product_id: 45, store: 'Puregold Tanauan', price: 175.00 },
  { id: 605, product_id: 48, store: 'Puregold Tanauan', price: 182.00 },
  
  // Rice & Grains
  { id: 606, product_id: 49, store: 'Puregold Tanauan', price: 55.00 },
  { id: 607, product_id: 49, store: 'Citi Mall Tanauan', price: 57.00 },
  { id: 608, product_id: 50, store: 'Puregold Tanauan', price: 60.00 },
  { id: 609, product_id: 51, store: 'Citi Mall Tanauan', price: 76.00 },
  
  // Fruits
  { id: 610, product_id: 54, store: 'Puregold Tanauan', price: 80.00 },
  { id: 611, product_id: 56, store: 'Citi Mall Tanauan', price: 93.00 },
  { id: 612, product_id: 61, store: 'Citi Mall Tanauan', price: 220.00 },
  
  // Vegetables
  { id: 613, product_id: 66, store: 'Puregold Tanauan', price: 115.00 },
  { id: 614, product_id: 68, store: 'Puregold Tanauan', price: 270.00 },
  { id: 615, product_id: 69, store: 'Puregold Tanauan', price: 82.00 },
  { id: 616, product_id: 70, store: 'Puregold Tanauan', price: 90.00 },
  { id: 617, product_id: 71, store: 'Puregold Tanauan', price: 105.00 },
  
  // Meat
  { id: 618, product_id: 85, store: 'Puregold Tanauan', price: 275.00 },
  { id: 619, product_id: 85, store: 'Citi Mall Tanauan', price: 278.00 },
  { id: 620, product_id: 86, store: 'Puregold Tanauan', price: 235.00 },
  { id: 621, product_id: 89, store: 'Puregold Tanauan', price: 375.00 },
  { id: 622, product_id: 90, store: 'Puregold Tanauan', price: 345.00 },
  { id: 623, product_id: 92, store: 'Puregold Tanauan', price: 325.00 },
  { id: 624, product_id: 95, store: 'Puregold Tanauan', price: 280.00 },
  
  // Eggs
  { id: 625, product_id: 104, store: 'Puregold Tanauan', price: 235.00 },
  { id: 626, product_id: 105, store: 'Puregold Tanauan', price: 255.00 },
  
  // Bread & Bakery
  { id: 627, product_id: 109, store: 'Puregold Tanauan', price: 51.50 },
  { id: 628, product_id: 109, store: 'Citi Mall Tanauan', price: 52.00 },
  { id: 629, product_id: 110, store: 'Puregold Tanauan', price: 57.00 },
  { id: 630, product_id: 111, store: 'Puregold Tanauan', price: 47.00 },
  
  // Condiments & Sauces
  { id: 631, product_id: 116, store: 'Puregold Tanauan', price: 46.50 },
  { id: 632, product_id: 118, store: 'Puregold Tanauan', price: 27.00 },
  { id: 633, product_id: 120, store: 'Puregold Tanauan', price: 21.00 },
  { id: 634, product_id: 124, store: 'Puregold Tanauan', price: 33.50 },
  { id: 635, product_id: 126, store: 'Puregold Tanauan', price: 23.50 },
  
  // Cooking Oil
  { id: 636, product_id: 130, store: 'Puregold Tanauan', price: 142.00 },
  { id: 637, product_id: 131, store: 'Puregold Tanauan', price: 152.00 },
  { id: 638, product_id: 132, store: 'Puregold Tanauan', price: 132.00 },
  
  // Pasta
  { id: 639, product_id: 134, store: 'Puregold Tanauan', price: 76.00 },
  { id: 640, product_id: 135, store: 'Puregold Tanauan', price: 40.50 },
  
  // Snacks
  { id: 641, product_id: 137, store: 'Puregold Tanauan', price: 40.50 },
  { id: 642, product_id: 138, store: 'Puregold Tanauan', price: 33.50 },
  { id: 643, product_id: 140, store: 'Puregold Tanauan', price: 26.50 },
  { id: 644, product_id: 142, store: 'Puregold Tanauan', price: 46.50 },
  { id: 645, product_id: 145, store: 'Puregold Tanauan', price: 83.00 },
  { id: 646, product_id: 146, store: 'Puregold Tanauan', price: 36.50 },
  
  // Household
  { id: 647, product_id: 152, store: 'Puregold Tanauan', price: 180.00 },
  { id: 648, product_id: 152, store: 'Citi Mall Tanauan', price: 185.00 },
  { id: 649, product_id: 153, store: 'Puregold Tanauan', price: 190.00 },
  { id: 650, product_id: 155, store: 'Puregold Tanauan', price: 162.00 },
  { id: 651, product_id: 157, store: 'Puregold Tanauan', price: 66.00 },
  
  // Personal Care
  { id: 652, product_id: 162, store: 'Puregold Tanauan', price: 36.50 },
  { id: 653, product_id: 164, store: 'Puregold Tanauan', price: 83.00 },
  { id: 654, product_id: 167, store: 'Puregold Tanauan', price: 240.00 },
  { id: 655, product_id: 168, store: 'Puregold Tanauan', price: 182.00 },
  
  // Baby Products
  { id: 656, product_id: 174, store: 'Puregold Tanauan', price: 182.00 },
  { id: 657, product_id: 178, store: 'Puregold Tanauan', price: 380.00 },
  
  // Frozen Goods
  { id: 658, product_id: 179, store: 'Puregold Tanauan', price: 122.00 },
  { id: 659, product_id: 181, store: 'Puregold Tanauan', price: 280.00 },
  { id: 660, product_id: 183, store: 'Puregold Tanauan', price: 92.00 },

  // ========== ADDITIONAL PRICES FOR SANTO TOMAS ==========
  // Beverages
  { id: 661, product_id: 1, store: 'WalterMart Santo Tomas', price: 73.50 },
  { id: 662, product_id: 2, store: 'WalterMart Santo Tomas', price: 73.50 },
  { id: 663, product_id: 3, store: 'WalterMart Santo Tomas', price: 64.00 },
  { id: 664, product_id: 4, store: 'WalterMart Santo Tomas', price: 73.00 },
  { id: 665, product_id: 5, store: 'WalterMart Santo Tomas', price: 73.00 },
  { id: 666, product_id: 6, store: 'WalterMart Santo Tomas', price: 37.00 },
  { id: 667, product_id: 7, store: 'WalterMart Santo Tomas', price: 83.00 },
  { id: 668, product_id: 8, store: 'WalterMart Santo Tomas', price: 94.00 },
  { id: 669, product_id: 9, store: 'WalterMart Santo Tomas', price: 126.00 },
  { id: 670, product_id: 10, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 671, product_id: 11, store: 'WalterMart Santo Tomas', price: 17.00 },
  { id: 672, product_id: 12, store: 'WalterMart Santo Tomas', price: 17.00 },
  
  // Dairy
  { id: 673, product_id: 13, store: 'WalterMart Santo Tomas', price: 109.00 },
  { id: 674, product_id: 14, store: 'WalterMart Santo Tomas', price: 57.00 },
  { id: 675, product_id: 15, store: 'WalterMart Santo Tomas', price: 126.00 },
  { id: 676, product_id: 16, store: 'WalterMart Santo Tomas', price: 555.00 },
  { id: 677, product_id: 17, store: 'WalterMart Santo Tomas', price: 116.00 },
  { id: 678, product_id: 18, store: 'WalterMart Santo Tomas', price: 283.00 },
  { id: 679, product_id: 19, store: 'WalterMart Santo Tomas', price: 47.00 },
  { id: 680, product_id: 20, store: 'WalterMart Santo Tomas', price: 166.00 },
  { id: 681, product_id: 21, store: 'WalterMart Santo Tomas', price: 84.00 },
  { id: 682, product_id: 22, store: 'WalterMart Santo Tomas', price: 137.00 },
  { id: 683, product_id: 23, store: 'WalterMart Santo Tomas', price: 96.00 },
  { id: 684, product_id: 24, store: 'WalterMart Santo Tomas', price: 287.00 },
  
  // Instant Noodles
  { id: 685, product_id: 25, store: 'WalterMart Santo Tomas', price: 14.75 },
  { id: 686, product_id: 26, store: 'WalterMart Santo Tomas', price: 14.75 },
  { id: 687, product_id: 27, store: 'WalterMart Santo Tomas', price: 15.25 },
  { id: 688, product_id: 28, store: 'WalterMart Santo Tomas', price: 31.50 },
  { id: 689, product_id: 29, store: 'WalterMart Santo Tomas', price: 12.00 },
  { id: 690, product_id: 30, store: 'WalterMart Santo Tomas', price: 13.75 },
  
  // Canned Goods
  { id: 691, product_id: 31, store: 'WalterMart Santo Tomas', price: 88.00 },
  { id: 692, product_id: 32, store: 'WalterMart Santo Tomas', price: 54.00 },
  { id: 693, product_id: 33, store: 'WalterMart Santo Tomas', price: 27.00 },
  { id: 694, product_id: 34, store: 'WalterMart Santo Tomas', price: 26.00 },
  { id: 695, product_id: 35, store: 'WalterMart Santo Tomas', price: 31.00 },
  { id: 696, product_id: 36, store: 'WalterMart Santo Tomas', price: 27.50 },
  { id: 697, product_id: 37, store: 'WalterMart Santo Tomas', price: 25.50 },
  { id: 698, product_id: 38, store: 'WalterMart Santo Tomas', price: 77.00 },
  { id: 699, product_id: 39, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 700, product_id: 40, store: 'WalterMart Santo Tomas', price: 57.00 },
  { id: 701, product_id: 41, store: 'WalterMart Santo Tomas', price: 247.00 },
  { id: 702, product_id: 42, store: 'WalterMart Santo Tomas', price: 164.00 },
  
  // Coffee
  { id: 703, product_id: 43, store: 'WalterMart Santo Tomas', price: 94.00 },
  { id: 704, product_id: 44, store: 'WalterMart Santo Tomas', price: 193.00 },
  { id: 705, product_id: 45, store: 'WalterMart Santo Tomas', price: 177.00 },
  { id: 706, product_id: 46, store: 'WalterMart Santo Tomas', price: 164.00 },
  { id: 707, product_id: 47, store: 'WalterMart Santo Tomas', price: 84.00 },
  { id: 708, product_id: 48, store: 'WalterMart Santo Tomas', price: 184.00 },
  
  // Rice & Grains
  { id: 709, product_id: 49, store: 'WalterMart Santo Tomas', price: 57.00 },
  { id: 710, product_id: 50, store: 'WalterMart Santo Tomas', price: 61.00 },
  { id: 711, product_id: 51, store: 'WalterMart Santo Tomas', price: 76.00 },
  { id: 712, product_id: 52, store: 'WalterMart Santo Tomas', price: 86.00 },
  { id: 713, product_id: 53, store: 'WalterMart Santo Tomas', price: 66.00 },
  
  // Fruits
  { id: 714, product_id: 54, store: 'WalterMart Santo Tomas', price: 83.00 },
  { id: 715, product_id: 55, store: 'WalterMart Santo Tomas', price: 78.00 },
  { id: 716, product_id: 56, store: 'WalterMart Santo Tomas', price: 93.00 },
  { id: 717, product_id: 57, store: 'WalterMart Santo Tomas', price: 145.00 },
  { id: 718, product_id: 58, store: 'WalterMart Santo Tomas', price: 53.00 },
  { id: 719, product_id: 59, store: 'WalterMart Santo Tomas', price: 78.00 },
  { id: 720, product_id: 60, store: 'WalterMart Santo Tomas', price: 63.00 },
  { id: 721, product_id: 61, store: 'WalterMart Santo Tomas', price: 225.00 },
  { id: 722, product_id: 62, store: 'WalterMart Santo Tomas', price: 182.00 },
  { id: 723, product_id: 63, store: 'WalterMart Santo Tomas', price: 355.00 },
  
  // Vegetables
  { id: 724, product_id: 66, store: 'WalterMart Santo Tomas', price: 118.00 },
  { id: 725, product_id: 67, store: 'WalterMart Santo Tomas', price: 108.00 },
  { id: 726, product_id: 68, store: 'WalterMart Santo Tomas', price: 275.00 },
  { id: 727, product_id: 69, store: 'WalterMart Santo Tomas', price: 83.00 },
  { id: 728, product_id: 70, store: 'WalterMart Santo Tomas', price: 93.00 },
  { id: 729, product_id: 71, store: 'WalterMart Santo Tomas', price: 108.00 },
  { id: 730, product_id: 72, store: 'WalterMart Santo Tomas', price: 73.00 },
  { id: 731, product_id: 73, store: 'WalterMart Santo Tomas', price: 43.00 },
  { id: 732, product_id: 74, store: 'WalterMart Santo Tomas', price: 63.00 },
  { id: 733, product_id: 75, store: 'WalterMart Santo Tomas', price: 68.00 },
  { id: 734, product_id: 76, store: 'WalterMart Santo Tomas', price: 53.00 },
  { id: 735, product_id: 77, store: 'WalterMart Santo Tomas', price: 93.00 },
  { id: 736, product_id: 81, store: 'WalterMart Santo Tomas', price: 83.00 },
  { id: 737, product_id: 82, store: 'WalterMart Santo Tomas', price: 175.00 },
  { id: 738, product_id: 83, store: 'WalterMart Santo Tomas', price: 155.00 },
  
  // Meat
  { id: 739, product_id: 85, store: 'WalterMart Santo Tomas', price: 278.00 },
  { id: 740, product_id: 86, store: 'WalterMart Santo Tomas', price: 238.00 },
  { id: 741, product_id: 87, store: 'WalterMart Santo Tomas', price: 228.00 },
  { id: 742, product_id: 88, store: 'WalterMart Santo Tomas', price: 198.00 },
  { id: 743, product_id: 89, store: 'WalterMart Santo Tomas', price: 378.00 },
  { id: 744, product_id: 90, store: 'WalterMart Santo Tomas', price: 348.00 },
  { id: 745, product_id: 91, store: 'WalterMart Santo Tomas', price: 358.00 },
  { id: 746, product_id: 92, store: 'WalterMart Santo Tomas', price: 328.00 },
  { id: 747, product_id: 93, store: 'WalterMart Santo Tomas', price: 585.00 },
  { id: 748, product_id: 94, store: 'WalterMart Santo Tomas', price: 525.00 },
  { id: 749, product_id: 95, store: 'WalterMart Santo Tomas', price: 283.00 },
  { id: 750, product_id: 96, store: 'WalterMart Santo Tomas', price: 164.00 },
  
  // Eggs
  { id: 751, product_id: 104, store: 'WalterMart Santo Tomas', price: 238.00 },
  { id: 752, product_id: 105, store: 'WalterMart Santo Tomas', price: 258.00 },
  { id: 753, product_id: 106, store: 'WalterMart Santo Tomas', price: 282.00 },
  
  // Bread & Bakery
  { id: 754, product_id: 109, store: 'WalterMart Santo Tomas', price: 51.75 },
  { id: 755, product_id: 110, store: 'WalterMart Santo Tomas', price: 57.50 },
  { id: 756, product_id: 111, store: 'WalterMart Santo Tomas', price: 47.50 },
  
  // Condiments & Sauces
  { id: 757, product_id: 116, store: 'WalterMart Santo Tomas', price: 47.00 },
  { id: 758, product_id: 117, store: 'WalterMart Santo Tomas', price: 44.00 },
  { id: 759, product_id: 118, store: 'WalterMart Santo Tomas', price: 27.50 },
  { id: 760, product_id: 119, store: 'WalterMart Santo Tomas', price: 28.50 },
  { id: 761, product_id: 120, store: 'WalterMart Santo Tomas', price: 21.50 },
  { id: 762, product_id: 121, store: 'WalterMart Santo Tomas', price: 22.50 },
  { id: 763, product_id: 122, store: 'WalterMart Santo Tomas', price: 67.00 },
  { id: 764, product_id: 123, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 765, product_id: 124, store: 'WalterMart Santo Tomas', price: 34.00 },
  { id: 766, product_id: 125, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 767, product_id: 126, store: 'WalterMart Santo Tomas', price: 24.00 },
  { id: 768, product_id: 127, store: 'WalterMart Santo Tomas', price: 64.00 },
  { id: 769, product_id: 128, store: 'WalterMart Santo Tomas', price: 17.50 },
  { id: 770, product_id: 129, store: 'WalterMart Santo Tomas', price: 27.50 },
  
  // Cooking Oil
  { id: 771, product_id: 130, store: 'WalterMart Santo Tomas', price: 143.00 },
  { id: 772, product_id: 131, store: 'WalterMart Santo Tomas', price: 154.00 },
  { id: 773, product_id: 132, store: 'WalterMart Santo Tomas', price: 133.00 },
  { id: 774, product_id: 133, store: 'WalterMart Santo Tomas', price: 490.00 },
  
  // Pasta
  { id: 775, product_id: 134, store: 'WalterMart Santo Tomas', price: 77.00 },
  { id: 776, product_id: 135, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 777, product_id: 136, store: 'WalterMart Santo Tomas', price: 96.00 },
  
  // Snacks
  { id: 778, product_id: 137, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 779, product_id: 138, store: 'WalterMart Santo Tomas', price: 34.00 },
  { id: 780, product_id: 139, store: 'WalterMart Santo Tomas', price: 31.00 },
  { id: 781, product_id: 140, store: 'WalterMart Santo Tomas', price: 27.00 },
  { id: 782, product_id: 141, store: 'WalterMart Santo Tomas', price: 34.00 },
  { id: 783, product_id: 142, store: 'WalterMart Santo Tomas', price: 47.00 },
  { id: 784, product_id: 143, store: 'WalterMart Santo Tomas', price: 51.00 },
  { id: 785, product_id: 144, store: 'WalterMart Santo Tomas', price: 64.00 },
  { id: 786, product_id: 145, store: 'WalterMart Santo Tomas', price: 84.00 },
  { id: 787, product_id: 146, store: 'WalterMart Santo Tomas', price: 37.00 },
  { id: 788, product_id: 147, store: 'WalterMart Santo Tomas', price: 44.00 },
  
  // Candy & Sweets
  { id: 789, product_id: 148, store: 'WalterMart Santo Tomas', price: 167.00 },
  { id: 790, product_id: 149, store: 'WalterMart Santo Tomas', price: 124.00 },
  
  // Household
  { id: 791, product_id: 152, store: 'WalterMart Santo Tomas', price: 183.00 },
  { id: 792, product_id: 153, store: 'WalterMart Santo Tomas', price: 193.00 },
  { id: 793, product_id: 154, store: 'WalterMart Santo Tomas', price: 196.00 },
  { id: 794, product_id: 155, store: 'WalterMart Santo Tomas', price: 164.00 },
  { id: 795, product_id: 156, store: 'WalterMart Santo Tomas', price: 54.00 },
  { id: 796, product_id: 157, store: 'WalterMart Santo Tomas', price: 67.00 },
  { id: 797, product_id: 158, store: 'WalterMart Santo Tomas', price: 77.00 },
  { id: 798, product_id: 159, store: 'WalterMart Santo Tomas', price: 227.00 },
  { id: 799, product_id: 160, store: 'WalterMart Santo Tomas', price: 184.00 },
  { id: 800, product_id: 161, store: 'WalterMart Santo Tomas', price: 47.00 },
  
  // Personal Care
  { id: 801, product_id: 162, store: 'WalterMart Santo Tomas', price: 37.00 },
  { id: 802, product_id: 163, store: 'WalterMart Santo Tomas', price: 34.00 },
  { id: 803, product_id: 164, store: 'WalterMart Santo Tomas', price: 84.00 },
  { id: 804, product_id: 165, store: 'WalterMart Santo Tomas', price: 87.00 },
  { id: 805, product_id: 166, store: 'WalterMart Santo Tomas', price: 64.00 },
  { id: 806, product_id: 167, store: 'WalterMart Santo Tomas', price: 243.00 },
  { id: 807, product_id: 168, store: 'WalterMart Santo Tomas', price: 184.00 },
  { id: 808, product_id: 169, store: 'WalterMart Santo Tomas', price: 194.00 },
  { id: 809, product_id: 170, store: 'WalterMart Santo Tomas', price: 41.00 },
  { id: 810, product_id: 171, store: 'WalterMart Santo Tomas', price: 44.00 },
  { id: 811, product_id: 172, store: 'WalterMart Santo Tomas', price: 124.00 },
  { id: 812, product_id: 173, store: 'WalterMart Santo Tomas', price: 94.00 },
  
  // Baby Products
  { id: 813, product_id: 174, store: 'WalterMart Santo Tomas', price: 184.00 },
  { id: 814, product_id: 175, store: 'WalterMart Santo Tomas', price: 327.00 },
  { id: 815, product_id: 176, store: 'WalterMart Santo Tomas', price: 164.00 },
  { id: 816, product_id: 177, store: 'WalterMart Santo Tomas', price: 84.00 },
  { id: 817, product_id: 178, store: 'WalterMart Santo Tomas', price: 383.00 },
  
  // Frozen Goods
  { id: 818, product_id: 179, store: 'WalterMart Santo Tomas', price: 124.00 },
  { id: 819, product_id: 180, store: 'WalterMart Santo Tomas', price: 184.00 },
  { id: 820, product_id: 181, store: 'WalterMart Santo Tomas', price: 283.00 },
  { id: 821, product_id: 182, store: 'WalterMart Santo Tomas', price: 164.00 },
  { id: 822, product_id: 183, store: 'WalterMart Santo Tomas', price: 94.00 },
  { id: 823, product_id: 184, store: 'WalterMart Santo Tomas', price: 104.00 },
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
    console.log(`\n📊 Summary:`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Prices: ${prices.length}`);
    console.log(`   Stores covered: SM, Puregold, Robinson's, WalterMart, Public Markets`);
    console.log(`   Categories: Beverages, Dairy, Instant Noodles, Canned Goods, Coffee,`);
    console.log(`              Rice & Grains, Fruits, Vegetables, Meat, Fish & Seafood,`);
    console.log(`              Eggs, Bread & Bakery, Condiments & Sauces, Cooking Oil,`);
    console.log(`              Pasta, Snacks, Candy & Sweets, Household, Personal Care,`);
    console.log(`              Baby Products, Frozen Goods`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();