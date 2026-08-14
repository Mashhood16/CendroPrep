import React from 'react';
import Link from 'next/link';
import { prisma } from '@repo/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SubjectsDashboard({ params }: { params: Promise<{ grade: string }> }) {
  const resolvedParams = await params;
  const grade = parseInt(resolvedParams.grade);
  
  if (isNaN(grade) || grade < 9 || grade > 12) {
    notFound();
  }

  const subjects = await prisma.subject.findMany({ 
    where: { grade },
    include: { papers: true, generatedPapers: true } 
  });

  return (
    <div className="p-8 h-full">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/classes" className="inline-flex items-center text-sm text-text-muted hover:text-white transition-colors mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Classes
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Grade {grade} Subjects
          </h1>
          <p className="text-text-muted">
            Select a subject to view available mock exams and past papers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.length === 0 ? (
            <div className="col-span-1 md:col-span-3 glass p-12 rounded-3xl text-center border-dashed border-2 border-white/10">
              <svg className="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <h3 className="text-xl font-bold mb-2">No Subjects Found</h3>
              <p className="text-text-muted">Subjects for Grade {grade} will appear here once they are added.</p>
            </div>
          ) : (
            subjects.map(subject => (
              <Link href={`/classes/${grade}/${subject.id}`} key={subject.id} className="block">
                <div className="glass p-6 rounded-2xl hover:border-brand-500/50 transition-colors h-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{subject.name}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-text-muted">
                    {subject.papers.length + (subject.generatedPapers?.length || 0)} Papers Available
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
