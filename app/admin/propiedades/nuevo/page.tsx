"use client";

import PropertyForm from "@/components/admin/PropertyForm";
import { handleCreateProperty } from "@/app/admin/actions";

export default function NuevoInmueble() {
    return (
        <PropertyForm
            title={<>Nuevo <span className="text-red-600">Inmueble</span></>}
            subtitle="Completa los datos para publicar una nueva propiedad."
            onSubmitAction={async (formData, imageUrls) => {
                const res = await handleCreateProperty(formData, imageUrls);
                return res as unknown as { error?: string, success?: boolean, slug?: string };
            }}
        />
    );
}
