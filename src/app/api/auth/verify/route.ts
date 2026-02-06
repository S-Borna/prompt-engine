import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/verification';
import { sendWelcomeEmail } from '@/lib/email';
import { markEmailVerified } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/login?error=missing-token', request.url));
        }

        // Verify the token
        const email = verifyToken(token);

        if (!email) {
            return NextResponse.redirect(new URL('/login?error=invalid-or-expired-token', request.url));
        }

        // Mark email as verified
        markEmailVerified(email);

        // Extract name from email (before @)
        const name = email.split('@')[0];

        // Send welcome email
        await sendWelcomeEmail(email, name);

        // Redirect to login with success message
        return NextResponse.redirect(
            new URL('/login?verified=true&message=Email verified! Please log in to start your trial.', request.url)
        );
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
    }
}
