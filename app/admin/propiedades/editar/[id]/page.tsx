import { getPropertyById, getAllTags, getAllAmenidades } from "@/lib/supabase/properties";
import PropertyForm from "@/components/admin/PropertyForm";
import { handleUpdateProperty } from "@/app/admin/actions";
import { GalleryImage } from "@/lib/supabase/properties";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";

interface EditPropertyPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditarPropiedad({ params }: EditPropertyPageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        return notFound();
    }

    // Fetch tags and amenidades for the form
    const [tags, amenidades] = await Promise.all([getAllTags(), getAllAmenidades()]);
    const supabase = createAdminClient();
    const { data: agentsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true });

    const agents = (agentsData || [])
        .filter((agent) => agent.full_name)
        .map((agent) => ({ id: agent.id, full_name: agent.full_name as string }));

    // Wrap handleUpdateProperty to include the ID
    const onUpdate = async (formData: FormData, images: GalleryImage[]) => {
        "use server";
        const res = await handleUpdateProperty(id, formData, images);
        return res as unknown as { error?: string, success?: boolean, slug?: string };
    };

    return (
        <PropertyForm
            initialData={property}
            title={<>Editar <span className="text-red-600">Inmueble</span></>}
            subtitle={`Editando: ${property.titulo}`}
            tags={tags}
            amenidades={amenidades}
            agents={agents}
            onSubmitAction={onUpdate}
        />
    );
}
