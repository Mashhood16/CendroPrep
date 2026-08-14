import React from 'react';
import Link from 'next/link';
import { prisma } from '@repo/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SubjectPapersDashboard({ params }: { params: Promise<{ grade: string, subjectId: string }> }) {
  const resolvedParams = await params;
  const grade = parseInt(resolvedParams.grade);
  const { subjectId } = resolvedParams;

  const subject = await prisma.subject.findUnique({ 
    where: { id: subjectId }
  });

  const generatedPapers = await prisma.generatedPaper.findMany({
    where: { subjectId },
    orderBy: { createdAt: 'asc' }
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="p-8 h-full">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href={`/classes/${grade}`} className="inline-flex items-center text-sm text-text-muted hover:text-white transition-colors mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Grade {grade} Subjects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {subject.name} Papers
          </h1>
          <p className="text-text-muted">
            Access premium dynamically extracted Mock Exams and Interactive Past Papers for {subject.name}.
          </p>
        </div>

        {/* Interactive Papers Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center text-brand-300">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Interactive Past Papers & Exams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedPapers.length === 0 ? (
              <div className="col-span-1 md:col-span-3 glass p-12 rounded-3xl text-center border-dashed border-2 border-white/10">
                <svg className="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-xl font-bold mb-2">No Interactive Papers Available Yet</h3>
                <p className="text-text-muted">Once interactive exams are available for {subject.name}, they will appear here.</p>
              </div>
            ) : (
              generatedPapers.map(paper => (
                <Link href={`/papers/${paper.id}?dynamic=true`} key={paper.id} className="block">
                  <div className="glass p-6 rounded-2xl hover:border-brand-500/50 transition-colors h-full flex flex-col bg-brand-900/10 border-brand-500/30 border">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brand-500/20 text-brand-300">
                        INTERACTIVE
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 flex-grow">{paper.title}</h3>
                    <div className="flex items-center text-brand-400 text-sm font-medium mt-4 group">
                      <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      Start Exam
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



