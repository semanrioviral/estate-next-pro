"use server";

import { createAdminClient } from "@/lib/supabase-server";

export async function trackWhatsappLead(phone: string, propertyId?: string, propertyTitle?: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("advisory_requests").insert({
            nombre: "Contacto WhatsApp",
            telefono: phone || "",
            email: "whatsapp@auto.tucasalospatios.com",
            mensaje: propertyTitle ? `Interesado en: ${propertyTitle}` : "Contacto vía WhatsApp",
            estado: "pendiente",
            property_id: propertyId || null,
        });
        if (error) console.warn("[CRM] Error tracking WhatsApp lead:", error.message);
    } catch (e: any) {
        console.warn("[CRM] Exception tracking WhatsApp lead:", e.message);
    }
}
