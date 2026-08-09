import fs from 'fs';
import pdf from 'pdf-parse';

async function main() {
  const dataBuffer = fs.readFileSync('../../apps/web/public/papers/Class9_Chemistry_NEW.pdf');
  const data = await pdf(dataBuffer);
  fs.writeFileSync('pdf-text.txt', data.text);
  console.log("Extracted text saved to pdf-text.txt");
}

main().catch(console.error);
