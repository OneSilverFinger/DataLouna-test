CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  balance NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id
  ON purchases (user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_product_id
  ON purchases (product_id);