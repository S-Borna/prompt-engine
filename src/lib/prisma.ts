import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Prisma 7 med PostgreSQL Adapter
// Lazy-loaded för att undvika build-time krascher på Cloudflare

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        // Under build-time finns inte DATABASE_URL - returnera en dummy
        // som aldrig faktiskt används under build
        console.warn('DATABASE_URL not defined - using mock client for build');
        return new PrismaClient();
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
}

// Lazy initialization - skapas bara när den faktiskt används
let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
    if (!_prisma) {
        _prisma = globalForPrisma.prisma ?? createPrismaClient();
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = _prisma;
        }
    }
    return _prisma;
}

// För bakåtkompatibilitet - men föredra getPrisma()
export const prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
        return Reflect.get(getPrisma(), prop);
    }
});

export default prisma;

