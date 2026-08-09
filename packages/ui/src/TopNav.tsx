import React from 'react';

export function TopNav() {
  // In the future, pass this down as a prop or fetch from global state
  const user = { name: "Guest Student", initials: "GS", grade: "Grade 9" };

  return (
    <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:border-brand-500/50 transition-colors">
        <svg className="w-4 h-4 text-text-muted mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text" 
          placeholder="Search topics, exams..." 
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-text-muted"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-text-muted hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-brand-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
        </button>

        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center border border-white/20">
            <span className="text-white font-medium text-sm">{user.initials}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-brand-400">{user.grade} • FBISE</p>
          </div>
        </div>
      </div>
    </header>
  );
}
