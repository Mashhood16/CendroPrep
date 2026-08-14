import fs from 'fs';
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
  const filePath = 'C:/Users/mashh/.gemini/antigravity/scratch/cendronyx-workspace/chemistry-class-9-fbise-60marks-papers.md';
  console.log(`Reading papers from ${filePath}...`);
  const text = fs.readFileSync(filePath, 'utf-8');

  const chemistrySubject = await prisma.subject.findFirst({
    where: { name: 'Chemistry', grade: 9 }
  });

  if (!chemistrySubject) {
    console.error("Class 9 Chemistry subject not found!");
    process.exit(1);
  }

  console.log(`Found Class 9 Chemistry Subject ID: ${chemistrySubject.id}`);

  // Delete all existing static Paper records for Class 9 Chemistry
  const deletedStatic = await prisma.paper.deleteMany({
    where: { subjectId: chemistrySubject.id }
  });
  console.log(`Deleted ${deletedStatic.count} existing static Paper records for Class 9 Chemistry.`);

  // Delete all existing GeneratedPaper records for Class 9 Chemistry (or orphan records)
  const deletedGenerated = await prisma.generatedPaper.deleteMany({
    where: {
      OR: [
        { subjectId: chemistrySubject.id },
        { subjectId: null }
      ]
    }
  });
  console.log(`Deleted ${deletedGenerated.count} existing GeneratedPaper records for Class 9 Chemistry.`);

  // Parse paper blocks
  const paperBlocks = text.split(/#\s*\[PAPER_START:\s*(\d+)\]/).slice(1);
  let inserted = 0;

  for (let pIdx = 0; pIdx < paperBlocks.length; pIdx += 2) {
    const paperNum = parseInt(paperBlocks[pIdx]);
    const block = paperBlocks[pIdx + 1];

    const qPart = block.split(/#\s*\[PAPER_END:\s*\d+\]/)[0];
    const solPart = block.split(/#\s*\[SOLUTION_START:\s*\d+\]/)[1]?.split(/#\s*\[SOLUTION_END:\s*\d+\]/)[0] || '';

    const secAQuestions = qPart.split(/## Section B/)[0];
    const secBQuestions = qPart.split(/## Section B/)[1] || '';

    const secASolutions = solPart.split(/## Section B Solutions/)[0];
    const secBSolutions = solPart.split(/## Section B Solutions/)[1] || '';

    // 1. Parse Section A MCQs
    const mcqs: any[] = [];
    const mcqRegex = /\*\*Q(\d+)\.\s*(.*?)\*\*\s*- A\)\s*(.*?)\s*- B\)\s*(.*?)\s*- C\)\s*(.*?)\s*- D\)\s*(.*?)(?=\*\*Q\d+|\s*$)/gs;
    let match;
    while ((match = mcqRegex.exec(secAQuestions)) !== null) {
      mcqs.push({
        qNum: parseInt(match[1]),
        text: match[2].trim(),
        options: [match[3].trim(), match[4].trim(), match[5].trim(), match[6].trim()],
        answer: '',
        explanation: ''
      });
    }

    // Parse Section A solution table
    const mcqAnswersMap: Record<number, { letter: string, text: string }> = {};
    const tableLineRegex = /\|\s*Q(\d+)\s*\|\s*\*\*([A-D])\*\*\s*\|\s*(.*?)\s*\|/g;
    while ((match = tableLineRegex.exec(secASolutions)) !== null) {
      mcqAnswersMap[parseInt(match[1])] = {
        letter: match[2],
        text: match[3].trim()
      };
    }

    // Attach correct answer and explanation to each MCQ
    const optionLetterMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    for (const mcq of mcqs) {
      const sol = mcqAnswersMap[mcq.qNum];
      if (sol) {
        const optIdx = optionLetterMap[sol.letter];
        mcq.answer = optIdx !== undefined ? mcq.options[optIdx] : sol.text;
        mcq.explanation = sol.text;
      }
    }

    // 2. Parse Section B Subjective Questions & Solutions
    const secBQuestionsList: any[] = [];
    const qRegex = /\*\*Q(\d+)\.\s*(.*?)\*\*(.*?)(?=\*\*Q\d+|\s*$)/gs;
    while ((match = qRegex.exec(secBQuestions)) !== null) {
      const rawTitle = match[2].trim();
      const rawContent = match[3].trim();
      const fullQText = rawTitle + (rawContent ? "\n" + rawContent : "");
      secBQuestionsList.push({
        qNum: parseInt(match[1]),
        text: fullQText
      });
    }

    // Parse Section B solutions
    const secBSolBlocks = secBSolutions.split(/###\s+Q(\d+)\s+Solution/i).slice(1);
    const secBSolMap: Record<number, string> = {};
    for (let sIdx = 0; sIdx < secBSolBlocks.length; sIdx += 2) {
      const qNum = parseInt(secBSolBlocks[sIdx]);
      const rawSol = secBSolBlocks[sIdx + 1].trim();
      let solText = rawSol.replace(/^\s*\(\d+\s*Marks\)\s*\[.*?\]/i, '').trim();
      if (solText.includes('**Solution:**')) {
        solText = solText.split('**Solution:**')[1].trim();
      }
      secBSolMap[qNum] = solText;
    }

    const shorts: any[] = secBQuestionsList.map(q => ({
      part: q.qNum,
      optA: q.text,
      optB: '',
      ansA: secBSolMap[q.qNum] || '',
      ansB: ''
    }));

    // Create GeneratedPaper record
    await prisma.generatedPaper.create({
      data: {
        title: `Model Paper ${paperNum} (60 Marks FBISE)`,
        subjectId: chemistrySubject.id,
        sectionA_MCQs: mcqs,
        sectionB_Short: shorts,
        sectionC_Long: [],
        pdfUrl: null
      }
    });

    inserted++;
    console.log(`Imported Model Paper ${paperNum} (${mcqs.length} MCQs, ${shorts.length} Subjective Questions)`);
  }

  console.log(`\nSuccessfully imported ${inserted} model papers from 60-marks file into Class 9 Chemistry!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
