import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function PrintPaperLayout({ paper }: { paper: any }) {
  if (!paper) return null;

  // Render a bubble grid for an OMR sheet look
  const renderBubbleGrid = (title: string, columns: number) => (
    <div className="border border-black inline-block text-center mb-4 text-xs font-sans">
      <div className="border-b border-black font-bold py-1 bg-gray-100">{title}</div>
      <div className="flex justify-center">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col border-r border-black last:border-r-0 px-2 py-1 gap-1">
            <div className="w-5 h-5 border border-black rounded-sm mb-1 mx-auto"></div>
            {Array.from({ length: 10 }).map((_, num) => (
              <div key={num} className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[9px] mx-auto text-gray-500">
                {num}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hidden print:block print:bg-white print:text-black font-serif text-black w-full max-w-none">
      
      {/* --- PART 1: QUESTION PAPER --- */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">CENDROPREP</h1>
        <h2 className="text-2xl font-bold">Federal Board SSC-I Examination</h2>
        <h3 className="text-xl font-bold">[NCP] SLOs Assessment Framework</h3>
        <h3 className="text-xl font-bold">{paper.title}</h3>
        <h4 className="text-lg font-bold uppercase mt-1 border-b-2 border-t-2 border-black py-1 inline-block px-10">CHEMISTRY (SSC-I) 9th</h4>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="font-bold underline text-lg mb-2">Section-A (Objective - Marks 30)</div>
          <div className="font-bold text-sm mb-2">Total Theory Marks: 60 (Objective 30 Marks / Subjective 30 Marks)</div>
          <div className="text-xs leading-tight w-64 text-justify">
            Section – A is compulsory. All parts of this section are to be answered on this page and handed over to the Centre Superintendent. Deleting / overwriting is not allowed. Do not use lead pencil.
          </div>
        </div>
        <div className="flex gap-4">
          {renderBubbleGrid("ROLL NUMBER", 6)}
          {renderBubbleGrid("Version No.", 4)}
        </div>
      </div>

      <div className="flex justify-between border-b border-black pb-2 mb-6 text-sm font-bold">
        <div>Candidate Sign. ___________________</div>
        <div>Invigilator Sign. ___________________</div>
      </div>

      <div className="mb-4">
        <div className="font-bold mb-4">
          Q1. <span className="underline">Fill the relevant bubble against each question according to curriculum. Each part carries 0.5 marks. (30 Marks)</span>
        </div>
        
        {paper.sectionA_MCQs?.map((q: any, i: number) => (
          <div key={i} className="mb-4 pl-6 relative page-break-inside-avoid">
            <div className="absolute left-0 font-bold">{i + 1}.</div>
            <div className="font-bold mb-1"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.text}</ReactMarkdown></div>
            <div className="grid grid-cols-1 gap-1 pl-4">
              {q.options.map((opt: string, optIdx: number) => (
                <div key={optIdx} className="flex gap-2">
                  <span>{String.fromCharCode(65 + optIdx)}.</span>
                  <span><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</ReactMarkdown></span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION B */}
      <div className="text-center font-bold text-xl border-b-2 border-black pb-1 mb-2 mt-8">
        SECTION – B: Subjective - Short Response Questions (Marks 18)
      </div>
      <div className="flex justify-between font-bold text-sm mb-4">
        <div>Q2. Attempt all short response questions based on SLOs. Each question carries 3 marks.</div>
        <div>(Total Marks: 18)</div>
      </div>
      
      <div className="space-y-4 mb-8">
        {paper.sectionB_Short?.map((q: any) => (
          <div key={q.part} className="flex gap-2 page-break-inside-avoid">
            <div className="font-bold w-12 text-right shrink-0">Q{q.part}.</div>
            <div>
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.optA}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION C */}
      {Array.isArray(paper.sectionC_Long) && paper.sectionC_Long.length > 0 ? (
        <>
          <div className="text-center font-bold text-xl border-b-2 border-black pb-1 mb-2 mt-8">
            SECTION – C: Subjective - Extended Response Questions (Marks 12)
          </div>
          <div className="font-bold text-sm mb-4 border border-black inline-block px-2 py-1 w-full text-center">
            Note: Attempt all questions. Each question carries 6 marks (Part a: 3 Marks, Part b: 3 Marks). Total Marks: 12
          </div>

          <div className="space-y-6">
            {paper.sectionC_Long?.map((q: any) => (
              <div key={q.qNum} className="flex gap-2 page-break-inside-avoid">
                <div className="font-bold w-8 shrink-0">Q{q.qNum}.</div>
                <div className="space-y-3 w-full">
                  <div>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.optA}</ReactMarkdown>
                  </div>
                  {q.optB && (
                    <div>
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.optB}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* --- PART 2: SOLUTIONS --- */}
      <div className="break-before-page pt-8 print:break-before-page">
        <h1 className="text-4xl font-extrabold text-center border-b-4 border-black pb-4 mb-8">SOLUTIONS & MARKING SCHEME</h1>

        {/* Section A Key */}
        <h2 className="text-2xl font-bold mb-4 bg-gray-200 py-2 px-4 border border-black">SECTION A (MCQs) ANSWER KEY (60 MCQs @ 0.5 Marks = 30 Marks)</h2>
        <table className="w-full border-collapse border border-black text-sm text-center mb-8">
          <tbody>
            {chunkArray(paper.sectionA_MCQs || [], 6).map((row: any[], rIdx: number) => (
              <tr key={rIdx}>
                {row.map((q, cIdx) => {
                  const letterIndex = q.options.findIndex((opt: string) => opt === q.answer);
                  const letter = letterIndex >= 0 ? String.fromCharCode(65 + letterIndex) : '-';
                  return (
                    <React.Fragment key={cIdx}>
                      <td className="border border-black font-bold bg-gray-100 p-2 w-12">{q.qNum}.</td>
                      <td className="border border-black font-bold p-2 w-12">{letter}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section B Solutions */}
        <h2 className="text-2xl font-bold mb-4 bg-gray-200 py-2 px-4 border border-black break-before-page">SECTION B (Short Response Solutions - 18 Marks)</h2>
        <div className="space-y-6 mb-8">
          {paper.sectionB_Short?.map((q: any) => (
            <div key={q.part} className="border-2 border-black p-4 rounded-lg page-break-inside-avoid">
              <h3 className="font-bold text-lg mb-4 border-b border-gray-400 pb-2">Question {q.part} (3 Marks)</h3>
              
              <div className="mb-6">
                <div className="font-bold mb-2 italic">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.optA}</ReactMarkdown>
                </div>
                <div className="pl-6 prose prose-sm max-w-none text-black prose-headings:text-black prose-a:text-black prose-strong:text-black prose-p:text-black [&_table]:border-collapse [&_th]:border [&_th]:border-black [&_td]:border [&_td]:border-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.ansA || 'No answer provided.'}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section C Solutions */}
        {Array.isArray(paper.sectionC_Long) && paper.sectionC_Long.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-4 bg-gray-200 py-2 px-4 border border-black break-before-page">SECTION C (Extended Response Solutions - 12 Marks)</h2>
            <div className="space-y-8">
              {paper.sectionC_Long?.map((q: any) => (
                <div key={q.qNum} className="border-2 border-black p-4 rounded-lg page-break-inside-avoid">
                  <h3 className="font-bold text-lg mb-4 border-b border-gray-400 pb-2">Question {q.qNum} (6 Marks)</h3>
                  
                  <div className="mb-6">
                    <div className="font-bold mb-2 italic">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.optA}</ReactMarkdown>
                    </div>
                    <div className="pl-6 prose prose-sm max-w-none text-black prose-headings:text-black prose-a:text-black prose-strong:text-black prose-p:text-black [&_table]:border-collapse [&_th]:border [&_th]:border-black [&_td]:border [&_td]:border-black">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.ansA || 'No answer provided.'}</ReactMarkdown>
                    </div>
                  </div>

                  {q.optB && (
                    <div>
                      <div className="font-bold mb-2 italic">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.optB}</ReactMarkdown>
                      </div>
                      <div className="pl-6 prose prose-sm max-w-none text-black prose-headings:text-black prose-a:text-black prose-strong:text-black prose-p:text-black [&_table]:border-collapse [&_th]:border [&_th]:border-black [&_td]:border [&_td]:border-black">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.ansB || 'No answer provided.'}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

    </div>
  );
}

function romanize(num: number): string {
  const lookup: Record<string, number> = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  for (const i in lookup) {
    const val = lookup[i];
    if (val !== undefined) {
      while (num >= val) {
        roman += i;
        num -= val;
      }
    }
  }
  return roman.toLowerCase();
}

function chunkArray(arr: any[], size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
