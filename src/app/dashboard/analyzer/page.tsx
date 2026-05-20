"use client";

import { useState } from "react";
import useSWR from "swr";
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  FileDown, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowRight, 
  Info,
  CircleAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useNotifications } from "@/lib/NotificationContext";

// Simple fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch");
  }
  return res.json();
};

export default function ResumeAnalyzerPage() {
  const [useMock, setUseMock] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const { addNotification } = useNotifications();

  // Load analyzer data using SWR (updates automatically when toggle changes)
  const { data, error, isLoading, mutate } = useSWR(
    `/api/resume/analyze?mock=${useMock}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const handleRewrite = async () => {
    if (!data?.cons) return;
    setIsRewriting(true);

    try {
      const response = await fetch("/api/resume/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cons: data.cons }),
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size === 0) throw new Error("Empty document downloaded.");

        // Start file download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "Forge_Refined_Resume.docx";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        addNotification({
          title: "Forge Complete",
          message: "Your resume has been fully rewritten and downloaded successfully.",
          type: "intel",
        });
      } else {
        const errorData = await response.json();
        addNotification({
          title: "Rewrite Failed",
          message: errorData.error || "Could not complete automated rewrite.",
          type: "intel",
        });
      }
    } catch (err) {
      console.error(err);
      addNotification({
        title: "Connection Error",
        message: "Failed to connect to the resume rewrite engine.",
        type: "intel",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  // UI state checks based on SWR payload
  const hasResume = !error || (error instanceof Error && !error.message.includes("No resume uploaded"));
  const tier = data?.tier || "SEEKER";
  const isSeeker = tier === "SEEKER";
  const isElite = tier === "ELITE";
  const isProfessional = tier === "PROFESSIONAL";

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
        <div className="space-y-2">
          <h1 className="heading-editorial">Resume Analyzer</h1>
          <p className="text-[13px] text-slate-400 font-medium">
            AI-driven recruiter critiques and metrics analysis.
          </p>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-900/40 p-2.5 rounded-[18px] border border-slate-200/40 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Demo Mock Data</span>
          <button
            onClick={() => setUseMock(!useMock)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${useMock ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
          >
            <motion.div
              animate={{ x: useMock ? 24 : 0 }}
              className="w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel p-24 text-center space-y-8 relative overflow-hidden border-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Analyzing Resume Structure...</h2>
            <p className="text-[14px] text-slate-400 font-medium max-w-md mx-auto">
              Surgically analyzing bullet counts, parsing verb selections, and checking for quantifiable business impact.
            </p>
          </div>
        </div>
      )}

      {/* Error / Upload Resume State */}
      {!isLoading && error && (
        <div className="glass-panel p-16 text-center space-y-8 max-w-2xl mx-auto bg-white/40">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/20 rounded-[24px] flex items-center justify-center mx-auto border border-blue-100/50">
            <CircleAlert className="text-blue-600" size={36} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">No Resume Uploaded</h2>
            <p className="text-[14px] text-slate-400 font-medium">
              We couldn&apos;t find an uploaded resume for your account. Head to your profile settings to upload a resume `.docx` first.
            </p>
          </div>
          <div>
            <Link 
              href="/dashboard/profile"
              className="btn-primary inline-flex items-center gap-3 px-8 py-3.5"
            >
              Go to Profile Settings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Core Analysis Dashboard */}
      {!isLoading && !error && data && (
        <div className="space-y-10">
          
          {/* Section 1: The Score Overview */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* The Ring Gauge Card */}
            <div className="lg:col-span-5 glass-panel p-10 flex flex-col items-center justify-center text-center bg-white/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-600/30 to-blue-600/0" />
              
              {/* Radial Progress Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-slate-100 dark:stroke-slate-800" 
                    strokeWidth="8" fill="transparent" 
                  />
                  <motion.circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-blue-600" 
                    strokeWidth="8" fill="transparent"
                    strokeDasharray={263.8}
                    initial={{ strokeDashoffset: 263.8 }}
                    animate={{ strokeDashoffset: 263.8 - (263.8 * data.score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {data.grade}
                  </span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Score: {data.score}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Your Resume Strength
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                  {data.score >= 85 
                    ? "Excellent performance! Ready to target competitive corporate roles." 
                    : data.score >= 70 
                    ? "Decent foundation. Adding metrics and active verbs will elevate it." 
                    : "Crucial improvements needed to clear standard applicant tracking systems (ATS)."}
                </p>
              </div>
            </div>

            {/* Overall Summary Card */}
            <div className="lg:col-span-7 glass-panel p-10 flex flex-col justify-center bg-white/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Recruiter Feedback
                </h3>
              </div>

              <p className="text-[15px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
                {isSeeker 
                  ? "Based on a structural audit, we evaluated your resume against current hiring standards. Complete metrics analytics, formatting strengths, and passive language audits are available in the diagnostic panels below."
                  : `Your resume shows a raw score of ${data.score}/100. Recruiter analysis indicates a strong baseline of skills, but specific bullet optimizations are required to increase conversion rates for competitive roles.`}
              </p>

              <div className="flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5 py-1 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Info size={12} /> Format: Standard docx
                </span>
                <span className="flex items-center gap-1.5 py-1 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  Tier: {tier} Member
                </span>
              </div>
            </div>

          </div>

          {/* Section 2: Detailed Diagnostics (Pros & Cons) */}
          <div className="grid md:grid-cols-2 gap-8 items-stretch relative">
            
            {/* The Pros Panel */}
            <div className="glass-panel p-8 bg-white/40 flex flex-col">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-6 flex items-center gap-2">
                <ThumbsUp size={16} /> What is Working Well
              </h4>
              
              <div className="space-y-4 flex-1">
                {isSeeker ? (
                  // Blurred Pro Content Placeholder
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800 blur-[4px] select-none opacity-40">
                      <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-5/6" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))
                ) : (
                  data.pros?.map((pro: string, idx: number) => (
                    <div 
                      key={idx}
                      className="flex gap-4 p-5 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="p-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-full shrink-0 w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                      <p className="text-[13px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        {pro}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* The Cons Panel */}
            <div className="glass-panel p-8 bg-white/40 flex flex-col">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-6 flex items-center gap-2">
                <ThumbsDown size={16} /> Areas to Improve
              </h4>

              <div className="space-y-4 flex-1">
                {isSeeker ? (
                  // Blurred Con Content Placeholder
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800 blur-[4px] select-none opacity-40">
                      <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-5/6" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))
                ) : (
                  data.cons?.map((con: string, idx: number) => (
                    <div 
                      key={idx}
                      className="flex gap-4 p-5 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full shrink-0 w-6 h-6 flex items-center justify-center">
                        ✕
                      </div>
                      <p className="text-[13px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        {con}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* GATING OVERLAY: SEEKER TIER */}
            {isSeeker && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-8 bg-slate-900/5 backdrop-blur-[6px] rounded-[32px] overflow-hidden">
                <div className="glass-panel p-10 max-w-md text-center space-y-6 shadow-2xl border-white bg-white/90">
                  <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center mx-auto border border-blue-100/50 text-blue-600">
                    <Lock size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Unlock Analysis Details</h3>
                    <p className="text-[13px] text-slate-500 font-semibold leading-relaxed">
                      Upgrade to the Elite plan to view what is working well, identify exact resume flaws, and view detailed improvement suggestions.
                    </p>
                  </div>
                  <div>
                    <Link
                      href="/pricing"
                      className="btn-primary w-full flex items-center justify-center gap-3 py-3.5"
                    >
                      Upgrade to Elite <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Section 3: Recommendations & Suggestions */}
          <div className="glass-panel p-8 bg-white/40 relative">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              Actionable Recommendations
            </h4>

            <div className="space-y-4 mb-8">
              {isSeeker ? (
                // Seeker suggestions preview (blurred)
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl blur-[3px] select-none opacity-30">
                    <div className="h-4 bg-slate-200 rounded w-11/12" />
                  </div>
                ))
              ) : (
                data.suggestions?.map((sug: string, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start py-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-100/40">
                      {idx + 1}
                    </span>
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                      {sug}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Action Bar (The Rewrite Engine) */}
            <div className="border-t border-slate-200/40 dark:border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h5 className="text-[13px] font-black text-slate-900 dark:text-white tracking-tight">
                  Automated Resume Optimizer
                </h5>
                <p className="text-[12px] text-slate-400 font-medium">
                  Let AI surgically rewrite your summary and experience to fix these criticisms instantly.
                </p>
              </div>

              <div>
                <button
                  onClick={handleRewrite}
                  disabled={isRewriting || !isProfessional}
                  className={`btn-primary flex items-center gap-3 px-8 py-3.5 disabled:opacity-20 ${!isProfessional ? "cursor-not-allowed" : ""}`}
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Refining...
                    </>
                  ) : (
                    <>
                      <FileDown size={16} /> Forge Refined Version
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* GATING OVERLAY: ELITE/SEEKER FOR REWRITE */}
            {!isProfessional && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-8 bg-slate-900/[0.02] backdrop-blur-[3px] rounded-[32px] overflow-hidden">
                <div className="glass-card p-6 bg-white border-slate-200/80 shadow-2xl flex flex-col sm:flex-row items-center gap-6 max-w-xl">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0 border border-indigo-100/50">
                    <Lock size={20} />
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <h5 className="text-[13px] font-black text-slate-950 uppercase tracking-wider">
                      Auto-Rewrite Gated
                    </h5>
                    <p className="text-[12px] text-slate-500 font-semibold leading-relaxed">
                      Upgrade to Professional to unlock the automated rewrite engine and download optimized `.docx` versions instantly.
                    </p>
                  </div>
                  <div>
                    <Link
                      href="/pricing"
                      className="btn-glass flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:text-white"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
