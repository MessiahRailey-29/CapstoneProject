DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS prices;

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT
);

-- Prices table (linked to products)
CREATE TABLE prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  store TEXT NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
