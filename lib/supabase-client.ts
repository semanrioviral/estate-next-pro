import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente para uso exclusivo en el NAVEGADOR (Client Components)
 * No importa next/headers ni módulos de servidor.
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validación defensiva para el build
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.VERCEL;

    if (!supabaseUrl || !supabaseKey) {
        if (isBuildPhase || process.env.NEXT_PHASE === 'phase-production-build') {
            const dummyResult = { data: [], error: null, count: 0 };
            const handler: ProxyHandler<any> = {
                get(target, prop): any {
                    if (prop === 'then') return (resolve: any) => resolve(dummyResult);
                    if (prop === 'auth') return {
                        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                    };
                    return new Proxy(() => { }, handler);
                },
                apply() {
                    return new Proxy(() => { }, handler);
                }
            };
            return new Proxy(() => { }, handler) as any;
        }
        throw new Error("NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas en el cliente");
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
}
