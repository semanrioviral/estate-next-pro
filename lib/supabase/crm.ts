"use server";

import { createAdminClient } from "@/lib/supabase-server";

export type PipelineEtapa = "nuevo" | "contactado" | "visitando" | "negociando" | "cerrado";

export interface CRMLead {
    id: string;
    nombre: string;
    telefono: string;
    email?: string;
    mensaje?: string;
    etapa: PipelineEtapa;
    property_id?: string;
    property_titulo?: string;
    property_slug?: string;
    notas?: string;
    ultimo_contacto?: string;
    created_at: string;
}

function mapToCRM(row: any): CRMLead {
    const etapaMap: Record<string, PipelineEtapa> = {
        pendiente: "nuevo",
        nuevo: "nuevo",
        contactado: "contactado",
        visitando: "visitando",
        negociando: "negociando",
        cerrado: "cerrado",
    };
    return {
        id: row.id,
        nombre: row.nombre,
        telefono: row.telefono || "",
        email: row.email || undefined,
        mensaje: row.mensaje || undefined,
        etapa: etapaMap[row.estado] || "nuevo",
        property_id: row.property_id || undefined,
        property_titulo: row.properties?.titulo || undefined,
        property_slug: row.properties?.slug || undefined,
        notas: row.notas || undefined,
        ultimo_contacto: row.ultimo_contacto || undefined,
        created_at: row.created_at,
    };
}

export async function getCRMLeads(): Promise<CRMLead[]> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from("advisory_requests")
        .select("id, nombre, telefono, email, mensaje, estado, property_id, properties(titulo, slug), created_at")
        .order("created_at", { ascending: false })
        .limit(200);
    return (data || []).map(mapToCRM);
}

export async function updateLeadEtapa(id: string, etapa: PipelineEtapa) {
    const supabase = createAdminClient();
    const estadoMap: Record<string, string> = {
        nuevo: "pendiente", contactado: "contactado", visitando: "visitando", negociando: "negociando", cerrado: "cerrado",
    };
    const { error } = await supabase.from("advisory_requests").update({
        estado: estadoMap[etapa],
        ultimo_contacto: new Date().toISOString(),
    }).eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
}

export async function addLeadNote(id: string, nota: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("advisory_requests").update({ notas: nota, ultimo_contacto: new Date().toISOString() }).eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
}

export async function getCRMMetrics() {
    const supabase = createAdminClient();
    const [advisoryRes, agentesRes] = await Promise.all([
        supabase.from("advisory_requests").select("estado"),
        supabase.from("profiles").select("id, full_name").eq("role", "agente"),
    ]);
    const total = (advisoryRes.data || []).length;
    const pipeline = { nuevo: 0, contactado: 0, visitando: 0, negociando: 0, cerrado: 0 };
    (advisoryRes.data || []).forEach((a: any) => {
        const e = a.estado === "pendiente" ? "nuevo" : a.estado === "contactado" ? "contactado" : a.estado === "cerrado" ? "cerrado" : "nuevo";
        pipeline[e as keyof typeof pipeline]++;
    });
    return { total, pipeline, agentes: agentesRes.data || [] };
}
