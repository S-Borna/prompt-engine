import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // ─── AUTH CHECKS (for protected routes) ────────────────────────────
    const protectedRoutes = ['/dashboard', '/api/ai'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        const session = await auth();

        // Require authentication
        if (!session?.user) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Require email verification (except for executives and demo users)
        if (!session.user.isVerified && pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/verify-pending', request.url));
        }
    }

    // ─── SECURITY HEADERS ───────────────────────────────────────────────
    const response = NextResponse.next();

    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY HEADERS
    // ═══════════════════════════════════════════════════════════════════════════

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // XSS Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        connect-src 'self' https://api.openai.com https://*.anthropic.com https://vercel.live wss://ws.vercel.live;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);

    // Permissions Policy (formerly Feature-Policy)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    // HSTS (HTTP Strict Transport Security)
    // Only set in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    return response;
}

// Apply middleware to all routes except static files
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, favicon.svg, apple-touch-icon (favicons)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon|public).*)',
    ],
};
