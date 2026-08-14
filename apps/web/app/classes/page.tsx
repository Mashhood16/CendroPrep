import React from 'react';
import Link from 'next/link';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

export default async function ClassesDashboard() {
  // Get counts of subjects for each grade
  const subjects = await prisma.subject.findMany({ select: { grade: true } });
  
  const gradeCounts = {
    9: subjects.filter(s => s.grade === 9).length,
    10: subjects.filter(s => s.grade === 10).length,
    11: subjects.filter(s => s.grade === 11).length,
    12: subjects.filter(s => s.grade === 12).length,
  };

  const classes = [
    { grade: 9, title: "Grade 9", description: "Matriculation Part 1" },
    { grade: 10, title: "Grade 10", description: "Matriculation Part 2" },
    { grade: 11, title: "Grade 11", description: "Intermediate Part 1 (HSSC-I)" },
    { grade: 12, title: "Grade 12", description: "Intermediate Part 2 (HSSC-II)" },
  ];

  return (
    <div className="p-8 h-full">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Classes & Subjects
          </h1>
          <p className="text-text-muted">
            Select your class to view available subjects and past papers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => {
            const count = gradeCounts[cls.grade as keyof typeof gradeCounts];
            
            return (
              <Link href={`/classes/${cls.grade}`} key={cls.grade} className="block">
                <div className="glass p-8 rounded-2xl hover:border-brand-500/50 transition-colors h-full group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-500/20 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xl">
                      {cls.grade}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-text-muted border border-white/10">
                      {count} Subjects
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">{cls.title}</h3>
                  <p className="text-text-muted relative z-10">{cls.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
