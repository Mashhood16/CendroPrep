"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import PrintPaperLayout from './PrintPaperLayout';

export default function DynamicPaperViewer({ paper }: { paper: any }) {
  const [showSolutions, setShowSolutions] = useState(false);

  return (
    <div className="min-h-screen bg-bg-dark-app print:bg-white print:text-black">
      {/* Header */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-bg-dark-card sticky top-0 z-10 print:hidden">
        <div className="flex items-center space-x-4">
          {/* We don't have the subjectId context here easily without passing it down, so just link back to dashboard or go back */}
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{paper.title}</h1>
            <p className="text-xs text-brand-400 font-medium">Interactive Mock Exam</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </button>
          <button 
            onClick={() => setShowSolutions(!showSolutions)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center ${showSolutions ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-brand-600 hover:bg-brand-500 text-white'}`}
          >
            {showSolutions ? 'Hide Solutions' : 'Reveal Solutions'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6 space-y-16 print:hidden">
        
        {/* Section A: MCQs */}
        {paper.sectionA_MCQs && paper.sectionA_MCQs.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Section A (Objective Type)</h2>
              <p className="text-text-muted text-sm mt-1">Multiple Choice Questions (12 Marks)</p>
            </div>
            
            <div className="space-y-6">
              {paper.sectionA_MCQs.map((q: any) => (
                <div key={q.qNum} className="glass p-6 rounded-2xl relative overflow-hidden">
                  <p className="text-white font-medium text-lg leading-relaxed mb-4">
                    <span className="text-brand-400 mr-2">Q{q.qNum}.</span> {q.text}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt: string, i: number) => {
                      const letter = String.fromCharCode(65 + i);
                      const isCorrect = showSolutions && opt === q.answer;
                      return (
                        <div key={i} className={`p-4 rounded-xl border flex items-start transition-all ${isCorrect ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                          <span className={`font-bold mr-3 ${isCorrect ? 'text-green-400' : 'text-text-muted'}`}>{letter})</span>
                          <span className={isCorrect ? 'text-green-100 font-medium' : 'text-gray-300'}>{opt}</span>
                          {isCorrect && (
                             <svg className="w-5 h-5 ml-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {showSolutions && q.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-200 text-sm overflow-x-auto">
                      <strong className="block mb-2">Explanation: </strong> 
                      <div className="space-y-2 [&_p]:inline">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {q.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section B: Short Answers */}
        {paper.sectionB_Short && paper.sectionB_Short.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Section B (Short Answers)</h2>
              <p className="text-text-muted text-sm mt-1">Answer questions with options (42 Marks)</p>
            </div>
            
            <div className="space-y-8">
              {paper.sectionB_Short.map((q: any) => (
                <div key={q.part} className="glass p-6 rounded-2xl relative overflow-hidden">
                  <h3 className="text-brand-400 font-bold mb-4">Question 2 (part {q.part})</h3>
                  
                  <div className="space-y-4">
                    {/* Question Content */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <p className="text-white font-medium mb-3">{q.optA}</p>
                      {showSolutions && (
                        <div className="mt-3 p-4 bg-green-900/20 border-l-2 border-green-500 rounded-r-xl text-green-100 text-sm leading-relaxed overflow-x-auto">
                          <strong className="block text-green-400 mb-2">Model Answer:</strong>
                          {q.ansA ? (
                            <div className="space-y-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-green-500/30 [&_th]:p-2 [&_th]:bg-green-900/40 [&_td]:border [&_td]:border-green-500/20 [&_td]:p-2 [&_p]:mb-2">
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {q.ansA}
                              </ReactMarkdown>
                            </div>
                          ) : 'No model answer provided.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section C: Long Answers */}
        {paper.sectionC_Long && paper.sectionC_Long.length > 0 && (
          <section className="space-y-6 pb-20">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Section C (Long/Extensive Answers)</h2>
              <p className="text-text-muted text-sm mt-1">Detailed answers with options (26 Marks)</p>
            </div>
            
            <div className="space-y-8">
              {paper.sectionC_Long.map((q: any) => (
                <div key={q.qNum} className="glass p-8 rounded-2xl relative overflow-hidden border-brand-500/20 border">
                  <h3 className="text-brand-400 font-bold mb-6 text-xl">Question {q.qNum}</h3>
                  
                  <div className="space-y-6">
                    {/* Part A */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <p className="text-white font-medium mb-4 leading-relaxed"><span className="text-brand-400 font-bold mr-2">(a)</span> {q.optA}</p>
                      {showSolutions && (
                        <div className="mt-4 p-5 bg-green-900/20 border-l-2 border-green-500 rounded-r-xl text-green-100 text-sm leading-relaxed overflow-x-auto">
                          <strong className="block text-green-400 mb-4">Detailed Model Answer:</strong>
                          {q.ansA ? (
                            <div className="space-y-4 [&_h4]:text-green-300 [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-green-500/30 [&_th]:p-2 [&_th]:bg-green-900/40 [&_td]:border [&_td]:border-green-500/20 [&_td]:p-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {q.ansA}
                              </ReactMarkdown>
                            </div>
                          ) : 'No model answer provided.'}
                        </div>
                      )}
                    </div>
                    {/* Part B */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <p className="text-white font-medium mb-4 leading-relaxed"><span className="text-brand-400 font-bold mr-2">(b)</span> {q.optB}</p>
                      {showSolutions && (
                        <div className="mt-4 p-5 bg-green-900/20 border-l-2 border-green-500 rounded-r-xl text-green-100 text-sm leading-relaxed overflow-x-auto">
                          <strong className="block text-green-400 mb-4">Detailed Model Answer:</strong>
                          {q.ansB ? (
                            <div className="space-y-4 [&_h4]:text-green-300 [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-green-500/30 [&_th]:p-2 [&_th]:bg-green-900/40 [&_td]:border [&_td]:border-green-500/20 [&_td]:p-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {q.ansB}
                              </ReactMarkdown>
                            </div>
                          ) : 'No model answer provided.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
      <PrintPaperLayout paper={paper} />
    </div>
  );
}
