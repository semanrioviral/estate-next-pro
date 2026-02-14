import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente para uso en el NAVEGADOR
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Si faltan variables, devolvemos null en lugar de lanzar error para evitar crash en SSR
    if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase env vars missing in client");
        return null as any;
    }

    return createSupabaseClient(supabaseUrl, supabaseKey);
}
