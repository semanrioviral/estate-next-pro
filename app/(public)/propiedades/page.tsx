import { Metadata } from "next";
import { getProperties } from "@/lib/supabase/properties";
import PropertyCardV3 from "@/components/design-system/PropertyCardV3";
import CatalogHeader from "@/components/design-system/CatalogHeader";
import { Search } from "lucide-react";
import Pagination from "@/components/design-system/Pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Catálogo de Propiedades | Inmobiliaria Tucasa Los Patios",
    description: "Explora nuestra amplia oferta de casas, apartamentos y lotes en venta en Cúcuta, Los Patios y Villa del Rosario. Tu hogar ideal está aquí.",
    alternates: {
        canonical: "/propiedades",
    },
};

export default async function PropiedadesPage({
    searchParams,
}: {
    searchParams: Promise<{ orden?: string; page?: string }>;
}) {
    const { orden, page: pageParam } = await searchParams;
    const currentPage = Number(pageParam) || 1;
    const { properties, totalCount } = await getProperties(orden, currentPage);

    return (
        <main className="min-h-screen bg-white">
            <CatalogHeader
                title={<>Explora Todas las <span className="text-brand">Propiedades</span></>}
                description="Nuestra selección completa de inmuebles en Cúcuta, Los Patios y Villa del Rosario."
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Catálogo General' }
                ]}
            />

            {/* Results Section */}
            <section className="py-20 bg-white">
                <div className="container-wide px-4">
                    {properties.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {properties.map((property) => (
                                    <PropertyCardV3 key={property.id} property={property} />
                                ))}
                            </div>

                            <div className="mt-12">
                                <Pagination
                                    totalItems={totalCount}
                                    itemsPerPage={12}
                                    currentPage={currentPage}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-bg-alt rounded-2xl border border-border-clean border-dashed">
                            <Search className="w-12 h-12 text-text-muted mb-4" />
                            <h3 className="text-text-primary mb-2">No encontramos resultados</h3>
                            <p className="text-text-secondary font-medium md:max-w-md text-center">
                                Intente ajustar los filtros de búsqueda o regrese más tarde para ver nuevas opciones.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main >
    );
}

