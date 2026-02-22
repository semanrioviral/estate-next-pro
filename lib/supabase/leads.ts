'use server';

import { createClient } from '../supabase-server';

export interface Lead {
    id: string;
    property_id?: string;
    nombre: string;
    telefono: string;
    mensaje: string;
    estado: 'nuevo' | 'contactado' | 'cerrado';
    tipo_lead: 'cliente' | 'propietario';
    direccion?: string;
    ciudad?: string;
    created_at: string;
    properties?: {
        titulo: string;
        slug: string;
    };
}

/**
 * Crea un nuevo lead en la base de datos
 */
export async function createLead(data: {
    property_id?: string;
    nombre: string;
    telefono: string;
    mensaje: string;
    tipo_lead?: 'cliente' | 'propietario';
    direccion?: string;
    ciudad?: string;
}) {
    try {
        const supabase = await createClient();

        const { data: lead, error } = await supabase
            .from('leads')
            .insert([
                {
                    property_id: data.property_id || null,
                    nombre: data.nombre,
                    telefono: data.telefono,
                    mensaje: data.mensaje,
                    tipo_lead: data.tipo_lead || 'cliente',
                    direccion: data.direccion || null,
                    ciudad: data.ciudad || null
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('[LEADS] Error creating lead:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: lead };
    } catch (err: any) {
        console.error('[LEADS] Exception in createLead:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Obtiene todos los leads ordenados por fecha de creación descendente
 */
export async function getLeads() {
    try {
        const supabase = await createClient();

        const { data: leads, error } = await supabase
            .from('leads')
            .select(`
                *,
                properties (
                    titulo,
                    slug
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[LEADS] Error fetching leads:', error.message);
            return [];
        }

        return leads as Lead[];
    } catch (err: any) {
        console.error('[LEADS] Exception in getLeads:', err.message);
        return [];
    }
}

/**
 * Actualiza el estado de un lead
 */
export async function updateLeadStatus(id: string, estado: Lead['estado']) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('leads')
            .update({ estado })
            .eq('id', id);

        if (error) {
            console.error('[LEADS] Error updating lead status:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('[LEADS] Exception in updateLeadStatus:', err.message);
        return { success: false, error: err.message };
    }
}
