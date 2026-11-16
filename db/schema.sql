-- La Bella Flor — schema Neon (Lakebase Postgres)
-- Rodar uma vez no SQL Editor do Neon (ou via migration).

CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'Conjuntos',
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  image_url     TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id            BIGSERIAL PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_images_product_idx
  ON product_images(product_id, sort_order ASC);

CREATE TABLE IF NOT EXISTS product_stock (
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size          TEXT NOT NULL CHECK (size IN ('P', 'M', 'G', 'GG')),
  quantity      INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (product_id, size)
);

CREATE TABLE IF NOT EXISTS orders (
  id                    TEXT PRIMARY KEY,
  status                TEXT NOT NULL DEFAULT 'pending_payment'
                          CHECK (status IN (
                            'pending_payment',
                            'paid',
                            'packing',
                            'shipped',
                            'cancelled'
                          )),
  customer_name         TEXT NOT NULL,
  customer_email        TEXT NOT NULL,
  customer_phone        TEXT NOT NULL,
  address_cep           TEXT NOT NULL,
  address_street        TEXT NOT NULL,
  address_number        TEXT NOT NULL,
  address_complement    TEXT NOT NULL DEFAULT '',
  address_neighborhood  TEXT NOT NULL,
  address_city          TEXT NOT NULL,
  address_state         TEXT NOT NULL,
  shipping_service_id   INTEGER,
  shipping_service_name TEXT NOT NULL DEFAULT '',
  shipping_cents        INTEGER NOT NULL DEFAULT 0,
  shipping_days         INTEGER,
  subtotal_cents        INTEGER NOT NULL DEFAULT 0,
  total_cents           INTEGER NOT NULL DEFAULT 0,
  mp_preference_id      TEXT,
  tracking_code         TEXT NOT NULL DEFAULT '',
  notes                 TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id              BIGSERIAL PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  size            TEXT NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
