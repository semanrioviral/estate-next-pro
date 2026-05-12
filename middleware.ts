import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()
    const hostname = request.headers.get('host') || ''

    // Imágenes antiguas de WordPress → 410 Gone
    if (url.pathname.startsWith('/wp-content/')) {
        return new NextResponse(null, { status: 410 })
    }

    // Trailing slash → non-trailing slash (except root)
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1)
        return NextResponse.redirect(url, { status: 301 })
    }

    if (hostname.startsWith('www.')) {
        const nonWwwHost = hostname.replace(/^www\./, '')
        url.hostname = nonWwwHost
        url.host = nonWwwHost
        const redirectResponse = NextResponse.redirect(url, { status: 301 })
        redirectResponse.headers.set('X-Robots-Tag', 'noindex')
        return redirectResponse
    }

    const response = await updateSession(request)

    if (!response.headers.has('Strict-Transport-Security')) {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        )
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
