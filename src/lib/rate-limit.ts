// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS API RATE LIMITING — SERVER-SIDE PROTECTION
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';

interface RateLimitConfig {
    /** Maximum requests per window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Custom identifier (defaults to IP) */
    keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory store (consider Redis for production)
const rateLimitStore: RateLimitStore = {};

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
    req: NextRequest,
    config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = config.keyGenerator
        ? config.keyGenerator(req)
        : getClientIdentifier(req);

    const now = Date.now();
    const record = rateLimitStore[key];

    // Clean up expired entries
    if (record && now > record.resetTime) {
        delete rateLimitStore[key];
    }

    // Initialize or get current record
    if (!rateLimitStore[key]) {
        rateLimitStore[key] = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: rateLimitStore[key].resetTime,
        };
    }

    // Check if limit exceeded
    const currentRecord = rateLimitStore[key];
    if (currentRecord.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: currentRecord.resetTime,
        };
    }

    // Increment counter
    currentRecord.count++;
    return {
        allowed: true,
        remaining: config.maxRequests - currentRecord.count,
        resetTime: currentRecord.resetTime,
    };
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: NextRequest): string {
    // Try to get IP from headers (Cloudflare, Vercel, etc.)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');

    return cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
}

/**
 * Preset rate limit configs
 */
export const RateLimitPresets = {
    /** Strict: 10 requests per minute */
    STRICT: {
        maxRequests: 10,
        windowMs: 60 * 1000,
    },
    /** Standard: 30 requests per minute */
    STANDARD: {
        maxRequests: 30,
        windowMs: 60 * 1000,
    },
    /** Generous: 100 requests per minute */
    GENEROUS: {
        maxRequests: 100,
        windowMs: 60 * 1000,
    },
    /** AI calls: 5 per minute (expensive operations) */
    AI_CALLS: {
        maxRequests: 5,
        windowMs: 60 * 1000,
    },
};

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const key in rateLimitStore) {
        if (rateLimitStore[key].resetTime < now) {
            delete rateLimitStore[key];
        }
    }
}, 60 * 1000); // Clean up every minute
