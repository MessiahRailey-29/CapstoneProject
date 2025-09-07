-- schema.sql for Cloudflare D1

-- Drop tables in correct order
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS products;

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT ''
);

-- Prices table (linked to products)
CREATE TABLE prices (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0.0,
  CONSTRAINT fk_product
    FOREIGN KEY (product_id) 
    REFERENCES products (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_prices_store ON prices(store);
