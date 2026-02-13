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

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
