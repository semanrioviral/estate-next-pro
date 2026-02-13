import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(useCookies = true) {
    let cookieStore;

    if (useCookies) {
        try {
            cookieStore = await cookies();
        } catch (error) {
            // Fallback for build time where cookies() is not available
            useCookies = false;
        }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase environment variables are missing');
        // Return a dummy client or handle as needed for build time
        return createServerClient(
            'https://placeholder.supabase.co',
            'placeholder',
            { cookies: { getAll() { return []; }, setAll() { } } }
        );
    }

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: useCookies && cookieStore ? {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            } : {
                getAll() { return []; },
                setAll() { }
            },
        }
    );
}
