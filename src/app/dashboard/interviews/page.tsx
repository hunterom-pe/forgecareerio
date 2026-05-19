"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Calendar, ShieldCheck, ArrowRight, BrainCircuit, Zap, Sparkles, Loader2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: string;
  matchScore: number;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [briefingJob, setBriefingJob] = useState<Job | null>(null);
  const [interviewBrief, setInterviewBrief] = useState<any>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/jobs/tracked");
        const data = await response.json();
        if (data.jobs) {
          setInterviews(data.jobs.filter((j: any) => j.status === 'INTERVIEWING'));
        }
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const handleGenerateBrief = async (job: Job) => {
    setBriefingJob(job);
    setIsGeneratingBrief(true);
    setInterviewBrief(null);
    try {
      const response = await fetch("/api/jobs/interview-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company, description: job.description })
      });
      const data = await response.json();
      if (data.brief) {
        setInterviewBrief(data.brief);
      }
    } catch (error) {
      console.error("Briefing failed:", error);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="h-64 glass-panel bg-white/50 border-white/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="heading-editorial">Interview Briefings</h1>
        <p className="label-mono opacity-70">Mission prep for your upcoming engagements</p>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-panel p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center mx-auto border border-indigo-100 shadow-xl">
            <MessageSquare className="text-indigo-600" size={32} />
          </div>
          <div className="space-y-4 max-w-sm mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-800">No active interviews</h2>
            <p className="text-[15px] text-slate-500 font-medium leading-relaxed">Drag a job into the "Interviewing" column on your dashboard to start generating intelligence briefs.</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {interviews.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden border-indigo-100/50"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">
                  {job.matchScore}% DNA
                </div>
              </div>
              <div className="space-y-1 mb-8">
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                <p className="label-mono !text-[11px] opacity-60 uppercase">{job.company}</p>
              </div>
              <button 
                onClick={() => handleGenerateBrief(job)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Launch Intel Brief <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reused Interview Brief Modal */}
      <AnimatePresence>
        {briefingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setBriefingJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-4xl bg-white/95 p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
              
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div>
                  <div className="label-mono !text-indigo-600 mb-2 flex items-center gap-2">
                    <ShieldCheck size={14} /> Classified Intelligence
                  </div>
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Interview Intelligence Brief</h2>
                  <p className="text-slate-500 mt-2 font-medium">Mission Prep for {briefingJob.title} @ {briefingJob.company}</p>
                </div>
                <button onClick={() => setBriefingJob(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={28} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-10">
                {isGeneratingBrief ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <span className="label-mono !text-slate-400 animate-pulse">Running simulations...</span>
                  </div>
                ) : interviewBrief ? (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-10">
                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Predicted Questions
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.technicalQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-[14px] font-medium text-slate-700 leading-relaxed">
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <BrainCircuit size={14} className="text-indigo-500" /> Strategy
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.behavioralQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 text-[14px] font-medium text-slate-700 leading-relaxed">
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                    <div className="space-y-10">
                      <section className="p-8 bg-slate-900 rounded-3xl text-white relative">
                        <h3 className="label-mono !text-indigo-400 mb-4 flex items-center gap-2">
                          <ShieldCheck size={14} /> Dossier
                        </h3>
                        <p className="text-[15px] leading-relaxed font-medium text-indigo-50/90">{interviewBrief.companyDossier}</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-500" /> Reverse Questions
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.reverseQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 text-[14px] font-medium text-slate-700 leading-relaxed">
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
