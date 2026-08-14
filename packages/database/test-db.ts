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
    const subjects = await prisma.subject.count();
    const papers = await prisma.paper.findMany();
    const generatedPapers = await prisma.generatedPaper.findMany();

    console.log(`=== DATABASE AUDIT ===`);
    console.log(`Total Subjects: ${subjects}`);
    console.log(`Total Static Papers (prisma.paper): ${papers.length}`);
    papers.forEach((p, i) => console.log(`  [Paper ${i+1}] ${p.title} (Subject ID: ${p.subjectId})`));

    console.log(`Total Generated Papers (prisma.generatedPaper): ${generatedPapers.length}`);
    generatedPapers.forEach((gp, i) => console.log(`  [GeneratedPaper ${i+1}] ${gp.title} (Subject ID: ${gp.subjectId})`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
