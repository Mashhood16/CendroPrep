import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import Tesseract from 'tesseract.js';

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('prisma+postgres://')) {
  const match = dbUrl.match(/api_key=(.*)/);
  if (match) {
    try {
      const json = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
      dbUrl = json.databaseUrl;
      console.log('Decoded raw Postgres URL from Prisma API key.');
    } catch (e) {
      console.error('Failed to parse API key', e);
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const RAW_BOOKS_DIR = path.join(__dirname, '../raw-books');
const TEMP_IMG_DIR = path.join(__dirname, '../temp_images');

async function main() {
  console.log("Starting Cendronyx PDF Local OCR & RegEx Parsing Process...");
  
  // WIPE DB (For MVP Seeding)
  console.log("Wiping existing curriculum data to prevent duplicates...");
  await prisma.topicContent.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.book.deleteMany();
  await prisma.subject.deleteMany();

  // Ensure temp directory exists
  if (!fs.existsSync(TEMP_IMG_DIR)) {
    fs.mkdirSync(TEMP_IMG_DIR, { recursive: true });
  }

  const files = fs.readdirSync(RAW_BOOKS_DIR).filter(file => file.endsWith('.pdf'));
  console.log(`Found ${files.length} PDF books. Beginning processing...`);

  const targetFiles = files;

  for (const file of targetFiles) {
    console.log(`\n--- Processing ${file} ---`);
    const pdfPath = path.join(RAW_BOOKS_DIR, file);
    
    // Create Subject & Book
    const subjectName = file.split('-')[0] || "Unknown";
    console.log(`Provisioning Database for Subject: ${subjectName}`);
    
    const subject = await prisma.subject.create({
      data: {
        name: subjectName,
        grade: 9
      }
    });

    const book = await prisma.book.create({
      data: {
        title: `${subjectName} Class 9 Textbook`,
        subjectId: subject.id
      }
    });

    // Step 1: Extract Images
    console.log("Extracting pages to images using PyMuPDF...");
    const pyScript = path.join(__dirname, 'pdf_to_images.py');
    try {
      execSync(`python "${pyScript}" "${pdfPath}" "${TEMP_IMG_DIR}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to extract images for ${file}`, e);
      continue;
    }

    // Step 2: OCR
    const images = fs.readdirSync(TEMP_IMG_DIR).filter(img => img.endsWith('.png')).sort();
    let fullExtractedText = "";
    
    console.log(`Extracted ${images.length} images. Starting Tesseract OCR...`);
    
    for (const img of images) {
      const imgPath = path.join(TEMP_IMG_DIR, img);
      const { data: { text } } = await Tesseract.recognize(imgPath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\rOCR Progress on ${img}: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      fullExtractedText += text + "\n";
    }

    // Step 3: RegEx Parser
    console.log("\nStarting RegEx Heuristic Parsing...");
    
    const lines = fullExtractedText.split('\n');
    let activeChapter = null;
    let activeTopic = null;
    let currentTopicBuffer = [];

    // Regex Definitions
    // Matches "Unit 1: Fundamentals of Chemistry" or "EE Unit 1:"
    const chapterRegex = /(?:Unit|Chapter)\s+(\d+)[:\-]?\s*(.*)/i;
    // Matches "1.6: APPLICATIONS OF SCIENCE"
    const topicRegex = /^(\d+\.\d+)[:\-]?\s*(.*)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const chapterMatch = line.match(chapterRegex);
      if (chapterMatch) {
        // Save previous topic content before switching
        if (activeTopic && currentTopicBuffer.length > 0) {
           await prisma.topicContent.create({
             data: {
               topicId: activeTopic.id,
               content: currentTopicBuffer.join('\n')
             }
           });
           currentTopicBuffer = [];
        }

        const chapterNo = parseInt(chapterMatch[1], 10);
        let chapterTitle = chapterMatch[2].trim();
        
        // Sometimes title is on next line if empty
        if (!chapterTitle && i + 1 < lines.length) {
            chapterTitle = lines[i+1].trim();
            i++; // skip next line since we consumed it
        }

        console.log(`[FOUND CHAPTER] ${chapterNo}: ${chapterTitle}`);
        activeChapter = await prisma.chapter.create({
          data: {
            title: chapterTitle || "Untitled Chapter",
            chapterNo: chapterNo,
            bookId: book.id
          }
        });
        activeTopic = null;
        continue;
      }

      if (activeChapter) {
        const topicMatch = line.match(topicRegex);
        if (topicMatch) {
          // Save previous topic content
          if (activeTopic && currentTopicBuffer.length > 0) {
             await prisma.topicContent.create({
               data: {
                 topicId: activeTopic.id,
                 content: currentTopicBuffer.join('\n')
               }
             });
             currentTopicBuffer = [];
          }

          const topicNo = topicMatch[1];
          const topicTitle = topicMatch[2].trim();
          
          console.log(`  [FOUND TOPIC] ${topicNo}: ${topicTitle}`);
          activeTopic = await prisma.topic.create({
            data: {
              title: topicTitle,
              topicNo: topicNo,
              chapterId: activeChapter.id
            }
          });
          continue;
        }
        
        // If it's neither a chapter nor a topic heading, it's content for the active topic
        if (activeTopic) {
           currentTopicBuffer.push(line);
        }
      }
    }

    // Flush the last topic buffer
    if (activeTopic && currentTopicBuffer.length > 0) {
       await prisma.topicContent.create({
         data: {
           topicId: activeTopic.id,
           content: currentTopicBuffer.join('\n')
         }
       });
    }
    
    // Step 4: Cleanup
    console.log("Cleaning up temp images...");
    for (const img of images) {
      fs.unlinkSync(path.join(TEMP_IMG_DIR, img));
    }
  }

  console.log("\nFinished processing available books!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
