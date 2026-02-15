'use server'

import { createClient, createAdminClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createProperty, deleteProperty, updateProperty } from '@/lib/supabase/properties'
import { revalidatePath } from 'next/cache'

export async function logout() {
    // ... existing logout code
}

export async function handleCreateProperty(formData: FormData, imageUrls: string[]) {
    try {
        console.log('[ACTION] handleCreateProperty iniciado');

        const titulo = formData.get('titulo') as string;
        const precio = Number(formData.get('precio'));
        const descripcion = formData.get('descripcion') as string;
        const descripcion_corta = formData.get('descripcion_corta') as string;
        const direccion = formData.get('direccion') as string;
        const barrio = formData.get('barrio') as string;
        const ciudad = formData.get('ciudad') as string;
        const tipo = formData.get('tipo') as any;
        const habitaciones = Number(formData.get('habitaciones'));
        const baños = Number(formData.get('baños'));
        const area_m2 = Number(formData.get('area_m2'));
        const negociable = formData.get('negociable') === 'true';
        const estado = formData.get('estado') as string;
        const medidas_lote = formData.get('medidas_lote') as string;
        const tipo_uso = formData.get('tipo_uso') as string;
        const financiamiento = formData.get('financiamiento') as string;
        const destacado = formData.get('destacado') === 'true';

        // SEO Fields
        const meta_titulo = formData.get('meta_titulo') as string;
        const meta_descripcion = formData.get('meta_descripcion') as string;
        const canonical = formData.get('canonical') as string;

        // Arrays (from comma separated or multiple inputs if needed, here we assume simple string for simplicity or multiple)
        const servicios = formData.get('servicios')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [];
        const etiquetas = formData.get('etiquetas')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [];

        if (!titulo || isNaN(precio)) {
            return { error: 'Título y precio son requeridos.' };
        }

        const slug = titulo.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const result = await createProperty({
            titulo,
            precio,
            descripcion,
            descripcion_corta,
            direccion,
            barrio,
            ciudad,
            tipo,
            habitaciones,
            baños,
            area_m2,
            negociable,
            estado,
            medidas_lote,
            tipo_uso,
            servicios,
            financiamiento,
            destacado,
            slug,
            meta_titulo,
            meta_descripcion,
            canonical,
            etiquetas,
            imagen_principal: imageUrls[0] || '',
        }, imageUrls);

        if (result.error) {
            console.error('[ACTION] Error en createProperty:', result.error);
            return { error: result.error };
        }

        console.log('[ACTION] Propiedad creada con éxito');
        revalidatePath('/admin/propiedades');
        revalidatePath('/propiedades');
        return { success: true, slug };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleCreateProperty:', err);
        return { error: err.message || 'Error inesperado al crear.' };
    }
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
        revalidatePath('/admin/propiedades');
        revalidatePath('/propiedades');
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
        const descripcion_corta = formData.get('descripcion_corta') as string;
        const direccion = formData.get('direccion') as string;
        const barrio = formData.get('barrio') as string;
        const ciudad = formData.get('ciudad') as string;
        const tipo = formData.get('tipo') as any;
        const habitaciones = Number(formData.get('habitaciones'));
        const baños = Number(formData.get('baños'));
        const area_m2 = Number(formData.get('area_m2'));
        const negociable = formData.get('negociable') === 'true';
        const estado = formData.get('estado') as string;
        const medidas_lote = formData.get('medidas_lote') as string;
        const tipo_uso = formData.get('tipo_uso') as string;
        const financiamiento = formData.get('financiamiento') as string;
        const destacado = formData.get('destacado') === 'true';

        // SEO Fields
        const meta_titulo = formData.get('meta_titulo') as string;
        const meta_descripcion = formData.get('meta_descripcion') as string;
        const canonical = formData.get('canonical') as string;

        const servicios = formData.get('servicios')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [];
        const etiquetas = formData.get('etiquetas')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [];

        if (!titulo || isNaN(precio)) {
            return { error: 'Título y precio son requeridos.' };
        }

        const slug = titulo.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const result = await updateProperty(id, {
            titulo,
            precio,
            descripcion,
            descripcion_corta,
            direccion,
            barrio,
            ciudad,
            tipo,
            habitaciones,
            baños,
            area_m2,
            negociable,
            estado,
            medidas_lote,
            tipo_uso,
            servicios,
            financiamiento,
            destacado,
            slug,
            meta_titulo,
            meta_descripcion,
            canonical,
            etiquetas,
        }, imageUrls);

        if (result.error) {
            console.error('[ACTION] Error en updateProperty:', result.error);
            return { error: result.error };
        }

        console.log('[ACTION] Propiedad actualizada con éxito');
        revalidatePath('/admin/propiedades');
        revalidatePath(`/propiedades/${slug}`);
        return { success: true, slug };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleUpdateProperty:', err);
        return { error: err.message || 'Error inesperado al actualizar.' };
    }
}

