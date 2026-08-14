import { prisma } from './index.js';

async function test() {
  const papers = await prisma.generatedPaper.findMany({
    select: { id: true, title: true, subjectId: true }
  });
  console.log('Generated papers in DB:', papers);
  prisma.$disconnect();
}
test();

