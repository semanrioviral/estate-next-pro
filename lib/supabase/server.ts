import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(useCookies = true, isAdmin = false) {
    let cookieStore;

    if (useCookies) {
        try {
            cookieStore = await cookies();
        } catch (error) {
            useCookies = false;
        }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = isAdmin
        ? process.env.SUPABASE_SERVICE_ROLE_KEY!
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
