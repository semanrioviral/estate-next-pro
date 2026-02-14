'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/admin/login')
}
import { createProperty } from '@/lib/supabase/properties'

export async function handleCreateProperty(formData: FormData, imageUrls: string[]) {
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

    // Generate a simple slug from title
    const slug = titulo.toLowerCase()
        .replace(/[^a-z0-0]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const { data, error } = await createProperty({
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

    if (error) {
        return { error };
    }

    return redirect('/admin/propiedades');
}
