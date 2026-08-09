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
  const grades = [9, 10, 11, 12];
  const subjectNames = [
    "Physics", 
    "Chemistry", 
    "Biology", 
    "Computer", 
    "Math", 
    "English", 
    "Urdu", 
    "Islamiyaat", 
    "Pak Studies"
  ];

  let added = 0;

  for (const grade of grades) {
    for (const name of subjectNames) {
      // Create if it doesn't exist
      const existing = await prisma.subject.findFirst({
        where: { name, grade }
      });
      
      if (!existing) {
        await prisma.subject.create({
          data: { name, grade }
        });
        added++;
        console.log(`Added ${name} for Grade ${grade}`);
      }
    }
  }
  
  console.log(`\nSuccessfully seeded ${added} new subjects!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
