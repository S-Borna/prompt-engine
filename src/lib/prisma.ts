import { PrismaClient } from '@prisma/client';

// Prisma 7 med PostgreSQL Adapter
// CRITICAL: pg och @prisma/adapter-pg importeras DYNAMISKT inuti funktionen
// för att undvika att Cloudflare Workers bundlar 'pg' som top-level extern
// modul (ger "Failed to load external module pg-xxx" runtime-krasch).

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.warn('DATABASE_URL not defined - using mock client for build');
        return new PrismaClient();
    }

    // Dynamic imports — keeps pg out of the Cloudflare Workers bundle
    const { Pool } = await import('pg');
    const { PrismaPg } = await import('@prisma/adapter-pg');

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
}

// Lazy initialization — skapas bara när den faktiskt används
let _prisma: PrismaClient | undefined;
let _prismaPromise: Promise<PrismaClient> | undefined;

export function getPrisma(): PrismaClient {
    if (_prisma) return _prisma;

    // Fallback for synchronous access — will be replaced by async version
    if (!_prisma) {
        _prisma = globalForPrisma.prisma ?? new PrismaClient();
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = _prisma;
        }
    }
    return _prisma;
}

/**
 * Async version — preferred. Properly initializes pg adapter.
 */
export async function getPrismaAsync(): Promise<PrismaClient> {
    if (_prisma) return _prisma;

    if (!_prismaPromise) {
        _prismaPromise = createPrismaClient().then((client) => {
            _prisma = client;
            if (process.env.NODE_ENV !== 'production') {
                globalForPrisma.prisma = _prisma;
            }
            return _prisma;
        });
    }

    return _prismaPromise;
}

// Proxy for backwards compatibility
export const prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
        return Reflect.get(getPrisma(), prop);
    }
});

export default prisma;

