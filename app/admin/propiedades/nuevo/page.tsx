import PropertyForm from "@/components/admin/PropertyForm";
import { handleCreateProperty } from "@/app/admin/actions";
import { getAllTags, getAllAmenidades } from "@/lib/supabase/properties";
import { GalleryImage } from "@/lib/supabase/properties";
import { createAdminClient } from "@/lib/supabase-server";

export default async function NuevoInmueble() {
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

    return (
        <PropertyForm
            title={<>Nuevo <span className="text-red-600">Inmueble</span></>}
            subtitle="Completa los datos para publicar una nueva propiedad."
            tags={tags}
            amenidades={amenidades}
            agents={agents}
            onSubmitAction={async (formData: FormData, images: GalleryImage[]) => {
                "use server";
                const res = await handleCreateProperty(formData, images);
                return res as unknown as { error?: string, success?: boolean, slug?: string };
            }}
        />
    );
}
