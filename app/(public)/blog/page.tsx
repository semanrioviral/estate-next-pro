import { getAllBlogPosts } from '@/lib/supabase/blog';
import BlogCard from '@/components/BlogCard';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, Rss, Info } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = "Blog Inmobiliario Norte de Santander | Noticias y Guías 2026";
    const description = "Las últimas noticias, guías de inversión y consejos del mercado inmobiliario en Cúcuta, Los Patios y Villa del Rosario. Expertos en propiedad raíz.";
    const canonicalUrl = `${siteUrl}/blog`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonicalUrl,
            images: [
                {
                    url: `${siteUrl}/images/og-blog.jpg`,
                    width: 1200,
                    height: 630,
                    alt: 'Blog Inmobiliario - Autoridad Regional',
                },
            ],
        },
    };
}

export default async function BlogListingPage() {
    const posts = await getAllBlogPosts();

    return (
        <main className="min-h-screen bg-white">
            {/* Header Section - Minimalist Phase 20 */}
            <section className="bg-zinc-950 py-32">
                <div className="container-wide px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest mb-8 border border-brand/20">
                            <Rss className="w-3 h-3" />
                            <span>Contenido de Valor</span>
                        </div>
                        <h1 className="text-white mb-8">
                            Blog <span className="text-brand">Inmobiliario</span>
                        </h1>
                        <p className="text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed">
                            Descubra por qué somos la <span className="text-white">autoridad inmobiliaria</span> en el Norte de Santander. Guías técnicas, consejos de inversión y actualidad del mercado.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Filter Section */}
            <section className="py-8 border-b border-zinc-50 sticky top-[70px] bg-white/90 backdrop-blur-sm z-40">
                <div className="container-wide px-4">
                    <div className="flex flex-wrap items-center justify-between gap-8">
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {['Todos', 'Inversión', 'Guías', 'Mercado Local', 'Noticias'].map((cat) => (
                                <button
                                    key={cat}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${cat === 'Todos'
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 border border-zinc-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <Link
                            href="/contacto"
                            className="hidden md:flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-brand"
                        >
                            ¿Desea escribir con nosotros? <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Listing Grid */}
            <section className="py-24">
                <div className="container-wide px-4">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center max-w-xl mx-auto bg-zinc-50 rounded-xl border border-zinc-100">
                            <BookOpen className="w-16 h-16 text-zinc-200 mx-auto mb-8 stroke-[1px]" />
                            <h3 className="mb-4">Próximamente</h3>
                            <p className="text-text-secondary font-medium mb-12">
                                Estamos redactando las mejores guías para que venda o compre su propiedad al mejor precio de 2026.
                            </p>
                            <Link href="/contacto" className="text-brand font-black uppercase tracking-widest text-xs border-b-2 border-brand pb-1">
                                Suscribirse a Novedades
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section - Simplified Phase 20 */}
            <section className="py-24 border-t border-zinc-50">
                <div className="container-wide px-4">
                    <div className="bg-zinc-50 p-12 md:p-20 rounded-xl border border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-16 overflow-hidden relative">
                        <div className="max-w-2xl relative z-10">
                            <h2 className="mb-8">¿Necesita asesoría personalizada ahora?</h2>
                            <p className="text-lg text-text-secondary font-medium leading-relaxed mb-12">
                                No espere a leerlo todo. Mi equipo de expertos puede guiarlo en tiempo real sobre inversiones en <span className="text-brand font-black">Cúcuta y Los Patios</span>.
                            </p>
                            <Link href="/contacto" className="inline-flex px-10 py-5 bg-brand text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-sm hover:scale-[1.02] transition-transform">
                                Hablar con un Experto
                            </Link>
                        </div>

                        <div className="hidden lg:block relative z-10">
                            <div className="p-10 bg-white rounded-xl border border-zinc-100 max-w-sm shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-brand/5 rounded-lg flex items-center justify-center">
                                        <Info className="w-5 h-5 text-brand" />
                                    </div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest">Dato del Día</h4>
                                </div>
                                <p className="text-sm text-text-secondary font-medium italic">"El 78% de las mejores inversiones inmobiliarias en la región se cierran antes de ser publicadas masivamente."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
