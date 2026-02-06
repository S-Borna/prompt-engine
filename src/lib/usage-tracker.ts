// ═══════════════════════════════════════════════════════════════════════════
// USAGE TRACKING — In-memory prompt usage counter
// Production: Replace with Redis or database
// ═══════════════════════════════════════════════════════════════════════════

interface UsageData {
    email: string;
    promptsUsed: number;
    lastUpdated: number;
}

// In-memory usage store (replace with Redis/database in production)
const usageStore = new Map<string, UsageData>();

/**
 * Get prompt usage for a user
 */
export function getPromptUsage(email: string): number {
    const data = usageStore.get(email.toLowerCase());
    return data?.promptsUsed || 0;
}

/**
 * Increment prompt usage for a user
 */
export function incrementPromptUsage(email: string): number {
    const normalizedEmail = email.toLowerCase();
    const currentUsage = getPromptUsage(normalizedEmail);
    const newUsage = currentUsage + 1;

    usageStore.set(normalizedEmail, {
        email: normalizedEmail,
        promptsUsed: newUsage,
        lastUpdated: Date.now(),
    });

    return newUsage;
}

/**
 * Reset prompt usage for a user (for testing/admin purposes)
 */
export function resetPromptUsage(email: string): void {
    usageStore.delete(email.toLowerCase());
}

/**
 * Check if user has exceeded trial limit
 */
export function hasExceededTrialLimit(email: string, limit: number = 100): boolean {
    return getPromptUsage(email) >= limit;
}
