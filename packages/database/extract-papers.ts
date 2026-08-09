import fs from 'fs';
import { prisma } from './index';

async function main() {
  const text = fs.readFileSync('pdf-text.txt', 'utf-8');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const papers: any[] = [];
  
  let currentPaper: any = null;
  let currentSection = '';
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Detect new paper
    const paperMatch = line.match(/CHEMISTRY SSC-I \(GRADE 9\) MODEL PAPER (\d+)/);
    if (paperMatch) {
      if (currentPaper) papers.push(currentPaper);
      const pNum = parseInt(paperMatch[1]);
      if (pNum > 3) {
        currentPaper = null; // Prevent pushing again
        break; // Only parse 1, 2, 3. 4-10 are duplicates of 3.
      }
      
      currentPaper = {
        title: `Model Paper ${pNum}`,
        sectionA_MCQs: [],
        sectionB_Short: [],
        sectionC_Long: [],
        answersMCQ: {},
        answersShort: {},
        answersLong: {}
      };
      currentSection = '';
      console.log(`Starting parse for Paper ${pNum}...`);
    }

    if (!currentPaper) { i++; continue; }

    if (line.includes('SECTION A (Objective Type')) { currentSection = 'A'; i++; continue; }
    if (line.includes('SECTION B (Short Answers')) { currentSection = 'B'; i++; continue; }
    if (line.includes('SECTION C (Long/Extensive Answers')) { currentSection = 'C'; i++; continue; }
    
    // Answer Keys
    if (line.includes('Section A Answer Key & Explanations')) { currentSection = 'KEY_A'; i++; continue; }
    if (line.includes('Section B Model Answers')) { currentSection = 'KEY_B'; i++; continue; }
    if (line.includes('Section C Model Answers')) { currentSection = 'KEY_C'; i++; continue; }

    // Parse Section A MCQs
    if (currentSection === 'A') {
      if (line.match(/^Q\d+\. /)) {
        let qText = line.replace(/^Q\d+\.\s*/, '');
        let nextLine = lines[i+1] || '';
        let options: string[] = [];

        if (nextLine.includes('A)') && nextLine.includes('B)')) {
          let abMatch = lines[i+1].match(/A\)\s*(.*?)\s*B\)\s*(.*)/);
          let cdMatch = lines[i+2].match(/C\)\s*(.*?)\s*D\)\s*(.*)/);
          if (abMatch) options.push(abMatch[1], abMatch[2]);
          if (cdMatch) options.push(cdMatch[1], cdMatch[2]);
          i += 2;
        } else if (nextLine.includes('A)') && !nextLine.includes('B)')) {
           options.push(lines[i+1].replace('A)', '').trim());
           options.push(lines[i+2].replace('B)', '').trim());
           options.push(lines[i+3].replace('C)', '').trim());
           options.push(lines[i+4].replace('D)', '').trim());
           i += 4;
        }

        if (options.length === 4) {
          currentPaper.sectionA_MCQs.push({
            qNum: currentPaper.sectionA_MCQs.length + 1,
            text: qText,
            options: options
          });
        }
      }
    }

    // Parse Section B Short
    if (currentSection === 'B') {
      const qMatch = line.match(/Question 2 \(part (\d+)\)\./);
      if (qMatch) {
        let part = parseInt(qMatch[1]);
        // Fast forward to Option A and Option B
        let optA = '', optB = '';
        while (i < lines.length && !lines[i].match(/Option\s+A:/)) i++;
        optA = lines[i]?.replace(/Option\s+A:/, '').trim() || '';
        while (i < lines.length && !lines[i].match(/Option\s+B:/)) i++;
        optB = lines[i]?.replace(/Option\s+B:/, '').trim() || '';
        
        currentPaper.sectionB_Short.push({ part, optA, optB });
      }
    }

    // Parse Section C Long
    if (currentSection === 'C') {
      const qMatch = line.match(/Question (\d+)\./);
      if (qMatch) {
        let qNum = parseInt(qMatch[1]);
        let optA = '', optB = '';
        
        // Aggregate lines for Option A
        i++;
        while (i < lines.length && !lines[i].match(/Option\s+A:/)) i++;
        while (i < lines.length && !lines[i].startsWith('OR')) {
            optA += ' ' + lines[i].replace(/Option\s+A:/, '').trim();
            i++;
        }
        
        // Aggregate lines for Option B
        while (i < lines.length && !lines[i].match(/Option\s+B:/)) i++;
        while (i < lines.length && !lines[i].match(/^Question \d+\./) && !lines[i].includes('SOLUTION')) {
            optB += ' ' + lines[i].replace(/Option\s+B:/, '').trim();
            i++;
        }
        i--; // backtrack 1 so main loop can catch the next question or section

        currentPaper.sectionC_Long.push({ qNum, optA: optA.trim(), optB: optB.trim() });
      }
    }

    // Keys... (simplified parsing)
    // Actually, getting keys perfectly aligned is tricky. Let's do basic mapping.
    
    // MCQ Keys
    if (currentSection === 'KEY_A') {
      const match = line.match(/^Q(\d+)\s*([A-D])/);
      if (match) {
        const qNum = parseInt(match[1]);
        const ans = match[2];
        let explanation = line.substring(match[0].length).trim();
        // Sometimes explanation spills to next line
        if (lines[i+1] && !lines[i+1].match(/^Q\d+\s*[A-D]/) && !lines[i+1].startsWith('Section B')) {
          explanation += ' ' + lines[i+1];
        }
        currentPaper.answersMCQ[qNum] = { correct: ans, explanation };
      }
    }

    // Short Answer Keys
    if (currentSection === 'KEY_B') {
      const qMatch = line.match(/Question 2 \(part (\d+)\) Solution:/);
      if (qMatch) {
        let part = parseInt(qMatch[1]);
        let ansA = '', ansB = '';
        while (i < lines.length && !lines[i].match(/Model\s+Answer\s+A:/)) i++;
        ansA = lines[i]?.replace(/Model\s+Answer\s+A:/, '').trim() || '';
        // spillover
        if (lines[i+1] && !lines[i+1].match(/Option\s+B:/)) ansA += ' ' + lines[i+1];

        while (i < lines.length && !lines[i].match(/Model\s+Answer\s+B:/)) i++;
        ansB = lines[i]?.replace(/Model\s+Answer\s+B:/, '').trim() || '';
        if (lines[i+1] && !lines[i+1].startsWith('Question 2') && !lines[i+1].startsWith('Section C')) ansB += ' ' + lines[i+1];

        currentPaper.answersShort[part] = { ansA, ansB };
      }
    }

    // Long Answer Keys
    if (currentSection === 'KEY_C') {
      const qMatch = line.match(/Question (\d+) Solution:/);
      if (qMatch) {
        let qNum = parseInt(qMatch[1]);
        let ansA = '', ansB = '';
        
        while (i < lines.length && !lines[i].match(/Detailed\s+Model\s+Answer\s+A:/)) i++;
        while (i < lines.length && !lines[i].match(/Option\s+B:/)) {
           if(lines[i].match(/Detailed\s+Model\s+Answer\s+A:/)) ansA += lines[i].replace(/Detailed\s+Model\s+Answer\s+A:/, '').trim();
           else ansA += ' ' + lines[i];
           i++;
        }

        while (i < lines.length && !lines[i].match(/Detailed\s+Model\s+Answer\s+B:/)) i++;
        while (i < lines.length && !lines[i].match(/^Question \d+ Solution:/) && !lines[i].includes('CHEMISTRY SSC-I')) {
           if(lines[i].match(/Detailed\s+Model\s+Answer\s+B:/)) ansB += lines[i].replace(/Detailed\s+Model\s+Answer\s+B:/, '').trim();
           else ansB += ' ' + lines[i];
           i++;
        }
        i--;
        currentPaper.answersLong[qNum] = { ansA: ansA.trim(), ansB: ansB.trim() };
      }
    }

    i++;
  }
  
  if (currentPaper) papers.push(currentPaper);

  console.log(`Parsed ${papers.length} unique papers from PDF.`);

  // Clear existing
  await prisma.generatedPaper.deleteMany();

  // Create 10 papers! (1, 2, 3 + 7 duplicates of 3)
  for (let pNum = 1; pNum <= 10; pNum++) {
    const sourcePaper = pNum <= 3 ? papers[pNum - 1] : papers[2];
    
    // Merge answers into the main JSON structure for easy rendering
    const mcqs = sourcePaper.sectionA_MCQs.map((q: any) => ({
      ...q,
      answer: sourcePaper.answersMCQ[q.qNum]?.correct || 'A',
      explanation: sourcePaper.answersMCQ[q.qNum]?.explanation || ''
    }));

    const shorts = sourcePaper.sectionB_Short.map((q: any) => ({
      ...q,
      ansA: sourcePaper.answersShort[q.part]?.ansA || '',
      ansB: sourcePaper.answersShort[q.part]?.ansB || ''
    }));

    const longs = sourcePaper.sectionC_Long.map((q: any) => ({
      ...q,
      ansA: sourcePaper.answersLong[q.qNum]?.ansA || '',
      ansB: sourcePaper.answersLong[q.qNum]?.ansB || ''
    }));

    await prisma.generatedPaper.create({
      data: {
        title: `Model Paper ${pNum}`,
        sectionA_MCQs: mcqs,
        sectionB_Short: shorts,
        sectionC_Long: longs,
        pdfUrl: `/papers/Class9_Chemistry_NEW.pdf`
      }
    });
  }

  console.log('Successfully inserted 10 GeneratedPaper records into the database!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
