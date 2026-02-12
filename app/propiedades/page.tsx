import { Metadata } from "next";
import { properties } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
    title: "Catálogo de Propiedades | TucasaLosPatios",
    description: "Explora nuestra amplia oferta de casas, apartamentos y lotes en venta en Cúcuta, Los Patios y Villa del Rosario. Tu hogar ideal está aquí.",
    alternates: {
        canonical: "/propiedades",
    },
};

export default function PropiedadesPage() {
    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <Breadcrumbs items={[{ label: "Propiedades" }]} />

            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl uppercase">
                    Nuestro Catálogo
                </h1>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                    Propiedades exclusivas en el área metropolitana de Cúcuta.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property, index) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                    // Note: PropertyCard component needs to handle loading prop if we want to pass it explicitly, 
                    // but usually Next.js handles it. The user specifically asked for loading="eager" and loading="lazy".
                    // I will update PropertyCard to accept this prop.
                    />
                ))}
            </div>
        </div>
    );
}
