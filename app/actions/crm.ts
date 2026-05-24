"use server";

import { createAdminClient } from "@/lib/supabase-server";

export async function trackWhatsappLead(phone: string, propertyId?: string, propertyTitle?: string) {
    try {
        const supabase = createAdminClient();
        const cleanPhone = phone.replace(/\D/g, '');

        // Buscar lead existente con el mismo teléfono
        const { data: existing } = await supabase
            .from("advisory_requests")
            .select("id, mensaje, property_id")
            .eq("telefono", phone)
            .order("created_at", { ascending: false })
            .limit(1);

        if (existing && existing.length > 0) {
            // Actualizar lead existente: agregar info de la nueva propiedad
            const lead = existing[0];
            const newPropertyLine = propertyTitle ? `\nTambién interesado en: ${propertyTitle}` : '';
            const updatedMensaje = (lead.mensaje || '') + newPropertyLine;

            const { error } = await supabase
                .from("advisory_requests")
                .update({
                    mensaje: updatedMensaje,
                    ultimo_contacto: new Date().toISOString(),
                    property_id: propertyId || lead.property_id, // actualizar a la más reciente
                })
                .eq("id", lead.id);

            if (!error) console.log("[CRM] Lead existente actualizado:", lead.id);
        } else {
            // Crear nuevo lead
            const { error } = await supabase.from("advisory_requests").insert({
                nombre: "Contacto WhatsApp",
                telefono: phone,
                email: "whatsapp@auto.tucasalospatios.com",
                mensaje: propertyTitle ? `Interesado en: ${propertyTitle}` : "Contacto vía WhatsApp",
                estado: "pendiente",
                property_id: propertyId || null,
            });
            if (error) console.warn("[CRM] Error creating lead:", error.message);
        }
    } catch (e: any) {
        console.warn("[CRM] Exception:", e.message);
    }
}
