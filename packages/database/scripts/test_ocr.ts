import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import Tesseract from 'tesseract.js';

const RAW_BOOKS_DIR = path.join(__dirname, '../raw-books');
const TEMP_IMG_DIR = path.join(__dirname, '../temp_images');

async function main() {
  if (!fs.existsSync(TEMP_IMG_DIR)) {
    fs.mkdirSync(TEMP_IMG_DIR, { recursive: true });
  }

  const pdfPath = path.join(RAW_BOOKS_DIR, 'Chemistry-Class-9.pdf');
  const pyScript = path.join(__dirname, 'pdf_to_images.py');
  
  // We'll run the python script, which renders the first 15 pages.
  execSync(`python "${pyScript}" "${pdfPath}" "${TEMP_IMG_DIR}"`, { stdio: 'inherit' });

  // Let's just OCR page 12, 13, 14, 15 where chapters usually start
  const targetImages = ['page_12.png', 'page_13.png', 'page_14.png', 'page_15.png'];
  let fullText = "";

  for (const img of targetImages) {
    const imgPath = path.join(TEMP_IMG_DIR, img);
    if (!fs.existsSync(imgPath)) continue;

    console.log(`OCRing ${img}...`);
    const { data: { text } } = await Tesseract.recognize(imgPath, 'eng');
    fullText += `\n--- ${img} ---\n` + text;
  }

  fs.writeFileSync(path.join(__dirname, '../temp_ocr_sample.txt'), fullText);
  console.log("Saved OCR sample to temp_ocr_sample.txt");
}

main().catch(console.error);
