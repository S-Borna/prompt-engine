// ═══════════════════════════════════════════════════════════════════════════
// USAGE TRACKING — PostgreSQL-backed via Prisma
// Uses User.promptsUsedToday in the users table
// ═══════════════════════════════════════════════════════════════════════════

import { getPrismaAsync } from './prisma';

/**
 * Get prompt usage for a user (by email)
 */
export async function getPromptUsage(email: string): Promise<number> {
    const prisma = await getPrismaAsync();
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { promptsUsedToday: true },
    });
    return user?.promptsUsedToday ?? 0;
}

/**
 * Increment prompt usage for a user. Creates user row if missing.
 */
export async function incrementPromptUsage(email: string): Promise<number> {
    const prisma = await getPrismaAsync();
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
            promptsUsedToday: { increment: 1 },
            lastActiveAt: new Date(),
        },
        create: {
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            promptsUsedToday: 1,
            lastActiveAt: new Date(),
        },
        select: { promptsUsedToday: true },
    });

    return user.promptsUsedToday;
}

/**
 * Reset prompt usage for a user (admin / testing)
 */
export async function resetPromptUsage(email: string): Promise<void> {
    const prisma = await getPrismaAsync();
    await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { promptsUsedToday: 0, promptsResetAt: new Date() },
    }).catch(() => { /* user may not exist yet */ });
}

/**
 * Check if user has exceeded trial limit
 */
export async function hasExceededTrialLimit(email: string, limit: number = 100): Promise<boolean> {
    const usage = await getPromptUsage(email);
    return usage >= limit;
}
