// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Extension Token Utilities
// HMAC-based token generation/verification for the Chrome Extension.
// Compatible with Cloudflare Workers (Web Crypto API only — no Node.js crypto).
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create an HMAC-signed token for the extension.
 */
export async function createExtensionToken(payload: Record<string, unknown>): Promise<string> {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'praxis-extension-secret';
    const encoder = new TextEncoder();

    const data = JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    });

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Token format: base64(payload).signature
    const payloadB64 = btoa(data);
    return `${payloadB64}.${sigHex}`;
}

/**
 * Verify and decode an extension token.
 */
export async function verifyExtensionToken(token: string): Promise<Record<string, unknown> | null> {
    try {
        const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'praxis-extension-secret';
        const encoder = new TextEncoder();

        const [payloadB64, sigHex] = token.split('.');
        if (!payloadB64 || !sigHex) return null;

        const data = atob(payloadB64);

        // Verify signature
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const sigBytes = new Uint8Array(
            sigHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
        );

        const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
        if (!valid) return null;

        const payload = JSON.parse(data);

        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}
