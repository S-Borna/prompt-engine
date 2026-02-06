import { NextRequest, NextResponse } from 'next/server';

// CRITICAL: All imports are DYNAMIC to avoid loading pg/bcrypt in Cloudflare Workers edge

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const { getPrismaAsync } = await import('@/lib/prisma');
        const bcrypt = (await import('bcryptjs')).default;
        const prisma = await getPrismaAsync();
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password & create user in Postgres
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: name || normalizedEmail.split('@')[0],
                password: hashedPassword,
            },
        });

        // Send verification email
        const { createVerificationToken } = await import('@/lib/verification');
        const { sendVerificationEmail } = await import('@/lib/email');
        const token = await createVerificationToken(normalizedEmail);
        await sendVerificationEmail(normalizedEmail, token);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                tier: user.tier,
                createdAt: user.createdAt.toISOString(),
            },
            message: 'Account created! Check your email to verify your account.',
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Could not create account. Please try again.' },
            { status: 500 }
        );
    }
}
