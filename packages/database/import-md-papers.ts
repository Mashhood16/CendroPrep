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
  const filePath = 'C:/Users/mashh/.gemini/antigravity/scratch/cendronyx-workspace/chemistry-class-9-fbise-65marks-papers-v4.md';
  const text = fs.readFileSync(filePath, 'utf-8');
  
  const papers = text.split(/# Mock Examination Paper \d+/).slice(1);
  
  let inserted = 0;

  // Clear previous papers
  await prisma.generatedPaper.deleteMany();

  for (let i = 0; i < papers.length; i++) {
    const paperNum = i + 1;
    const paperTextRaw = papers[i];
    const paperParts = paperTextRaw.split(/# Solution & Grading Guide \d+/);
    const paperQuestions = paperParts[0];
    const paperSolutions = paperParts.length > 1 ? paperParts[1] : '';

    const mcqs: any[] = [];
    const sectionA = paperQuestions.split(/## Section B/)[0];
    const mcqMatches = sectionA.matchAll(/\*\*Q(\d+)\.\s*(.*?)\*\*\s*- A\)\s*(.*?)\s*- B\)\s*(.*?)\s*- C\)\s*(.*?)\s*- D\)\s*(.*?)(?=\*\*Q|$)/gs);
    for (const match of mcqMatches) {
        mcqs.push({
            qNum: parseInt(match[1]),
            text: match[2].trim(),
            options: [match[3].trim(), match[4].trim(), match[5].trim(), match[6].trim()],
            answer: '',
            explanation: ''
        });
    }

    const shorts: any[] = [];
    const shortSection = paperQuestions.split(/## Section B/)[1]?.split(/## Section C/)[0] || '';
    const shortMatches = shortSection.matchAll(/-\s*\(([ivx]+)\)\s*(.*?)(?=- \([ivx]+\)|$)/gs);
    for (const match of shortMatches) {
        const romanToNum: Record<string, number> = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10, 'xi': 11, 'xii': 12, 'xiii': 13, 'xiv': 14, 'xv': 15 };
        const qNum = romanToNum[match[1]];
        if (qNum) {
            shorts.push({
                part: qNum,
                optA: match[2].trim(),
                optB: '',
                ansA: '',
                ansB: ''
            });
        }
    }

    const longs: any[] = [];
    const longSection = paperQuestions.split(/## Section C/)[1] || '';
    const longMatches = longSection.matchAll(/### Question (\d+)\.\s*(.*?)(?=### Question|$)/gs);
    for (const match of longMatches) {
        const qNum = parseInt(match[1]);
        const content = match[2].trim();
        const aSplit = content.split(/\(b\)/);
        let optA = aSplit[0].replace(/^\(a\)/, '').trim();
        let optB = aSplit.length > 1 ? aSplit[1].trim() : '';

        longs.push({
            qNum,
            optA,
            optB,
            ansA: '',
            ansB: ''
        });
    }

    if (paperSolutions) {
        const mcqSolSection = paperSolutions.split(/## Section B/)[0];
        const solLines = mcqSolSection.split('\n');
        const map: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        
        for (const line of solLines) {
            if (line.includes('| **Q')) {
                const qNumMatch = line.match(/\*\*Q(\d+)\*\*/);
                const ansMatch = line.match(/\*\*([A-D])\*\*/);
                const cols = line.split('|');
                const explanation = cols[cols.length - 2]?.trim() || '';

                if (qNumMatch && ansMatch) {
                    const qNum = parseInt(qNumMatch[1]);
                    const ans = ansMatch[1];
                    const mcq = mcqs.find(m => m.qNum === qNum);
                    if (mcq) {
                        mcq.answer = mcq.options[map[ans]];
                        mcq.explanation = explanation.replace(/\*\*/g, '').trim();
                    }
                }
            }
        }
        
        const shortSolSection = paperSolutions.split(/## Section C/)[0].split(/## Section B/)[1] || '';
        const shortSolBlocks = shortSolSection.split(/### \(/);
        for (const block of shortSolBlocks) {
            if (!block.trim()) continue;
            const blockMatch = block.match(/^([ivx]+)\)(.*?)\n(.*)/s);
            if (blockMatch) {
                const qNumStr = blockMatch[1];
                let solutionText = blockMatch[3].trim();
                
                // Remove AI filler text
                const fillerTextRegex = /\.?\s*This\s+concept\s+is\s+critical\s+under\s+Student\s+Learning\s+Objectives\s*\(SLOs\)\s+as\s+it\s+establishes\s+the\s+fundamental\s+chemical\s+theory,\s+enabling\s+practical\s+application\s+and\s+rigorous\s+qualitative\s+or\s+quantitative\s+evaluation\s+in\s+scientific\s+laboratories\.?/gi;
                solutionText = solutionText.replace(fillerTextRegex, '').trim();

                const romanToNum: Record<string, number> = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10, 'xi': 11, 'xii': 12, 'xiii': 13, 'xiv': 14, 'xv': 15 };
                const shortQ = shorts.find(s => s.part === romanToNum[qNumStr]);
                if (shortQ) {
                    shortQ.ansA = solutionText;
                }
            }
        }

        const longSolSection = paperSolutions.split(/## Section C/)[1] || '';
        const longSolMatches = longSolSection.matchAll(/### Question (\d+) Solution(.*?)(?=### Question|$)/gs);
        for (const match of longSolMatches) {
            const qNum = parseInt(match[1]);
            const content = match[2].trim();
            const longQ = longs.find(l => l.qNum === qNum);
            if (longQ) {
                const aSplit = content.split(/\(b\)/);
                
                let ansA_raw = aSplit[0].replace(/^\(a\)/, '').trim();
                let ansA_start = ansA_raw.indexOf('####');
                if (ansA_start !== -1) {
                    longQ.ansA = ansA_raw.substring(ansA_start).trim();
                } else {
                    let ansA_lines = ansA_raw.split('\n');
                    ansA_lines.shift();
                    longQ.ansA = ansA_lines.join('\n').trim();
                }
                
                if (aSplit.length > 1) {
                    let ansB_raw = aSplit[1].split('Standard FBISE Examination Marking Rubrics')[0].trim();
                    let ansB_start = ansB_raw.indexOf('####');
                    if (ansB_start !== -1) {
                        longQ.ansB = ansB_raw.substring(ansB_start).trim();
                    } else {
                        let ansB_lines = ansB_raw.split('\n');
                        ansB_lines.shift();
                        longQ.ansB = ansB_lines.join('\n').trim();
                    }
                }
            }
        }
    }

    let chemistrySubject = await prisma.subject.findFirst({
      where: { name: 'Chemistry', grade: 9 }
    });

    if (!chemistrySubject) {
       console.warn("Chemistry subject not found, papers will not be linked to a subject.");
    }

    await prisma.generatedPaper.create({
        data: {
            title: `Mock Paper ${paperNum} (Markdown Import)`,
            ...(chemistrySubject ? { subjectId: chemistrySubject.id } : {}),
            sectionA_MCQs: mcqs,
            sectionB_Short: shorts,
            sectionC_Long: longs,
            pdfUrl: null
        }
    });
    inserted++;
  }

  console.log(`Successfully inserted ${inserted} markdown papers into GeneratedPaper.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


