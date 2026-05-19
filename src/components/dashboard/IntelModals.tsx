"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Check, Copy, ShieldCheck, Zap, BrainCircuit, Info, DollarSign, ScrollText, Briefcase, Trash2, ExternalLink } from "lucide-react";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  status: 'WISHLIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  applyLink?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
}

export interface InterviewBrief {
  technicalQuestions: string[];
  behavioralQuestions: string[];
  companyDossier: string;
  reverseQuestions: string[];
}

export interface PlaybookData {
  salaryRange: string;
  leveragePoints: string[];
  negotiationScript: string;
  benefitsChecklist: string[];
}


interface IntelModalsProps {
  // Follow-up
  followUpJob: Job | null;
  setFollowUpJob: (job: Job | null) => void;
  isGeneratingEmail: boolean;
  generatedEmail: string;
  
  // Briefing
  briefingJob: Job | null;
  setBriefingJob: (job: Job | null) => void;
  isGeneratingBrief: boolean;
  interviewBrief: InterviewBrief | null;
  
  // Playbook
  playbookJob: Job | null;
  setPlaybookJob: (job: Job | null) => void;
  isGeneratingPlaybook: boolean;
  playbookData: PlaybookData | null;
  
  // Job Details
  viewJob: Job | null;
  setViewJob: (job: Job | null) => void;
  
  // Delete
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  confirmDelete: () => void;
  
  // Shared
  copyToClipboard: (text: string) => void;
  hasCopied: boolean;
  
  // Rejection
  rejectionJob: Job | null;
  setRejectionJob: (job: Job | null) => void;
  onSaveRejection: (id: string, reason: string, notes: string) => void;
}



