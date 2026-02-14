import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente para uso exclusivo en el NAVEGADOR (Client Components)
 * Usa solo variables con prefijo NEXT_PUBLIC_
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas en el cliente");
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
}

/**
 * Cliente para uso exclusivo en el SERVIDOR (Server Components, Actions, Route Handlers)
 * Puede usar cookies para mantener la sesión.
 * @param isAdmin Si es true, usa el SERVICE_ROLE_KEY (solo servidor)
 */
export async function createServerSupabaseClient(isAdmin = false) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = isAdmin
        ? process.env.SUPABASE_SERVICE_ROLE_KEY!
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("URL y Key de Supabase son requeridas en el servidor");
    }

    const cookieStore = await cookies();

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // El método setAll fue llamado desde un Server Component
                    }
                },
            },
        }
    );
}

/**
 * Cliente ligero para el Middleware (Servidor Edge)
 */
export function createMiddlewareSupabaseClient(request: any, response: any) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("URL y Key de Supabase son requeridas en el middleware");
    }

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );
}
