import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let url = process.env.DATABASE_URL;

// Dynamically extract the direct TCP connection string from the local prisma dev proxy url
if (url && url.startsWith('prisma+postgres://')) {
  try {
    const urlObj = new URL(url);
    const apiKey = urlObj.searchParams.get('api_key');
    if (apiKey) {
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf8'));
      if (decoded && decoded.databaseUrl) {
        url = decoded.databaseUrl;
      }
    }
  } catch (e) {
    console.error("Failed to parse Prisma Postgres direct URL", e);
  }
}

const pool = new pg.Pool({ connectionString: url });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Force re-instantiation on HMR to pick up schema changes
if (process.env.NODE_ENV !== 'production') {
  delete globalForPrisma.prisma;
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
