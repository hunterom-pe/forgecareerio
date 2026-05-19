"use client";

import { motion } from "framer-motion";

import { Star, Trash2, Sparkles, Loader2, ExternalLink, ArrowRight, BrainCircuit } from "lucide-react";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";


interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  status: 'WISHLIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  isSaved?: boolean;
  applyLink?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
}

interface JobCardProps {
  job: Job;
  index: number;
  snapshot: DraggableStateSnapshot;
  optimizingId: string | null;
  handleToggleSave: (id: string) => void;
  handleStatusChange: (id: string, status: 'WISHLIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED') => void;
  handleOptimize: (id: string) => void;
  onOpenPostMortem?: (job: Job) => void;
}



export function JobCard({ 
  job, 
  index, 
  snapshot, 
  optimizingId, 
  handleToggleSave, 
  handleStatusChange, 
  handleOptimize,
  onOpenPostMortem
}: JobCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={`glass-card p-10 group border-white/60 dark:border-white/10 shadow-xl ${snapshot.isDragging ? 'shadow-blue-500/30 scale-[1.02] ring-2 ring-blue-500/20' : 'hover:shadow-blue-500/10 hover:translate-y-[-2px]'} transition-all duration-300 cursor-grab active:cursor-grabbing`}>
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-8">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h4 className="text-2xl font-extrabold text-slate-800 dark:!text-white tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h4>
              <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white text-[10px] font-extrabold rounded-xl uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 shrink-0 relative overflow-hidden group/score">
                <div className="absolute inset-0 bg-white/20 shimmer group-hover/score:opacity-100 opacity-0 transition-opacity" />
                <span className="relative z-10">{job.matchScore}% DNA Match</span>
              </div>
            </div>
            <p className="label-mono !text-blue-600 dark:!text-blue-400 opacity-100 font-black">{job.company} <span className="mx-3 text-slate-300 dark:text-slate-600">/</span> {job.location}</p>
            {job.status === 'REJECTED' && job.rejectionReason && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.rejectionReason.split(', ').map(reason => (
                  <div key={reason} className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-full text-red-600 dark:text-red-400">
                    <BrainCircuit size={10} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 self-end md:self-center">
            <button 
              onClick={() => handleToggleSave(job.id)}
              className={`p-3 glass-card rounded-2xl transition-all duration-300 ${job.isSaved ? 'text-yellow-500 bg-yellow-50/50 border-yellow-200' : 'text-slate-300 dark:text-slate-500 hover:text-yellow-500 bg-white/80 dark:bg-slate-800/80'}`}
            >
              <Star size={20} fill={job.isSaved ? "currentColor" : "none"} />
            </button>
            <button onClick={() => handleStatusChange(job.id, 'REJECTED')} className="p-3 glass-card rounded-2xl text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors bg-white/80 dark:bg-slate-800/80"><Trash2 size={20} /></button>
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-[16px] font-semibold mb-10 line-clamp-5">{job.description}</p>

         <div className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-center justify-between pt-10 border-t border-slate-200/40 dark:border-slate-800">
          <div className="flex gap-4">
            {job.status === 'REJECTED' ? (
              <button 
                onClick={() => onOpenPostMortem?.(job)} 
                className="btn-primary py-4 px-10 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 shadow-red-600/20"
              >
                <BrainCircuit size={18} className="text-white/80" /> Log Intelligence
              </button>
            ) : (
              <button 
                onClick={() => handleOptimize(job.id)} 
                disabled={optimizingId === job.id} 
                className="btn-primary py-4 px-10 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {optimizingId === job.id ? (
                  <><Loader2 className="animate-spin" size={18} /> Optimizing...</>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/10 shimmer opacity-30" />
                    <Sparkles size={18} className="text-white/80 relative z-10" /> 
                    <span className="relative z-10">Optimize Resume</span>
                  </>
                )}
              </button>
            )}
            <a href={job.applyLink !== '#' ? job.applyLink : undefined} target="_blank" rel="noreferrer" className="btn-glass py-4 px-10 flex items-center justify-center gap-3">
              <ExternalLink size={18} /> View Source
            </a>
          </div>
          {job.status !== 'REJECTED' && (
            <button onClick={() => handleStatusChange(job.id, 'APPLIED')} className="label-mono !text-slate-400 dark:!text-slate-200 hover:!text-blue-600 transition-all flex items-center gap-3 group/btn cursor-grab active:cursor-grabbing">
              Mark as Applied <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
