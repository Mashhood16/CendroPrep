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

const papers = [
  { title: "Model Paper 1: Chapter-Wise Foundation", page: 3 },
  { title: "Model Paper 2: Atomic Structure & Bonding", page: 6 },
  { title: "Model Paper 3: Full Book Mock Board Examination", page: 9 },
  { title: "Model Paper 4: SLO Comprehensive Mock Exam", page: 12 },
  { title: "Model Paper 5: SLO Comprehensive Mock Exam", page: 15 },
  { title: "Model Paper 6: SLO Comprehensive Mock Exam", page: 18 },
  { title: "Model Paper 7: SLO Comprehensive Mock Exam", page: 21 },
  { title: "Model Paper 8: SLO Comprehensive Mock Exam", page: 24 },
  { title: "Model Paper 9: SLO Comprehensive Mock Exam", page: 27 },
  { title: "Model Paper 10: SLO Comprehensive Mock Exam", page: 30 }
];

async function main() {
  const subject = await prisma.subject.findFirst({
    where: { name: "Chemistry", grade: 9 }
  });

  if (!subject) {
    console.error("Class 9 Chemistry not found!");
    process.exit(1);
  }

  // Delete the old single paper
  await prisma.paper.deleteMany({
    where: { 
      subjectId: subject.id,
      title: "10 SLO-Based Model Papers With Solutions"
    }
  });

  // Insert the 10 distinct papers, using the #page fragment
  for (const paper of papers) {
    await prisma.paper.create({
      data: {
        title: paper.title,
        type: "MOCK_EXAM",
        year: 2026,
        pdfUrl: `/papers/Class9_Chemistry_10ModelPapers.pdf#page=${paper.page}`,
        subjectId: subject.id
      }
    });
    console.log(`Added: ${paper.title} (Starts at page ${paper.page})`);
  }

  console.log("\nSuccessfully added 10 individual papers to Class 9 Chemistry!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
