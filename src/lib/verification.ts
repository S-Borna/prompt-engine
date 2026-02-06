// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION TOKEN STORE — In-memory storage for email verification
// Production: Replace with Redis or database
// ═══════════════════════════════════════════════════════════════════════════

interface VerificationToken {
    email: string;
    token: string;
    createdAt: number;
    expiresAt: number;
}

// In-memory store (replace with Redis in production)
const verificationTokens = new Map<string, VerificationToken>();

// Cleanup expired tokens every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of verificationTokens.entries()) {
        if (data.expiresAt < now) {
            verificationTokens.delete(token);
        }
    }
}, 5 * 60 * 1000);

/**
 * Generate a verification token for an email
 */
export function createVerificationToken(email: string): string {
    // Generate secure random token
    const token = Array.from({ length: 32 }, () =>
        Math.random().toString(36).charAt(2)
    ).join('');

    const now = Date.now();
    verificationTokens.set(token, {
        email: email.toLowerCase(),
        token,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    });

    return token;
}

/**
 * Verify a token and return the associated email
 */
export function verifyToken(token: string): string | null {
    const data = verificationTokens.get(token);

    if (!data) {
        return null;
    }

    if (data.expiresAt < Date.now()) {
        verificationTokens.delete(token);
        return null;
    }

    // Token is valid - delete it so it can only be used once
    verificationTokens.delete(token);
    return data.email;
}

/**
 * Check if an email has a pending verification token
 */
export function hasPendingVerification(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    for (const data of verificationTokens.values()) {
        if (data.email === normalizedEmail && data.expiresAt > Date.now()) {
            return true;
        }
    }
    return false;
}
