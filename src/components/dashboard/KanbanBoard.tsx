"use client";

import { motion } from "framer-motion";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2, Eye, ExternalLink, Mail, FolderOpen, DollarSign, Zap, Sparkles, Star, BrainCircuit } from "lucide-react";


import { LucideIcon } from "lucide-react";

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


interface KanbanBoardProps {
  jobs: Job[];
  handleDelete: (id: string) => void;
  setViewJob: (job: Job) => void;
  handleFollowUp: (job: Job) => void;
  handleGenerateBrief: (job: Job) => void;
  handleGeneratePlaybook: (job: Job) => void;
  onOpenPostMortem?: (job: Job) => void;
}


const kanbanColumns: { name: Job['status']; title: string; color: string; icon: LucideIcon }[] = [
  { name: 'APPLIED', title: 'Applied', color: 'blue', icon: Zap },
  { name: 'INTERVIEWING', title: 'Interviewing', color: 'amber', icon: Sparkles },
  { name: 'OFFER', title: 'Offer', color: 'emerald', icon: Star },
  { name: 'REJECTED', title: 'Rejected', color: 'slate', icon: Trash2 },
];


export function KanbanBoard({ 
  jobs, 
  handleDelete, 
  setViewJob, 
  handleFollowUp, 
  handleGenerateBrief, 
  handleGeneratePlaybook,
  onOpenPostMortem
}: KanbanBoardProps) {

  return (
    <div className="space-y-8">
      {kanbanColumns.map(col => {
        const columnJobs = jobs.filter(j => j.status === col.name);
        const Icon = col.icon;
        return (
          <div key={col.name} className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border border-white/60 dark:border-white/10 bg-${col.color}-500/10 text-${col.color}-600 dark:text-${col.color}-400`}>
                  <Icon size={16} />
                </div>
                <span className="text-[12px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">{col.title}</span>
              </div>
              <span className={`text-[10px] font-black text-${col.color}-600 dark:text-${col.color}-400 bg-${col.color}-50 dark:bg-${col.color}-950/30 px-3 py-1 rounded-lg border border-${col.color}-100 dark:border-${col.color}-900/50 shadow-sm`}>{columnJobs.length}</span>
            </div>
            
            <Droppable droppableId={col.name}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`glass-card p-5 min-h-[140px] space-y-4 transition-all duration-300 relative overflow-hidden ${snapshot.isDraggingOver ? `bg-${col.color}-50/40 dark:bg-${col.color}-900/10 border-${col.color}-300/50 scale-[1.01] ring-4 ring-${col.color}-500/5` : 'bg-white/10 dark:bg-black/10 border-white/40 dark:border-white/5'}`}
                >
                  {columnJobs.length === 0 && !snapshot.isDraggingOver ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3 opacity-30">
                      <div className={`w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center`}>
                        <Icon size={20} className="text-slate-300 dark:text-slate-700" />
                      </div>
                      <span className="label-mono !text-[9px] !tracking-[0.5em] text-slate-400 dark:text-slate-600">Empty Radar</span>
                    </div>
                  ) : null}

                  {columnJobs.map((job, index) => (
                    <Draggable key={job.id} draggableId={job.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.draggableProps} 
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                        >
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`glass-card p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border-white/60 dark:border-white/10 shadow-xl group/card relative ${snapshot.isDragging ? `shadow-${col.color}-500/30 scale-105 ring-2 ring-${col.color}-500/20` : 'shadow-slate-200/20 dark:shadow-black/20 hover:shadow-blue-500/5'} cursor-grab active:cursor-grabbing`}
                          >
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-xl opacity-0 group-hover/card:opacity-100 z-10"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <h5 className="text-[14px] font-black text-slate-900 dark:!text-white mb-1 leading-tight">{job.title}</h5>
                              <div className={`label-mono !text-${col.color}-600 dark:!text-${col.color}-400 !text-[9px] tracking-[0.1em] opacity-80`}>{job.company}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setViewJob(job); }}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                                title="View Description"
                              >
                                <Eye size={14} />
                              </button>
                              {job.applyLink && job.applyLink !== '#' && (
                                <a 
                                  href={job.applyLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                                  title="View Original Post"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                          
                          {col.name === 'APPLIED' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleFollowUp(job); }}
                              className="mt-4 w-full py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Mail size={12} /> Write Follow-up
                            </button>
                          )}

                          {col.name === 'INTERVIEWING' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleGenerateBrief(job); }}
                              className="mt-4 w-full py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <FolderOpen size={12} /> Intel Brief
                            </button>
                          )}

                          {col.name === 'OFFER' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleGeneratePlaybook(job); }}
                              className="mt-4 w-full py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <DollarSign size={12} /> Negotiate
                            </button>
                          )}

                          {col.name === 'REJECTED' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onOpenPostMortem?.(job); }}
                              className="mt-4 w-full py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-red-100 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <BrainCircuit size={12} /> Post-Mortem
                            </button>
                          )}

                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        );
      })}
    </div>
  );
}
