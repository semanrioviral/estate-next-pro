import { supabase } from '../supabase';
import { unstable_cache } from 'next/cache';

export interface BlogPost {
    id: string;
    titulo: string;
    slug: string;
    excerpt: string | null;
    contenido: string;
    ciudad: string | null;
    categoria: string | null;
    meta_titulo: string | null;
    meta_descripcion: string | null;
    published: boolean; // Mantener por compatibilidad temporal
    status: 'draft' | 'scheduled' | 'published';
    published_at: string;
    created_at: string;
    updated_at: string;
}

/**
 * Automáticamente publica artículos cuya fecha programada ya pasó.
 * Actúa como un "cron" interno al consultar la base de datos.
 */
async function autoPublishScheduled() {
    try {
        const { error } = await supabase
            .from('blog_posts')
            .update({ status: 'published', published: true })
            .eq('status', 'scheduled')
            .lte('published_at', new Date().toISOString());

        if (error) console.error('Error in autoPublishScheduled:', error);
    } catch (e) {
        console.error('Failed to auto-publish:', e);
    }
}

/**
 * Fetches all published blog posts
 */
export const getAllBlogPosts = unstable_cache(
    async (): Promise<BlogPost[]> => {
        await autoPublishScheduled();
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
    ['all-blog-posts'],
    { revalidate: 1, tags: ['blog'] }
);

/**
 * Fetches a single blog post by its slug
 */
export const getBlogPostBySlug = unstable_cache(
    async (slug: string): Promise<BlogPost | null> => {
        await autoPublishScheduled();
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    },
    ['blog-post-by-slug'],
    { revalidate: 1, tags: ['blog'] }
);

/**
 * Fetches blog posts filtered by city
 */
export const getBlogPostsByCiudad = unstable_cache(
    async (ciudad: string): Promise<BlogPost[]> => {
        await autoPublishScheduled();
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('ciudad', ciudad)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
    ['blog-posts-by-ciudad'],
    { revalidate: 1, tags: ['blog'] }
);

/**
 * Fetches related posts by category
 */
export const getRelatedPosts = unstable_cache(
    async (categoria: string, currentSlug: string, limit = 3): Promise<BlogPost[]> => {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('categoria', categoria)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .neq('slug', currentSlug)
            .limit(limit)
            .order('published_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
    ['related-blog-posts'],
    { revalidate: 1, tags: ['blog'] }
);
