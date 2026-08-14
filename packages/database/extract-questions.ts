import fs from 'fs';
import { prisma } from './index.js';
import { QuestionType, Difficulty } from '@prisma/client';

async function main() {
  const text = fs.readFileSync('pdf-text.txt', 'utf-8');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // We need a dummy Topic to attach questions to
  // First, find or create "Chemistry" subject
  let subject = await prisma.subject.findFirst({ where: { name: 'Chemistry', grade: 9 } });
  if (!subject) {
    subject = await prisma.subject.create({
      data: { name: 'Chemistry', grade: 9 }
    });
  }

  // Find or create "Mock Exams Book"
  let book = await prisma.book.findFirst({ where: { title: 'Mock Exams Book', subjectId: subject.id } });
  if (!book) {
    book = await prisma.book.create({
      data: { title: 'Mock Exams Book', subjectId: subject.id }
    });
  }

  // Find or create "Mock Exams" chapter
  let chapter = await prisma.chapter.findFirst({ where: { title: 'Mock Exams', bookId: book.id } });
  if (!chapter) {
    chapter = await prisma.chapter.create({
      data: { title: 'Mock Exams', chapterNo: 0, bookId: book.id }
    });
  }

  // Find or create "Extracted Questions" topic
  let topic = await prisma.topic.findFirst({ where: { title: 'Extracted Questions', chapterId: chapter.id } });
  if (!topic) {
    topic = await prisma.topic.create({
      data: { title: 'Extracted Questions', topicNo: '0.0', chapterId: chapter.id, subTopics: [] }
    });
  }

  let currentPaper = 0;
  let mcqs: any[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.includes('CHEMISTRY SSC-I (GRADE 9) MODEL PAPER')) {
      const match = line.match(/MODEL PAPER (\d+)/);
      if (match) {
        currentPaper = parseInt(match[1]);
        console.log(`Parsing Paper ${currentPaper}...`);
      }
    }

    // Parse MCQ
    if (line.match(/^Q\d+\. /) && currentPaper <= 3 && currentPaper > 0) {
      // It's a question. Let's see if it's an MCQ or short answer.
      // MCQs usually have A) B) C) D) in the next lines.
      let qText = line.replace(/^Q\d+\.\s*/, '');
      let nextLine = lines[i+1] || '';
      let isMCQ = false;
      let options: string[] = [];

      // Look ahead to see if it's an MCQ
      if (nextLine.includes('A)') && nextLine.includes('B)')) {
        isMCQ = true;
        // Parse options from next two lines
        // A) ZeroB) Continuous
        // A) Zero B) Continuous
        const abLine = lines[i+1];
        const cdLine = lines[i+2];
        
        let optA = "", optB = "", optC = "", optD = "";
        let abMatch = abLine.match(/A\)\s*(.*?)\s*B\)\s*(.*)/);
        if (abMatch) { optA = abMatch[1]; optB = abMatch[2]; }
        
        let cdMatch = cdLine.match(/C\)\s*(.*?)\s*D\)\s*(.*)/);
        if (cdMatch) { optC = cdMatch[1]; optD = cdMatch[2]; }

        options = [optA, optB, optC, optD];
        i += 2; // skip option lines
      } else if (nextLine.includes('A)') && !nextLine.includes('B)')) {
         // sometimes options are on 4 lines
         isMCQ = true;
         options.push(lines[i+1].replace('A)', '').trim());
         options.push(lines[i+2].replace('B)', '').trim());
         options.push(lines[i+3].replace('C)', '').trim());
         options.push(lines[i+4].replace('D)', '').trim());
         i += 4;
      }

      if (isMCQ) {
        mcqs.push({
          text: qText,
          options: options,
          paper: currentPaper
        });
      }
    }
    
    i++;
  }

  // Parse Answer Key from Section A Answer Key & Explanations
  let currentKeyPaper = 0;
  let inAnswerKey = false;
  let answersParsed = 0;

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    
    if (line.includes('SOLUTION & GRADING GUIDE — MODEL PAPER') || line.includes('SOLUTION & GRADING GUIDE - MODEL PAPER')) {
      const match = line.match(/MODEL PAPER (\d+)/);
      if (match) {
        currentKeyPaper = parseInt(match[1]);
        if (currentKeyPaper > 3) break; // Only first 3 are unique
      }
    }

    if (line.includes('Section A Answer Key & Explanations')) {
      inAnswerKey = true;
      continue;
    }
    if (line.includes('Section B Model Answers')) {
      inAnswerKey = false;
      continue;
    }

    if (inAnswerKey && currentKeyPaper <= 3) {
      // Looks like: Q1CChemistry is defined as the science...
      // Or: Q1 C Chemistry is defined...
      const match = line.match(/^Q(\d+)\s*([A-D])/);
      if (match) {
        const qNum = parseInt(match[1]);
        const correctLetter = match[2]; // A, B, C, D
        
        // Find the corresponding question
        // Note: some questions might not have parsed perfectly, so we find it by text matching or index
        const qIndex = (currentKeyPaper - 1) * 17 + (qNum - 1);
        if (mcqs[qIndex]) {
          const letterMap: any = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
          mcqs[qIndex].answer = mcqs[qIndex].options[letterMap[correctLetter]];
          // Extract solution explanation
          let explanation = line.substring(match[0].length).trim();
          mcqs[qIndex].solution = explanation;
          answersParsed++;
        }
      }
    }
  }

  console.log(`Parsed ${mcqs.length} MCQs and matched ${answersParsed} answers.`);

  // Clear existing questions for this topic to avoid duplicates
  await prisma.question.deleteMany({ where: { topicId: topic.id } });

  // Insert into database
  let inserted = 0;
  for (const mcq of mcqs) {
    if (mcq.answer) {
      await prisma.question.create({
        data: {
          text: mcq.text,
          type: QuestionType.MCQ,
          difficulty: Difficulty.MEDIUM,
          marks: 1,
          isSLO: true,
          options: mcq.options,
          answer: mcq.answer,
          solution: mcq.solution,
          topicId: topic.id
        }
      });
      inserted++;
    }
  }

  console.log(`Successfully inserted ${inserted} unique MCQs into the database!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
