import PropertyEditor from "@/components/admin/PropertyEditor";
import { handleCreateProperty } from "@/app/admin/actions";
import { getAllTags, getAllAmenidades, GalleryImage } from "@/lib/supabase/properties";
import { createAdminClient } from "@/lib/supabase-server";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

export default async function NuevoInmueble() {
    const [tags, amenidades] = await Promise.all([getAllTags(), getAllAmenidades()]);
    const supabase = createAdminClient();
    const { data: agentsData } = await supabase
        .from('profiles').select('id, full_name').order('full_name', { ascending: true });
    const agents = (agentsData || []).filter(a => a.full_name).map(a => ({ id: a.id, full_name: a.full_name as string }));

    return (
        <div className="space-y-4">
            <AdminBreadcrumbs items={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Propiedades', href: '/admin/propiedades' },
                { label: 'Nuevo inmueble' }
            ]} />
            <PropertyEditor
                tags={tags}
                amenidades={amenidades}
                agents={agents}
                onSubmitAction={async (formData: FormData, images: GalleryImage[]) => {
                    "use server";
                    const res = await handleCreateProperty(formData, images);
                    return res as unknown as { error?: string; success?: boolean; slug?: string };
                }}
            />
        </div>
    );
}
