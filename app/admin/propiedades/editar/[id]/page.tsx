import { getPropertyById } from "@/lib/supabase/properties";
import PropertyForm from "@/components/admin/PropertyForm";
import { handleUpdateProperty } from "@/app/admin/actions";
import { notFound } from "next/navigation";

interface EditPropertyPageProps {
    params: {
        id: string;
    };
}

export default async function EditarPropiedad({ params }: EditPropertyPageProps) {
    const property = await getPropertyById(params.id);

    if (!property) {
        return notFound();
    }

    // Wrap handleUpdateProperty to include the ID
    const onUpdate = async (formData: FormData, imageUrls: string[]) => {
        "use server";
        const res = await handleUpdateProperty(params.id, formData, imageUrls);
        return res as unknown as { error?: string, success?: boolean, slug?: string };
    };

    return (
        <PropertyForm
            initialData={property}
            title={<>Editar <span className="text-red-600">Inmueble</span></>}
            subtitle={`Editando: ${property.titulo}`}
            onSubmitAction={onUpdate}
        />
    );
}