export async function handleBulkImport(data: any[]) {
    try {
        console.log('[ACTION] handleBulkImport iniciado. Registros:', data.length);
        const supabase = await createClient();

        let insertedCount = 0;
        let omittedCount = 0;
        const errors: { item: string, error: string }[] = [];

        // 1. Obtener slugs y direcciones existentes para detección de duplicados
        const { data: existing } = await supabase
            .from('properties')
            .select('slug, direccion');

        const existingSlugs = new Set(existing?.map(p => p.slug) || []);
        const existingDirs = new Set(existing?.map(p => p.direccion?.toLowerCase().trim()).filter(Boolean) || []);

        const validBatch: any[] = [];

        for (const item of data) {
            try {
                // Generar slug si no viene
                const slug = item.slug || (item.titulo ? item.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : null);

                if (!slug || !item.titulo || !item.precio) {
                    errors.push({ item: item.titulo || 'Sin Título', error: 'Faltan campos obligatorios' });
                    continue;
                }

                // Detectar duplicado
                if (existingSlugs.has(slug) || (item.direccion && existingDirs.has(item.direccion.toLowerCase().trim()))) {
                    omittedCount++;
                    continue;
                }

                const cleanedItem = {
                    titulo: item.titulo,
                    descripcion: item.descripcion || '',
                    descripcion_corta: item.descripcion_corta || '',
                    direccion: item.direccion || '',
                    ciudad: item.ciudad || 'Cúcuta',
                    barrio: item.barrio || 'Centro',
                    precio: Number(item.precio),
                    negociable: item.negociable === true || item.negociable === 'true',
                    estado: item.estado || 'Disponible',
                    tipo: item.tipo || 'casa',
                    habitaciones: Number(item.habitaciones || 0),
                    baños: Number(item.baños || 0),
                    area_m2: Number(item.area_m2 || 0),
                    medidas_lote: item.medidas_lote || '',
                    tipo_uso: item.tipo_uso || 'Residencial',
                    servicios: Array.isArray(item.servicios) ? item.servicios : (item.servicios?.split(',').map((s: string) => s.trim()) || []),
                    etiquetas: Array.isArray(item.etiquetas) ? item.etiquetas : (item.etiquetas?.split(',').map((s: string) => s.trim()) || []),
                    financiamiento: item.financiamiento || '',
                    slug,
                    imagen_principal: item.imagen_principal || '',
                    destacado: item.destacado === true || item.destacado === 'true',
                    meta_titulo: item.meta_titulo || item.titulo,
                    meta_descripcion: item.meta_descripcion || item.descripcion_corta || '',
                    canonical: item.canonical || ''
                };

                validBatch.push(cleanedItem);
                existingSlugs.add(slug); // Evitar duplicados dentro del mismo batch
            } catch (err: any) {
                errors.push({ item: item.titulo || 'Error registro', error: err.message });
            }
        }

        if (validBatch.length > 0) {
            console.log(`[ACTION] Insertando batch de ${validBatch.length} propiedades...`);
            const { error: insertError } = await supabase
                .from('properties')
                .insert(validBatch);

            if (insertError) {
                console.error('[ACTION] Error crítico en inserción masiva:', insertError);
                return { error: 'Error al insertar en base de datos: ' + insertError.message };
            }
            insertedCount = validBatch.length;
        }

        revalidatePath('/admin/propiedades');
        revalidatePath('/propiedades');

        return {
            success: true,
            report: {
                inserted: insertedCount,
                omitted: omittedCount,
                errors
            }
        };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleBulkImport:', err);
        return { error: err.message || 'Error inesperado en importación.' };
    }
}

export async function handleInviteAgent(email: string, fullName: string) {
    try {
        console.log('[ACTION] Invitando agente:', email);

        if (!process.env.NEXT_PUBLIC_SITE_URL) {
            console.error('[ACTION] Error: NEXT_PUBLIC_SITE_URL no está configurada');
            return { error: 'Falta configuración en el servidor (SITE_URL). Contacte a soporte.' };
        }

        const supabase = createAdminClient();

        const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { full_name: fullName },
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/login`
        });

        if (error) {
            console.error('[ACTION] Error invitando agente:', error.message);
            return { error: `Error de Supabase: ${error.message}` };
        }

        console.log('[ACTION] Agente invitado con éxito');
        revalidatePath('/admin/equipo');
        return { success: true };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleInviteAgent:', err);
        return { error: err.message || 'Error inesperado al procesar la invitación.' };
    }
}

export async function handleDeleteInvitation(userId: string) {
    try {
        console.log('[ACTION] Eliminando invitación/usuario:', userId);
        const supabase = createAdminClient();

        // Eliminar de auth
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            console.error('[ACTION] Error eliminando invitación:', error.message);
            return { error: error.message };
        }

        // Eliminar de profiles si existe (por seguridad)
        await supabase.from('profiles').delete().eq('id', userId);

        console.log('[ACTION] Invitación eliminada con éxito');
        revalidatePath('/admin/equipo');
        return { success: true };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleDeleteInvitation:', err);
        return { error: err.message || 'Error inesperado al eliminar.' };
    }
}

export async function handleSyncProfile(userId: string, email: string, fullName: string) {
    try {
        console.log('[ACTION] Sincronizando perfil para:', email);
        const supabase = createAdminClient();

        // Verificar si ya existe
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (existing) {
            return { success: true, message: 'Perfil ya existe' };
        }

        // Crear perfil
        const { error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                full_name: fullName,
                role: 'agente' // Por defecto
            });

        if (error) {
            console.error('[ACTION] Error creando perfil sync:', error.message);
            return { error: error.message };
        }

        console.log('[ACTION] Perfil sincronizado con éxito');
        revalidatePath('/admin/equipo');
        return { success: true };
    } catch (err: any) {
        console.error('[ACTION] Excepción en handleSyncProfile:', err);
        return { error: err.message || 'Error inesperado en sincronización.' };
    }
}