export function IntelModals({
  followUpJob, setFollowUpJob, isGeneratingEmail, generatedEmail,
  briefingJob, setBriefingJob, isGeneratingBrief, interviewBrief,
  playbookJob, setPlaybookJob, isGeneratingPlaybook, playbookData,
  viewJob, setViewJob,
  deleteConfirmId, setDeleteConfirmId, confirmDelete,
  copyToClipboard, hasCopied,
  rejectionJob, setRejectionJob, onSaveRejection
}: IntelModalsProps) {


  return (
    <>
      {/* Follow-up Email Modal */}
      <AnimatePresence>
        {followUpJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setFollowUpJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-2xl bg-white/90 p-10 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="label-mono !text-blue-600 mb-2">Automated Follow-up</div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Email Draft</h2>
                  <p className="text-sm text-slate-500 mt-1">Draft for {followUpJob.company}</p>
                </div>
                <button onClick={() => setFollowUpJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="glass-card bg-slate-50/50 p-6 rounded-2xl border-slate-200/50 relative">
                {isGeneratingEmail ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="label-mono !text-slate-400">Synthesizing follow-up...</span>
                  </div>
                ) : (
                  <>
                    <pre className="text-slate-700 text-sm font-medium whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedEmail}
                    </pre>
                    <button 
                      onClick={() => copyToClipboard(generatedEmail)}
                      className="absolute top-4 right-4 p-3 bg-white border border-slate-200 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-slate-600 hover:text-blue-600"
                      title="Copy to clipboard"
                    >
                      {hasCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-between items-center">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" /> Intelligence by Forge AI
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setFollowUpJob(null)} className="btn-glass px-8">Close</button>
                  <button onClick={() => copyToClipboard(generatedEmail)} disabled={!generatedEmail} className="btn-primary px-8 flex items-center gap-2">
                    {hasCopied ? "Copied!" : "Copy Email"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interview Brief Modal */}
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
                    <div className="relative">
                      <Loader2 className="animate-spin text-indigo-600" size={48} />
                      <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                    </div>
                    <span className="label-mono !text-slate-400 animate-pulse">Running job-specific simulations...</span>
                  </div>
                ) : interviewBrief ? (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-10">
                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Predicted Technical Questions
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
                          <BrainCircuit size={14} className="text-indigo-500" /> Behavioral Strategy
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.behavioralQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 text-[14px] font-medium text-slate-700 leading-relaxed">
                              <div className="text-[10px] font-black uppercase text-indigo-600 mb-2 opacity-50">Predicting:</div>
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-10">
                      <section className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <Info size={80} />
                        </div>
                        <h3 className="label-mono !text-indigo-400 mb-4 flex items-center gap-2">
                          <ShieldCheck size={14} /> Company Dossier
                        </h3>
                        <p className="text-[15px] leading-relaxed font-medium text-indigo-50/90">
                          {interviewBrief.companyDossier}
                        </p>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-500" /> Reverse Questions (Ask Them)
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.reverseQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 text-[14px] font-medium text-slate-700 leading-relaxed flex items-start gap-4">
                              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 label-mono text-red-500">Failed to decrypt intelligence data.</div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/40 flex justify-between items-center shrink-0">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" /> Compiled via Forge Intelligence Hub
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setBriefingJob(null)} className="btn-glass px-10">Dismiss</button>
                  <button onClick={() => window.print()} className="btn-primary px-10 bg-indigo-600 hover:bg-indigo-700">Print Briefing</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Negotiation Playbook Modal */}
      <AnimatePresence>
        {playbookJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setPlaybookJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-4xl bg-white/95 p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
              
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div>
                  <div className="label-mono !text-emerald-600 mb-2 flex items-center gap-2">
                    <DollarSign size={14} /> Negotiation Playbook
                  </div>
                  <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">The Winning Leverage</h2>
                  <p className="text-slate-500 mt-2 font-medium">Strategic Defense for {playbookJob.title} @ {playbookJob.company}</p>
                </div>
                <button onClick={() => setPlaybookJob(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={28} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-10">
                {isGeneratingPlaybook ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <Loader2 className="animate-spin text-emerald-600" size={48} />
                      <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                    </div>
                    <span className="label-mono !text-slate-400 animate-pulse">Calculating market leverage...</span>
                  </div>
                ) : playbookData ? (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-10">
                      <section className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-600">
                          <DollarSign size={80} />
                        </div>
                        <h3 className="label-mono !text-emerald-700 mb-4 flex items-center gap-2 text-[10px]">
                          Market Benchmark
                        </h3>
                        <div className="text-4xl font-black text-emerald-900 tracking-tighter mb-2">{playbookData.salaryRange}</div>
                        <p className="text-[13px] font-medium text-emerald-700 opacity-80">Estimated US National average for this seniority.</p>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Your Leverage Points
                        </h3>
                        <div className="space-y-3">
                          {playbookData.leveragePoints.map((p: string, i: number) => (
                            <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl text-[14px] font-medium text-slate-700 leading-relaxed shadow-sm">
                              {p}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-10">
                      <section className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="label-mono !text-emerald-600 !text-[10px] tracking-[0.2em]">Negotiation Script</h3>
                          <button onClick={() => copyToClipboard(playbookData?.negotiationScript || "")} className="text-[10px] font-black uppercase text-emerald-600 hover:underline">Copy Script</button>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-3xl text-slate-300 text-[13px] font-medium leading-relaxed font-sans whitespace-pre-wrap">
                          {playbookData.negotiationScript}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Briefcase size={14} className="text-slate-500" /> Benefits Checklist
                        </h3>
                        <div className="space-y-3">
                          {playbookData.benefitsChecklist.map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <Check size={16} className="text-emerald-500" />
                              <span className="text-[13px] font-medium text-slate-600">{item}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 label-mono text-red-500">Failed to generate playbook.</div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/40 flex justify-between items-center shrink-0">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" /> Strategy by Forge AI
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setPlaybookJob(null)} className="btn-glass px-10">Close</button>
                  <button onClick={() => copyToClipboard(playbookData?.negotiationScript || "")} disabled={!playbookData} className="btn-primary px-10 bg-emerald-600 hover:bg-emerald-700">Copy Strategy</button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Details Modal */}
      <AnimatePresence>
        {viewJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setViewJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-3xl bg-white/95 p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200" />
              
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{viewJob.title}</h2>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">
                      {viewJob.matchScore}% Match
                    </div>
                  </div>
                  <p className="label-mono !text-slate-400 !text-[12px]">{viewJob.company} <span className="mx-2 opacity-30">/</span> {viewJob.location}</p>
                </div>
                <button onClick={() => setViewJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-8">
                <div className="space-y-4">
                  <h3 className="label-mono !text-slate-900 !text-[11px] uppercase tracking-widest">Full Description</h3>
                  <div className="text-slate-600 text-[15px] font-medium leading-relaxed font-sans whitespace-pre-wrap">
                    {viewJob.description}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/40 flex justify-between items-center shrink-0">
                <a 
                  href={viewJob.applyLink !== '#' ? viewJob.applyLink : undefined} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  <ExternalLink size={14} /> View Original Source
                </a>
                <button onClick={() => setViewJob(null)} className="btn-primary px-10">Close Details</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post-Mortem Rejection Modal */}
      <AnimatePresence>
        {rejectionJob && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-md"
              onClick={() => setRejectionJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-xl bg-white/95 p-10 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-white overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
              
              <div className="flex justify-between items-start mb-8 shrink-0">
                <div>
                  <div className="label-mono !text-red-600 mb-2 flex items-center gap-2">
                    <BrainCircuit size={14} /> Post-Mortem Intelligence
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">What happened?</h2>
                  <p className="text-slate-500 mt-2 font-medium">Record feedback for {rejectionJob.company}</p>
                </div>
                <button onClick={() => setRejectionJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Reason</label>
                  <div className="flex flex-wrap gap-2">
                    {['Skills Gap', 'Culture Fit', 'Compensation', 'Ghosted', 'Timing/Budget', 'Other'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const currentReasons = rejectionJob.rejectionReason ? rejectionJob.rejectionReason.split(', ') : [];
                          let newReasons;
                          if (currentReasons.includes(tag)) {
                            newReasons = currentReasons.filter(r => r !== tag);
                          } else {
                            newReasons = [...currentReasons, tag];
                          }
                          const updatedJob = { ...rejectionJob, rejectionReason: newReasons.join(', ') };
                          setRejectionJob(updatedJob);
                        }}
                        className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                          rejectionJob.rejectionReason?.split(', ').includes(tag) 
                            ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20" 
                            : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Notes</label>
                  <textarea 
                    className="input-glass w-full h-32 p-5 bg-slate-50/50 resize-none"
                    placeholder="What specific feedback did they give? Any lessons for the next one?"
                    value={rejectionJob.rejectionNotes || ""}
                    onChange={(e) => {
                      const updatedJob = { ...rejectionJob, rejectionNotes: e.target.value };
                      setRejectionJob(updatedJob);
                    }}
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4 shrink-0">
                <button onClick={() => setRejectionJob(null)} className="flex-1 btn-glass">Dismiss</button>
                <button 
                  onClick={() => {
                    onSaveRejection(rejectionJob.id, rejectionJob.rejectionReason || 'Other', rejectionJob.rejectionNotes || '');
                    setRejectionJob(null);
                  }}
                  className="flex-1 btn-primary bg-slate-900 text-white hover:bg-black"
                >
                  Save Intelligence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-panel w-full max-w-md bg-white p-10 relative z-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] border-white text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-red-100">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Remove Job?</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">This application will be permanently removed from your tracker. This action cannot be undone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 btn-glass !py-4.5 !text-[12px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4.5 bg-red-500 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
