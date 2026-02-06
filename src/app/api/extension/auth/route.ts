import { NextRequest, NextResponse } from 'next/server';
import { isExecutiveEmail, getUserRole } from '@/lib/auth';
import { createExtensionToken } from '@/lib/extension-token';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Extension Auth Endpoint
// Accepts email/password, returns a JWT token for the Chrome Extension.
//
// POST /api/extension/auth
// Body: { email, password }
// Returns: { token, user: { email, tier, promptsUsed, isVerified } }
// ═══════════════════════════════════════════════════════════════════════════

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
