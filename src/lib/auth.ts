import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Auth Configuration
// Demo mode: Works without database for Cloudflare Workers edge runtime
// ═══════════════════════════════════════════════════════════════════════════

// Demo users for development/preview (in production, use Prisma Accelerate)
const DEMO_USERS: Record<string, { id: string; email: string; name: string; password: string }> = {
    'demo@praxis.app': {
        id: 'demo_user_1',
        email: 'demo@praxis.app',
        name: 'Demo User',
        password: 'demo123', // In demo mode, accept any password
    },
};

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
                // Demo mode defaults
                token.tier = 'FREE';
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
                session.user.tier = (token.tier as string) || 'FREE';
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
            tier: string;
            xp: number;
            level: number;
            streak: number;
            promptsUsedToday: number;
        };
    }

    interface User {
        tier?: string;
        xp?: number;
        level?: number;
        streak?: number;
        promptsUsedToday?: number;
    }
}

