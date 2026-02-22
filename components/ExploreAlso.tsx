import Link from 'next/link';
import { getAllBarrios, getAllCities, getAllTags } from '@/lib/supabase/properties';
import { Tag, MapPin, Building2, ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/supabase/seo-helpers';

interface ExploreAlsoProps {
    currentOperacion?: string;
    currentSlug?: string;
}

export default async function ExploreAlso({ currentOperacion = 'venta', currentSlug }: ExploreAlsoProps) {
    const [tags, barrios, cities] = await Promise.all([
        getAllTags(),
        getAllBarrios(),
        getAllCities()
    ]);

    // Limitar para mantener el diseño limpio
    const displayTags = tags.filter(t => (t as any).slug !== currentSlug).slice(0, 6);
    const displayBarrios = barrios.filter(b => b.slug !== currentSlug).slice(0, 6);
    const displayCities = cities.filter(c => slugify(c) !== currentSlug).slice(0, 6);

    return (
        <section className="mt-20 pt-16 border-t border-zinc-100">
            <div className="container-wide">
                <div className="mb-12 flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest rounded-xl mb-4">
                        Navegación
                    </span>
                    <h2 className="text-3xl font-black text-zinc-950 tracking-tight">
                        Siga Explorando el <span className="text-brand">Mercado Inmobiliario</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Tags Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-zinc-950">
                            <div className="w-10 h-10 rounded-xl bg-bg-alt flex items-center justify-center text-brand border border-zinc-100">
                                <Tag size={20} />
                            </div>
                            <h3 className="font-black text-lg">Por Categoría</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {displayTags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/${currentOperacion}/${(tag as any).slug}`}
                                    className="px-4 py-2 bg-white border border-zinc-100 hover:border-brand hover:text-brand text-text-secondary text-sm font-bold rounded-xl transition-all flex items-center gap-2 group"
                                >
                                    {tag.nombre}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Barrios Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-zinc-950">
                            <div className="w-10 h-10 rounded-xl bg-bg-alt flex items-center justify-center text-brand border border-zinc-100">
                                <MapPin size={20} />
                            </div>
                            <h3 className="font-black text-lg">Zonas Destacadas</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {displayBarrios.map((barrio) => (
                                <Link
                                    key={barrio.id}
                                    href={`/barrio/${barrio.slug}`}
                                    className="px-4 py-2 bg-white border border-zinc-100 hover:border-brand hover:text-brand text-text-secondary text-sm font-bold rounded-xl transition-all flex items-center gap-2 group"
                                >
                                    {barrio.nombre}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Cities Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-zinc-950">
                            <div className="w-10 h-10 rounded-xl bg-bg-alt flex items-center justify-center text-brand border border-zinc-100">
                                <Building2 size={20} />
                            </div>
                            <h3 className="font-black text-lg">Ciudades</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {displayCities.map((city) => (
                                <Link
                                    key={city}
                                    href={`/${currentOperacion}/${slugify(city)}`}
                                    className="px-4 py-2 bg-white border border-zinc-100 hover:border-brand hover:text-brand text-text-secondary text-sm font-bold rounded-xl transition-all flex items-center gap-2 group"
                                >
                                    {city}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
