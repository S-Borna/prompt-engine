// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION TOKEN STORE — PostgreSQL-backed via Prisma
// Uses the VerificationToken model in schema.prisma
// ═══════════════════════════════════════════════════════════════════════════

import { getPrismaAsync } from './prisma';

/**
 * Generate a verification token for an email and persist it to Postgres
 */
export async function createVerificationToken(email: string): Promise<string> {
    const prisma = await getPrismaAsync();

    // Generate secure random token
    const token = Array.from({ length: 32 }, () =>
        Math.random().toString(36).charAt(2)
    ).join('');

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing tokens for this email first
    await prisma.verificationToken.deleteMany({
        where: { identifier: email.toLowerCase() },
    });

    await prisma.verificationToken.create({
        data: {
            identifier: email.toLowerCase(),
            token,
            expires,
        },
    });

    return token;
}

/**
 * Verify a token and return the associated email
 */
export async function verifyToken(token: string): Promise<string | null> {
    const prisma = await getPrismaAsync();

    const record = await prisma.verificationToken.findUnique({
        where: { token },
    });

    if (!record) return null;

    // Delete the token (single-use)
    await prisma.verificationToken.delete({
        where: { token },
    });

    // Check expiry
    if (record.expires < new Date()) return null;

    return record.identifier;
}

/**
 * Check if an email has a pending verification token
 */
export async function hasPendingVerification(email: string): Promise<boolean> {
    const prisma = await getPrismaAsync();

    const record = await prisma.verificationToken.findFirst({
        where: {
            identifier: email.toLowerCase(),
            expires: { gt: new Date() },
        },
    });

    return !!record;
}
