import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Auth Configuration
// PostgreSQL-backed via Prisma — JWT sessions for Cloudflare Workers edge
//
// CRITICAL: All Prisma/pg/bcrypt imports are DYNAMIC (inside functions)
// to avoid loading Node.js-only modules in the Cloudflare Workers edge.
// Middleware imports this file → top-level pg import = instant crash.
// ═══════════════════════════════════════════════════════════════════════════

// Executive/Creator accounts — unlimited access, no rate limits
const EXECUTIVE_EMAILS = ['said@saidborna.com'];

/**
 * Mark an email as verified in the database
 */
export async function markEmailVerified(email: string): Promise<void> {
    const { getPrismaAsync } = await import('./prisma');
    const prisma = await getPrismaAsync();
    await prisma.user.upsert({
        where: { email: email.toLowerCase() },
        update: { emailVerified: new Date() },
        create: {
            email: email.toLowerCase(),
            name: email.split('@')[0],
            emailVerified: new Date(),
        },
    });
}

/**
 * Check if an email is verified (database lookup)
 */
export async function isEmailVerified(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;
    if (isExecutiveEmail(email)) return true;

    const { getPrismaAsync } = await import('./prisma');
    const prisma = await getPrismaAsync();
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { emailVerified: true },
    });

    return !!user?.emailVerified;
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
export function getUserRole(email: string | null | undefined): 'executive' | 'creator' | 'trial' | 'free' {
    if (isExecutiveEmail(email)) return 'creator';
    return 'trial';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null;

                    const email = (credentials.email as string).toLowerCase();
                    const password = credentials.password as string;

                    if (!email || password.length < 1) return null;

                    // Dynamic imports to avoid loading pg/bcrypt in edge
                    const { getPrismaAsync } = await import('./prisma');
                    const bcrypt = (await import('bcryptjs')).default;
                    const prisma = await getPrismaAsync();

                    // Look up user in database
                    const existingUser = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (existingUser) {
                        // Existing user — verify password
                        if (existingUser.password) {
                            const valid = await bcrypt.compare(password, existingUser.password);
                            if (!valid) return null;
                        }
                        // Update last active
                        await prisma.user.update({
                            where: { email },
                            data: { lastActiveAt: new Date() },
                        });

                        return {
                            id: existingUser.id,
                            email: existingUser.email,
                            name: existingUser.name,
                        };
                    }

                    // New user — create account + send verification email
                    const hashedPassword = await bcrypt.hash(password, 12);
                    const newUser = await prisma.user.create({
                        data: {
                            email,
                            name: email.split('@')[0],
                            password: hashedPassword,
                            lastActiveAt: new Date(),
                        },
                    });

                    // Send verification email (dynamic import)
                    try {
                        const { createVerificationToken } = await import('./verification');
                        const { sendVerificationEmail } = await import('./email');
                        const token = await createVerificationToken(email);
                        await sendVerificationEmail(email, token);
                    } catch (emailErr) {
                        console.warn('Failed to send verification email:', emailErr);
                    }

                    return {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),

        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [Google({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true,
            })]
            : []),

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
                token.role = getUserRole(user.email);
                token.tier = isExecutiveEmail(user.email) ? 'CREATOR' : 'FREE';

                // Fetch verification status from DB (dynamic import)
                try {
                    const { getPrismaAsync } = await import('./prisma');
                    const prisma = await getPrismaAsync();
                    const dbUser = await prisma.user.findUnique({
                        where: { email: (user.email as string).toLowerCase() },
                        select: {
                            emailVerified: true,
                            promptsUsedToday: true,
                            xp: true,
                            level: true,
                            streak: true,
                            tier: true,
                            trialEndsAt: true,
                        },
                    });

                    token.isVerified = isExecutiveEmail(user.email) || !!dbUser?.emailVerified;
                    token.promptsUsed = dbUser?.promptsUsedToday ?? 0;
                    token.xp = dbUser?.xp ?? 0;
                    token.level = dbUser?.level ?? 1;
                    token.streak = dbUser?.streak ?? 0;

                    // Executive emails ALWAYS get CREATOR — DB value cannot override
                    if (isExecutiveEmail(user.email)) {
                        token.tier = 'CREATOR';
                        token.trialEndsAt = null;
                    } else if (dbUser?.tier) {
                        token.tier = dbUser.tier;
                    }

                    // Auto-set 7-day trial start for free users on first login
                    if (!isExecutiveEmail(user.email) && !dbUser?.trialEndsAt && (dbUser?.tier === 'FREE' || !dbUser?.tier)) {
                        const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                        await prisma.user.update({
                            where: { email: (user.email as string).toLowerCase() },
                            data: { trialEndsAt: trialEnd },
                        }).catch(() => { });
                        token.trialEndsAt = trialEnd.toISOString();
                    } else {
                        token.trialEndsAt = dbUser?.trialEndsAt?.toISOString() || null;
                    }
                } catch (dbErr) {
                    console.warn('JWT callback: DB lookup failed, using defaults:', dbErr);
                    token.isVerified = isExecutiveEmail(user.email);
                    token.promptsUsed = 0;
                    token.xp = 0;
                    token.level = 1;
                    token.streak = 0;
                }
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
                session.user.trialEndsAt = (token.trialEndsAt as string) || null;
            }
            return session;
        },

        async signIn() {
            return true;
        },
    },

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
            trialEndsAt: string | null;
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
        trialEndsAt?: string | null;
    }
}

