import { createMiddlewareClient } from "../supabase-server";
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

    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

    // Public routes: skip Supabase auth entirely
    if (!isAdminPath) {
        return supabaseResponse;
    }

    const supabase = createMiddlewareClient(request, supabaseResponse);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

    // 1. No user -> Redirect to login (if not already there)
    if (!user && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
    }

    // 2. User logged in -> Check roles (except login itself)
    if (user && !isLoginPage) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile || (profile.role !== 'admin' && profile.role !== 'agente')) {
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
