// server/src/seed.ts
import dotenv from 'dotenv';
import { connectDB } from './db';
import { Product, Price } from './models';

dotenv.config();

const products = [
  // ========== BEVERAGES ==========
  // Coke - Multiple sizes
  { id: 1, name: 'Coke', category: 'Beverages', unit: '330ml can' },
  { id: 2, name: 'Coke', category: 'Beverages', unit: '500ml' },
  { id: 3, name: 'Coke', category: 'Beverages', unit: '1L' },
  { id: 4, name: 'Coke', category: 'Beverages', unit: '1.5L' },
  { id: 5, name: 'Coke', category: 'Beverages', unit: '2L' },
  
  // Sprite - Multiple sizes
  { id: 6, name: 'Sprite', category: 'Beverages', unit: '330ml can' },
  { id: 7, name: 'Sprite', category: 'Beverages', unit: '500ml' },
  { id: 8, name: 'Sprite', category: 'Beverages', unit: '1L' },
  { id: 9, name: 'Sprite', category: 'Beverages', unit: '1.5L' },
  { id: 10, name: 'Sprite', category: 'Beverages', unit: '2L' },
  
  // Royal True Orange
  { id: 11, name: 'Royal True Orange', category: 'Beverages', unit: '330ml can' },
  { id: 12, name: 'Royal True Orange', category: 'Beverages', unit: '500ml' },
  { id: 13, name: 'Royal True Orange', category: 'Beverages', unit: '1.5L' },
  { id: 14, name: 'Royal True Orange', category: 'Beverages', unit: '2L' },
  
  // Pepsi
  { id: 15, name: 'Pepsi', category: 'Beverages', unit: '330ml can' },
  { id: 16, name: 'Pepsi', category: 'Beverages', unit: '500ml' },
  { id: 17, name: 'Pepsi', category: 'Beverages', unit: '1.5L' },
  { id: 18, name: 'Pepsi', category: 'Beverages', unit: '2L' },
  
  // Mountain Dew
  { id: 19, name: 'Mountain Dew', category: 'Beverages', unit: '330ml can' },
  { id: 20, name: 'Mountain Dew', category: 'Beverages', unit: '500ml' },
  { id: 21, name: 'Mountain Dew', category: 'Beverages', unit: '1.5L' },
  
  // C2 Green Tea
  { id: 22, name: 'C2 Green Tea Apple', category: 'Beverages', unit: '500ml' },
  { id: 23, name: 'C2 Green Tea Apple', category: 'Beverages', unit: '1L' },
  
  // Zesto Orange
  { id: 24, name: 'Zesto Orange', category: 'Beverages', unit: '200ml (pack of 10)' },
  
  // Del Monte Pineapple Juice
  { id: 25, name: 'Del Monte Pineapple Juice', category: 'Beverages', unit: '240ml' },
  { id: 26, name: 'Del Monte Pineapple Juice', category: 'Beverages', unit: '1L' },
  
  // Minute Maid Orange Juice
  { id: 27, name: 'Minute Maid Orange Juice', category: 'Beverages', unit: '1L' },
  { id: 28, name: 'Minute Maid Orange Juice', category: 'Beverages', unit: '330ml' },
  
  // Gatorade
  { id: 29, name: 'Gatorade Blue Bolt', category: 'Beverages', unit: '500ml' },
  { id: 30, name: 'Gatorade Blue Bolt', category: 'Beverages', unit: '1L' },
  
  // Water
  { id: 31, name: 'Summit Mineral Water', category: 'Beverages', unit: '500ml' },
  { id: 32, name: 'Summit Mineral Water', category: 'Beverages', unit: '1L' },
  { id: 33, name: 'Wilkins Distilled Water', category: 'Beverages', unit: '500ml' },
  { id: 34, name: 'Wilkins Distilled Water', category: 'Beverages', unit: '1L' },

  // ========== DAIRY ==========
  // Powdered Milk
  { id: 35, name: 'Bear Brand Powdered Milk', category: 'Dairy', unit: '150g' },
  { id: 36, name: 'Bear Brand Powdered Milk', category: 'Dairy', unit: '320g' },
  { id: 37, name: 'Bear Brand Powdered Milk', category: 'Dairy', unit: '700g' },
  
  // Evaporated Milk
  { id: 38, name: 'Alaska Evaporated Milk', category: 'Dairy', unit: '154ml' },
  { id: 39, name: 'Alaska Evaporated Milk', category: 'Dairy', unit: '370ml' },
  
  // Fresh Milk
  { id: 40, name: 'Nestle Fresh Milk', category: 'Dairy', unit: '1L' },
  { id: 41, name: 'Nestle Fresh Milk', category: 'Dairy', unit: '250ml' },
  { id: 42, name: 'Magnolia Fresh Milk', category: 'Dairy', unit: '1L' },
  { id: 43, name: 'Magnolia Fresh Milk', category: 'Dairy', unit: '250ml' },
  
  // Milk Powder
  { id: 44, name: 'Anchor Full Cream Milk Powder', category: 'Dairy', unit: '400g' },
  { id: 45, name: 'Anchor Full Cream Milk Powder', category: 'Dairy', unit: '900g' },
  { id: 46, name: 'Birch Tree Fortified Powdered Milk', category: 'Dairy', unit: '330g' },
  { id: 47, name: 'Birch Tree Fortified Powdered Milk', category: 'Dairy', unit: '550g' },
  
  // Cream & Butter
  { id: 48, name: 'Nestle All Purpose Cream', category: 'Dairy', unit: '250ml' },
  { id: 49, name: 'Nestle All Purpose Cream', category: 'Dairy', unit: '125ml' },
  { id: 50, name: 'Magnolia Butter', category: 'Dairy', unit: '200g' },
  { id: 51, name: 'Magnolia Butter', category: 'Dairy', unit: '100g' },
  
  // Cheese
  { id: 52, name: 'Eden Cheese', category: 'Dairy', unit: '165g' },
  { id: 53, name: 'Eden Cheese', category: 'Dairy', unit: '440g' },
  { id: 54, name: 'Arla Cream Cheese', category: 'Dairy', unit: '150g' },
  
  // Yogurt
  { id: 55, name: 'Nestle Yogurt Strawberry', category: 'Dairy', unit: '80g (4-pack)' },
  
  // Ice Cream
  { id: 56, name: 'Selecta Ice Cream Ube', category: 'Dairy', unit: '1.3L' },
  { id: 57, name: 'Selecta Ice Cream Ube', category: 'Dairy', unit: '750ml' },

  // ========== INSTANT NOODLES ==========
  { id: 58, name: 'Lucky Me Pancit Canton Original', category: 'Instant Noodles', unit: 'per pack' },
  { id: 59, name: 'Lucky Me Pancit Canton Original', category: 'Instant Noodles', unit: '10-pack' },
  { id: 60, name: 'Lucky Me Pancit Canton Chilimansi', category: 'Instant Noodles', unit: 'per pack' },
  { id: 61, name: 'Lucky Me Pancit Canton Chilimansi', category: 'Instant Noodles', unit: '10-pack' },
  { id: 62, name: 'Lucky Me La Paz Batchoy', category: 'Instant Noodles', unit: 'per pack' },
  { id: 63, name: 'Lucky Me La Paz Batchoy', category: 'Instant Noodles', unit: '10-pack' },
  { id: 64, name: 'Nissin Cup Noodles Seafood', category: 'Instant Noodles', unit: '60g' },
  { id: 65, name: 'Payless Instant Pancit Canton', category: 'Instant Noodles', unit: 'per pack' },
  { id: 66, name: 'Quickchow Instant Mami Beef', category: 'Instant Noodles', unit: 'per pack' },

  // ========== CANNED GOODS ==========
  // Tuna
  { id: 67, name: 'Century Tuna Flakes in Oil', category: 'Canned Goods', unit: '180g' },
  { id: 68, name: 'Century Tuna Flakes in Oil', category: 'Canned Goods', unit: '155g' },
  
  // Corned Beef
  { id: 69, name: 'Argentina Corned Beef', category: 'Canned Goods', unit: '175g' },
  { id: 70, name: 'Argentina Corned Beef', category: 'Canned Goods', unit: '260g' },
  
  // Sardines
  { id: 71, name: 'Ligo Sardines in Tomato Sauce', category: 'Canned Goods', unit: '155g' },
  { id: 72, name: 'Ligo Sardines in Tomato Sauce', category: 'Canned Goods', unit: '215g' },
  { id: 73, name: '555 Tuna Sardines', category: 'Canned Goods', unit: '155g' },
  { id: 74, name: 'Mega Sardines Green', category: 'Canned Goods', unit: '155g' },
  { id: 75, name: 'Mega Sardines Green', category: 'Canned Goods', unit: '215g' },
  
  // Liver Spread
  { id: 76, name: 'CDO Liver Spread', category: 'Canned Goods', unit: '85g' },
  { id: 77, name: 'CDO Liver Spread', category: 'Canned Goods', unit: '175g' },
  { id: 78, name: 'Reno Liver Spread', category: 'Canned Goods', unit: '85g' },
  
  // Sauces & Others
  { id: 79, name: 'Del Monte Spaghetti Sauce Filipino Style', category: 'Canned Goods', unit: '250g' },
  { id: 80, name: 'Del Monte Spaghetti Sauce Filipino Style', category: 'Canned Goods', unit: '500g' },
  { id: 81, name: 'Hunt\'s Pork & Beans', category: 'Canned Goods', unit: '230g' },
  { id: 82, name: 'Hunt\'s Pork & Beans', category: 'Canned Goods', unit: '150g' },
  { id: 83, name: 'Del Monte Pineapple Chunks', category: 'Canned Goods', unit: '227g' },
  
  // Luncheon Meat
  { id: 84, name: 'Spam Classic', category: 'Canned Goods', unit: '340g' },
  { id: 85, name: 'Spam Classic', category: 'Canned Goods', unit: '200g' },
  { id: 86, name: 'Maling Premium Luncheon Meat', category: 'Canned Goods', unit: '340g' },
  { id: 87, name: 'Maling Premium Luncheon Meat', category: 'Canned Goods', unit: '200g' },

  // ========== COFFEE ==========
  // Instant Coffee
  { id: 88, name: 'Nescafe Classic', category: 'Coffee', unit: '50g' },
  { id: 89, name: 'Nescafe Classic', category: 'Coffee', unit: '100g' },
  { id: 90, name: 'Nescafe Classic', category: 'Coffee', unit: '200g' },
  
  // 3-in-1 Coffee
  { id: 91, name: 'Nescafe 3-in-1 Original', category: 'Coffee', unit: '10 sachets' },
  { id: 92, name: 'Nescafe 3-in-1 Original', category: 'Coffee', unit: '30 sachets' },
  { id: 93, name: 'Great Taste White 3-in-1', category: 'Coffee', unit: '10 sachets' },
  { id: 94, name: 'Great Taste White 3-in-1', category: 'Coffee', unit: '30 sachets' },
  { id: 95, name: 'Kopiko Brown Coffee', category: 'Coffee', unit: '10 sachets' },
  { id: 96, name: 'Kopiko Brown Coffee', category: 'Coffee', unit: '30 sachets' },
  { id: 97, name: 'San Mig Coffee Barako', category: 'Coffee', unit: '10 sachets' },
  
  // Milo
  { id: 98, name: 'Milo Powder', category: 'Coffee', unit: '300g' },
  { id: 99, name: 'Milo Powder', category: 'Coffee', unit: '600g' },
  { id: 100, name: 'Milo Powder', category: 'Coffee', unit: '1kg' },

  // ========== RICE & GRAINS ==========
  // Sinandomeng Rice
  { id: 101, name: 'Sinandomeng Rice', category: 'Rice & Grains', unit: '1 kg' },
  { id: 102, name: 'Sinandomeng Rice', category: 'Rice & Grains', unit: '5 kg' },
  { id: 103, name: 'Sinandomeng Rice', category: 'Rice & Grains', unit: '10 kg' },
  { id: 104, name: 'Sinandomeng Rice', category: 'Rice & Grains', unit: '25 kg' },
  
  // Jasmine Rice
  { id: 105, name: 'Jasmine Rice', category: 'Rice & Grains', unit: '1 kg' },
  { id: 106, name: 'Jasmine Rice', category: 'Rice & Grains', unit: '5 kg' },
  { id: 107, name: 'Jasmine Rice', category: 'Rice & Grains', unit: '10 kg' },
  { id: 108, name: 'Jasmine Rice', category: 'Rice & Grains', unit: '25 kg' },
  
  // Dinorado Rice
  { id: 109, name: 'Dinorado Rice', category: 'Rice & Grains', unit: '1 kg' },
  { id: 110, name: 'Dinorado Rice', category: 'Rice & Grains', unit: '5 kg' },
  { id: 111, name: 'Dinorado Rice', category: 'Rice & Grains', unit: '10 kg' },
  
  // Brown Rice
  { id: 112, name: 'Brown Rice', category: 'Rice & Grains', unit: '1 kg' },
  { id: 113, name: 'Brown Rice', category: 'Rice & Grains', unit: '5 kg' },
  
  // Malagkit Rice
  { id: 114, name: 'Malagkit Rice', category: 'Rice & Grains', unit: '1 kg' },
  { id: 115, name: 'Malagkit Rice', category: 'Rice & Grains', unit: '5 kg' },

  // ========== FRUITS ==========
  // Bananas
  { id: 116, name: 'Royal Banana', category: 'Fruits', unit: 'per kg' },
  { id: 117, name: 'Royal Banana', category: 'Fruits', unit: 'per dozen' },
  { id: 118, name: 'Latundan Banana', category: 'Fruits', unit: 'per kg' },
  { id: 119, name: 'Latundan Banana', category: 'Fruits', unit: 'per dozen' },
  { id: 120, name: 'Cavendish Banana', category: 'Fruits', unit: 'per kg' },
  { id: 121, name: 'Cavendish Banana', category: 'Fruits', unit: 'per dozen' },
  
  // Tropical Fruits
  { id: 122, name: 'Mango Manila', category: 'Fruits', unit: 'per kg' },
  { id: 123, name: 'Mango Manila', category: 'Fruits', unit: 'per piece' },
  { id: 124, name: 'Papaya', category: 'Fruits', unit: 'per kg' },
  { id: 125, name: 'Papaya', category: 'Fruits', unit: 'per piece' },
  { id: 126, name: 'Pineapple Queen', category: 'Fruits', unit: 'per piece' },
  { id: 127, name: 'Watermelon', category: 'Fruits', unit: 'per kg' },
  { id: 128, name: 'Watermelon', category: 'Fruits', unit: 'per piece' },
  
  // Imported Fruits
  { id: 129, name: 'Apple Fuji', category: 'Fruits', unit: 'per kg' },
  { id: 130, name: 'Apple Fuji', category: 'Fruits', unit: 'per piece' },
  { id: 131, name: 'Orange Imported', category: 'Fruits', unit: 'per kg' },
  { id: 132, name: 'Orange Imported', category: 'Fruits', unit: 'per piece' },
  { id: 133, name: 'Grapes Red', category: 'Fruits', unit: 'per kg' },
  { id: 134, name: 'Grapes Red', category: 'Fruits', unit: '500g' },
  
  // Local Fruits
  { id: 135, name: 'Calamansi', category: 'Fruits', unit: 'per kg' },
  { id: 136, name: 'Calamansi', category: 'Fruits', unit: '250g' },
  { id: 137, name: 'Coconut', category: 'Fruits', unit: 'per piece' },

  // ========== VEGETABLES ==========
  // Onions & Garlic
  { id: 138, name: 'White Onion', category: 'Vegetables', unit: 'per kg' },
  { id: 139, name: 'White Onion', category: 'Vegetables', unit: '500g' },
  { id: 140, name: 'Red Onion', category: 'Vegetables', unit: 'per kg' },
  { id: 141, name: 'Red Onion', category: 'Vegetables', unit: '500g' },
  { id: 142, name: 'Garlic Native', category: 'Vegetables', unit: 'per kg' },
  { id: 143, name: 'Garlic Native', category: 'Vegetables', unit: '250g' },
  
  // Common Vegetables
  { id: 144, name: 'Tomato', category: 'Vegetables', unit: 'per kg' },
  { id: 145, name: 'Tomato', category: 'Vegetables', unit: '500g' },
  { id: 146, name: 'Potato', category: 'Vegetables', unit: 'per kg' },
  { id: 147, name: 'Potato', category: 'Vegetables', unit: '500g' },
  { id: 148, name: 'Carrots', category: 'Vegetables', unit: 'per kg' },
  { id: 149, name: 'Carrots', category: 'Vegetables', unit: '500g' },
  { id: 150, name: 'Cabbage', category: 'Vegetables', unit: 'per kg' },
  { id: 151, name: 'Cabbage', category: 'Vegetables', unit: 'per head' },
  { id: 152, name: 'Lettuce', category: 'Vegetables', unit: 'per head' },
  { id: 153, name: 'Cucumber', category: 'Vegetables', unit: 'per kg' },
  { id: 154, name: 'Cucumber', category: 'Vegetables', unit: 'per piece' },
  
  // Filipino Vegetables
  { id: 155, name: 'Eggplant', category: 'Vegetables', unit: 'per kg' },
  { id: 156, name: 'Eggplant', category: 'Vegetables', unit: '500g' },
  { id: 157, name: 'Squash', category: 'Vegetables', unit: 'per kg' },
  { id: 158, name: 'Squash', category: 'Vegetables', unit: '500g' },
  { id: 159, name: 'Sitaw/String Beans', category: 'Vegetables', unit: 'per kg' },
  { id: 160, name: 'Sitaw/String Beans', category: 'Vegetables', unit: '250g' },
  { id: 161, name: 'Kangkong', category: 'Vegetables', unit: 'per bundle' },
  { id: 162, name: 'Pechay', category: 'Vegetables', unit: 'per bundle' },
  { id: 163, name: 'Malunggay', category: 'Vegetables', unit: 'per bundle' },
  { id: 164, name: 'Ampalaya/Bitter Gourd', category: 'Vegetables', unit: 'per kg' },
  { id: 165, name: 'Ampalaya/Bitter Gourd', category: 'Vegetables', unit: '500g' },
  { id: 166, name: 'Bell Pepper', category: 'Vegetables', unit: 'per kg' },
  { id: 167, name: 'Bell Pepper', category: 'Vegetables', unit: '250g' },
  { id: 168, name: 'Ginger', category: 'Vegetables', unit: 'per kg' },
  { id: 169, name: 'Ginger', category: 'Vegetables', unit: '250g' },
  { id: 170, name: 'Green Chili', category: 'Vegetables', unit: 'per kg' },
  { id: 171, name: 'Green Chili', category: 'Vegetables', unit: '100g' },

  // ========== MEAT ==========
  // Chicken
  { id: 172, name: 'Chicken Breast', category: 'Meat', unit: 'per kg' },
  { id: 173, name: 'Chicken Breast', category: 'Meat', unit: '500g' },
  { id: 174, name: 'Chicken Drumsticks', category: 'Meat', unit: 'per kg' },
  { id: 175, name: 'Chicken Drumsticks', category: 'Meat', unit: '500g' },
  { id: 176, name: 'Chicken Wings', category: 'Meat', unit: 'per kg' },
  { id: 177, name: 'Chicken Wings', category: 'Meat', unit: '500g' },
  { id: 178, name: 'Chicken Whole', category: 'Meat', unit: 'per kg' },
  { id: 179, name: 'Chicken Whole', category: 'Meat', unit: 'per piece' },
  
  // Pork
  { id: 180, name: 'Pork Belly Liempo', category: 'Meat', unit: 'per kg' },
  { id: 181, name: 'Pork Belly Liempo', category: 'Meat', unit: '500g' },
  { id: 182, name: 'Pork Kasim', category: 'Meat', unit: 'per kg' },
  { id: 183, name: 'Pork Kasim', category: 'Meat', unit: '500g' },
  { id: 184, name: 'Pork Chop', category: 'Meat', unit: 'per kg' },
  { id: 185, name: 'Pork Chop', category: 'Meat', unit: '500g' },
  { id: 186, name: 'Ground Pork', category: 'Meat', unit: 'per kg' },
  { id: 187, name: 'Ground Pork', category: 'Meat', unit: '500g' },
  { id: 188, name: 'Ground Pork', category: 'Meat', unit: '250g' },
  
  // Beef
  { id: 189, name: 'Beef Steak Meat', category: 'Meat', unit: 'per kg' },
  { id: 190, name: 'Beef Steak Meat', category: 'Meat', unit: '500g' },
  { id: 191, name: 'Ground Beef', category: 'Meat', unit: 'per kg' },
  { id: 192, name: 'Ground Beef', category: 'Meat', unit: '500g' },
  { id: 193, name: 'Ground Beef', category: 'Meat', unit: '250g' },
  
  // Processed Meat
  { id: 194, name: 'Hotdog Purefoods Tender Juicy', category: 'Meat', unit: '1kg' },
  { id: 195, name: 'Hotdog Purefoods Tender Juicy', category: 'Meat', unit: '500g' },
  { id: 196, name: 'Bacon CDO', category: 'Meat', unit: '200g' },
  { id: 197, name: 'Bacon CDO', category: 'Meat', unit: '500g' },

  // ========== FISH & SEAFOOD ==========
  { id: 198, name: 'Bangus/Milkfish', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 199, name: 'Bangus/Milkfish', category: 'Fish & Seafood', unit: 'per piece (medium)' },
  { id: 200, name: 'Bangus/Milkfish', category: 'Fish & Seafood', unit: 'per piece (large)' },
  { id: 201, name: 'Tilapia', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 202, name: 'Tilapia', category: 'Fish & Seafood', unit: 'per piece' },
  { id: 203, name: 'Galunggong', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 204, name: 'Galunggong', category: 'Fish & Seafood', unit: '500g' },
  { id: 205, name: 'Squid', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 206, name: 'Squid', category: 'Fish & Seafood', unit: '500g' },
  { id: 207, name: 'Shrimp Medium', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 208, name: 'Shrimp Medium', category: 'Fish & Seafood', unit: '500g' },
  { id: 209, name: 'Blue Marlin Steak', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 210, name: 'Blue Marlin Steak', category: 'Fish & Seafood', unit: '500g' },
  { id: 211, name: 'Talakitok', category: 'Fish & Seafood', unit: 'per kg' },
  { id: 212, name: 'Talakitok', category: 'Fish & Seafood', unit: 'per piece' },

  // ========== EGGS ==========
  { id: 213, name: 'Medium Eggs', category: 'Eggs', unit: 'per tray (30 pcs)' },
  { id: 214, name: 'Medium Eggs', category: 'Eggs', unit: 'per dozen' },
  { id: 215, name: 'Medium Eggs', category: 'Eggs', unit: 'half dozen' },
  { id: 216, name: 'Large Eggs', category: 'Eggs', unit: 'per tray (30 pcs)' },
  { id: 217, name: 'Large Eggs', category: 'Eggs', unit: 'per dozen' },
  { id: 218, name: 'Large Eggs', category: 'Eggs', unit: 'half dozen' },
  { id: 219, name: 'Extra Large Eggs', category: 'Eggs', unit: 'per tray (30 pcs)' },
  { id: 220, name: 'Extra Large Eggs', category: 'Eggs', unit: 'per dozen' },
  { id: 221, name: 'Quail Eggs', category: 'Eggs', unit: 'per dozen' },
  { id: 222, name: 'Quail Eggs', category: 'Eggs', unit: 'per tray (30 pcs)' },
  { id: 223, name: 'Salted Eggs', category: 'Eggs', unit: 'per dozen' },
  { id: 224, name: 'Salted Eggs', category: 'Eggs', unit: 'half dozen' },

  // ========== BREAD & BAKERY ==========
  { id: 225, name: 'Gardenia Classic White Bread', category: 'Bread & Bakery', unit: '450g' },
  { id: 226, name: 'Gardenia Classic White Bread', category: 'Bread & Bakery', unit: '600g' },
  { id: 227, name: 'Gardenia Wheat Bread', category: 'Bread & Bakery', unit: '450g' },
  { id: 228, name: 'Gardenia Wheat Bread', category: 'Bread & Bakery', unit: '600g' },
  { id: 229, name: 'Tasty Bread', category: 'Bread & Bakery', unit: '450g' },
  { id: 230, name: 'Pan de Sal', category: 'Bread & Bakery', unit: '10 pcs' },
  { id: 231, name: 'Pan de Sal', category: 'Bread & Bakery', unit: '20 pcs' },
  { id: 232, name: 'Ensaymada', category: 'Bread & Bakery', unit: 'per piece' },
  { id: 233, name: 'Spanish Bread', category: 'Bread & Bakery', unit: 'per piece' },
  { id: 234, name: 'Monay', category: 'Bread & Bakery', unit: 'per piece' },

  // ========== CONDIMENTS & SAUCES ==========
  // Ketchup
  { id: 235, name: 'UFC Banana Catsup', category: 'Condiments & Sauces', unit: '320g' },
  { id: 236, name: 'UFC Banana Catsup', category: 'Condiments & Sauces', unit: '550g' },
  { id: 237, name: 'Papa Banana Catsup', category: 'Condiments & Sauces', unit: '320g' },
  { id: 238, name: 'Papa Banana Catsup', category: 'Condiments & Sauces', unit: '550g' },
  
  // Soy Sauce
  { id: 239, name: 'Datu Puti Soy Sauce', category: 'Condiments & Sauces', unit: '385ml' },
  { id: 240, name: 'Datu Puti Soy Sauce', category: 'Condiments & Sauces', unit: '1L' },
  { id: 241, name: 'Silver Swan Soy Sauce', category: 'Condiments & Sauces', unit: '385ml' },
  { id: 242, name: 'Silver Swan Soy Sauce', category: 'Condiments & Sauces', unit: '1L' },
  
  // Vinegar
  { id: 243, name: 'Datu Puti Vinegar', category: 'Condiments & Sauces', unit: '385ml' },
  { id: 244, name: 'Datu Puti Vinegar', category: 'Condiments & Sauces', unit: '1L' },
  { id: 245, name: 'UFC Vinegar', category: 'Condiments & Sauces', unit: '385ml' },
  { id: 246, name: 'UFC Vinegar', category: 'Condiments & Sauces', unit: '1L' },
  
  // Other Sauces & Seasonings
  { id: 247, name: 'Mama Sita\'s Oyster Sauce', category: 'Condiments & Sauces', unit: '405g' },
  { id: 248, name: 'Knorr Liquid Seasoning', category: 'Condiments & Sauces', unit: '250ml' },
  { id: 249, name: 'Knorr Liquid Seasoning', category: 'Condiments & Sauces', unit: '500ml' },
  { id: 250, name: 'Maggi Magic Sarap', category: 'Condiments & Sauces', unit: '50g' },
  { id: 251, name: 'Maggi Magic Sarap', category: 'Condiments & Sauces', unit: '100g' },
  { id: 252, name: 'Ajinomoto Umami Seasoning', category: 'Condiments & Sauces', unit: '100g' },
  { id: 253, name: 'Ajinomoto Umami Seasoning', category: 'Condiments & Sauces', unit: '200g' },
  { id: 254, name: 'Iodized Salt', category: 'Condiments & Sauces', unit: '1kg' },
  { id: 255, name: 'Iodized Salt', category: 'Condiments & Sauces', unit: '500g' },
  { id: 256, name: 'Black Pepper Ground', category: 'Condiments & Sauces', unit: '50g' },
  { id: 257, name: 'Black Pepper Ground', category: 'Condiments & Sauces', unit: '100g' },
  { id: 258, name: 'UFC Gravy Mix', category: 'Condiments & Sauces', unit: '25g' },
  { id: 259, name: 'McCormick BBQ Marinade Mix', category: 'Condiments & Sauces', unit: '40g' },

  // ========== COOKING OIL ==========
  { id: 260, name: 'Baguio Vegetable Oil', category: 'Cooking Oil', unit: '1L' },
  { id: 261, name: 'Baguio Vegetable Oil', category: 'Cooking Oil', unit: '2L' },
  { id: 262, name: 'Minola Premium Cooking Oil', category: 'Cooking Oil', unit: '1L' },
  { id: 263, name: 'Minola Premium Cooking Oil', category: 'Cooking Oil', unit: '2L' },
  { id: 264, name: 'Golden Fiesta Palm Oil', category: 'Cooking Oil', unit: '1L' },
  { id: 265, name: 'Golden Fiesta Palm Oil', category: 'Cooking Oil', unit: '2L' },
  { id: 266, name: 'Olive Oil Extra Virgin', category: 'Cooking Oil', unit: '250ml' },
  { id: 267, name: 'Olive Oil Extra Virgin', category: 'Cooking Oil', unit: '500ml' },

  // ========== PASTA ==========
  { id: 268, name: 'Royal Spaghetti Pasta', category: 'Pasta', unit: '450g' },
  { id: 269, name: 'Royal Spaghetti Pasta', category: 'Pasta', unit: '900g' },
  { id: 270, name: 'Royal Elbow Macaroni', category: 'Pasta', unit: '200g' },
  { id: 271, name: 'Royal Elbow Macaroni', category: 'Pasta', unit: '400g' },
  { id: 272, name: 'San Remo Penne', category: 'Pasta', unit: '500g' },
  { id: 273, name: 'San Remo Penne', category: 'Pasta', unit: '1kg' },

  // ========== SNACKS ==========
  { id: 274, name: 'Jack n Jill Piattos Cheese', category: 'Snacks', unit: '40g' },
  { id: 275, name: 'Jack n Jill Piattos Cheese', category: 'Snacks', unit: '85g' },
  { id: 276, name: 'Oishi Prawn Crackers', category: 'Snacks', unit: '60g' },
  { id: 277, name: 'Oishi Prawn Crackers', category: 'Snacks', unit: '90g' },
  { id: 278, name: 'Nova Multigrain Chips', category: 'Snacks', unit: '78g' },
  { id: 279, name: 'Chippy BBQ', category: 'Snacks', unit: '110g' },
  { id: 280, name: 'Boy Bawang Cornick Adobo', category: 'Snacks', unit: '100g' },
  { id: 281, name: 'Skyflakes Crackers', category: 'Snacks', unit: '250g' },
  { id: 282, name: 'Skyflakes Crackers', category: 'Snacks', unit: '500g' },
  { id: 283, name: 'Fita Crackers', category: 'Snacks', unit: '300g' },
  { id: 284, name: 'Fita Crackers', category: 'Snacks', unit: '600g' },
  { id: 285, name: 'M.Y. San Grahams', category: 'Snacks', unit: '200g' },
  { id: 286, name: 'M.Y. San Grahams', category: 'Snacks', unit: '400g' },
  { id: 287, name: 'Oreo Cookies', category: 'Snacks', unit: '137g' },
  { id: 288, name: 'Oreo Cookies', category: 'Snacks', unit: '274g' },
  { id: 289, name: 'Cream-O Cookies', category: 'Snacks', unit: '132g' },
  { id: 290, name: 'Cream-O Cookies', category: 'Snacks', unit: '264g' },
  { id: 291, name: 'Rebisco Crackers', category: 'Snacks', unit: '250g' },

  // ========== CANDY & SWEETS ==========
  { id: 292, name: 'Storck Knoppers', category: 'Candy & Sweets', unit: '25g (8-pack)' },
  { id: 293, name: 'White Rabbit Candy', category: 'Candy & Sweets', unit: '227g' },
  { id: 294, name: 'White Rabbit Candy', category: 'Candy & Sweets', unit: '100g' },
  { id: 295, name: 'Hany Candy', category: 'Candy & Sweets', unit: 'per pack' },
  { id: 296, name: 'Choc Nut', category: 'Candy & Sweets', unit: 'per pack (24 pcs)' },
  { id: 297, name: 'Choc Nut', category: 'Candy & Sweets', unit: 'per pack (12 pcs)' },

  // ========== FROZEN GOODS ==========
  { id: 298, name: 'Magnolia Chicken Nuggets', category: 'Frozen Goods', unit: '200g' },
  { id: 299, name: 'Magnolia Chicken Nuggets', category: 'Frozen Goods', unit: '400g' },
  { id: 300, name: 'Magnolia Chicken Fries', category: 'Frozen Goods', unit: '200g' },
  { id: 301, name: 'Magnolia Chicken Fries', category: 'Frozen Goods', unit: '400g' },
  { id: 302, name: 'Purefoods Chicken Franks', category: 'Frozen Goods', unit: '500g' },
  { id: 303, name: 'Purefoods Chicken Franks', category: 'Frozen Goods', unit: '1kg' },
  { id: 304, name: 'Crab Sticks', category: 'Frozen Goods', unit: '250g' },
  { id: 305, name: 'Crab Sticks', category: 'Frozen Goods', unit: '500g' },
  { id: 306, name: 'Fish Balls', category: 'Frozen Goods', unit: '250g' },
  { id: 307, name: 'Fish Balls', category: 'Frozen Goods', unit: '500g' },
  { id: 308, name: 'Squid Balls', category: 'Frozen Goods', unit: '250g' },
  { id: 309, name: 'Squid Balls', category: 'Frozen Goods', unit: '500g' },
];

