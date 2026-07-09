import { Metadata } from 'next';
import { Heart } from 'lucide-react';
import FavoritesList from '@/components/FavoritesList';

export const metadata: Metadata = {
    title: 'Mis Propiedades Favoritas | Inmobiliaria Tucasa Los Patios',
    description: 'Lista de propiedades que has guardado como favoritas. Encuentra tu hogar ideal entre tus inmuebles preferidos en Cúcuta, Los Patios y Villa del Rosario.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://tucasalospatios.com/favoritos',
    },
};

export default function FavoritosPage() {
    return (
        <main className="min-h-screen bg-white">
            <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-12">
                <div className="container-wide px-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-4">
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                            <span className="text-[12px] font-black text-red-600 uppercase tracking-widest">Tus Favoritos</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                            Propiedades <span className="text-red-500">Guardadas</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl">
                            Aquí encontrarás todas las propiedades que has guardado. Compara precios, comparte con tu familia o contacta al asesor directamente.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-20">
                <div className="container-wide px-4">
                    <FavoritesList />
                </div>
            </section>
        </main>
    );
}
