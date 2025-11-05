-- Migration: Add Bundle Sale Parent-Child Relationships
-- Date: 2025-11-05
-- Description: Allows bundle sales to contain multiple individual items
--              Each item can be in its own category but linked to a bundle parent

-- Add columns to support bundle relationships
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES listings(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_bundle_parent BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_listings_bundle_id ON listings(bundle_id);

-- Comments
COMMENT ON COLUMN listings.bundle_id IS 'If set, this item belongs to a bundle (parent listing)';
COMMENT ON COLUMN listings.is_bundle_parent IS 'True if this is a bundle listing that contains other items';

-- How it works:
-- 1. User creates a parent bundle listing (is_bundle_parent = true, category = bulk-sale)
-- 2. User adds child items with their own categories (bundle_id = parent.id)
-- 3. Child items appear in:
--    - Their own category pages
--    - The bundle sale category (via bundle_id)
--    - Parent bundle detail page
-- 4. Each child can be marked sold individually
-- 5. Deleting parent cascade deletes all children
