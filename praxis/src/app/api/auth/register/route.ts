import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Note: Prisma with pg adapter doesn't work on Cloudflare Workers edge runtime
// For production, use Prisma Accelerate or a HTTP-based database connection

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        // Validation
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

        // For demo/development: Return success without database
        // In production, connect to Prisma Accelerate or use Neon/PlanetScale HTTP

        // Hash password (for when DB is connected)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Demo mode: simulate successful registration
        const demoUser = {
            id: `demo_${Date.now()}`,
            email,
            name: name || null,
            tier: 'FREE',
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            user: demoUser,
            message: 'Account created! You can now sign in.',
            demo: true, // Flag indicating demo mode
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Could not create account. Please try again.' },
            { status: 500 }
        );
    }
}
