"use server";

import { createAdminClient } from "@/lib/supabase-server";

interface LeadInput {
    nombre: string;
    telefono: string;
    email?: string;
    mensaje?: string;
    property_id?: string;
}

export async function submitLead(data: LeadInput) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("advisory_requests").insert({
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.email || null,
            mensaje: data.mensaje || null,
            property_id: data.property_id || null,
            estado: "pendiente",
        });

        if (error) {
            console.error("[LEAD] Error al insertar:", error.message);
            return { error: "Error al enviar la solicitud. Intenta de nuevo." };
        }

        return { success: true };
    } catch (err: any) {
        console.error("[LEAD] Excepción:", err.message);
        return { error: "Error inesperado al enviar." };
    }
}
