import { getBlogPostsByCiudad } from '@/lib/supabase/blog';
import BlogCard from '@/components/BlogCard';
import { Metadata } from 'next';
import { MapPin, ArrowLeft, Search, Building } from 'lucide-react';
import Link from 'next/link';

interface BlogCityPageProps {
    params: { ciudad: string };
}

export async function generateMetadata({ params }: BlogCityPageProps): Promise<Metadata> {
    const { ciudad: ciudadRaw } = await params;
    const ciudad = ciudadRaw.charAt(0).toUpperCase() + ciudadRaw.slice(1);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = `Guía Inmobiliaria en ${ciudad} | Blog TLP`;
    const description = `Descubra las mejores oportunidades y consejos expertos para el mercado inmobiliario específicamente en ${ciudad}, Norte de Santander.`;
    const canonicalUrl = `${siteUrl}/blog/ciudad/${ciudadRaw}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

export default async function BlogCityPage({ params }: BlogCityPageProps) {
    const { ciudad } = await params;
    const posts = await getBlogPostsByCiudad(ciudad);
    const ciudadName = ciudad.charAt(0).toUpperCase() + ciudad.slice(1);

    return (
        <main className="min-h-screen bg-white">
            {/* City Header */}
            <section className="pt-32 pb-20 bg-zinc-50 border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-4">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-12 hover:text-[#fb2c36] transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Volver al Blog General
                    </Link>

                    <div className="max-w-3xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-200">
                                <MapPin className="w-6 h-6 text-[#fb2c36]" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9]">
                                Actualidad en <br /><span className="text-[#fb2c36]">{ciudadName}</span>
                            </h1>
                        </div>
                        <p className="text-xl text-zinc-500 font-medium leading-relaxed">
                            Análisis técnico y noticias locales para inversores y propietarios en el municipio de <span className="text-zinc-900 font-bold">{ciudadName}</span>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Listing Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-16 px-4">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Resultados para {ciudadName}</h2>
                        <div className="text-[10px] font-bold text-zinc-400">
                            {posts.length} {posts.length === 1 ? 'Artículo encontrado' : 'Artículos encontrados'}
                        </div>
                    </div>

                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center max-w-lg mx-auto bg-zinc-50 rounded-[3rem] border border-zinc-100">
                            <Search className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-4">Sin artículos específicos aún</h3>
                            <p className="text-zinc-500 font-medium mb-8 text-sm">Pronto publicaremos contenido exclusivo sobre {ciudadName}.</p>
                            <Link href="/blog" className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Ver Blog Principal</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Local Authority Badge */}
            <section className="pb-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="p-12 bg-[#fb2c36] rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-10">
                        <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-xl">
                            <Building className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <h2 className="text-3xl font-black mb-2 tracking-tighter">¿Busca inmuebles en {ciudadName}?</h2>
                            <p className="text-white/80 font-medium">Explore nuestro inventario curado con las mejores fotos y asesoría legal incluida.</p>
                        </div>
                        <Link href={`/venta/${ciudad}`} className="px-10 py-5 bg-white text-[#fb2c36] rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-red-900/20">
                            Ver Portafolio Local
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