const prices = [
  // ========== BEVERAGES (Products 1-12) ==========
  // Coke 1.5L
  { id: 1, product_id: 1, store: 'Tanauan City Public Market', price: 65.00 },
  { id: 2, product_id: 1, store: 'Santo Tomas Public Market', price: 66.00 },
  { id: 3, product_id: 1, store: 'Lipa City Public Market', price: 67.00 },
  { id: 4, product_id: 1, store: 'Batangas Grand Terminal Market', price: 65.00 },
  { id: 5, product_id: 1, store: 'Malvar Public Market', price: 64.00 },
  { id: 6, product_id: 1, store: 'Taal Heritage Public Market', price: 66.00 },
  
  // Sprite 1.5L
  { id: 7, product_id: 2, store: 'Tanauan City Public Market', price: 65.00 },
  { id: 8, product_id: 2, store: 'Santo Tomas Public Market', price: 66.00 },
  { id: 9, product_id: 2, store: 'Lipa City Public Market', price: 67.00 },
  { id: 10, product_id: 2, store: 'Batangas Grand Terminal Market', price: 65.00 },
  { id: 11, product_id: 2, store: 'Rosario Public Market', price: 66.50 },
  
  // Royal True Orange 1.5L
  { id: 12, product_id: 3, store: 'Tanauan City Public Market', price: 62.00 },
  { id: 13, product_id: 3, store: 'Santo Tomas Public Market', price: 63.00 },
  { id: 14, product_id: 3, store: 'Lipa City Public Market', price: 64.00 },
  { id: 15, product_id: 3, store: 'Malvar Public Market', price: 61.00 },
  
  // Pepsi 1.5L
  { id: 16, product_id: 4, store: 'Tanauan City Public Market', price: 64.00 },
  { id: 17, product_id: 4, store: 'Santo Tomas Public Market', price: 65.00 },
  { id: 18, product_id: 4, store: 'Lipa City Public Market', price: 66.00 },
  { id: 19, product_id: 4, store: 'Batangas Grand Terminal Market', price: 64.00 },
  
  // Mountain Dew 1.5L
  { id: 20, product_id: 5, store: 'Tanauan City Public Market', price: 64.00 },
  { id: 21, product_id: 5, store: 'Santo Tomas Public Market', price: 65.00 },
  { id: 22, product_id: 5, store: 'Lipa City Public Market', price: 66.00 },
  
  // C2 Green Tea Apple 1L
  { id: 23, product_id: 6, store: 'Tanauan City Public Market', price: 28.00 },
  { id: 24, product_id: 6, store: 'Santo Tomas Public Market', price: 29.00 },
  { id: 25, product_id: 6, store: 'Lipa City Public Market', price: 30.00 },
  { id: 26, product_id: 6, store: 'Batangas Grand Terminal Market', price: 28.50 },
  
  // Zesto Orange 200ml (pack of 10)
  { id: 27, product_id: 7, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 28, product_id: 7, store: 'Santo Tomas Public Market', price: 86.00 },
  { id: 29, product_id: 7, store: 'Lipa City Public Market', price: 88.00 },
  
  // Del Monte Pineapple Juice 1L
  { id: 30, product_id: 8, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 31, product_id: 8, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 32, product_id: 8, store: 'Lipa City Public Market', price: 70.00 },
  { id: 33, product_id: 8, store: 'Batangas Grand Terminal Market', price: 68.50 },
  
  // Minute Maid Orange Juice 1L
  { id: 34, product_id: 9, store: 'Tanauan City Public Market', price: 72.00 },
  { id: 35, product_id: 9, store: 'Santo Tomas Public Market', price: 73.00 },
  { id: 36, product_id: 9, store: 'Lipa City Public Market', price: 75.00 },
  
  // Gatorade Blue Bolt 500ml
  { id: 37, product_id: 10, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 38, product_id: 10, store: 'Santo Tomas Public Market', price: 36.00 },
  { id: 39, product_id: 10, store: 'Lipa City Public Market', price: 37.00 },
  { id: 40, product_id: 10, store: 'Batangas Grand Terminal Market', price: 35.50 },
  
  // Summit Mineral Water 1L
  { id: 41, product_id: 11, store: 'Tanauan City Public Market', price: 18.00 },
  { id: 42, product_id: 11, store: 'Santo Tomas Public Market', price: 19.00 },
  { id: 43, product_id: 11, store: 'Lipa City Public Market', price: 20.00 },
  { id: 44, product_id: 11, store: 'Malvar Public Market', price: 17.50 },
  { id: 45, product_id: 11, store: 'Batangas Grand Terminal Market', price: 18.50 },
  
  // Wilkins Distilled Water 1L
  { id: 46, product_id: 12, store: 'Tanauan City Public Market', price: 20.00 },
  { id: 47, product_id: 12, store: 'Santo Tomas Public Market', price: 21.00 },
  { id: 48, product_id: 12, store: 'Lipa City Public Market', price: 22.00 },
  { id: 49, product_id: 12, store: 'Batangas Grand Terminal Market', price: 20.50 },

  // ========== DAIRY (Products 13-24) ==========
  // Bear Brand Powdered Milk 320g
  { id: 50, product_id: 13, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 51, product_id: 13, store: 'Santo Tomas Public Market', price: 186.00 },
  { id: 52, product_id: 13, store: 'Lipa City Public Market', price: 188.00 },
  { id: 53, product_id: 13, store: 'Batangas Grand Terminal Market', price: 185.00 },
  
  // Alaska Evaporated Milk 370ml
  { id: 54, product_id: 14, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 55, product_id: 14, store: 'Santo Tomas Public Market', price: 39.00 },
  { id: 56, product_id: 14, store: 'Lipa City Public Market', price: 40.00 },
  { id: 57, product_id: 14, store: 'Malvar Public Market', price: 37.50 },
  
  // Nestle Fresh Milk 1L
  { id: 58, product_id: 15, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 59, product_id: 15, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 60, product_id: 15, store: 'Lipa City Public Market', price: 98.00 },
  { id: 61, product_id: 15, store: 'Batangas Grand Terminal Market', price: 95.00 },
  
  // Anchor Full Cream Milk Powder 900g
  { id: 62, product_id: 16, store: 'Tanauan City Public Market', price: 425.00 },
  { id: 63, product_id: 16, store: 'Santo Tomas Public Market', price: 428.00 },
  { id: 64, product_id: 16, store: 'Lipa City Public Market', price: 430.00 },
  
  // Magnolia Fresh Milk 1L
  { id: 65, product_id: 17, store: 'Tanauan City Public Market', price: 92.00 },
  { id: 66, product_id: 17, store: 'Santo Tomas Public Market', price: 93.00 },
  { id: 67, product_id: 17, store: 'Lipa City Public Market', price: 95.00 },
  { id: 68, product_id: 17, store: 'Batangas Grand Terminal Market', price: 92.00 },
  
  // Birch Tree Fortified Powdered Milk 550g
  { id: 69, product_id: 18, store: 'Tanauan City Public Market', price: 265.00 },
  { id: 70, product_id: 18, store: 'Santo Tomas Public Market', price: 268.00 },
  { id: 71, product_id: 18, store: 'Lipa City Public Market', price: 270.00 },
  
  // Nestle All Purpose Cream 250ml
  { id: 72, product_id: 19, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 73, product_id: 19, store: 'Santo Tomas Public Market', price: 43.00 },
  { id: 74, product_id: 19, store: 'Lipa City Public Market', price: 45.00 },
  { id: 75, product_id: 19, store: 'Batangas Grand Terminal Market', price: 42.50 },
  
  // Magnolia Butter 200g
  { id: 76, product_id: 20, store: 'Tanauan City Public Market', price: 115.00 },
  { id: 77, product_id: 20, store: 'Santo Tomas Public Market', price: 116.00 },
  { id: 78, product_id: 20, store: 'Lipa City Public Market', price: 118.00 },
  
  // Eden Cheese 165g
  { id: 79, product_id: 21, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 80, product_id: 21, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 81, product_id: 21, store: 'Lipa City Public Market', price: 70.00 },
  { id: 82, product_id: 21, store: 'Batangas Grand Terminal Market', price: 68.00 },
  
  // Arla Cream Cheese 150g
  { id: 83, product_id: 22, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 84, product_id: 22, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 85, product_id: 22, store: 'Lipa City Public Market', price: 98.00 },
  
  // Nestle Yogurt Strawberry 80g (pack of 4)
  { id: 86, product_id: 23, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 87, product_id: 23, store: 'Santo Tomas Public Market', price: 56.00 },
  { id: 88, product_id: 23, store: 'Lipa City Public Market', price: 58.00 },
  
  // Selecta Ice Cream Ube 1.3L
  { id: 89, product_id: 24, store: 'Tanauan City Public Market', price: 195.00 },
  { id: 90, product_id: 24, store: 'Santo Tomas Public Market', price: 198.00 },
  { id: 91, product_id: 24, store: 'Lipa City Public Market', price: 200.00 },
  { id: 92, product_id: 24, store: 'Batangas Grand Terminal Market', price: 195.00 },

  // ========== INSTANT NOODLES (Products 25-30) ==========
  // Lucky Me Pancit Canton Original
  { id: 93, product_id: 25, store: 'Tanauan City Public Market', price: 14.00 },
  { id: 94, product_id: 25, store: 'Santo Tomas Public Market', price: 14.50 },
  { id: 95, product_id: 25, store: 'Lipa City Public Market', price: 15.00 },
  { id: 96, product_id: 25, store: 'Batangas Grand Terminal Market', price: 14.00 },
  { id: 97, product_id: 25, store: 'Malvar Public Market', price: 13.50 },
  
  // Lucky Me Pancit Canton Chilimansi
  { id: 98, product_id: 26, store: 'Tanauan City Public Market', price: 14.00 },
  { id: 99, product_id: 26, store: 'Santo Tomas Public Market', price: 14.50 },
  { id: 100, product_id: 26, store: 'Lipa City Public Market', price: 15.00 },
  { id: 101, product_id: 26, store: 'Batangas Grand Terminal Market', price: 14.00 },
  
  // Lucky Me La Paz Batchoy
  { id: 102, product_id: 27, store: 'Tanauan City Public Market', price: 14.50 },
  { id: 103, product_id: 27, store: 'Santo Tomas Public Market', price: 15.00 },
  { id: 104, product_id: 27, store: 'Lipa City Public Market', price: 15.50 },
  
  // Nissin Cup Noodles Seafood 60g
  { id: 105, product_id: 28, store: 'Tanauan City Public Market', price: 28.00 },
  { id: 106, product_id: 28, store: 'Santo Tomas Public Market', price: 29.00 },
  { id: 107, product_id: 28, store: 'Lipa City Public Market', price: 30.00 },
  { id: 108, product_id: 28, store: 'Batangas Grand Terminal Market', price: 28.50 },
  
  // Payless Instant Pancit Canton
  { id: 109, product_id: 29, store: 'Tanauan City Public Market', price: 12.00 },
  { id: 110, product_id: 29, store: 'Santo Tomas Public Market', price: 12.50 },
  { id: 111, product_id: 29, store: 'Lipa City Public Market', price: 13.00 },
  { id: 112, product_id: 29, store: 'Malvar Public Market', price: 11.50 },
  
  // Quickchow Instant Mami Beef
  { id: 113, product_id: 30, store: 'Tanauan City Public Market', price: 11.00 },
  { id: 114, product_id: 30, store: 'Santo Tomas Public Market', price: 11.50 },
  { id: 115, product_id: 30, store: 'Lipa City Public Market', price: 12.00 },

  // ========== CANNED GOODS (Products 31-42) ==========
  // Century Tuna Flakes in Oil 180g
  { id: 116, product_id: 31, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 117, product_id: 31, store: 'Santo Tomas Public Market', price: 36.00 },
  { id: 118, product_id: 31, store: 'Lipa City Public Market', price: 37.00 },
  { id: 119, product_id: 31, store: 'Batangas Grand Terminal Market', price: 35.00 },
  { id: 120, product_id: 31, store: 'Malvar Public Market', price: 34.50 },
  
  // Argentina Corned Beef 175g
  { id: 121, product_id: 32, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 122, product_id: 32, store: 'Santo Tomas Public Market', price: 43.00 },
  { id: 123, product_id: 32, store: 'Lipa City Public Market', price: 44.00 },
  { id: 124, product_id: 32, store: 'Batangas Grand Terminal Market', price: 42.00 },
  
  // Ligo Sardines in Tomato Sauce 155g
  { id: 125, product_id: 33, store: 'Tanauan City Public Market', price: 22.00 },
  { id: 126, product_id: 33, store: 'Santo Tomas Public Market', price: 22.50 },
  { id: 127, product_id: 33, store: 'Lipa City Public Market', price: 23.00 },
  { id: 128, product_id: 33, store: 'Batangas Grand Terminal Market', price: 22.00 },
  
  // 555 Tuna Sardines 155g
  { id: 129, product_id: 34, store: 'Tanauan City Public Market', price: 23.00 },
  { id: 130, product_id: 34, store: 'Santo Tomas Public Market', price: 23.50 },
  { id: 131, product_id: 34, store: 'Lipa City Public Market', price: 24.00 },
  
  // Mega Sardines Green 155g
  { id: 132, product_id: 35, store: 'Tanauan City Public Market', price: 20.00 },
  { id: 133, product_id: 35, store: 'Santo Tomas Public Market', price: 20.50 },
  { id: 134, product_id: 35, store: 'Lipa City Public Market', price: 21.00 },
  { id: 135, product_id: 35, store: 'Batangas Grand Terminal Market', price: 20.00 },
  
  // CDO Liver Spread 85g
  { id: 136, product_id: 36, store: 'Tanauan City Public Market', price: 28.00 },
  { id: 137, product_id: 36, store: 'Santo Tomas Public Market', price: 28.50 },
  { id: 138, product_id: 36, store: 'Lipa City Public Market', price: 29.00 },
  
  // Reno Liver Spread 85g
  { id: 139, product_id: 37, store: 'Tanauan City Public Market', price: 22.00 },
  { id: 140, product_id: 37, store: 'Santo Tomas Public Market', price: 22.50 },
  { id: 141, product_id: 37, store: 'Lipa City Public Market', price: 23.00 },
  { id: 142, product_id: 37, store: 'Batangas Grand Terminal Market', price: 22.00 },
  
  // Del Monte Spaghetti Sauce Filipino Style 500g
  { id: 143, product_id: 38, store: 'Tanauan City Public Market', price: 58.00 },
  { id: 144, product_id: 38, store: 'Santo Tomas Public Market', price: 59.00 },
  { id: 145, product_id: 38, store: 'Lipa City Public Market', price: 60.00 },
  
  // Hunt's Pork & Beans 230g
  { id: 146, product_id: 39, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 147, product_id: 39, store: 'Santo Tomas Public Market', price: 36.00 },
  { id: 148, product_id: 39, store: 'Lipa City Public Market', price: 37.00 },
  { id: 149, product_id: 39, store: 'Batangas Grand Terminal Market', price: 35.50 },
  
  // Del Monte Pineapple Chunks 227g
  { id: 150, product_id: 40, store: 'Tanauan City Public Market', price: 45.00 },
  { id: 151, product_id: 40, store: 'Santo Tomas Public Market', price: 46.00 },
  { id: 152, product_id: 40, store: 'Lipa City Public Market', price: 47.00 },
  
  // Spam Classic 340g
  { id: 153, product_id: 41, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 154, product_id: 41, store: 'Santo Tomas Public Market', price: 188.00 },
  { id: 155, product_id: 41, store: 'Lipa City Public Market', price: 190.00 },
  { id: 156, product_id: 41, store: 'Batangas Grand Terminal Market', price: 185.00 },
  
  // Maling Premium Luncheon Meat 340g
  { id: 157, product_id: 42, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 158, product_id: 42, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 159, product_id: 42, store: 'Lipa City Public Market', price: 98.00 },

  // ========== COFFEE (Products 43-48) ==========
  // Nescafe Classic 50g
  { id: 160, product_id: 43, store: 'Tanauan City Public Market', price: 75.00 },
  { id: 161, product_id: 43, store: 'Santo Tomas Public Market', price: 76.00 },
  { id: 162, product_id: 43, store: 'Lipa City Public Market', price: 78.00 },
  { id: 163, product_id: 43, store: 'Batangas Grand Terminal Market', price: 75.00 },
  
  // Nescafe 3-in-1 Original 30s
  { id: 164, product_id: 44, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 165, product_id: 44, store: 'Santo Tomas Public Market', price: 188.00 },
  { id: 166, product_id: 44, store: 'Lipa City Public Market', price: 190.00 },
  
  // Great Taste White 3-in-1 30s
  { id: 167, product_id: 45, store: 'Tanauan City Public Market', price: 165.00 },
  { id: 168, product_id: 45, store: 'Santo Tomas Public Market', price: 168.00 },
  { id: 169, product_id: 45, store: 'Lipa City Public Market', price: 170.00 },
  { id: 170, product_id: 45, store: 'Batangas Grand Terminal Market', price: 165.00 },
  
  // Kopiko Brown Coffee 30s
  { id: 171, product_id: 46, store: 'Tanauan City Public Market', price: 155.00 },
  { id: 172, product_id: 46, store: 'Santo Tomas Public Market', price: 158.00 },
  { id: 173, product_id: 46, store: 'Lipa City Public Market', price: 160.00 },
  
  // San Mig Coffee Barako 10g (10s)
  { id: 174, product_id: 47, store: 'Tanauan City Public Market', price: 45.00 },
  { id: 175, product_id: 47, store: 'Santo Tomas Public Market', price: 46.00 },
  { id: 176, product_id: 47, store: 'Lipa City Public Market', price: 48.00 },
  { id: 177, product_id: 47, store: 'Batangas Grand Terminal Market', price: 45.00 },
  { id: 178, product_id: 47, store: 'Cuenca Public Market', price: 43.00 },
  
  // Milo Powder 300g
  { id: 179, product_id: 48, store: 'Tanauan City Public Market', price: 125.00 },
  { id: 180, product_id: 48, store: 'Santo Tomas Public Market', price: 128.00 },
  { id: 181, product_id: 48, store: 'Lipa City Public Market', price: 130.00 },
  { id: 182, product_id: 48, store: 'Batangas Grand Terminal Market', price: 125.00 },

  // ========== RICE & GRAINS (Products 49-53) ==========
  // Sinandomeng Rice (1 kg)
  { id: 183, product_id: 49, store: 'Tanauan City Public Market', price: 48.00 },
  { id: 184, product_id: 49, store: 'Santo Tomas Public Market', price: 49.00 },
  { id: 185, product_id: 49, store: 'Lipa City Public Market', price: 50.00 },
  { id: 186, product_id: 49, store: 'Batangas Grand Terminal Market', price: 48.00 },
  { id: 187, product_id: 49, store: 'Malvar Public Market', price: 47.00 },
  { id: 188, product_id: 49, store: 'Rosario Public Market', price: 48.50 },
  
  // Jasmine Rice (1 kg)
  { id: 189, product_id: 50, store: 'Tanauan City Public Market', price: 52.00 },
  { id: 190, product_id: 50, store: 'Santo Tomas Public Market', price: 53.00 },
  { id: 191, product_id: 50, store: 'Lipa City Public Market', price: 54.00 },
  { id: 192, product_id: 50, store: 'Batangas Grand Terminal Market', price: 52.00 },
  
  // Dinorado Rice (1 kg)
  { id: 193, product_id: 51, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 194, product_id: 51, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 195, product_id: 51, store: 'Lipa City Public Market', price: 70.00 },
  
  // Brown Rice (1 kg)
  { id: 196, product_id: 52, store: 'Tanauan City Public Market', price: 62.00 },
  { id: 197, product_id: 52, store: 'Santo Tomas Public Market', price: 63.00 },
  { id: 198, product_id: 52, store: 'Lipa City Public Market', price: 65.00 },
  { id: 199, product_id: 52, store: 'Batangas Grand Terminal Market', price: 62.00 },
  
  // Malagkit Rice (1 kg)
  { id: 200, product_id: 53, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 201, product_id: 53, store: 'Santo Tomas Public Market', price: 56.00 },
  { id: 202, product_id: 53, store: 'Lipa City Public Market', price: 58.00 },

  // ========== FRUITS (Products 54-65) ==========
  // Royal Banana (1 kg)
  { id: 203, product_id: 54, store: 'Tanauan City Public Market', price: 45.00 },
  { id: 204, product_id: 54, store: 'Santo Tomas Public Market', price: 44.00 },
  { id: 205, product_id: 54, store: 'Lipa City Public Market', price: 46.00 },
  { id: 206, product_id: 54, store: 'Batangas Grand Terminal Market', price: 45.00 },
  { id: 207, product_id: 54, store: 'Rosario Public Market', price: 43.00 },
  { id: 208, product_id: 54, store: 'Malvar Public Market', price: 42.00 },
  
  // Latundan Banana (1 kg)
  { id: 209, product_id: 55, store: 'Tanauan City Public Market', price: 50.00 },
  { id: 210, product_id: 55, store: 'Santo Tomas Public Market', price: 49.00 },
  { id: 211, product_id: 55, store: 'Lipa City Public Market', price: 51.00 },
  { id: 212, product_id: 55, store: 'Batangas Grand Terminal Market', price: 50.00 },
  
  // Cavendish Banana (1 kg)
  { id: 213, product_id: 56, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 214, product_id: 56, store: 'Santo Tomas Public Market', price: 54.00 },
  { id: 215, product_id: 56, store: 'Lipa City Public Market', price: 56.00 },
  
  // Mango Manila (1 kg)
  { id: 216, product_id: 57, store: 'Tanauan City Public Market', price: 120.00 },
  { id: 217, product_id: 57, store: 'Santo Tomas Public Market', price: 118.00 },
  { id: 218, product_id: 57, store: 'Lipa City Public Market', price: 125.00 },
  { id: 219, product_id: 57, store: 'Batangas Grand Terminal Market', price: 120.00 },
  { id: 220, product_id: 57, store: 'Rosario Public Market', price: 115.00 },
  
  // Papaya (1 kg)
  { id: 221, product_id: 58, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 222, product_id: 58, store: 'Santo Tomas Public Market', price: 37.00 },
  { id: 223, product_id: 58, store: 'Lipa City Public Market', price: 40.00 },
  { id: 224, product_id: 58, store: 'Sambat Public Market', price: 36.00 },
  { id: 225, product_id: 58, store: 'Malvar Public Market', price: 35.00 },
  
  // Pineapple Queen (per pc)
  { id: 226, product_id: 59, store: 'Tanauan City Public Market', price: 65.00 },
  { id: 227, product_id: 59, store: 'Santo Tomas Public Market', price: 63.00 },
  { id: 228, product_id: 59, store: 'Lipa City Public Market', price: 68.00 },
  { id: 229, product_id: 59, store: 'Batangas Grand Terminal Market', price: 65.00 },
  
  // Watermelon (1 kg)
  { id: 230, product_id: 60, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 231, product_id: 60, store: 'Santo Tomas Public Market', price: 34.00 },
  { id: 232, product_id: 60, store: 'Lipa City Public Market', price: 36.00 },
  { id: 233, product_id: 60, store: 'Rosario Public Market', price: 33.00 },
  
  // Apple Fuji (1 kg)
  { id: 234, product_id: 61, store: 'Tanauan City Public Market', price: 195.00 },
  { id: 235, product_id: 61, store: 'Santo Tomas Public Market', price: 198.00 },
  { id: 236, product_id: 61, store: 'Lipa City Public Market', price: 200.00 },
  { id: 237, product_id: 61, store: 'Batangas Grand Terminal Market', price: 195.00 },
  
  // Orange Imported (1 kg)
  { id: 238, product_id: 62, store: 'Tanauan City Public Market', price: 165.00 },
  { id: 239, product_id: 62, store: 'Santo Tomas Public Market', price: 168.00 },
  { id: 240, product_id: 62, store: 'Lipa City Public Market', price: 170.00 },
  
  // Grapes Red (1 kg)
  { id: 241, product_id: 63, store: 'Tanauan City Public Market', price: 285.00 },
  { id: 242, product_id: 63, store: 'Santo Tomas Public Market', price: 288.00 },
  { id: 243, product_id: 63, store: 'Lipa City Public Market', price: 290.00 },
  { id: 244, product_id: 63, store: 'Batangas Grand Terminal Market', price: 285.00 },
  
  // Calamansi (1 kg)
  { id: 245, product_id: 64, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 246, product_id: 64, store: 'Santo Tomas Public Market', price: 53.00 },
  { id: 247, product_id: 64, store: 'Lipa City Public Market', price: 58.00 },
  { id: 248, product_id: 64, store: 'Batangas Grand Terminal Market', price: 55.00 },
  { id: 249, product_id: 64, store: 'Malvar Public Market', price: 52.00 },
  
  // Coconut (per pc)
  { id: 250, product_id: 65, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 251, product_id: 65, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 252, product_id: 65, store: 'Lipa City Public Market', price: 36.00 },
  { id: 253, product_id: 65, store: 'Batangas Grand Terminal Market', price: 35.00 },
  { id: 254, product_id: 65, store: 'San Juan Public Market', price: 30.00 },

  // ========== VEGETABLES (Products 66-87) ==========
  // White Onion (1 kg)
  { id: 255, product_id: 66, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 256, product_id: 66, store: 'Santo Tomas Public Market', price: 83.00 },
  { id: 257, product_id: 66, store: 'Lipa City Public Market', price: 86.00 },
  { id: 258, product_id: 66, store: 'Batangas Grand Terminal Market', price: 84.00 },
  { id: 259, product_id: 66, store: 'Malvar Public Market', price: 82.00 },
  { id: 260, product_id: 66, store: 'Sambat Public Market', price: 81.00 },
  
  // Red Onion (1 kg)
  { id: 261, product_id: 67, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 262, product_id: 67, store: 'Santo Tomas Public Market', price: 93.00 },
  { id: 263, product_id: 67, store: 'Lipa City Public Market', price: 96.00 },
  { id: 264, product_id: 67, store: 'Batangas Grand Terminal Market', price: 94.00 },
  { id: 265, product_id: 67, store: 'Malvar Public Market', price: 92.00 },
  
  // Garlic Native (1 kg)
  { id: 266, product_id: 68, store: 'Tanauan City Public Market', price: 180.00 },
  { id: 267, product_id: 68, store: 'Santo Tomas Public Market', price: 175.00 },
  { id: 268, product_id: 68, store: 'Lipa City Public Market', price: 185.00 },
  { id: 269, product_id: 68, store: 'Batangas Grand Terminal Market', price: 178.00 },
  { id: 270, product_id: 68, store: 'Rosario Public Market', price: 173.00 },
  
  // Tomato (1 kg)
  { id: 271, product_id: 69, store: 'Tanauan City Public Market', price: 65.00 },
  { id: 272, product_id: 69, store: 'Santo Tomas Public Market', price: 63.00 },
  { id: 273, product_id: 69, store: 'Lipa City Public Market', price: 67.00 },
  { id: 274, product_id: 69, store: 'Batangas Grand Terminal Market', price: 65.00 },
  { id: 275, product_id: 69, store: 'Sambat Public Market', price: 62.00 },
  { id: 276, product_id: 69, store: 'Malvar Public Market', price: 61.00 },
  
  // Potato (1 kg)
  { id: 277, product_id: 70, store: 'Tanauan City Public Market', price: 75.00 },
  { id: 278, product_id: 70, store: 'Santo Tomas Public Market', price: 74.00 },
  { id: 279, product_id: 70, store: 'Lipa City Public Market', price: 77.00 },
  { id: 280, product_id: 70, store: 'Batangas Grand Terminal Market', price: 75.00 },
  
  // Carrots (1 kg)
  { id: 281, product_id: 71, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 282, product_id: 71, store: 'Santo Tomas Public Market', price: 67.00 },
  { id: 283, product_id: 71, store: 'Lipa City Public Market', price: 70.00 },
  { id: 284, product_id: 71, store: 'Batangas Grand Terminal Market', price: 68.00 },
  { id: 285, product_id: 71, store: 'Malvar Public Market', price: 66.00 },
  
  // Cabbage (1 kg)
  { id: 286, product_id: 72, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 287, product_id: 72, store: 'Santo Tomas Public Market', price: 54.00 },
  { id: 288, product_id: 72, store: 'Lipa City Public Market', price: 57.00 },
  { id: 289, product_id: 72, store: 'Batangas Grand Terminal Market', price: 55.00 },
  
  // Lettuce (per head)
  { id: 290, product_id: 73, store: 'Tanauan City Public Market', price: 45.00 },
  { id: 291, product_id: 73, store: 'Santo Tomas Public Market', price: 44.00 },
  { id: 292, product_id: 73, store: 'Lipa City Public Market', price: 47.00 },
  { id: 293, product_id: 73, store: 'Batangas Grand Terminal Market', price: 45.00 },
  
  // Cucumber (1 kg)
  { id: 294, product_id: 74, store: 'Tanauan City Public Market', price: 48.00 },
  { id: 295, product_id: 74, store: 'Santo Tomas Public Market', price: 47.00 },
  { id: 296, product_id: 74, store: 'Lipa City Public Market', price: 50.00 },
  { id: 297, product_id: 74, store: 'Sambat Public Market', price: 46.00 },
  
  // Eggplant (1 kg)
  { id: 298, product_id: 75, store: 'Tanauan City Public Market', price: 65.00 },
  { id: 299, product_id: 75, store: 'Santo Tomas Public Market', price: 63.00 },
  { id: 300, product_id: 75, store: 'Lipa City Public Market', price: 67.00 },
  { id: 301, product_id: 75, store: 'Batangas Grand Terminal Market', price: 65.00 },
  { id: 302, product_id: 75, store: 'Malvar Public Market', price: 62.00 },
  
  // Squash (1 kg)
  { id: 303, product_id: 76, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 304, product_id: 76, store: 'Santo Tomas Public Market', price: 37.00 },
  { id: 305, product_id: 76, store: 'Lipa City Public Market', price: 40.00 },
  { id: 306, product_id: 76, store: 'Batangas Grand Terminal Market', price: 38.00 },
  
  // Sitaw/String Beans (1 kg)
  { id: 307, product_id: 77, store: 'Tanauan City Public Market', price: 75.00 },
  { id: 308, product_id: 77, store: 'Santo Tomas Public Market', price: 73.00 },
  { id: 309, product_id: 77, store: 'Lipa City Public Market', price: 77.00 },
  { id: 310, product_id: 77, store: 'Sambat Public Market', price: 72.00 },
  
  // Ampalaya/Bitter Melon (1 kg)
  { id: 311, product_id: 78, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 312, product_id: 78, store: 'Santo Tomas Public Market', price: 67.00 },
  { id: 313, product_id: 78, store: 'Lipa City Public Market', price: 70.00 },
  { id: 314, product_id: 78, store: 'Batangas Grand Terminal Market', price: 68.00 },
  
  // Okra (1 kg)
  { id: 315, product_id: 79, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 316, product_id: 79, store: 'Santo Tomas Public Market', price: 54.00 },
  { id: 317, product_id: 79, store: 'Lipa City Public Market', price: 57.00 },
  { id: 318, product_id: 79, store: 'Malvar Public Market', price: 53.00 },
  
  // Upo/Bottle Gourd (1 kg)
  { id: 319, product_id: 80, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 320, product_id: 80, store: 'Santo Tomas Public Market', price: 41.00 },
  { id: 321, product_id: 80, store: 'Lipa City Public Market', price: 44.00 },
  { id: 322, product_id: 80, store: 'Batangas Grand Terminal Market', price: 42.00 },
  
  // Patola/Sponge Gourd (1 kg)
  { id: 323, product_id: 81, store: 'Tanauan City Public Market', price: 58.00 },
  { id: 324, product_id: 81, store: 'Santo Tomas Public Market', price: 57.00 },
  { id: 325, product_id: 81, store: 'Lipa City Public Market', price: 60.00 },
  
  // Sayote/Chayote (1 kg)
  { id: 326, product_id: 82, store: 'Tanauan City Public Market', price: 45.00 },
  { id: 327, product_id: 82, store: 'Santo Tomas Public Market', price: 44.00 },
  { id: 328, product_id: 82, store: 'Lipa City Public Market', price: 47.00 },
  { id: 329, product_id: 82, store: 'Batangas Grand Terminal Market', price: 45.00 },
  
  // Labanos/White Radish (1 kg)
  { id: 330, product_id: 83, store: 'Tanauan City Public Market', price: 52.00 },
  { id: 331, product_id: 83, store: 'Santo Tomas Public Market', price: 51.00 },
  { id: 332, product_id: 83, store: 'Lipa City Public Market', price: 54.00 },
  
  // Talong na Pula/Red Eggplant (1 kg)
  { id: 333, product_id: 84, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 334, product_id: 84, store: 'Santo Tomas Public Market', price: 67.00 },
  { id: 335, product_id: 84, store: 'Lipa City Public Market', price: 70.00 },
  { id: 336, product_id: 84, store: 'Malvar Public Market', price: 66.00 },
  
  // Pechay/Bok Choy (1 kg)
  { id: 337, product_id: 85, store: 'Tanauan City Public Market', price: 48.00 },
  { id: 338, product_id: 85, store: 'Santo Tomas Public Market', price: 47.00 },
  { id: 339, product_id: 85, store: 'Lipa City Public Market', price: 50.00 },
  { id: 340, product_id: 85, store: 'Sambat Public Market', price: 46.00 },
  
  // Kangkong/Water Spinach (1 kg)
  { id: 341, product_id: 86, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 342, product_id: 86, store: 'Santo Tomas Public Market', price: 34.00 },
  { id: 343, product_id: 86, store: 'Lipa City Public Market', price: 37.00 },
  { id: 344, product_id: 86, store: 'Batangas Grand Terminal Market', price: 35.00 },
  { id: 345, product_id: 86, store: 'Malvar Public Market', price: 33.00 },
  
  // Malunggay/Moringa Leaves (1 kg)
  { id: 346, product_id: 87, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 347, product_id: 87, store: 'Santo Tomas Public Market', price: 37.00 },
  { id: 348, product_id: 87, store: 'Lipa City Public Market', price: 40.00 },
  { id: 349, product_id: 87, store: 'Batangas Grand Terminal Market', price: 38.00 },

  // ========== EGGS (Products 88-90) ==========
  // Chicken Eggs Medium (per dozen)
  { id: 350, product_id: 88, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 351, product_id: 88, store: 'Santo Tomas Public Market', price: 84.00 },
  { id: 352, product_id: 88, store: 'Lipa City Public Market', price: 87.00 },
  { id: 353, product_id: 88, store: 'Batangas Grand Terminal Market', price: 85.00 },
  { id: 354, product_id: 88, store: 'Malvar Public Market', price: 83.00 },
  { id: 355, product_id: 88, store: 'Rosario Public Market', price: 84.00 },
  
  // Chicken Eggs Large (per dozen)
  { id: 356, product_id: 89, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 357, product_id: 89, store: 'Santo Tomas Public Market', price: 94.00 },
  { id: 358, product_id: 89, store: 'Lipa City Public Market', price: 97.00 },
  { id: 359, product_id: 89, store: 'Batangas Grand Terminal Market', price: 95.00 },
  
  // Duck Eggs/Itlog na Pato (per dozen)
  { id: 360, product_id: 90, store: 'Tanauan City Public Market', price: 115.00 },
  { id: 361, product_id: 90, store: 'Santo Tomas Public Market', price: 113.00 },
  { id: 362, product_id: 90, store: 'Lipa City Public Market', price: 118.00 },
  { id: 363, product_id: 90, store: 'Taal Heritage Public Market', price: 110.00 },

  // ========== BREAD & BAKERY (Products 91-99) ==========
  // Pandesal (per dozen)
  { id: 364, product_id: 91, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 365, product_id: 91, store: 'Santo Tomas Public Market', price: 37.00 },
  { id: 366, product_id: 91, store: 'Lipa City Public Market', price: 40.00 },
  { id: 367, product_id: 91, store: 'Batangas Grand Terminal Market', price: 38.00 },
  { id: 368, product_id: 91, store: 'Malvar Public Market', price: 36.00 },
  
  // Tasty Bread (per pc)
  { id: 369, product_id: 92, store: 'Tanauan City Public Market', price: 45.00 },
  { id: 370, product_id: 92, store: 'Santo Tomas Public Market', price: 44.00 },
  { id: 371, product_id: 92, store: 'Lipa City Public Market', price: 46.00 },
  
  // Monay (per pc)
  { id: 372, product_id: 93, store: 'Tanauan City Public Market', price: 12.00 },
  { id: 373, product_id: 93, store: 'Santo Tomas Public Market', price: 11.00 },
  { id: 374, product_id: 93, store: 'Lipa City Public Market', price: 13.00 },
  { id: 375, product_id: 93, store: 'Batangas Grand Terminal Market', price: 12.00 },
  
  // Ensaymada (per pc)
  { id: 376, product_id: 94, store: 'Tanauan City Public Market', price: 25.00 },
  { id: 377, product_id: 94, store: 'Santo Tomas Public Market', price: 24.00 },
  { id: 378, product_id: 94, store: 'Lipa City Public Market', price: 26.00 },
  
  // Spanish Bread (per pc)
  { id: 379, product_id: 95, store: 'Tanauan City Public Market', price: 15.00 },
  { id: 380, product_id: 95, store: 'Santo Tomas Public Market', price: 14.00 },
  { id: 381, product_id: 95, store: 'Lipa City Public Market', price: 16.00 },
  { id: 382, product_id: 95, store: 'Batangas Grand Terminal Market', price: 15.00 },
  
  // Putok (per pc)
  { id: 383, product_id: 96, store: 'Tanauan City Public Market', price: 10.00 },
  { id: 384, product_id: 96, store: 'Santo Tomas Public Market', price: 9.00 },
  { id: 385, product_id: 96, store: 'Lipa City Public Market', price: 11.00 },
  
  // Kababayan (per pc)
  { id: 386, product_id: 97, store: 'Tanauan City Public Market', price: 12.00 },
  { id: 387, product_id: 97, store: 'Santo Tomas Public Market', price: 11.00 },
  { id: 388, product_id: 97, store: 'Lipa City Public Market', price: 13.00 },
  { id: 389, product_id: 97, store: 'Batangas Grand Terminal Market', price: 12.00 },
  
  // Gardenia White Bread 450g
  { id: 390, product_id: 98, store: 'Tanauan City Public Market', price: 58.00 },
  { id: 391, product_id: 98, store: 'Santo Tomas Public Market', price: 59.00 },
  { id: 392, product_id: 98, store: 'Lipa City Public Market', price: 60.00 },
  
  // Gardenia Wheat Bread 450g
  { id: 393, product_id: 99, store: 'Tanauan City Public Market', price: 62.00 },
  { id: 394, product_id: 99, store: 'Santo Tomas Public Market', price: 63.00 },
  { id: 395, product_id: 99, store: 'Lipa City Public Market', price: 65.00 },

  // ========== MEAT & POULTRY (Products 100-106) ==========
  // Chicken Breast (1 kg)
  { id: 396, product_id: 100, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 397, product_id: 100, store: 'Santo Tomas Public Market', price: 183.00 },
  { id: 398, product_id: 100, store: 'Lipa City Public Market', price: 188.00 },
  { id: 399, product_id: 100, store: 'Batangas Grand Terminal Market', price: 184.00 },
  { id: 400, product_id: 100, store: 'Malvar Public Market', price: 182.00 },
  
  // Chicken Drumstick (1 kg)
  { id: 401, product_id: 101, store: 'Tanauan City Public Market', price: 165.00 },
  { id: 402, product_id: 101, store: 'Santo Tomas Public Market', price: 163.00 },
  { id: 403, product_id: 101, store: 'Lipa City Public Market', price: 168.00 },
  { id: 404, product_id: 101, store: 'Batangas Grand Terminal Market', price: 165.00 },
  
  // Pork Liempo (1 kg)
  { id: 405, product_id: 102, store: 'Tanauan City Public Market', price: 280.00 },
  { id: 406, product_id: 102, store: 'Santo Tomas Public Market', price: 275.00 },
  { id: 407, product_id: 102, store: 'Lipa City Public Market', price: 285.00 },
  { id: 408, product_id: 102, store: 'Batangas Grand Terminal Market', price: 278.00 },
  { id: 409, product_id: 102, store: 'Malvar Public Market', price: 273.00 },
  
  // Pork Kasim (1 kg)
  { id: 410, product_id: 103, store: 'Tanauan City Public Market', price: 260.00 },
  { id: 411, product_id: 103, store: 'Santo Tomas Public Market', price: 255.00 },
  { id: 412, product_id: 103, store: 'Lipa City Public Market', price: 265.00 },
  { id: 413, product_id: 103, store: 'Batangas Grand Terminal Market', price: 258.00 },
  
  // Pork Pigue/Ham (1 kg)
  { id: 414, product_id: 104, store: 'Tanauan City Public Market', price: 285.00 },
  { id: 415, product_id: 104, store: 'Santo Tomas Public Market', price: 280.00 },
  { id: 416, product_id: 104, store: 'Lipa City Public Market', price: 290.00 },
  
  // Ground Pork (1 kg)
  { id: 417, product_id: 105, store: 'Tanauan City Public Market', price: 250.00 },
  { id: 418, product_id: 105, store: 'Santo Tomas Public Market', price: 245.00 },
  { id: 419, product_id: 105, store: 'Lipa City Public Market', price: 255.00 },
  { id: 420, product_id: 105, store: 'Batangas Grand Terminal Market', price: 248.00 },
  
  // Beef Brisket (1 kg)
  { id: 421, product_id: 106, store: 'Tanauan City Public Market', price: 385.00 },
  { id: 422, product_id: 106, store: 'Santo Tomas Public Market', price: 380.00 },
  { id: 423, product_id: 106, store: 'Lipa City Public Market', price: 390.00 },
  { id: 424, product_id: 106, store: 'Batangas Grand Terminal Market', price: 383.00 },

  // ========== FISH & SEAFOOD (Products 107-116) ==========
  // Tilapia (1 kg)
  { id: 425, product_id: 107, store: 'Tanauan City Public Market', price: 135.00 },
  { id: 426, product_id: 107, store: 'Santo Tomas Public Market', price: 133.00 },
  { id: 427, product_id: 107, store: 'Lipa City Public Market', price: 138.00 },
  { id: 428, product_id: 107, store: 'Batangas Grand Terminal Market', price: 133.00 },
  { id: 429, product_id: 107, store: 'Bauan Public Market', price: 130.00 },
  { id: 430, product_id: 107, store: 'San Juan Public Market', price: 128.00 },
  
  // Bangus/Milkfish (1 kg)
  { id: 431, product_id: 108, store: 'Tanauan City Public Market', price: 165.00 },
  { id: 432, product_id: 108, store: 'Santo Tomas Public Market', price: 163.00 },
  { id: 433, product_id: 108, store: 'Lipa City Public Market', price: 168.00 },
  { id: 434, product_id: 108, store: 'Batangas Grand Terminal Market', price: 163.00 },
  { id: 435, product_id: 108, store: 'Bauan Public Market', price: 160.00 },
  { id: 436, product_id: 108, store: 'San Juan Public Market', price: 158.00 },
  
  // Galunggong (1 kg)
  { id: 437, product_id: 109, store: 'Tanauan City Public Market', price: 148.00 },
  { id: 438, product_id: 109, store: 'Lipa City Public Market', price: 150.00 },
  { id: 439, product_id: 109, store: 'Batangas Grand Terminal Market', price: 145.00 },
  { id: 440, product_id: 109, store: 'Bauan Public Market', price: 140.00 },
  { id: 441, product_id: 109, store: 'San Juan Public Market', price: 138.00 },
  { id: 442, product_id: 109, store: 'Lemery Public Market', price: 143.00 },
  
  // Tulingan/Skipjack Tuna (1 kg)
  { id: 443, product_id: 110, store: 'Batangas Grand Terminal Market', price: 185.00 },
  { id: 444, product_id: 110, store: 'Bauan Public Market', price: 180.00 },
  { id: 445, product_id: 110, store: 'San Juan Public Market', price: 175.00 },
  { id: 446, product_id: 110, store: 'Lipa City Public Market', price: 188.00 },
  
  // Pusit/Squid (1 kg)
  { id: 447, product_id: 111, store: 'Batangas Grand Terminal Market', price: 285.00 },
  { id: 448, product_id: 111, store: 'Bauan Public Market', price: 275.00 },
  { id: 449, product_id: 111, store: 'San Juan Public Market', price: 270.00 },
  { id: 450, product_id: 111, store: 'Lipa City Public Market', price: 290.00 },
  
  // Hipon/Shrimp Medium (1 kg)
  { id: 451, product_id: 112, store: 'Batangas Grand Terminal Market', price: 385.00 },
  { id: 452, product_id: 112, store: 'Bauan Public Market', price: 375.00 },
  { id: 453, product_id: 112, store: 'San Juan Public Market', price: 370.00 },
  { id: 454, product_id: 112, store: 'Lipa City Public Market', price: 390.00 },
  
  // Talaba/Oysters (1 kg)
  { id: 455, product_id: 113, store: 'Batangas Grand Terminal Market', price: 165.00 },
  { id: 456, product_id: 113, store: 'Bauan Public Market', price: 155.00 },
  { id: 457, product_id: 113, store: 'San Juan Public Market', price: 150.00 },
  
  // Tahong/Mussels (1 kg)
  { id: 458, product_id: 114, store: 'Batangas Grand Terminal Market', price: 95.00 },
  { id: 459, product_id: 114, store: 'Bauan Public Market', price: 88.00 },
  { id: 460, product_id: 114, store: 'San Juan Public Market', price: 85.00 },
  { id: 461, product_id: 114, store: 'Lipa City Public Market', price: 98.00 },
  
  // Halaan/Clams (1 kg)
  { id: 462, product_id: 115, store: 'Batangas Grand Terminal Market', price: 85.00 },
  { id: 463, product_id: 115, store: 'Bauan Public Market', price: 78.00 },
  { id: 464, product_id: 115, store: 'San Juan Public Market', price: 75.00 },
  
  // Alimango/Crab (1 kg)
  { id: 465, product_id: 116, store: 'Batangas Grand Terminal Market', price: 285.00 },
  { id: 466, product_id: 116, store: 'Bauan Public Market', price: 275.00 },
  { id: 467, product_id: 116, store: 'San Juan Public Market', price: 268.00 },
  { id: 468, product_id: 116, store: 'Lipa City Public Market', price: 290.00 },

  // ========== CONDIMENTS & SAUCES (Products 117-129) ==========
  // Papa Banana Catsup 320g
  { id: 469, product_id: 117, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 470, product_id: 117, store: 'Santo Tomas Public Market', price: 43.00 },
  { id: 471, product_id: 117, store: 'Lipa City Public Market', price: 45.00 },
  { id: 472, product_id: 117, store: 'Batangas Grand Terminal Market', price: 42.00 },
  
  // Datu Puti Soy Sauce 385ml
  { id: 473, product_id: 118, store: 'Tanauan City Public Market', price: 28.00 },
  { id: 474, product_id: 118, store: 'Santo Tomas Public Market', price: 29.00 },
  { id: 475, product_id: 118, store: 'Lipa City Public Market', price: 30.00 },
  { id: 476, product_id: 118, store: 'Batangas Grand Terminal Market', price: 28.50 },
  
  // Silver Swan Soy Sauce 385ml
  { id: 477, product_id: 119, store: 'Tanauan City Public Market', price: 32.00 },
  { id: 478, product_id: 119, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 479, product_id: 119, store: 'Lipa City Public Market', price: 34.00 },
  
  // Datu Puti Vinegar 385ml
  { id: 480, product_id: 120, store: 'Tanauan City Public Market', price: 22.00 },
  { id: 481, product_id: 120, store: 'Santo Tomas Public Market', price: 23.00 },
  { id: 482, product_id: 120, store: 'Lipa City Public Market', price: 24.00 },
  { id: 483, product_id: 120, store: 'Batangas Grand Terminal Market', price: 22.50 },
  
  // UFC Vinegar 385ml
  { id: 484, product_id: 121, store: 'Tanauan City Public Market', price: 25.00 },
  { id: 485, product_id: 121, store: 'Santo Tomas Public Market', price: 26.00 },
  { id: 486, product_id: 121, store: 'Lipa City Public Market', price: 27.00 },
  
  // Mama Sita's Oyster Sauce 405g
  { id: 487, product_id: 122, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 488, product_id: 122, store: 'Santo Tomas Public Market', price: 56.00 },
  { id: 489, product_id: 122, store: 'Lipa City Public Market', price: 58.00 },
  { id: 490, product_id: 122, store: 'Batangas Grand Terminal Market', price: 55.00 },
  
  // Knorr Liquid Seasoning 250ml
  { id: 491, product_id: 123, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 492, product_id: 123, store: 'Santo Tomas Public Market', price: 39.00 },
  { id: 493, product_id: 123, store: 'Lipa City Public Market', price: 40.00 },
  
  // Maggi Magic Sarap 50g
  { id: 494, product_id: 124, store: 'Tanauan City Public Market', price: 18.00 },
  { id: 495, product_id: 124, store: 'Santo Tomas Public Market', price: 19.00 },
  { id: 496, product_id: 124, store: 'Lipa City Public Market', price: 20.00 },
  { id: 497, product_id: 124, store: 'Batangas Grand Terminal Market', price: 18.50 },
  
  // Ajinomoto Umami Seasoning 100g
  { id: 498, product_id: 125, store: 'Tanauan City Public Market', price: 32.00 },
  { id: 499, product_id: 125, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 500, product_id: 125, store: 'Lipa City Public Market', price: 35.00 },
  
  // Iodized Salt 1kg
  { id: 501, product_id: 126, store: 'Tanauan City Public Market', price: 18.00 },
  { id: 502, product_id: 126, store: 'Santo Tomas Public Market', price: 18.50 },
  { id: 503, product_id: 126, store: 'Lipa City Public Market', price: 19.00 },
  { id: 504, product_id: 126, store: 'Batangas Grand Terminal Market', price: 18.00 },
  
  // Black Pepper Ground 50g
  { id: 505, product_id: 127, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 506, product_id: 127, store: 'Santo Tomas Public Market', price: 43.00 },
  { id: 507, product_id: 127, store: 'Lipa City Public Market', price: 45.00 },
  
  // UFC Gravy Mix 25g
  { id: 508, product_id: 128, store: 'Tanauan City Public Market', price: 15.00 },
  { id: 509, product_id: 128, store: 'Santo Tomas Public Market', price: 15.50 },
  { id: 510, product_id: 128, store: 'Lipa City Public Market', price: 16.00 },
  
  // McCormick BBQ Marinade Mix 40g
  { id: 511, product_id: 129, store: 'Tanauan City Public Market', price: 22.00 },
  { id: 512, product_id: 129, store: 'Santo Tomas Public Market', price: 23.00 },
  { id: 513, product_id: 129, store: 'Lipa City Public Market', price: 24.00 },
  { id: 514, product_id: 129, store: 'Batangas Grand Terminal Market', price: 22.50 },

  // ========== COOKING OIL (Products 130-133) ==========
  // Baguio Vegetable Oil 1L
  { id: 515, product_id: 130, store: 'Tanauan City Public Market', price: 115.00 },
  { id: 516, product_id: 130, store: 'Santo Tomas Public Market', price: 116.00 },
  { id: 517, product_id: 130, store: 'Lipa City Public Market', price: 118.00 },
  { id: 518, product_id: 130, store: 'Batangas Grand Terminal Market', price: 115.00 },
  
  // Minola Premium Cooking Oil 1L
  { id: 519, product_id: 131, store: 'Tanauan City Public Market', price: 125.00 },
  { id: 520, product_id: 131, store: 'Santo Tomas Public Market', price: 126.00 },
  { id: 521, product_id: 131, store: 'Lipa City Public Market', price: 128.00 },
  
  // Golden Fiesta Palm Oil 1L
  { id: 522, product_id: 132, store: 'Tanauan City Public Market', price: 98.00 },
  { id: 523, product_id: 132, store: 'Santo Tomas Public Market', price: 99.00 },
  { id: 524, product_id: 132, store: 'Lipa City Public Market', price: 100.00 },
  { id: 525, product_id: 132, store: 'Batangas Grand Terminal Market', price: 98.00 },
  
  // Olive Oil Extra Virgin 500ml
  { id: 526, product_id: 133, store: 'Tanauan City Public Market', price: 285.00 },
  { id: 527, product_id: 133, store: 'Santo Tomas Public Market', price: 288.00 },
  { id: 528, product_id: 133, store: 'Lipa City Public Market', price: 290.00 },

  // ========== PASTA (Products 134-136) ==========
  // Royal Spaghetti Pasta 900g
  { id: 529, product_id: 134, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 530, product_id: 134, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 531, product_id: 134, store: 'Lipa City Public Market', price: 70.00 },
  { id: 532, product_id: 134, store: 'Batangas Grand Terminal Market', price: 68.00 },
  
  // Royal Elbow Macaroni 400g
  { id: 533, product_id: 135, store: 'Tanauan City Public Market', price: 32.00 },
  { id: 534, product_id: 135, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 535, product_id: 135, store: 'Lipa City Public Market', price: 34.00 },
  
  // San Remo Penne 500g
  { id: 536, product_id: 136, store: 'Tanauan City Public Market', price: 78.00 },
  { id: 537, product_id: 136, store: 'Santo Tomas Public Market', price: 79.00 },
  { id: 538, product_id: 136, store: 'Lipa City Public Market', price: 80.00 },
  { id: 539, product_id: 136, store: 'Batangas Grand Terminal Market', price: 78.00 },

  // ========== SNACKS (Products 137-147) ==========
  // Jack n Jill Piattos Cheese 85g
  { id: 540, product_id: 137, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 541, product_id: 137, store: 'Santo Tomas Public Market', price: 36.00 },
  { id: 542, product_id: 137, store: 'Lipa City Public Market', price: 37.00 },
  { id: 543, product_id: 137, store: 'Batangas Grand Terminal Market', price: 35.00 },
  
  // Oishi Prawn Crackers 90g
  { id: 544, product_id: 138, store: 'Tanauan City Public Market', price: 32.00 },
  { id: 545, product_id: 138, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 546, product_id: 138, store: 'Lipa City Public Market', price: 34.00 },
  
  // Nova Multigrain Chips 78g
  { id: 547, product_id: 139, store: 'Tanauan City Public Market', price: 28.00 },
  { id: 548, product_id: 139, store: 'Santo Tomas Public Market', price: 29.00 },
  { id: 549, product_id: 139, store: 'Lipa City Public Market', price: 30.00 },
  { id: 550, product_id: 139, store: 'Batangas Grand Terminal Market', price: 28.50 },
  
  // Chippy BBQ 110g
  { id: 551, product_id: 140, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 552, product_id: 140, store: 'Santo Tomas Public Market', price: 39.00 },
  { id: 553, product_id: 140, store: 'Lipa City Public Market', price: 40.00 },
  
  // Boy Bawang Cornick Adobo 100g
  { id: 554, product_id: 141, store: 'Tanauan City Public Market', price: 32.00 },
  { id: 555, product_id: 141, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 556, product_id: 141, store: 'Lipa City Public Market', price: 34.00 },
  { id: 557, product_id: 141, store: 'Batangas Grand Terminal Market', price: 32.50 },
  
  // Skyflakes Crackers 250g
  { id: 558, product_id: 142, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 559, product_id: 142, store: 'Santo Tomas Public Market', price: 43.00 },
  { id: 560, product_id: 142, store: 'Lipa City Public Market', price: 45.00 },
  
  // Fita Crackers 300g
  { id: 561, product_id: 143, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 562, product_id: 143, store: 'Santo Tomas Public Market', price: 39.00 },
  { id: 563, product_id: 143, store: 'Lipa City Public Market', price: 40.00 },
  { id: 564, product_id: 143, store: 'Batangas Grand Terminal Market', price: 38.50 },
  
  // M.Y. San Grahams 200g
  { id: 565, product_id: 144, store: 'Tanauan City Public Market', price: 48.00 },
  { id: 566, product_id: 144, store: 'Santo Tomas Public Market', price: 49.00 },
  { id: 567, product_id: 144, store: 'Lipa City Public Market', price: 50.00 },
  
  // Oreo Cookies 137g
  { id: 568, product_id: 145, store: 'Tanauan City Public Market', price: 52.00 },
  { id: 569, product_id: 145, store: 'Santo Tomas Public Market', price: 53.00 },
  { id: 570, product_id: 145, store: 'Lipa City Public Market', price: 55.00 },
  { id: 571, product_id: 145, store: 'Batangas Grand Terminal Market', price: 52.00 },
  
  // Cream-O Cookies 132g
  { id: 572, product_id: 146, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 573, product_id: 146, store: 'Santo Tomas Public Market', price: 36.00 },
  { id: 574, product_id: 146, store: 'Lipa City Public Market', price: 37.00 },
  
  // Rebisco Crackers 250g
  { id: 575, product_id: 147, store: 'Tanauan City Public Market', price: 38.00 },
  { id: 576, product_id: 147, store: 'Santo Tomas Public Market', price: 39.00 },
  { id: 577, product_id: 147, store: 'Lipa City Public Market', price: 40.00 },
  { id: 578, product_id: 147, store: 'Batangas Grand Terminal Market', price: 38.50 },

  // ========== CANDY & SWEETS (Products 148-151) ==========
  // Storck Knoppers 25g (pack of 8)
  { id: 579, product_id: 148, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 580, product_id: 148, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 581, product_id: 148, store: 'Lipa City Public Market', price: 98.00 },
  
  // White Rabbit Candy 227g
  { id: 582, product_id: 149, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 583, product_id: 149, store: 'Santo Tomas Public Market', price: 86.00 },
  { id: 584, product_id: 149, store: 'Lipa City Public Market', price: 88.00 },
  { id: 585, product_id: 149, store: 'Batangas Grand Terminal Market', price: 85.00 },
  
  // Hany Candy (per pack)
  { id: 586, product_id: 150, store: 'Tanauan City Public Market', price: 22.00 },
  { id: 587, product_id: 150, store: 'Santo Tomas Public Market', price: 23.00 },
  { id: 588, product_id: 150, store: 'Lipa City Public Market', price: 24.00 },
  
  // Choc Nut (per pack)
  { id: 589, product_id: 151, store: 'Tanauan City Public Market', price: 18.00 },
  { id: 590, product_id: 151, store: 'Santo Tomas Public Market', price: 19.00 },
  { id: 591, product_id: 151, store: 'Lipa City Public Market', price: 20.00 },
  { id: 592, product_id: 151, store: 'Batangas Grand Terminal Market', price: 18.50 },

  // ========== HOUSEHOLD ITEMS (Products 152-161) ==========
  // Surf Powder Detergent 1kg
  { id: 593, product_id: 152, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 594, product_id: 152, store: 'Santo Tomas Public Market', price: 86.00 },
  { id: 595, product_id: 152, store: 'Lipa City Public Market', price: 88.00 },
  { id: 596, product_id: 152, store: 'Batangas Grand Terminal Market', price: 85.00 },
  
  // Tide Powder Detergent 1kg
  { id: 597, product_id: 153, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 598, product_id: 153, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 599, product_id: 153, store: 'Lipa City Public Market', price: 98.00 },
  
  // Ariel Powder Detergent 1kg
  { id: 600, product_id: 154, store: 'Tanauan City Public Market', price: 105.00 },
  { id: 601, product_id: 154, store: 'Santo Tomas Public Market', price: 106.00 },
  { id: 602, product_id: 154, store: 'Lipa City Public Market', price: 108.00 },
  { id: 603, product_id: 154, store: 'Batangas Grand Terminal Market', price: 105.00 },
  
  // Downy Fabric Conditioner 1L
  { id: 604, product_id: 155, store: 'Tanauan City Public Market', price: 125.00 },
  { id: 605, product_id: 155, store: 'Santo Tomas Public Market', price: 126.00 },
  { id: 606, product_id: 155, store: 'Lipa City Public Market', price: 128.00 },
  
  // Zonrox Bleach 1L
  { id: 607, product_id: 156, store: 'Tanauan City Public Market', price: 58.00 },
  { id: 608, product_id: 156, store: 'Santo Tomas Public Market', price: 59.00 },
  { id: 609, product_id: 156, store: 'Lipa City Public Market', price: 60.00 },
  { id: 610, product_id: 156, store: 'Batangas Grand Terminal Market', price: 58.00 },
  
  // Joy Dishwashing Liquid 485ml
  { id: 611, product_id: 157, store: 'Tanauan City Public Market', price: 75.00 },
  { id: 612, product_id: 157, store: 'Santo Tomas Public Market', price: 76.00 },
  { id: 613, product_id: 157, store: 'Lipa City Public Market', price: 78.00 },
  
  // Domex Toilet Bowl Cleaner 500ml
  { id: 614, product_id: 158, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 615, product_id: 158, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 616, product_id: 158, store: 'Lipa City Public Market', price: 70.00 },
  { id: 617, product_id: 158, store: 'Batangas Grand Terminal Market', price: 68.00 },
  
  // Lysol Disinfectant Spray 400ml
  { id: 618, product_id: 159, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 619, product_id: 159, store: 'Santo Tomas Public Market', price: 188.00 },
  { id: 620, product_id: 159, store: 'Lipa City Public Market', price: 190.00 },
  
  // Baygon Multi-Insect Killer 600ml
  { id: 621, product_id: 160, store: 'Tanauan City Public Market', price: 165.00 },
  { id: 622, product_id: 160, store: 'Santo Tomas Public Market', price: 168.00 },
  { id: 623, product_id: 160, store: 'Lipa City Public Market', price: 170.00 },
  { id: 624, product_id: 160, store: 'Batangas Grand Terminal Market', price: 165.00 },
  
  // Kris Trash Bags Large (10s)
  { id: 625, product_id: 161, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 626, product_id: 161, store: 'Santo Tomas Public Market', price: 56.00 },
  { id: 627, product_id: 161, store: 'Lipa City Public Market', price: 58.00 },

  // ========== PERSONAL CARE (Products 162-173) ==========
  // Safeguard Bar Soap 135g
  { id: 628, product_id: 162, store: 'Tanauan City Public Market', price: 35.00 },
  { id: 629, product_id: 162, store: 'Santo Tomas Public Market', price: 36.00 },
  { id: 630, product_id: 162, store: 'Lipa City Public Market', price: 37.00 },
  { id: 631, product_id: 162, store: 'Batangas Grand Terminal Market', price: 35.00 },
  
  // Palmolive Naturals Bar Soap 115g
  { id: 632, product_id: 163, store: 'Tanauan City Public Market', price: 32.00 },
  { id: 633, product_id: 163, store: 'Santo Tomas Public Market', price: 33.00 },
  { id: 634, product_id: 163, store: 'Lipa City Public Market', price: 34.00 },
  
  // Colgate Toothpaste 150g
  { id: 635, product_id: 164, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 636, product_id: 164, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 637, product_id: 164, store: 'Lipa City Public Market', price: 70.00 },
  { id: 638, product_id: 164, store: 'Batangas Grand Terminal Market', price: 68.00 },
  
  // Close-Up Toothpaste 160g
  { id: 639, product_id: 165, store: 'Tanauan City Public Market', price: 75.00 },
  { id: 640, product_id: 165, store: 'Santo Tomas Public Market', price: 76.00 },
  { id: 641, product_id: 165, store: 'Lipa City Public Market', price: 78.00 },
  
  // Oral-B Toothbrush
  { id: 642, product_id: 166, store: 'Tanauan City Public Market', price: 55.00 },
  { id: 643, product_id: 166, store: 'Santo Tomas Public Market', price: 56.00 },
  { id: 644, product_id: 166, store: 'Lipa City Public Market', price: 58.00 },
  { id: 645, product_id: 166, store: 'Batangas Grand Terminal Market', price: 55.00 },
  
  // Head & Shoulders Shampoo 340ml
  { id: 646, product_id: 167, store: 'Tanauan City Public Market', price: 165.00 },
  { id: 647, product_id: 167, store: 'Santo Tomas Public Market', price: 168.00 },
  { id: 648, product_id: 167, store: 'Lipa City Public Market', price: 170.00 },
  
  // Palmolive Shampoo 340ml
  { id: 649, product_id: 168, store: 'Tanauan City Public Market', price: 135.00 },
  { id: 650, product_id: 168, store: 'Santo Tomas Public Market', price: 138.00 },
  { id: 651, product_id: 168, store: 'Lipa City Public Market', price: 140.00 },
  { id: 652, product_id: 168, store: 'Batangas Grand Terminal Market', price: 135.00 },
  
  // Cream Silk Conditioner 340ml
  { id: 653, product_id: 169, store: 'Tanauan City Public Market', price: 145.00 },
  { id: 654, product_id: 169, store: 'Santo Tomas Public Market', price: 148.00 },
  { id: 655, product_id: 169, store: 'Lipa City Public Market', price: 150.00 },
  
  // Modess Napkin Ultra Thin 8s
  { id: 656, product_id: 170, store: 'Tanauan City Public Market', price: 42.00 },
  { id: 657, product_id: 170, store: 'Santo Tomas Public Market', price: 43.00 },
  { id: 658, product_id: 170, store: 'Lipa City Public Market', price: 45.00 },
  { id: 659, product_id: 170, store: 'Batangas Grand Terminal Market', price: 42.00 },
  
  // Whisper Napkin Wings 8s
  { id: 660, product_id: 171, store: 'Tanauan City Public Market', price: 48.00 },
  { id: 661, product_id: 171, store: 'Santo Tomas Public Market', price: 49.00 },
  { id: 662, product_id: 171, store: 'Lipa City Public Market', price: 50.00 },
  
  // Johnson's Baby Powder 200g
  { id: 663, product_id: 172, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 664, product_id: 172, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 665, product_id: 172, store: 'Lipa City Public Market', price: 98.00 },
  { id: 666, product_id: 172, store: 'Batangas Grand Terminal Market', price: 95.00 },
  
  // Rexona Deodorant Roll-on 40ml
  { id: 667, product_id: 173, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 668, product_id: 173, store: 'Santo Tomas Public Market', price: 86.00 },
  { id: 669, product_id: 173, store: 'Lipa City Public Market', price: 88.00 },

  // ========== BABY PRODUCTS (Products 174-178) ==========
  // EQ Diaper Dry Pants Small 14s
  { id: 670, product_id: 174, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 671, product_id: 174, store: 'Santo Tomas Public Market', price: 188.00 },
  { id: 672, product_id: 174, store: 'Lipa City Public Market', price: 190.00 },
  { id: 673, product_id: 174, store: 'Batangas Grand Terminal Market', price: 185.00 },
  
  // Pampers Baby Dry Pants Medium 18s
  { id: 674, product_id: 175, store: 'Tanauan City Public Market', price: 285.00 },
  { id: 675, product_id: 175, store: 'Santo Tomas Public Market', price: 288.00 },
  { id: 676, product_id: 175, store: 'Lipa City Public Market', price: 290.00 },
  
  // Johnson's Baby Shampoo 200ml
  { id: 677, product_id: 176, store: 'Tanauan City Public Market', price: 125.00 },
  { id: 678, product_id: 176, store: 'Santo Tomas Public Market', price: 126.00 },
  { id: 679, product_id: 176, store: 'Lipa City Public Market', price: 128.00 },
  { id: 680, product_id: 176, store: 'Batangas Grand Terminal Market', price: 125.00 },
  
  // Cerelac Wheat 120g
  { id: 681, product_id: 177, store: 'Tanauan City Public Market', price: 68.00 },
  { id: 682, product_id: 177, store: 'Santo Tomas Public Market', price: 69.00 },
  { id: 683, product_id: 177, store: 'Lipa City Public Market', price: 70.00 },
  
  // Lactum 3+ 350g
  { id: 684, product_id: 178, store: 'Tanauan City Public Market', price: 285.00 },
  { id: 685, product_id: 178, store: 'Santo Tomas Public Market', price: 288.00 },
  { id: 686, product_id: 178, store: 'Lipa City Public Market', price: 290.00 },
  { id: 687, product_id: 178, store: 'Batangas Grand Terminal Market', price: 285.00 },

  // ========== FROZEN GOODS (Products 179-184) ==========
  // Magnolia Chicken Nuggets 200g
  { id: 688, product_id: 179, store: 'Tanauan City Public Market', price: 115.00 },
  { id: 689, product_id: 179, store: 'Santo Tomas Public Market', price: 116.00 },
  { id: 690, product_id: 179, store: 'Lipa City Public Market', price: 118.00 },
  { id: 691, product_id: 179, store: 'Batangas Grand Terminal Market', price: 115.00 },
  
  // Magnolia Chicken Fries 400g
  { id: 692, product_id: 180, store: 'Tanauan City Public Market', price: 185.00 },
  { id: 693, product_id: 180, store: 'Santo Tomas Public Market', price: 188.00 },
  { id: 694, product_id: 180, store: 'Lipa City Public Market', price: 190.00 },
  
  // Purefoods Chicken Franks 1kg
  { id: 695, product_id: 181, store: 'Tanauan City Public Market', price: 285.00 },
  { id: 696, product_id: 181, store: 'Santo Tomas Public Market', price: 288.00 },
  { id: 697, product_id: 181, store: 'Lipa City Public Market', price: 290.00 },
  { id: 698, product_id: 181, store: 'Batangas Grand Terminal Market', price: 285.00 },
  
  // Crab Sticks 500g
  { id: 699, product_id: 182, store: 'Tanauan City Public Market', price: 125.00 },
  { id: 700, product_id: 182, store: 'Santo Tomas Public Market', price: 126.00 },
  { id: 701, product_id: 182, store: 'Lipa City Public Market', price: 128.00 },
  
  // Fish Balls 500g
  { id: 702, product_id: 183, store: 'Tanauan City Public Market', price: 85.00 },
  { id: 703, product_id: 183, store: 'Santo Tomas Public Market', price: 86.00 },
  { id: 704, product_id: 183, store: 'Lipa City Public Market', price: 88.00 },
  { id: 705, product_id: 183, store: 'Batangas Grand Terminal Market', price: 85.00 },
  
  // Squid Balls 500g
  { id: 706, product_id: 184, store: 'Tanauan City Public Market', price: 95.00 },
  { id: 707, product_id: 184, store: 'Santo Tomas Public Market', price: 96.00 },
  { id: 708, product_id: 184, store: 'Lipa City Public Market', price: 98.00 },
  { id: 709, product_id: 184, store: 'Batangas Grand Terminal Market', price: 95.00 },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set');
    }

    await connectDB(mongoUri);

    console.log('ðŸ—‘ï¸  Clearing existing data...');
    await Product.deleteMany({});
    await Price.deleteMany({});

    console.log('ðŸ“¦ Inserting products...');
    await Product.insertMany(products);
    console.log(`âœ… Inserted ${products.length} products`);

    console.log('ðŸ’° Inserting prices...');
    await Price.insertMany(prices);
    console.log(`âœ… Inserted ${prices.length} prices`);

    console.log('\nðŸŽ‰ Seed completed successfully!');
    console.log(`\nðŸ“Š Summary:`);
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
    console.error('âŒ Seed failed:', error);
    process.exit(1);
  }
}

seed();