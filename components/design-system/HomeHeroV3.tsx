import Image from 'next/image';
import Link from 'next/link';

export default function HomeHeroV3() {
    return (
        <section className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-48 overflow-hidden bg-slate-900">
            {/* Background Image with optimized overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://res.cloudinary.com/dwdlmbftw/image/upload/f_webp,q_40,w_400/hero/hero-homepage"
                    alt="Propiedad de Lujo"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="100vw"
                    className="object-cover opacity-60"
                    decoding="sync"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-950/80"></div>
            </div>

            <div className="container-wide relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 animate-fade-in shadow-xl">
                        <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                        <p className="text-white text-[12px] font-bold uppercase tracking-[0.2em]">
                            Inmobiliaria líder en finca raíz en Norte de Santander
                        </p>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold !text-white leading-tight tracking-tight drop-shadow-2xl">
                        Casas y Apartamentos en Venta en Los Patios y Cúcuta
                    </h1>

                    <p className="text-lg md:text-xl !text-white/80 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                        Propiedades exclusivas en Los Patios, Cúcuta y todo Norte de Santander.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/venta"
                            className="bg-brand-600 text-white px-12 h-14 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-[0.98] shadow-lg shadow-brand-900/20 flex items-center justify-center min-w-[240px]"
                        >
                            Ver Propiedades
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
