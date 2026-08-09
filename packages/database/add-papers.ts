import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

let url = process.env.DATABASE_URL;

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
const prisma = new PrismaClient({ adapter });

async function main() {
  const subject = await prisma.subject.findFirst({
    where: { name: "Chemistry", grade: 9 }
  });

  if (!subject) {
    console.error("Class 9 Chemistry not found!");
    process.exit(1);
  }

  const paper = await prisma.paper.create({
    data: {
      title: "10 SLO-Based Model Papers With Solutions",
      type: "MOCK_EXAM",
      year: 2026,
      pdfUrl: "/papers/Class9_Chemistry_10ModelPapers.pdf",
      subjectId: subject.id
    }
  });

  console.log("Successfully added PDF to Class 9 Chemistry!");
  console.log(paper);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
