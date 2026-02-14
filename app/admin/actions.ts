'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createProperty } from '@/lib/supabase/properties'

export async function logout() {
    try {
        const supabase = await createClient()
        await supabase.auth.signOut()
    } catch (err) {
        console.error('Error during logout:', err)
    } finally {
        return redirect('/admin/login')
    }
}

export async function handleCreateProperty(formData: FormData, imageUrls: string[]) {
    try {
        console.log('[ACTION] handleCreateProperty iniciado');
        console.log('[ACTION] URLs de imágenes recibidas:', imageUrls.length);

        const titulo = formData.get('titulo') as string;
        const precio = Number(formData.get('precio'));
        const descripcion = formData.get('descripcion') as string;
        const barrio = formData.get('barrio') as string;
        const ciudad = formData.get('ciudad') as string;
        const tipo = formData.get('tipo') as 'casa' | 'apartamento' | 'lote';
        const habitaciones = Number(formData.get('habitaciones'));
        const baños = Number(formData.get('baños'));
        const area_m2 = Number(formData.get('area_m2'));
        const destacado = formData.get('destacado') === 'true';

        if (!titulo || isNaN(precio)) {
            return { error: 'Título y precio son campos requeridos.' };
        }

        // Generate a simple slug from title
        const slug = titulo.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const result = await createProperty({
            titulo,
            precio,
            descripcion,
            barrio,
            ciudad,
            tipo,
            habitaciones,
            baños,
            area_m2,
            slug,
            destacado,
            imagen_principal: '', // Handled by createProperty from imageUrls
        }, imageUrls);

        if (result.error) {
            console.error('[ACTION] Error en createProperty:', result.error);
            return { error: result.error };
        }

        console.log('[ACTION] Propiedad y fotos creadas con éxito');
        return { success: true, slug: result.data.slug };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleCreateProperty:', err);
        return { error: err.message || 'Ocurrió un error inesperado al procesar la solicitud.' };
    }
}
