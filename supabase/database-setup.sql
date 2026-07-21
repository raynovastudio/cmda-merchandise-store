-- CMDA Nigeria Merchandise Store — Database Tables
-- Run this in Supabase SQL Editor to create shared product + order storage.

-- ============================================================
-- PRODUCTS TABLE
-- Stores admin-managed products (custom products + edits to base products).
-- Base products from src/data/products.ts serve as defaults/fallback.
-- Only rows for products the admin has added or edited exist here.
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Apparel',
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sizes JSONB,
  colors JSONB,
  availability TEXT NOT NULL DEFAULT 'in-stock',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ORDERS TABLE
-- Stores all customer orders. Written on checkout, read by admin.
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  membership_number TEXT DEFAULT '',
  items JSONB NOT NULL,
  fulfillment_method TEXT NOT NULL,
  conference_pickup JSONB,
  delegate_pickup JSONB,
  delivery JSONB,
  payment_proof JSONB,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'awaiting-payment',
  timeline JSONB DEFAULT '[]'::jsonb,
  pickup_code TEXT,
  pickup_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS — permissive policies (no auth, anon key is public-facing)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Index for fast order lookups by order_number
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
