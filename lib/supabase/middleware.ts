import { createMiddlewareClient } from "../supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({ request });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return response;
    }

    const supabase = createMiddlewareClient(request, response);

    // Only check auth for admin routes to keep public routes fast
    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
    if (!isAdminPath) {
        return response;
    }

    const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
    }

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

    if (user && isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
    }

    return response;
}
