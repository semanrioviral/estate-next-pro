import Image from "next/image";
import { properties } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";

export default function Home() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-20">
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
          alt="Lujosa casa en Norte de Santander"
          fill
          priority
          className="object-cover brightness-[0.6]"
          sizes="100vw"
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Encuentra tu próximo <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Hogar Ideal</span>
          </h1>
          <p className="mt-8 text-xl leading-8 text-zinc-200 max-w-2xl mx-auto">
            Gestionamos las mejores propiedades en Cúcuta, Los Patios y Villa del Rosario. Calidad, confianza y profesionalismo en cada paso.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-blue-500 transition-all hover:scale-105">
              Explorar Propiedades
            </button>
            <button className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all">
              Contáctanos
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Propiedades Destacadas</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Una selección exclusiva de nuestros mejores inmuebles.</p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </div>
  );
}
