import fs from 'fs';
import path from 'path';
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

function cleanMarkdown(str: string): string {
  if (!str) return '';
  return str
    .replace(/^[ \t]+(\$\$)/gm, '$1')
    .replace(/^[ \t]+(\\\()/gm, '$1')
    .replace(/^[ \t]+(\\\[)/gm, '$1')
    .replace(/\n[ \t]{3,4}(\$\$.*?\$\$)/gs, '\n$1');
}

async function main() {
  const filePath = path.resolve('C:/Users/mashh/.gemini/antigravity/scratch/cendronyx-workspace/chemistry-class-9-fbise-60marks-papers-v5.md');
  console.log(`Reading papers from ${filePath}...`);
  const text = fs.readFileSync(filePath, 'utf-8');

  const chemistrySubject = await prisma.subject.findFirst({
    where: {
      name: { contains: 'Chemistry', mode: 'insensitive' },
      grade: 9
    }
  });

  if (!chemistrySubject) {
    console.error("Class 9 Chemistry subject not found in DB!");
    return;
  }

  console.log(`Found/Created Class 9 Chemistry Subject ID: ${chemistrySubject.id}`);

  // Purge existing Class 9 Chemistry mock papers
  const deletedStatic = await prisma.paper.deleteMany({
    where: {
      subjectId: chemistrySubject.id
    }
  });
  console.log(`Purged ${deletedStatic.count} static Paper records for Class 9 Chemistry.`);

  const deletedGenerated = await prisma.generatedPaper.deleteMany({
    where: {
      OR: [
        { subjectId: chemistrySubject.id },
        { subjectId: null }
      ]
    }
  });
  console.log(`Purged ${deletedGenerated.count} GeneratedPaper records for Class 9 Chemistry.`);

  // Step 3: Parse paper blocks using delimiters # [PAPER_START: X] to # [PAPER_END: X]
  const paperBlocks = text.split(/#\s*\[PAPER_START:\s*(\d+)\]/).slice(1);
  let inserted = 0;

  for (let pIdx = 0; pIdx < paperBlocks.length; pIdx += 2) {
    const paperNum = parseInt(paperBlocks[pIdx]);
    const block = paperBlocks[pIdx + 1];

    const qPart = block.split(/#\s*\[PAPER_END:\s*\d+\]/)[0];
    const solPart = block.split(/#\s*\[SOLUTION_START:\s*\d+\]/)[1]?.split(/#\s*\[SOLUTION_END:\s*\d+\]/)[0] || '';

    // Split sections in Question part
    const secAQuestions = qPart.split(/## Section B/)[0] || '';
    const secBQuestions = qPart.split(/## Section B/)[1]?.split(/## Section C/)[0] || '';
    const secCQuestions = qPart.split(/## Section C/)[1] || '';

    // Split sections in Solution part
    const secASolutions = solPart.split(/## Section B Solutions/)[0] || '';
    const secBSolutions = solPart.split(/## Section B Solutions/)[1]?.split(/## Section C Solutions/)[0] || '';
    const secCSolutions = solPart.split(/## Section C Solutions/)[1] || '';

    // 1. Parse Section A MCQs (60 MCQs)
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

    // Parse Section A solution table (| Q.No | Correct Option | Answer Text | Explanation |)
    const mcqAnswersMap: Record<number, { letter: string, text: string, explanation: string }> = {};
    const tableLineRegex = /\|\s*Q(\d+)\s*\|\s*\*\*([A-D])\*\*\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
    while ((match = tableLineRegex.exec(secASolutions)) !== null) {
      mcqAnswersMap[parseInt(match[1])] = {
        letter: match[2],
        text: match[3].trim(),
        explanation: match[4] ? match[4].trim() : match[3].trim()
      };
    }

    const optionLetterMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    for (const mcq of mcqs) {
      const sol = mcqAnswersMap[mcq.qNum];
      if (sol) {
        const optIdx = optionLetterMap[sol.letter];
        mcq.answer = optIdx !== undefined ? mcq.options[optIdx] : sol.text;
        mcq.explanation = sol.explanation || sol.text;
      }
    }

    // 2. Parse Section B Subjective SRQs (6 Questions)
    const secBQuestionsList: any[] = [];
    const bqRegex = /\*\*Q(\d+)\.\s*(.*?)\*\*(.*?)(?=\*\*Q\d+|\s*$)/gs;
    while ((match = bqRegex.exec(secBQuestions)) !== null) {
      const rawTitle = match[2].trim();
      const rawContent = match[3].trim();
      const fullQText = rawTitle + (rawContent ? "\n" + rawContent : "");
      secBQuestionsList.push({
        qNum: parseInt(match[1]),
        text: fullQText
      });
    }

    // Parse Section B solutions (### Q1 Solution ...)
    const secBSolBlocks = secBSolutions.split(/###\s+Q(\d+)\s+Solution/i).slice(1);
    const secBSolMap: Record<number, string> = {};
    for (let sIdx = 0; sIdx < secBSolBlocks.length; sIdx += 2) {
      const qNum = parseInt(secBSolBlocks[sIdx]);
      let solText = secBSolBlocks[sIdx + 1].trim();
      solText = solText.replace(/^\s*\(\d+\s*Marks\)\s*\[.*?\]/i, '').trim();
      secBSolMap[qNum] = solText;
    }

    const shorts: any[] = secBQuestionsList.map(q => ({
      part: q.qNum,
      optA: q.text,
      optB: '',
      ansA: cleanMarkdown(secBSolMap[q.qNum] || ''),
      ansB: ''
    }));

    // 3. Parse Section C Subjective ERQs (2 Questions with sub-parts)
    const longs: any[] = [];
    
    // Split secCQuestions into Question 1 and Question 2 blocks
    const cQBlocks = secCQuestions.split(/\*\*Q(\d+)\.\s*/).slice(1);
    const cSolBlocks = secCSolutions.split(/###\s+Q(\d+)\s+Solution/i).slice(1);
    const cSolMap: Record<number, string> = {};
    for (let cIdx = 0; cIdx < cSolBlocks.length; cIdx += 2) {
      const qNum = parseInt(cSolBlocks[cIdx]);
      cSolMap[qNum] = cSolBlocks[cIdx + 1].trim();
    }

    for (let cIdx = 0; cIdx < cQBlocks.length; cIdx += 2) {
      const qNum = parseInt(cQBlocks[cIdx]);
      const rawBlock = cQBlocks[cIdx + 1].trim();

      // Extract main prompt and (a), (b) parts
      const lines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
      let mainPrompt = '';
      let partA = '';
      let partB = '';

      for (const line of lines) {
        if (line.startsWith('- (a)') || line.startsWith('(a)')) {
          partA = line.replace(/^-?\s*\(a\)\s*/, '').trim();
        } else if (line.startsWith('- (b)') || line.startsWith('(b)')) {
          partB = line.replace(/^-?\s*\(b\)\s*/, '').trim();
        } else if (!partA && !partB) {
          mainPrompt += (mainPrompt ? ' ' : '') + line.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
        }
      }

      const fullOptA = mainPrompt ? `**${mainPrompt}**\n\n(a) ${partA}` : partA;
      const fullOptB = partB ? `(b) ${partB}` : '';

      // Split solution into part (a) and part (b) by #### headings
      const fullSol = cSolMap[qNum] || '';
      let ansA = fullSol;
      let ansB = '';

      const headings = fullSol.split(/(?=####\s+)/).map(h => h.trim()).filter(Boolean);
      if (headings.length >= 2) {
        ansA = headings[0];
        ansB = headings.slice(1).join('\n\n');
      }

      longs.push({
        qNum,
        optA: fullOptA,
        optB: fullOptB,
        ansA: cleanMarkdown(ansA),
        ansB: cleanMarkdown(ansB)
      });
    }

    // Save paper into database
    await prisma.generatedPaper.create({
      data: {
        title: `Model Paper ${paperNum} (60 Marks FBISE Blueprint)`,
        subjectId: chemistrySubject.id,
        sectionA_MCQs: mcqs,
        sectionB_Short: shorts,
        sectionC_Long: longs,
        pdfUrl: null
      }
    });

    inserted++;
    console.log(`Imported Model Paper ${paperNum}: ${mcqs.length} MCQs (0.5m), ${shorts.length} SRQs (3m), ${longs.length} ERQs (6m)`);
  }

  console.log(`\nSuccessfully imported ${inserted} FBISE 60-mark model papers into Class 9 Chemistry!`);
}

main()
  .catch(e => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
