import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // Return dummy client for safe-fail behavior in non-configured environments
        return createBrowserClient(
            'https://placeholder.supabase.co',
            'placeholder'
        );
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
}
