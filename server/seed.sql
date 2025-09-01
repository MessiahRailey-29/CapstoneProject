-- Insert sample products
INSERT INTO products (name, category) VALUES
  ('Coke 1.5L', 'Beverages'),
  ('Bear Brand Powdered Milk 320g', 'Dairy'),
  ('Lucky Me Pancit Canton', 'Instant Noodles'),
  ('Century Tuna 180g', 'Canned Goods'),
  ('Nescafe Classic 50g', 'Coffee');

-- Insert sample prices (just assume one store for now)
INSERT INTO prices (product_id, store, price) VALUES
  (1, 'SM Supermarket', 75.00),
  (2, 'SM Supermarket', 110.00),
  (3, 'SM Supermarket', 15.00),
  (4, 'SM Supermarket', 89.00),
  (5, 'SM Supermarket', 95.00);
