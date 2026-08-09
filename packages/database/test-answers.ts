import { prisma } from './index';

async function test() {
  const p = await prisma.generatedPaper.findFirst();
  console.log('MCQ 1:', JSON.stringify(p?.sectionA_MCQs[0], null, 2));
  console.log('Short 1:', JSON.stringify(p?.sectionB_Short[0], null, 2));
  console.log('Long 1:', JSON.stringify(p?.sectionC_Long[0], null, 2));
  prisma.$disconnect();
}
test();
