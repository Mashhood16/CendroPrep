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
  const subject = await prisma.subject.findFirst({
    where: { name: 'Chemistry', grade: 9 }
  });

  if (!subject) {
    console.log("Chemistry subject not found");
    return;
  }

  const result = await prisma.generatedPaper.updateMany({
    where: { subjectId: null },
    data: { subjectId: subject.id }
  });

  console.log(`Updated ${result.count} GeneratedPaper records to belong to ${subject.name}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
