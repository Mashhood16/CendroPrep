'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  // In the future, pass this down as a prop or fetch from global state
  const progress = 0;
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen glass border-r border-white/5 flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center space-x-2 mb-12">
        <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.5)] flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Cendronyx Prep</span>
      </div>

      <nav className="flex-1 space-y-2">
        <a href="/" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/' ? 'bg-white/5 text-brand-300 font-medium border border-white/10' : 'text-text-muted hover:bg-white/5 hover:text-white border border-transparent'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span>Dashboard</span>
        </a>
        <a href="/classes" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname?.startsWith('/classes') ? 'bg-white/5 text-brand-300 font-medium border border-white/10' : 'text-text-muted hover:bg-white/5 hover:text-white border border-transparent'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span>Classes & Subjects</span>
        </a>
        <a href="#" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname?.startsWith('/mock-exams') ? 'bg-white/5 text-brand-300 font-medium border border-white/10' : 'text-text-muted hover:bg-white/5 hover:text-white border border-transparent'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Mock Exams</span>
        </a>
      </nav>

      <div className="mt-auto">
        <div className="glass p-4 rounded-xl">
          <p className="text-xs text-text-muted mb-2">Study Progress</p>
          <div className="w-full bg-black/50 rounded-full h-2 mb-1">
            <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-right text-brand-400 font-medium">{progress}%</p>
        </div>
      </div>
    </aside>
  );
}
