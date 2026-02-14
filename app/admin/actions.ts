'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createProperty, deleteProperty, updateProperty } from '@/lib/supabase/properties'

export async function logout() {
    // ... existing logout code
}

export async function handleCreateProperty(formData: FormData, imageUrls: string[]) {
    // ... existing handleCreateProperty code
}

export async function handleDeleteProperty(id: string) {
    try {
        console.log('[ACTION] handleDeleteProperty iniciado para ID:', id);
        const result = await deleteProperty(id);

        if (result.error) {
            console.error('[ACTION] Error en deleteProperty:', result.error);
            return { error: result.error };
        }

        console.log('[ACTION] Propiedad eliminada con éxito');
        return { success: true };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleDeleteProperty:', err);
        return { error: err.message || 'Error inesperado al eliminar.' };
    }
}

export async function handleUpdateProperty(id: string, formData: FormData, imageUrls: string[]) {
    try {
        console.log('[ACTION] handleUpdateProperty iniciado para ID:', id);

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
            return { error: 'Título y precio son requeridos.' };
        }

        // Re-generate slug if title changed (simplified, could be more robust)
        const slug = titulo.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const result = await updateProperty(id, {
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
        }, imageUrls);

        if (result.error) {
            console.error('[ACTION] Error en updateProperty:', result.error);
            return { error: result.error };
        }

        console.log('[ACTION] Propiedad actualizada con éxito');
        return { success: true, slug };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleUpdateProperty:', err);
        return { error: err.message || 'Error inesperado al actualizar.' };
    }
}
