import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase middleware: missing environment variables');
        // If it's an admin path (but NOT the login page), don't allow access if variables are missing
        const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");
        if (request.nextUrl.pathname.startsWith("/admin") && !isLoginPage) {
            const url = request.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    const supabase = createServerClient(
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
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // auth issues.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");
    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

    // 1. No user -> Redirect to login (if not already there)
    if (!user && isAdminPath && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
    }

    // 2. User logged in -> Check roles for admin paths (except login itself)
    if (user && isAdminPath && !isLoginPage) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile || (profile.role !== 'admin' && profile.role !== 'agente')) {
            console.error("Access Denied - Role Check Failed:", { user: user.email, profile, error });
            const url = request.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }

    // 3. User logged in but on login page -> Redirect to admin dashboard
    if (user && isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
