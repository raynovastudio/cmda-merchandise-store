-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Creates the product-images bucket with public read access

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to read images (public bucket)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Allow anyone to upload (for now — add auth later)
CREATE POLICY "Allow uploads for product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 4. Allow anyone to delete their own uploads
CREATE POLICY "Allow delete for product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
