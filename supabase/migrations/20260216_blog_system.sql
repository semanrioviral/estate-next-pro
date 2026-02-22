-- Migration: 20260216_blog_system.sql
-- Description: Professional SEO Blog System

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  contenido TEXT NOT NULL,
  ciudad TEXT, -- Optional city filter
  categoria TEXT, -- Optional category filter
  meta_titulo TEXT,
  meta_descripcion TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_ciudad ON public.blog_posts(ciudad);
CREATE INDEX IF NOT EXISTS idx_blog_posts_categoria ON public.blog_posts(categoria);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public read access
CREATE POLICY "Public blog posts are viewable by everyone" 
ON public.blog_posts FOR SELECT 
USING (published = true);

-- Admin full access (Assuming authenticated users are admins for this simple logic, 
-- or you can add specific role checks if needed)
CREATE POLICY "Admins can do everything on blog_posts" 
ON public.blog_posts FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
