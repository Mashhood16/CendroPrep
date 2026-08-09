import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();
let url = process.env.DATABASE_URL;
if (url && url.startsWith('prisma+postgres://')) {
    const urlObj = new URL(url);
    const apiKey = urlObj.searchParams.get('api_key');
    if (apiKey) {
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf8'));
      if (decoded && decoded.databaseUrl) {
        url = decoded.databaseUrl;
      }
    }
}
const pool = new pg.Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const papers = await prisma.generatedPaper.findMany();
    if (papers.length > 0) {
        const p = papers[0];
        console.log("=== Q2 (ii) ===");
        console.log((p.sectionB_Short as any[])[1]?.ansA);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
