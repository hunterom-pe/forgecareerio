"use client";

import { useState } from "react";
import useSWR from "swr";
import { Download, ExternalLink, Calendar, CheckCircle2, X, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton, JobCardSkeleton } from "@/components/ui/Skeleton";

interface Application {
  id: string;
  company: string;
  title: string;
  createdAt: string;
  status: string;
  applyLink: string;
  description: string;
}

export default function ApplicationsPage() {
  const { data: appData, isLoading: isAppsLoading, mutate: mutateApps } = useSWR("/api/jobs/tracked");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (app: Application) => {
    setIsDownloading(app.id);
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: 'optimize', 
          jobDescription: app.description || "",
          jobId: app.id
        }),
      });

      if (!res.ok) throw new Error("Optimization failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Optimized_Resume_${app.company}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate resume. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    
    try {
      const res = await fetch("/api/jobs/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDeleted: true }),
      });

      if (res.ok) {
        mutateApps();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (isAppsLoading || !appData) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      </div>
    );
  }

  const applications = (appData.jobs || []).filter((j: any) => j.status !== 'WISHLIST');

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Applications</h1>
        <p className="text-slate-500 font-medium">History of all resumes optimized for specific roles.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-20 text-center space-y-6 bg-white/40 border-white/60">
          <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No applications yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Once you optimize a resume for a job match, it will appear here for you to download and track.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden bg-white/60 border-white/80 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100/50">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Role & Company</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Date</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                <AnimatePresence>
                  {applications.map((app: any) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-white/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-lg tracking-tight">{app.title}</div>
                          <div className="text-[12px] font-black text-indigo-500 uppercase tracking-widest">{app.company}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                          <CheckCircle2 size={12} /> {app.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                          <Calendar size={14} className="opacity-40" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          {app.applyLink && app.applyLink !== '#' && (
                            <a 
                              href={app.applyLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 glass-card rounded-xl text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 active:scale-95 bg-white/80"
                              title="View Original Post"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                          <button 
                            onClick={() => handleDownload(app)}
                            disabled={isDownloading === app.id}
                            className="p-2.5 glass-card rounded-xl text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 active:scale-95 bg-white/80 disabled:opacity-50"
                          >
                            {isDownloading === app.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Download size={18} />
                            )}
                          </button>
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="p-2.5 glass-card rounded-xl text-slate-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95 bg-white/80"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
