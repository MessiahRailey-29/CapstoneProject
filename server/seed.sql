-- seed.sql for Cloudflare D1

-- Clear data
DELETE FROM prices;
DELETE FROM products;

-- Reset autoincrement counters
DELETE FROM sqlite_sequence WHERE name IN ('products', 'prices');

-- Insert sample products
INSERT INTO products (name, category) VALUES
  ('Coke 1.5L', 'Beverages'),
  ('Bear Brand Powdered Milk 320g', 'Dairy'),
  ('Lucky Me Pancit Canton', 'Instant Noodles'),
  ('Century Tuna 180g', 'Canned Goods'),
  ('Nescafe Classic 50g', 'Coffee'),
  ('Royal Banana (1 kg)', 'Fruits'),
  ('White Onion (1 kg)', 'Vegetables'),
  ('Chicken Breast (1 kg)', 'Meat'),
  ('Gardenia Classic White Bread', 'Bread'),
  ('Surf Powder Detergent 1kg', 'Household');

-- Insert sample prices
INSERT INTO prices (product_id, store, price) VALUES
  (1, 'SM Supermarket', 75.00),
  (1, 'Puregold', 73.00),
  (1, 'Robinson''s Supermarket', 76.50),

  (2, 'SM Supermarket', 110.00),
  (2, 'Puregold', 108.50),
  (2, 'Mercury Drug', 112.00),

  (3, 'SM Supermarket', 15.00),
  (3, 'Puregold', 14.50),
  (3, '7-Eleven', 16.00),

  (4, 'SM Supermarket', 89.00),
  (4, 'Puregold', 87.50),
  (4, 'Robinson''s Supermarket', 90.00),

  (5, 'SM Supermarket', 95.00),
  (5, 'Puregold', 93.00),
  (5, 'Mercury Drug', 97.00),

  (6, 'SM Supermarket', 85.00),
  (6, 'Puregold', 80.00),
  (6, 'Palengke', 75.00),

  (7, 'SM Supermarket', 120.00),
  (7, 'Puregold', 115.00),
  (7, 'Palengke', 100.00),

  (8, 'SM Supermarket', 280.00),
  (8, 'Puregold', 275.00),
  (8, 'Palengke', 260.00),

  (9, 'SM Supermarket', 52.00),
  (9, 'Puregold', 51.50),
  (9, '7-Eleven', 54.00),

  (10, 'SM Supermarket', 185.00),
  (10, 'Puregold', 180.00),
  (10, 'Robinson''s Supermarket', 188.00);
