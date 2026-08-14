import { prisma } from './index.js';

async function main() {
  console.log("Finding Class 9 Chemistry...");
  const subject = await prisma.subject.findFirst({
    where: {
      grade: 9,
      name: {
        contains: 'Chemistry',
        mode: 'insensitive'
      }
    }
  });

  if (!subject) {
    console.log("Subject not found!");
    return;
  }

  console.log(`Found Subject: ${subject.name} (ID: ${subject.id})`);

  // Delete static papers linked to this subject
  const deletedPapers = await prisma.paper.deleteMany({
    where: {
      subjectId: subject.id
    }
  });
  console.log(`Deleted ${deletedPapers.count} static Paper records.`);

  // Delete GeneratedPaper records
  const deletedGenerated = await prisma.generatedPaper.deleteMany();
  console.log(`Deleted ${deletedGenerated.count} GeneratedPaper records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
