import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 med PostgreSQL Adapter
// PrismaPg@7.3+ tar { connectionString } direkt — skapar Pool internt.
// nodejs_compat + compatibility_date 2026-02-03 ger net/tls stöd i Workers.

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.warn('DATABASE_URL not defined - using mock client for build');
        return new PrismaClient();
    }

    // PrismaPg handles Pool creation internally — no manual pg import needed
    const adapter = new PrismaPg({ connectionString });

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

