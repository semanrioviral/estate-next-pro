-- Migration: 20260526_blog_canonical_url.sql
-- Description: Add canonical_url column to blog_posts for property-derived articles
-- Context: Blog posts auto-generated from properties should point canonical to the original property page
-- to avoid SEO duplicate content issues detected in Google Search Console

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

COMMENT ON COLUMN blog_posts.canonical_url IS
'URL canónica alternativa (ej: la ficha de la propiedad original). Si se define, el blog post usará esta URL en su rel=canonical en lugar de auto-referenciarse.';
