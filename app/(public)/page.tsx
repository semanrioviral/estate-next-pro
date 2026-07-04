import { Suspense } from 'react';
import HomeHeroV3 from "@/components/design-system/HomeHeroV3";
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ChevronRight, Building2, ShieldCheck, Star, CheckCircle2, Home as HomeIcon, Building, Map, LayoutGrid } from 'lucide-react';
import SearchBarV3 from "@/components/design-system/SearchBarV3";
import { SITE_URL } from '@/lib/supabase/constants';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: { absolute: 'Casas y Apartamentos en Venta en Los Patios y Cúcuta | Inmobiliaria Tucasa Los Patios' },
    description: 'Casas y apartamentos en venta en Los Patios, Cúcuta y Norte de Santander. Encuentra tu próxima propiedad con la mejor inmobiliaria de la región.',
    alternates: {
        canonical: SITE_URL,
    },
    openGraph: {
        title: 'Casas y Apartamentos en Venta en Los Patios y Cúcuta | Inmobiliaria Tucasa Los Patios',
        description: 'Casas y apartamentos en venta en Los Patios, Cúcuta y Norte de Santander.',
        type: 'website',
        url: SITE_URL,
    },
};

import { FeaturedPropertiesSection, FeaturedPropertiesFallback } from './FeaturedPropertiesSection';

const cities = [
  { name: "Cúcuta", slug: "cucuta", count: "120+ inmuebles", image: "https://res.cloudinary.com/dwdlmbftw/image/upload/f_webp,q_60,w_600/ciudades/cucuta" },
  { name: "Los Patios", slug: "los-patios", count: "80+ inmuebles", image: "https://res.cloudinary.com/dwdlmbftw/image/upload/f_webp,q_60,w_600/ciudades/los-patios" },
  { name: "Villa del Rosario", slug: "villa-del-rosario", count: "45+ inmuebles", image: "https://res.cloudinary.com/dwdlmbftw/image/upload/f_webp,q_60,w_600/ciudades/villa-del-rosario" }
];

const navItems = [
  { label: "Propiedades únicas", val: "Casas", href: "/venta/casa", icon: <HomeIcon className="w-6 h-6" /> },
  { label: "Espacios modernos", val: "Apartamentos", href: "/venta/apartamento", icon: <Building className="w-6 h-6" /> },
  { label: "Nueva inversión", val: "Proyectos", href: "/venta/proyecto", icon: <LayoutGrid className="w-6 h-6" /> },
  { label: "Terrenos base", val: "Lotes", href: "/venta/lote", icon: <Map className="w-6 h-6" /> },
];

const services = [
  { title: "Gestión de Ventas", href: "/consignar-propiedad", desc: "Venda su propiedad rápido y al valor comercial justo.", icon: <Building2 className="w-7 h-7" /> },
  { title: "Arriendos Seguros", href: "/arriendo", desc: "Arriende con la tranquilidad de pólizas de seguros integrales.", icon: <Star className="w-7 h-7 text-whatsapp fill-whatsapp/10" /> },
  { title: "Avalúos Técnicos", href: "/contacto", desc: "Certificamos el valor real de su inmueble con total transparencia.", icon: <ShieldCheck className="w-7 h-7" /> }
];

const testimonials = [
  { name: "Carlos Mendoza", pos: "Inversor Senior", text: "La asesoría técnica and legal de Tucasa fue fundamental para mi diversificación en Los Patios. Un proceso impecable y profesional." },
  { name: "Dra. Marta Rodríguez", pos: "Propietaria", text: "Destaco el marketing digital y la gestión de prospectos. Vendieron mi casa en tiempo récord con todas las garantías jurídicas." },
  { name: "Ing. Jorge Duarte", pos: "Arrendatario", text: "Excelente plataforma digital. La gestión de contratos y pagos es transparente and eficiente. Altamente recomendados." }
];

