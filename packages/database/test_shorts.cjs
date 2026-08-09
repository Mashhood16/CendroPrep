const fs = require('fs');

const text = fs.readFileSync('C:/Users/mashh/.gemini/antigravity/scratch/cendronyx-workspace/chemistry-class-9-fbise-65marks-papers-v2.md', 'utf-8');
const paperTextRaw = text.split('# Mock Examination Paper')[1];
const paperParts = paperTextRaw.split('# Solution & Grading Guide');
const paperQuestions = paperParts[0];
const paperSolutions = paperParts.length > 1 ? paperParts[1] : '';

const shorts = [];
const shortSection = paperQuestions.split('## Section B')[1]?.split('## Section C')[0] || '';
const shortMatches = Array.from(shortSection.matchAll(/-\s*\((.*?)\)\s*(.*?)(?=- \([ivx]+\)|$)/gs));
let shortIndex = 1;
for (const match of shortMatches) {
    shorts.push({
        part: shortIndex++,
        optA: match[2].trim(),
        optB: '',
        ansA: '',
        ansB: ''
    });
}

const longs = [];
const longSection = paperQuestions.split('## Section C')[1] || '';
const longMatches = Array.from(longSection.matchAll(/### Question (\d+)\.(.*?)(?=### Question|$)/gs));
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

const shortSolSection = paperSolutions.split('## Section B Short Answer Solutions')[1]?.split('## Section C Long Answer Solutions')[0] || '';
const shortSolMatches = Array.from(shortSolSection.matchAll(/### \([ivx]+\)(.*?)(?=### \([ivx]+\)|$)/gs));
let solIndex = 1;
for (const match of shortSolMatches) {
    const shortQ = shorts.find(s => s.part === solIndex);
    if (shortQ) {
        let ansText = match[1].trim();
        let ansLines = ansText.split('\n');
        ansLines.shift(); 
        shortQ.ansA = ansLines.join('\n').trim();
    }
    solIndex++;
}

const longSolSection = paperSolutions.split('## Section C Long Answer Solutions')[1] || '';
const longSolMatches = Array.from(longSolSection.matchAll(/### Question (\d+) Solution(.*?)(?=### Question|$)/gs));
for (const match of longSolMatches) {
    const qNum = parseInt(match[1]);
    const content = match[2].trim();
    const longQ = longs.find(l => l.qNum === qNum);
    if (longQ) {
        const aSplit = content.split(/\(b\)/);
        let ansA = aSplit[0].replace(/^\(a\)/, '').trim();
        let ansA_lines = ansA.split('\n');
        ansA_lines.shift();
        longQ.ansA = ansA_lines.join('\n').trim();
        
        if (aSplit.length > 1) {
            let ansB = aSplit[1].trim();
            let ansB_lines = ansB.split('\n');
            ansB_lines.shift();
            longQ.ansB = ansB_lines.join('\n').trim();
        }
    }
}

console.log('Short 1 optA:', shorts[0].optA);
console.log('Short 1 ansA:\n', shorts[0].ansA);

console.log('\nLong 3 optA:\n', longs[0].optA);
console.log('\nLong 3 optB:\n', longs[0].optB);
console.log('\nLong 3 ansA:\n', longs[0].ansA);
console.log('\nLong 3 ansB:\n', longs[0].ansB);
