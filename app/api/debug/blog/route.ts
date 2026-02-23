import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Temporary debug endpoint — remove after diagnosis
export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get('slug');

    if (!slug) {
        // List ALL posts with their slugs and status
        const { data, error } = await supabase
            .from('blog_posts')
            .select('id, slug, titulo, status, published, published_at')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            total: data?.length || 0,
            posts: data,
            serverTime: new Date().toISOString(),
        });
    }

    // Fetch a specific post ignoring status/published_at
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, titulo, status, published, published_at, created_at')
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({
            found: false,
            slug,
            message: 'No post with this slug exists in the database',
        });
    }

    return NextResponse.json({
        found: true,
        slug,
        id: data.id,
        titulo: data.titulo,
        status: data.status,
        published: data.published,
        published_at: data.published_at,
        created_at: data.created_at,
        serverTime: new Date().toISOString(),
        willShow: data.status === 'published' && new Date(data.published_at) <= new Date(),
    });
}
