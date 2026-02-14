import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente para uso exclusivo en el SERVIDOR (Server Components, Actions, Route Handlers)
 * @param isAdmin Si es true, usa el SERVICE_ROLE_KEY (solo servidor)
 */
export async function createClient(isAdmin = false) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = isAdmin
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Validación defensiva: No fallar durante el build si faltan variables
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.VERCEL;

    if (!supabaseUrl || !supabaseKey) {
        if (isBuildPhase || process.env.NEXT_PHASE === 'phase-production-build') {
            console.warn("⚠️ Advertencia: Usando cliente Supabase de respaldo para el build.");

            const dummyResult = { data: [], error: null, count: 0 };
            const recursiveHandler: ProxyHandler<any> = {
                get(target, prop): any {
                    if (prop === 'then') {
                        return (resolve: any) => resolve(dummyResult);
                    }
                    return new Proxy(() => { }, recursiveHandler);
                },
                apply() {
                    return new Proxy(() => { }, recursiveHandler);
                }
            };

            // El cliente raíz NO debe ser thenable para que 'await createClient()' 
            // resuelva al objeto cliente y no a los datos dummy.
            return {
                from: () => new Proxy(() => { }, recursiveHandler),
                auth: {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                }
            } as any;
        }
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
 * Recibe el request y response directamente para evitar usar next/headers
 */
export function createMiddlewareClient(request: any, response: any) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validación defensiva
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

    if (!supabaseUrl || !supabaseKey) {
        if (isBuildPhase) return null as any;
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
