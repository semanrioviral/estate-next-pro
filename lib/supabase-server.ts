import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/**
 * Cliente estático para fetch de datos públicos (Property Listings)
 * Evita el uso de cookies() para permitir que unstable_cache funcione correctamente.
 */
export function createPublicClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    )
}

export function createMiddlewareClient(request: any, response: any) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )
}

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        const missing = [];
        if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
        if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

        throw new Error(
            `CRITICAL: Supabase credentials missing (${missing.join(", ")}). ` +
            "Ensure these are set in your environment variables (Vercel or .env.local)."
        );
    }

    return createServerClient(
        supabaseUrl,
        supabaseServiceKey,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    )
}
