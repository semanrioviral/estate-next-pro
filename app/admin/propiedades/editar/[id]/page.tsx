import { getPropertyById, getAllTags, getAllAmenidades, GalleryImage } from "@/lib/supabase/properties";
import PropertyEditor from "@/components/admin/PropertyEditor";
import { handleUpdateProperty } from "@/app/admin/actions";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

interface EditPropertyPageProps { params: Promise<{ id: string }> }

export default async function EditarPropiedad({ params }: EditPropertyPageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property) return notFound();

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
                { label: property.titulo }
            ]} />
            <PropertyEditor
                initialData={property}
                isEdit
                tags={tags}
                amenidades={amenidades}
                agents={agents}
                onSubmitAction={async (formData: FormData, images: GalleryImage[]) => {
                    "use server";
                    const res = await handleUpdateProperty(id, formData, images);
                    return res as unknown as { error?: string; success?: boolean; slug?: string };
                }}
            />
        </div>
    );
}
