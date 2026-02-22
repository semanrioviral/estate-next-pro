-- Migration to add scheduling capabilities to the blog system
-- Phase 17: SEO Blog Automation Engine

-- 1. Add columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published'));

-- 2. Update existing posts to ensure they are published
UPDATE blog_posts SET status = 'published' WHERE status IS NULL;
UPDATE blog_posts SET published_at = created_at WHERE published_at IS NULL;

-- 3. Update RLS policies to restrict public view to published posts
-- First, drop existing read policy if it's too permissive
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;

CREATE POLICY "Public can read published posts"
ON blog_posts FOR SELECT
TO public
USING (
    status = 'published' AND 
    published_at <= NOW()
);

-- 4. Ensure authenticated users (admins) can still see everything
DROP POLICY IF EXISTS "Authenticated users can do everything" ON blog_posts;
CREATE POLICY "Authenticated users can do everything"
ON blog_posts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Create index for performance on status and date
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduling ON blog_posts (status, published_at);
