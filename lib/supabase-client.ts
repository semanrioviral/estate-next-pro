import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente para uso exclusivo en el NAVEGADOR (Client Components)
 * No importa next/headers ni módulos de servidor.
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas en el cliente");
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
}
