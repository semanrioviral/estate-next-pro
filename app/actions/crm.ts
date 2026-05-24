"use server";

import { createAdminClient } from "@/lib/supabase-server";

export async function trackWhatsappLead(phone: string, propertyId?: string, propertyTitle?: string) {
    try {
        const supabase = createAdminClient();

        // Buscar lead existente con el mismo teléfono
        const { data: existing } = await supabase
            .from("advisory_requests")
            .select("id, mensaje, property_id, propiedades_ids")
            .eq("telefono", phone)
            .order("created_at", { ascending: false })
            .limit(1);

        if (existing && existing.length > 0) {
            const lead = existing[0];
            
            // Track propiedad en historial (evitar duplicados)
            let propsIds: string[] = [];
            try { propsIds = lead.propiedades_ids ? JSON.parse(lead.propiedades_ids) : []; } catch { propsIds = []; }
            if (lead.property_id) propsIds.unshift(lead.property_id);
            if (propertyId && !propsIds.includes(propertyId)) propsIds.unshift(propertyId);
            propsIds = [...new Set(propsIds)].slice(0, 20); // max 20 properties

            const newPropLine = propertyTitle && propertyId && propertyId !== lead.property_id
                ? `\n📌 ${new Date().toLocaleDateString('es-CO')} — También interesado en: ${propertyTitle}`
                : '';

            const { error } = await supabase
                .from("advisory_requests")
                .update({
                    mensaje: (lead.mensaje || '') + newPropLine,
                    ultimo_contacto: new Date().toISOString(),
                    property_id: propertyId || lead.property_id,
                    propiedades_ids: JSON.stringify(propsIds),
                })
                .eq("id", lead.id);

            if (!error) console.log("[CRM] Lead actualizado:", lead.id, "| Props:", propsIds.length);
        } else {
            // Crear nuevo lead
            const { error } = await supabase.from("advisory_requests").insert({
                nombre: "Contacto WhatsApp",
                telefono: phone,
                email: "whatsapp@auto.tucasalospatios.com",
                mensaje: propertyTitle ? `Interesado en: ${propertyTitle}` : "Contacto vía WhatsApp",
                estado: "pendiente",
                property_id: propertyId || null,
                propiedades_ids: propertyId ? JSON.stringify([propertyId]) : null,
            });
            if (error) console.warn("[CRM] Error creating lead:", error.message);
        }
    } catch (e: any) {
        console.warn("[CRM] Exception:", e.message);
    }
}
