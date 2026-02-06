import { NextRequest, NextResponse } from 'next/server';
import { isExecutiveEmail, getUserRole } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Extension Auth Endpoint
// Accepts email/password, returns a JWT token for the Chrome Extension.
//
// POST /api/extension/auth
// Body: { email, password }
// Returns: { token, user: { email, tier, promptsUsed, isVerified } }
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple HMAC-based token generation using Web Crypto API
 * (Compatible with Cloudflare Workers — no Node.js crypto)
 */
async function createExtensionToken(payload: Record<string, unknown>): Promise<string> {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'praxis-extension-secret';
    const encoder = new TextEncoder();

    const data = JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    });

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Token format: base64(payload).signature
    const payloadB64 = btoa(data);
    return `${payloadB64}.${sigHex}`;
}

/**
 * Verify and decode an extension token
 */
export async function verifyExtensionToken(token: string): Promise<Record<string, unknown> | null> {
    try {
        const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'praxis-extension-secret';
        const encoder = new TextEncoder();

        const [payloadB64, sigHex] = token.split('.');
        if (!payloadB64 || !sigHex) return null;

        const data = atob(payloadB64);

        // Verify signature
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const sigBytes = new Uint8Array(
            sigHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
        );

        const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
        if (!valid) return null;

        const payload = JSON.parse(data);

        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    // ─── CORS for Chrome Extension ────────────────────────────
    const origin = request.headers.get('origin') || '';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (origin.startsWith('chrome-extension://')) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }

    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400, headers }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Dynamic imports (Cloudflare Workers safe)
        const { getPrismaAsync } = await import('@/lib/prisma');
        const bcrypt = (await import('bcryptjs')).default;
        const prisma = await getPrismaAsync();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                emailVerified: true,
                tier: true,
                promptsUsedToday: true,
            },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401, headers }
            );
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401, headers }
            );
        }

        // Generate token
        const token = await createExtensionToken({
            sub: user.id,
            email: user.email,
            tier: user.tier || 'FREE',
        });

        // Update last active
        await prisma.user.update({
            where: { email: normalizedEmail },
            data: { lastActiveAt: new Date() },
        }).catch(() => { }); // Non-critical

        return NextResponse.json({
            token,
            user: {
                email: user.email,
                name: user.name,
                tier: user.tier || (isExecutiveEmail(user.email) ? 'CREATOR' : 'FREE'),
                role: getUserRole(user.email),
                isVerified: isExecutiveEmail(user.email) || !!user.emailVerified,
                promptsUsed: user.promptsUsedToday || 0,
            },
        }, { headers });

    } catch (error) {
        console.error('[extension/auth] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers }
        );
    }
}

// ─── CORS Preflight ─────────────────────────────────────────
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    const headers: Record<string, string> = {};

    if (origin.startsWith('chrome-extension://')) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        headers['Access-Control-Max-Age'] = '86400';
    }

    return new NextResponse(null, { status: 204, headers });
}
