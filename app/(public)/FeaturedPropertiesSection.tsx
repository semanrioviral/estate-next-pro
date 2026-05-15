import { getFeaturedProperties } from "@/lib/supabase/properties";
import PropertyCardV3 from "@/components/design-system/PropertyCardV3";
import Link from 'next/link';
import { ChevronRight, Building2, Star } from 'lucide-react';

export async function FeaturedPropertiesSection() {
  const featuredProperties = await getFeaturedProperties(6);

  if (featuredProperties.length === 0) {
    return (
      <section className="py-24 bg-white border-t-2 border-brand-600/10">
        <div className="container-wide">
          <div className="py-32 bg-slate-50 rounded-[3rem] border border-slate-200 text-center shadow-inner">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Sincronizando últimas propiedades...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white border-t-2 border-brand-600/10">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-600/5 blur-3xl rounded-full"></div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-widest mb-6 relative z-10"><Star className="w-3 h-3 fill-brand-600" /> Selección Premium</div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 relative z-10">Propiedades <span className="text-brand-600">Recomendadas</span></h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl relative z-10">Inmobiliaria líder en Cúcuta y Los Patios. Explore las oportunidades de inversión más seguras de la región.</p>
          </div>
          <Link href="/venta" className="group flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 hover:text-brand-600 transition-all">
            Explorar Catálogo Completo
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm border border-slate-100 group-hover:scale-110 group-hover:shadow-brand-200"><ChevronRight className="w-5 h-5" /></div>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredProperties.map((property) => (
            <div key={property.id} className="transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-3xl">
              <PropertyCardV3 property={property} variant="homepage" />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center mt-16">
          <Link href="/venta" className="group relative inline-flex items-center gap-3 bg-brand-600 text-white px-10 md:px-14 h-16 md:h-[4.5rem] rounded-full font-black text-sm md:text-base uppercase tracking-[0.15em] hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/25 active:scale-[0.97] hover:shadow-2xl hover:shadow-brand-600/30 hover:-translate-y-0.5 overflow-hidden">
            <span className="absolute inset-0 rounded-full border-2 border-brand-600 animate-ping opacity-15"></span>
            Ver Todas las Propiedades
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-slate-400 font-medium">Descubre todo nuestro inventario disponible</p>
        </div>
      </div>
    </section>
  );
}

export function FeaturedPropertiesFallback() {
  return (
    <section className="py-24 bg-white border-t-2 border-brand-600/10">
      <div className="container-wide">
        <div className="py-20 md:py-32 bg-slate-50 rounded-[3rem] border border-slate-200 text-center shadow-inner">
          <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse mx-auto mb-6" />
          <div className="h-6 w-64 bg-slate-200 animate-pulse rounded mx-auto mb-4" />
          <div className="h-4 w-48 bg-slate-200 animate-pulse rounded mx-auto" />
        </div>
      </div>
    </section>
  );
}
