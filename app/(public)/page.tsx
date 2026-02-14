import Image from "next/image";
import Link from "next/link";
import { getFeaturedProperties } from "@/lib/supabase/properties";
import PropertyCard from "@/components/PropertyCard";

// Forzar renderizado dinámico para evitar errores de Supabase durante el build
export const dynamic = 'force-dynamic';

export default async function Home() {
  const featuredProperties = await getFeaturedProperties(3);

  return (
    <div className="flex flex-col gap-24 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
          alt="Lujosa casa en Norte de Santander"
          fill
          priority
          className="object-cover brightness-[0.5] scale-105"
          sizes="100vw"
        />

        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-zinc-50 dark:to-black"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 w-full pt-20">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-500/30 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 animate-fade-in">
              Inmobiliaria de Confianza
            </span>
            <h1 className="text-6xl font-black tracking-tight text-white sm:text-8xl mb-8 leading-[1.1]">
              Tu próximo <br />
              <span className="text-gradient">Hogar Ideal</span>
            </h1>
            <p className="text-xl leading-relaxed text-zinc-300 mb-12 max-w-2xl font-medium">
              Gestionamos las propiedades más exclusivas en Cúcuta, Los Patios y Villa del Rosario.
              Calidad y profesionalismo para tu inversión más importante.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                href="/propiedades"
                className="w-full sm:w-auto text-center rounded-2xl bg-blue-600 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
              >
                Explorar Catálogo
              </Link>
              <Link
                href="/contacto"
                className="w-full sm:w-auto text-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-10 py-5 text-lg font-bold text-white hover:bg-white/20 transition-all"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter sm:text-5xl">
              Propiedades <span className="text-blue-600">Destacadas</span>
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 mt-4 rounded-full"></div>
            <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Descubre una selección exclusiva de nuestros inmuebles más valorados en Norte de Santander.
            </p>
          </div>
          <Link
            href="/propiedades"
            className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors"
          >
            Ver catálogo completo
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={index < 3}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
              Estamos actualizando nuestro catálogo. ¡Vuelve pronto!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

