import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { createVerificationToken } from './verification';
import { sendVerificationEmail } from './email';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Auth Configuration
// Demo mode: Works without database for Cloudflare Workers edge runtime
// ═══════════════════════════════════════════════════════════════════════════

// Executive accounts — unlimited access, no rate limits
const EXECUTIVE_EMAILS = ['said@saidborna.com'];

// Demo users for development/preview (in production, use Prisma Accelerate)
const DEMO_USERS: Record<string, { id: string; email: string; name: string; password: string }> = {
    'demo@praxis.app': {
        id: 'demo_user_1',
        email: 'demo@praxis.app',
        name: 'Demo User',
        password: 'demo123',
    },
};

// In-memory verified emails store (replace with database in production)
const verifiedEmails = new Set<string>();

/**
 * Mark an email as verified
 */
export function markEmailVerified(email: string): void {
    verifiedEmails.add(email.toLowerCase());
}

/**
 * Check if an email is verified
 */
export function isEmailVerified(email: string | null | undefined): boolean {
    if (!email) return false;
    // Executive and demo emails are auto-verified
    if (isExecutiveEmail(email) || DEMO_USERS[email.toLowerCase()]) return true;
    return verifiedEmails.has(email.toLowerCase());
}

/**
 * Check if an email belongs to an executive account
 */
export function isExecutiveEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return EXECUTIVE_EMAILS.includes(email.toLowerCase());
}

/**
 * Get user role from email
 */
export function getUserRole(email: string | null | undefined): 'executive' | 'trial' | 'free' {
    if (isExecutiveEmail(email)) return 'executive';
    // Future: Check subscription status in database
    return 'trial';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    // No adapter = JWT-only sessions (works on edge)

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },

    providers: [
        // Email/Password (Demo Mode)
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const email = credentials.email as string;
                    const password = credentials.password as string;

                    // Demo mode: Accept any valid-looking email
                    // In production, verify against database
                    if (email && password.length >= 1) {
                        // Check if it's a known demo user
                        const demoUser = DEMO_USERS[email.toLowerCase()];

                        if (demoUser) {
                            return {
                                id: demoUser.id,
                                email: demoUser.email,
                                name: demoUser.name,
                            };
                        }

                        // For new signups, send verification email
                        if (!isEmailVerified(email)) {
                            const token = createVerificationToken(email);
                            await sendVerificationEmail(email, token);
                        }

                        // For any other email, create a demo session
                        return {
                            id: `user_${Date.now()}`,
                            email: email,
                            name: email.split('@')[0],
                        };
                    }

                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),

        // Google OAuth (configure in Cloudflare dashboard)
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [Google({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true,
            })]
            : []),

        // GitHub OAuth (configure in Cloudflare dashboard)
        ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
            ? [GitHub({
                clientId: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true,
            })]
            : []),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                // Role-based access
                token.role = getUserRole(user.email);
                token.tier = isExecutiveEmail(user.email) ? 'EXECUTIVE' : 'FREE';
                token.isVerified = isEmailVerified(user.email);
                token.promptsUsed = token.promptsUsed || 0; // Persistent counter
                token.xp = 0;
                token.level = 1;
                token.streak = 0;
                token.promptsUsedToday = 0;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = (token.role as string) || 'trial';
                session.user.tier = (token.tier as string) || 'FREE';
                session.user.isVerified = (token.isVerified as boolean) || false;
                session.user.promptsUsed = (token.promptsUsed as number) || 0;
                session.user.xp = (token.xp as number) || 0;
                session.user.level = (token.level as number) || 1;
                session.user.streak = (token.streak as number) || 0;
                session.user.promptsUsedToday = (token.promptsUsedToday as number) || 0;
            }
            return session;
        },

        async signIn() {
            // Allow all sign-ins in demo mode
            return true;
        },
    },

    // Suppress errors in production
    debug: process.env.NODE_ENV === 'development',
});

// Type extensions for NextAuth
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            role: string;
            tier: string;
            isVerified: boolean;
            promptsUsed: number;
            xp: number;
            level: number;
            streak: number;
            promptsUsedToday: number;
        };
    }

    interface User {
        role?: string;
        tier?: string;
        isVerified?: boolean;
        promptsUsed?: number;
        xp?: number;
        level?: number;
        streak?: number;
        promptsUsedToday?: number;
    }
}

