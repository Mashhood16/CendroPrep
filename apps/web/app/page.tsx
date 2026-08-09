export default function Home() {
  // In the future, this will be dynamically fetched from the database based on the logged-in user:
  const user = { firstName: "Student" };
  const metrics = {
    upcomingExams: 0,
    overallMastery: 0, // percentage
    topicsStudied: 0,
    topicsAddedThisWeek: 0,
    avgExamScore: 0, // percentage
  };

  return (
    <div className="p-8 h-full">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user.firstName} 👋
          </h1>
          <p className="text-text-muted">
            You have {metrics.upcomingExams} upcoming mock exams this week.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl hover:border-brand-500/30 transition-colors">
            <h3 className="text-sm font-medium text-text-muted mb-2">Overall Mastery</h3>
            <p className="text-4xl font-bold text-white">{metrics.overallMastery}%</p>
            <div className="mt-4 w-full bg-white/5 rounded-full h-1.5">
              <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${metrics.overallMastery}%` }}></div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl hover:border-brand-500/30 transition-colors">
            <h3 className="text-sm font-medium text-text-muted mb-2">Topics Studied</h3>
            <p className="text-4xl font-bold text-white">{metrics.topicsStudied}</p>
            <p className="text-xs text-brand-400 mt-2">+{metrics.topicsAddedThisWeek} this week</p>
          </div>

          <div className="glass p-6 rounded-2xl hover:border-brand-500/30 transition-colors">
            <h3 className="text-sm font-medium text-text-muted mb-2">Avg. Exam Score</h3>
            <p className="text-4xl font-bold text-white">{metrics.avgExamScore}%</p>
            <p className="text-xs text-brand-400 mt-2">{metrics.avgExamScore > 0 ? 'Top 20% in FBISE' : 'Take an exam to get a rank!'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl">
             <h3 className="text-lg font-bold mb-4">Generate Mock Exam</h3>
             <p className="text-sm text-text-muted mb-6">Create a custom 50-50 SLO & Standard exam for any subject.</p>
             <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-xl transition-colors">
               Start Generator
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
