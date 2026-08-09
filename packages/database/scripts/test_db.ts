import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('prisma+postgres://')) {
  const match = dbUrl.match(/api_key=(.*)/);
  if (match) {
    const json = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
    dbUrl = json.databaseUrl;
  }
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const chapters = await prisma.chapter.findMany();
  console.log('--- CHAPTERS ---');
  console.log(chapters);
  
  const topics = await prisma.topic.findMany();
  console.log('\n--- TOPICS ---');
  console.log(topics);
}

main().finally(() => prisma.$disconnect());