function StatsSection() {
  return (
    <section className="pt-24 pb-24 bg-slate-50 relative overflow-hidden">
      <div className="container-wide relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {navItems.map((nav, i) => (
            <Link key={i} href={nav.href} className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-brand-600/20 hover:shadow-xl hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm mb-5 border border-slate-100 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">{nav.icon}</div>
              <span className="text-xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-brand-600 transition-colors uppercase">{nav.val}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{nav.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200/60 relative">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-brand-600 font-black text-[11px] uppercase tracking-[0.3em] mb-4">Experiencia Garantizada</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-8 leading-tight">Impulsamos tus <br /> <span className="text-brand-600">Negocios Inmobiliarios</span></h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">Como portal profesional en Norte de Santander, ofrecemos una infraestructura legal y comercial completa para asegurar su éxito.</p>
            <div className="flex flex-col gap-4 w-full">
              {["Fotografía y Video Profesional", "Análisis de Mercado Georreferenciado", "Acompañamiento en Firmas Digitales", "Gestión Hipotecaria Eficiente"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-whatsapp" />{item}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <Link key={idx} href={service.href} className="p-8 pb-10 bg-white rounded-3xl border border-slate-100 hover:border-brand-600/20 transition-all hover:shadow-2xl hover:-translate-y-2 group block border-b-4 border-b-transparent hover:border-b-brand-600 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-600 mb-8 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 border border-slate-100">{service.icon}</div>
                <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium mb-8">{service.desc}</p>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors">Ver más detalles</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CitiesSection() {
  return (
    <section className="py-32 bg-white border-t-2 border-brand-600/10 relative overflow-hidden">
      <div className="container-wide relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-600/5 blur-3xl rounded-full"></div>
            <span className="text-brand-600 font-black text-[11px] uppercase tracking-[0.4em] mb-4 block relative z-10">Inteligencia de Mercado</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight relative z-10">Análisis por <span className="text-brand-600">Zonas de Inversión</span></h2>
          </div>
          <p className="text-slate-500 font-medium max-w-sm relative z-10">Datos clave para decisiones inmobiliarias estratégicas en el área metropolitana de Cúcuta.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities.map((city, cityIndex) => (
            <Link key={city.slug} href={`/${city.slug}`} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <Image src={city.image} alt={`Propiedades en ${city.name} - ${city.count} inmuebles disponibles`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px" priority={cityIndex === 0} unoptimized />
                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl">{city.count}</div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-brand-600 transition-colors uppercase">{city.name}</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plusvalía Est.</span><span className="text-sm font-black text-slate-700">8% - 12% Anual</span></div>
                  <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perfil</span><span className="text-sm font-black text-slate-700">Residencial A</span></div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-600">Explorar Mercado</div>
                  <ChevronRight className="w-5 h-5 text-brand-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-20 p-10 bg-slate-800 rounded-[2.5rem] border border-slate-700/50 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shrink-0 shadow-xl shadow-brand-900/20"><Building2 className="w-8 h-8 text-white" /></div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              <span className="text-white font-bold">Liderazgo Regional:</span> Tucasa Inmobiliaria se consolida como el referente técnico en Norte de Santander. Nuestra plataforma integra analítica de datos y visibilidad multi-canal para que su propiedad en <span className="text-white">Cúcuta, Los Patios o Villa del Rosario</span> destaque ante compradores de alto perfil, garantizando una transacción eficiente, segura and transparente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden">
      <div className="container-wide relative z-10">
        <div className="flex flex-col items-center text-center mb-24">
          <span className="text-brand-500 font-black text-[11px] uppercase tracking-[0.4em] mb-4">Garantía de Excelencia</span>
          <h2 className="text-4xl md:text-5xl font-black !text-white mb-8 tracking-tight">Experiencias de <span className="text-brand-600 underline decoration-slate-800 underline-offset-8">Confianza</span></h2>
          <p className="text-slate-400 font-medium max-w-xl">La satisfacción de nuestros clientes es el pilar de nuestra trayectoria profesional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((tm, i) => (
            <div key={i} className="p-10 bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border border-white/5 flex flex-col hover:border-brand-600/30 hover:bg-slate-900 transition-all group">
              <div className="flex gap-1.5 mb-8">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 text-brand-600 fill-brand-600" />)}</div>
              <blockquote className="text-lg text-slate-300 font-medium leading-relaxed mb-10 flex-grow">&ldquo;{tm.text}&rdquo;</blockquote>
              <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-black text-lg border border-white/5">{tm.name[0]}</div>
                <div><p className="font-black text-white text-sm">{tm.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tm.pos}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConversionSection() {
  return (
    <section className="py-40 bg-white border-t border-slate-100">
      <div className="container-wide text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-brand-600 font-black text-[11px] uppercase tracking-[0.4em] mb-10 block">Portal Inmobiliario Premium</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-10 leading-[1] tracking-tighter">Asegure su <span className="text-brand-600">Patrimonio</span> hoy mismo</h2>
          <p className="text-slate-500 text-xl md:text-2xl mb-16 font-medium leading-relaxed max-w-3xl mx-auto">Inicie su proceso de venta o avalúo con el respaldo técnico y legal más sólido de Cúcuta.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/consignar-propiedad" className="bg-brand-600 text-white px-12 h-20 rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/20 active:scale-[0.98] min-w-[300px]">Consignar Propiedad</Link>
            <Link href="/contacto" className="bg-slate-900 text-white px-12 h-20 rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] min-w-[300px]">Hablar con un Experto</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col bg-white">
      <HomeHeroV3 />
      <div className="-mt-12 relative z-30 flex justify-center">
        <div className="w-full">
          <Suspense fallback={<div className="h-[320px] md:h-[72px] bg-slate-50 animate-pulse rounded-3xl md:rounded-[6px]" />}>
            <SearchBarV3 />
          </Suspense>
        </div>
      </div>
      <StatsSection />
      <Suspense fallback={<FeaturedPropertiesFallback />}>
        <FeaturedPropertiesSection />
      </Suspense>
      <ServicesSection />
      <CitiesSection />
      <TestimonialsSection />
      <ConversionSection />
    </div>
  );
}
