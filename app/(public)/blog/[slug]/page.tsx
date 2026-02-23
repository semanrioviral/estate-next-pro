import { cache } from 'react';
import { getBlogPostBySlug, getRelatedPosts } from '@/lib/supabase/blog';
import { getFeaturedProperties } from '@/lib/supabase/properties';
import { IntelligentLinker, extractHeadings } from '@/lib/utils/seo-linker';
import PropertyCardV2 from '@/components/design-system/PropertyCardV2';
import BlogCard from '@/components/BlogCard';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    Calendar, Tag, Clock, Share2, ArrowLeft,
    MessageSquare, User, ShieldCheck, Award, TrendingUp,
    ChevronRight, List, Home, MapPin, Building2, CreditCard,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

// Force dynamic so newly published posts appear immediately
export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
    params: { slug: string };
}

const getBlogPostBySlugCached = cache(async (slug: string) => getBlogPostBySlug(slug));


export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = params;
    const post = await getBlogPostBySlugCached(slug);
    if (!post) return {};

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = post.meta_titulo || `${post.titulo} | Inmobiliaria Tucasa Los Patios`;
    const description = post.meta_descripcion || post.excerpt || '';
    const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: canonicalUrl,
            publishedTime: post.created_at,
            authors: ['Equipo Inmobiliaria Tucasa Los Patios'],
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = params;
    const post = await getBlogPostBySlugCached(slug);
    if (!post) notFound();

    const [relatedPosts, featuredProperties] = await Promise.all([
        getRelatedPosts(post.categoria || 'Actualidad', post.slug),
        getFeaturedProperties(3)
    ]);

    const headings = extractHeadings(post.contenido);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    const blogJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.titulo,
        "description": post.excerpt || post.meta_descripcion,
        "datePublished": post.created_at,
        "dateModified": post.updated_at,
        "author": {
            "@type": "Organization",
            "name": "Inmobiliaria Tucasa Los Patios",
            "url": siteUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "Inmobiliaria Tucasa Los Patios",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${siteUrl}/blog/${post.slug}`
        },
        "image": `${siteUrl}/images/og-blog.jpg`
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${siteUrl}/blog`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.titulo,
                "item": `${siteUrl}/blog/${post.slug}`
            }
        ]
    };

    return (
        <article className="min-h-screen bg-white pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Breadcrumb Visual - Simplified Phase 20 */}
            <div className="bg-bg-alt border-b border-zinc-50 py-4">
                <div className="container-wide px-4">
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <Link href="/" className="hover:text-brand transition-colors flex items-center gap-1">
                            <Home className="w-3 h-3" />
                        </Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-zinc-400 truncate max-w-[200px] md:max-w-none">{post.titulo}</span>
                    </nav>
                </div>
            </div>

            {/* Minimalist Hero Section */}
            <header className="bg-zinc-950 pt-32 pb-24">
                <div className="container-wide px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-4 mb-10">
                            <span className="px-6 py-2 bg-brand text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {post.categoria || 'Actualidad'}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <h1 className="text-white mb-12 leading-tight">
                            {post.titulo}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-8 pt-12 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
                                    TLP
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Equipo Inmobiliaria Tucasa Los Patios</p>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Autoridad Verificada</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
                                <Share2 className="w-4 h-4" /> Compartir
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col lg:flex-row gap-20">
                {/* Content Area */}
                <div className="lg:w-2/3">
                    {/* Table of Contents (Mobile Widget) */}
                    {headings.length > 0 && (
                        <div className="mb-16 p-8 bg-bg-alt rounded-xl border border-zinc-100 lg:hidden">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-zinc-200 pb-4">
                                <List className="w-4 h-4 text-brand" />
                                Tabla de Contenidos
                            </h3>
                            <nav className="space-y-4">
                                {headings.map(h => (
                                    <a key={h.id} href={`#${h.id}`} className="block text-sm font-bold text-text-secondary hover:text-brand transition-colors border-l-2 border-transparent hover:border-brand pl-4">
                                        {h.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Article Body */}
                    <div className="prose prose-zinc prose-base max-w-none text-zinc-700 font-normal leading-[1.8] article-content">
                        <IntelligentLinker content={post.contenido} />
                    </div>

                    {/* Intermediate CTA */}
                    <div className="my-24 p-12 bg-zinc-950 rounded-xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2 text-white">¿Busca asesoría inmediata?</h3>
                            <p className="text-zinc-400 font-medium mb-0">Atención prioritaria para su inversión en Cúcuta.</p>
                        </div>
                        <Link
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                            className="px-10 py-5 bg-brand text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform shadow-sm shrink-0 relative z-10"
                        >
                            WhatsApp Directo
                        </Link>
                    </div>

                    {/* Final Authority Block */}
                    <div className="mt-24 pt-20 border-t border-zinc-50 flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-16 h-16 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100 shrink-0">
                            <Award className="w-8 h-8 text-brand" />
                        </div>
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-black mb-2">Compromiso con la Verdad Inmobiliaria</h4>
                            <p className="text-text-secondary font-medium max-w-2xl leading-relaxed">
                                Este contenido fue redactado por expertos de Inmobiliaria Tucasa Los Patios. No somos solo una inmobiliaria, somos su socio estratégico en el Norte de Santander.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:w-1/3">
                    <div className="lg:sticky lg:top-36 space-y-10">
                        {/* TOC Widget - Desktop */}
                        {headings.length > 0 && (
                            <div className="hidden lg:block p-10 bg-bg-alt rounded-xl border border-border-subtle shadow-sm">
                                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-8 border-b border-zinc-100 pb-4">
                                    <List className="w-4 h-4 text-brand" />
                                    Contenido
                                </h3>
                                <nav className="space-y-4">
                                    {headings.map(h => (
                                        <a
                                            key={h.id}
                                            href={`#${h.id}`}
                                            className="block text-sm font-bold text-text-muted hover:text-brand transition-all border-l-2 border-transparent hover:border-brand pl-6"
                                        >
                                            {h.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}

                        {/* Featured Properties Widget */}
                        <div className="p-10 bg-white border border-border-subtle rounded-xl shadow-sm">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-10 border-b border-zinc-50 pb-4">
                                <TrendingUp className="w-4 h-4 text-brand" />
                                Oportunidades
                            </h3>
                            <div className="space-y-8">
                                {featuredProperties.slice(0, 3).map(prop => (
                                    <Link key={prop.id} href={`/propiedades/${prop.slug}`} className="flex gap-4 group items-start">
                                        <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-bg-alt">
                                            {prop.imagen_principal ? (
                                                <img
                                                    src={prop.imagen_principal}
                                                    alt={prop.titulo}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-zinc-200" />
                                                </div>
                                            )}
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand text-white text-[7px] font-black uppercase rounded shadow-sm">
                                                {prop.operacion || 'Venta'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h4 className="text-[10px] font-black leading-tight text-zinc-950 group-hover:text-brand transition-colors mb-2 uppercase tracking-tight line-clamp-2">
                                                {prop.titulo}
                                            </h4>
                                            <p className="text-[10px] font-black text-brand uppercase tracking-widest">
                                                {new Intl.NumberFormat('es-CO', {
                                                    style: 'currency',
                                                    currency: 'COP',
                                                    maximumFractionDigits: 0
                                                }).format(prop.precio)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Quick Context Navigation */}
                        <div className="p-10 bg-zinc-950 rounded-xl text-white shadow-sm relative overflow-hidden group">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4 relative z-10 text-zinc-400">Explora también</h3>
                            <div className="space-y-3 relative z-10">
                                {[
                                    { label: 'Casas en Venta', href: '/venta' },
                                    { label: 'Apartamentos en Arriendo', href: '/arriendo' },
                                    { label: 'Blog Regional', href: '/blog' }
                                ].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-brand/50 transition-all group"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                        <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-brand transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="bg-bg-alt py-32 border-t border-zinc-50">
                    <div className="container-wide px-4">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-8 px-4">
                            <div>
                                <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Sugerencias de lectura</p>
                                <h2 className="tracking-tighter">Más sobre <span className="text-brand">{post.categoria || 'Inmobiliaria'}</span></h2>
                            </div>
                            <Link href="/blog" className="px-8 py-4 bg-white border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand transition-colors shadow-sm">Ver Todo el Blog</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {relatedPosts.map(p => (
                                <BlogCard key={p.id} post={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
}
