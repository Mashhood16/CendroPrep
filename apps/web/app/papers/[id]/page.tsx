import React from 'react';
import Link from 'next/link';
import { prisma } from '@repo/database';
import { notFound } from 'next/navigation';
import DynamicPaperViewer from '../components/DynamicPaperViewer';

export default async function PaperViewer({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isDynamic = resolvedSearchParams.dynamic === 'true';

  if (isDynamic) {
    const generatedPaper = await prisma.generatedPaper.findUnique({ 
      where: { id: resolvedParams.id } 
    });
    
    if (!generatedPaper) {
      notFound();
    }
    
    return <DynamicPaperViewer paper={generatedPaper} />;
  }

  const paper = await prisma.paper.findUnique({ 
    where: { id: resolvedParams.id } 
  });
  
  if (!paper) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-bg-dark-card sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/papers" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{paper.title}</h1>
            <p className="text-xs text-text-muted font-medium">{paper.year} • {paper.type.replace('_', ' ')}</p>
          </div>
        </div>
        
        <a href={paper.pdfUrl} download className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download PDF
        </a>
      </div>

      <div className="flex-1 bg-black p-4 md:p-8">
        <div className="max-w-5xl mx-auto h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass">
          <iframe 
            src={`${paper.pdfUrl}#toolbar=0`} 
            className="w-full h-full border-none"
            title={paper.title}
          />
        </div>
      </div>
    </div>
  );
}
