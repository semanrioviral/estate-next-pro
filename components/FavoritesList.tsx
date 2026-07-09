'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, ArrowRight, Trash2, Share2 } from 'lucide-react';
import { getFavorites, clearAllFavorites, Favorite } from '@/lib/favorites';
import { optimizeCloudinaryUrl } from '@/lib/supabase/seo-helpers';
import { trackEvent } from './tracking/gtag';

export default function FavoritesList() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = () => {
            setFavorites(getFavorites());
            setLoading(false);
        };
        load();

        const handleChange = () => load();
        window.addEventListener('favoritesChanged', handleChange);
        window.addEventListener('storage', handleChange);

        return () => {
            window.removeEventListener('favoritesChanged', handleChange);
            window.removeEventListener('storage', handleChange);
        };
    }, []);

    const handleClearAll = () => {
        if (confirm('¿Estás seguro de que quieres eliminar todos tus favoritos?')) {
            clearAllFavorites();
            trackEvent('property_favorite', { action: 'clear_all', count: favorites.length });
        }
    };

    const handleShare = async () => {
        if (favorites.length === 0) return;
        const shareText = `Mis propiedades favoritas en Tucasa Los Patios:\n${favorites.map(f => `• ${f.titulo} - $${f.precio.toLocaleString('es-CO')} COP`).join('\n')}\n\nVer más: https://tucasalospatios.com/favoritos`;
        const shareUrl = 'https://tucasalospatios.com/favoritos';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mis Favoritos - Tucasa',
                    text: shareText,
                    url: shareUrl,
                });
                trackEvent('property_favorite', { action: 'share' });
            } catch {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Lista copiada al portapapeles');
                trackEvent('property_favorite', { action: 'copy_link' });
            } catch {
                // Silent fail
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-pulse text-slate-400">Cargando favoritos...</div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <Heart className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">
                    Aún no tienes favoritos
                </h2>
                <p className="text-slate-500 font-medium text-center max-w-md mb-8">
                    Explora nuestro catálogo y guarda las propiedades que más te interesen. Aparecerán aquí para que puedas compararlas fácilmente.
                </p>
                <Link
                    href="/propiedades"
                    className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                    <Search className="w-4 h-4" /> Explorar Propiedades
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-sm text-slate-500 font-medium">
                        <span className="text-slate-900 font-black text-base">{favorites.length}</span>{' '}
                        {favorites.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartir
                    </button>
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpiar todo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {favorites.map((fav) => {
                    const formattedPrice = new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                    }).format(fav.precio);

                    return (
                        <article key={fav.id} className="group relative bg-white rounded-xl border border-slate-200/60 overflow-hidden transition-all hover:border-red-300/40 hover:shadow-xl flex flex-col">
                            <Link href={`/propiedades/${fav.slug}`} className="absolute inset-0 z-10" aria-label={`Ver ${fav.titulo}`} />

                            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                <img
                                    src={optimizeCloudinaryUrl(fav.imagen_principal)}
                                    alt={fav.titulo}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3 z-20 flex gap-1.5">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border border-slate-200">
                                        {(fav.operacion || 'venta').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-grow relative z-20 bg-white">
                                <p className="text-[24px] font-bold text-slate-900 tracking-tighter mb-2 flex items-baseline gap-1">
                                    {formattedPrice}
                                    <span className="text-[12px] font-bold text-slate-500 uppercase">COP</span>
                                </p>
                                <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2 mb-3">
                                    {fav.titulo}
                                </h3>
                                <div className="flex items-center gap-1 mb-4">
                                    <span className="text-[13px] font-medium text-slate-500 uppercase">
                                        {fav.barrio ? `${fav.barrio}, ` : ''}{fav.ciudad}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[13px] text-slate-600 font-bold pt-3 border-t border-slate-100">
                                    {fav.habitaciones && <span>{fav.habitaciones} hab</span>}
                                    {fav.area_m2 && <span>{Math.round(fav.area_m2)}m²</span>}
                                    <span className="ml-auto text-red-500 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                                        Ver <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}
