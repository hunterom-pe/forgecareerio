"use client";


import { useState, useEffect, useRef } from "react";
import { Search, Zap, ExternalLink, Loader2, Sparkles, Star, Trash2, ArrowRight, Mail, Copy, Check, X, FolderOpen, ShieldCheck, Info, BrainCircuit, DollarSign, ScrollText, Briefcase, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useNotifications } from "@/lib/NotificationContext";
import { useRouter } from "next/navigation";
import { JobCard } from "@/components/dashboard/JobCard";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { IntelModals, type InterviewBrief, type PlaybookData } from "@/components/dashboard/IntelModals";





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


import useSWR from "swr";
import { Skeleton, JobCardSkeleton, StatsSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { data: trackedData, isLoading: isTrackedLoading, mutate: mutateTracked } = useSWR("/api/jobs/tracked");
  const { data: usageData, mutate: mutateUsage } = useSWR("/api/user/usage");

  const [currentPage, setCurrentPage] = useState(0);
  const jobsPerPage = 8;
  const [isScanning, setIsScanning] = useState(false);

  const [hasScanned, setHasScanned] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [followUpJob, setFollowUpJob] = useState<Job | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [briefingJob, setBriefingJob] = useState<Job | null>(null);
  const [interviewBrief, setInterviewBrief] = useState<InterviewBrief | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [playbookJob, setPlaybookJob] = useState<Job | null>(null);
  const [playbookData, setPlaybookData] = useState<PlaybookData | null>(null);

  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [rejectionJob, setRejectionJob] = useState<Job | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const hasAutoScannedRef = useRef(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [jobType, setJobType] = useState<string>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const { notifications, addNotification, markAsRead } = useNotifications();
  const router = useRouter();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState<{ type: 'scan' | 'optimization' | 'brief' | 'playbook' } | null>(null);

  // Sync SWR data to local state. We mirror server-fetched tracked jobs into
  // local state because we also store in-memory wishlist jobs (from live scans)
  // that haven't been persisted yet. This is a legitimate use of setState in
  // an effect — see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  useEffect(() => {
    if (trackedData?.jobs) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJobs(prev => {
        const wishlistJobs = prev.filter(j => j.status === 'WISHLIST');
        const trackedJobs = trackedData.jobs;
        
        // Merge: Keep all tracked jobs, and append wishlist jobs that aren't already tracked
        const merged = [...trackedJobs];
        wishlistJobs.forEach(wj => {
          if (!merged.find(mj => mj.id === wj.id)) {
            merged.push(wj);
          }
        });
        return merged;
      });
      if (trackedData.jobs.some((j: Job) => j.status === 'WISHLIST')) {
        setHasScanned(true);
      }
    }
  }, [trackedData]);

  const usage = usageData?.usage;
  const fetchUsage = () => mutateUsage();



  const startScan = async (page = 0) => {
    // PRE-CHECK LIMITS
    if (usage && usage.scanCount >= usage.limits.scans) {
      setShowUpgradeModal({ type: 'scan' });
      return;
    }

    setIsScanning(true);

    setCurrentPage(page);
    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          page,
          jobType: jobType !== "all" ? jobType : undefined,
          remoteOnly: remoteOnly || undefined
        })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.jobs) {
          // Merge with existing jobs, but avoid duplicates
          // Flush wishlist on Page 0 to ensure fresh results for new locations/titles
          setJobs(prev => {
            // Keep jobs that are NOT in wishlist (Tracked/Applied/etc)
            const trackedJobs = prev.filter(j => j.status !== 'WISHLIST');
            
            // If it's page 0, we start fresh. If it's page > 0, we append.
            const updatedJobs = page === 0 ? [...trackedJobs] : [...prev];
            
            data.jobs.forEach((newJob: Job) => {
              const index = updatedJobs.findIndex(j => j.id === newJob.id);
              if (index !== -1) {
                updatedJobs[index] = { ...updatedJobs[index], ...newJob };
              } else {
                updatedJobs.push(newJob);
              }
            });
            return updatedJobs;
          });
          setHasScanned(true);
          mutateUsage();
        }
      } else {
        addNotification({
          title: data.error || "Scan Failed",
          message: data.message || "Something went wrong while scanning for jobs.",
          type: "intel"
        });
      }

    } catch (error) {
      console.error("Scan failed:", error);
      addNotification({
        title: "Scan Interrupted",
        message: "A network or system error occurred. Please refresh and try again.",
        type: "intel"
      });
    } finally {

      setIsScanning(false);
    }
  };

  // Trigger automatic scan if requested via URL. Guarded by a ref so this
  // only fires once per mount even if dependencies change while scanning.
  useEffect(() => {
    if (hasAutoScannedRef.current) return;
    if (!window.location.search.includes('scan=true')) return;
    if (hasScanned || isScanning) return;

    hasAutoScannedRef.current = true;
    window.history.replaceState({}, '', '/dashboard');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startScan();
  }, [hasScanned, isScanning]);

  // Scroll main container to top when page changes
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);


    const handleStatusChange = async (id: string, newStatus: Job['status']) => {
      // Optimistic UI Update
      setJobs(prev => prev.map(job => job.id === id ? { ...job, status: newStatus } : job));

      // Sync to Database
      const jobToUpdate = jobs.find(j => j.id === id);
      if (jobToUpdate) {
        try {
          await fetch("/api/jobs/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus })
          });
        } catch (error) {
          console.error("Failed to sync job status to DB:", error);
        }
      }
    };

    const handleSaveRejection = async (id: string, reason: string, notes: string) => {
      setJobs(prev => prev.map(job => job.id === id ? { ...job, rejectionReason: reason, rejectionNotes: notes } : job));
      
      try {
        await fetch("/api/jobs/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, rejectionReason: reason, rejectionNotes: notes })
        });
      } catch (error) {
        console.error("Failed to save rejection intelligence:", error);
      }
    };


    const handleDelete = (id: string) => {
      setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
      if (!deleteConfirmId) return;
      const id = deleteConfirmId;
      setDeleteConfirmId(null);
      
      // Optimistic UI Update
      setJobs(prev => prev.filter(job => job.id !== id));

      try {
        await fetch("/api/jobs/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isDeleted: true })
        });
        addNotification({
          title: "Application Removed",
          message: "The job has been removed from your tracker.",
          type: "intel"
        });
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    };

    const handleToggleSave = async (id: string) => {
      const job = jobs.find(j => j.id === id);
      if (!job) return;
      
      const newSavedState = !job.isSaved;

      // Optimistic UI Update
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isSaved: newSavedState } : j));

      try {
        await fetch("/api/jobs/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isSaved: newSavedState })
        });
        
        if (newSavedState) {
          addNotification({
            title: "Job Pinned",
            message: "This job will now stay at the top of your radar.",
            type: "intel"
          });
        }
      } catch (error) {
        console.error("Failed to toggle save:", error);
      }
    };

  const handleOptimize = async (id: string) => {
    // PRE-CHECK LIMITS
    if (usage && usage.optimizationCount >= usage.limits.optimizations) {
      setShowUpgradeModal({ type: 'optimization' });
      return;
    }

    const job = jobs.find(j => j.id === id);

    if (!job) return;
    setOptimizingId(id);
    try {
      const response = await fetch("/api/jobs/search", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'optimize', jobDescription: job.description, jobId: job.id }) 
      });
      console.log("Optimization Response Status:", response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log("Blob received, size:", blob.size);
        if (blob.size === 0) throw new Error("Received an empty file from the server.");
        
        console.log("Download starting for optimized resume...");
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = 'none';
        a.href = url;
        a.download = `Forge_${job.company}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        handleStatusChange(id, 'APPLIED');
        
        addNotification({
          title: "Optimization Complete",
          message: "Your resume has been surgically optimized and downloaded.",
          type: "intel"
        });
      } else {
        const errorData = await response.json();
        addNotification({
          title: errorData.error || "Optimization Failed",
          message: errorData.message || "Could not optimize resume. Please check your AI key or resume format.",
          type: "intel"
        });
      }

    } catch (error) {
      console.error("Optimization failed:", error);
      addNotification({
        title: "Connection Error",
        message: "Failed to connect to the optimization engine.",
        type: "intel"
      });
    } finally {
      setOptimizingId(null);
    }
  };

  const handleFollowUp = async (job: Job) => {
    setFollowUpJob(job);
    setIsGeneratingEmail(true);
    setGeneratedEmail("");
    try {
      const response = await fetch("/api/jobs/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company })
      });
      const data = await response.json();
      if (data.email) {
        setGeneratedEmail(data.email);
      }
    } catch (error) {
      console.error("Follow-up failed:", error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleGenerateBrief = async (job: Job) => {
    // PRE-CHECK LIMITS
    if (usage && usage.briefCount >= usage.limits.briefs) {
      setShowUpgradeModal({ type: 'brief' });
      return;
    }

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
      if (response.ok) {
        setInterviewBrief(data.brief);
      } else {
        addNotification({
          title: data.error || "Briefing Failed",
          message: data.message || "Could not generate intel brief.",
          type: "intel"
        });
        setBriefingJob(null);
      }

    } catch (error) {
      console.error("Briefing failed:", error);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleGeneratePlaybook = async (job: Job) => {
    // PRE-CHECK LIMITS (Seeker is always locked)
    if (usage && usage.tier === 'SEEKER') {
      setShowUpgradeModal({ type: 'playbook' });
      return;
    }

    setPlaybookJob(job);

    setIsGeneratingPlaybook(true);
    setPlaybookData(null);
    try {
      const response = await fetch("/api/jobs/negotiation-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company, matchScore: job.matchScore })
      });
      const data = await response.json();
      if (response.ok) {
        setPlaybookData(data.playbook);
      } else {
        addNotification({
          title: data.error || "Playbook Failed",
          message: data.message || "Could not generate negotiation playbook.",
          type: "intel"
        });
        setPlaybookJob(null);
      }

    } catch (error) {
      console.error("Playbook failed:", error);
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    // 1. Handle reordering within the same column
    if (source.droppableId === destination.droppableId) {
      if (source.index === destination.index) return;
      
      const columnJobs = jobs.filter(j => j.status === source.droppableId);
      const otherJobs = jobs.filter(j => j.status !== source.droppableId);
      
      const newColumnJobs = Array.from(columnJobs);
      const [removed] = newColumnJobs.splice(source.index, 1);
      newColumnJobs.splice(destination.index, 0, removed);
      
      setJobs([...otherJobs, ...newColumnJobs]);
      return;
    }

    // 2. Handle moving between columns
    handleStatusChange(draggableId, destination.droppableId as Job['status']);

    // Trigger Interview Intel
    if (destination.droppableId === 'INTERVIEWING') {
      const job = jobs.find(j => j.id === draggableId);
      if (job) {
        addNotification({
          title: "Interview Intel",
          message: `You're interviewing with ${job.company}! We've automatically generated a custom 1-page interview cheat sheet based on their exact job description. Click here to view.`,
          type: "intel"
        });
      }
    }
    if (destination.droppableId === 'REJECTED') {
      const job = jobs.find(j => j.id === draggableId);
      if (job) {
        setRejectionJob(job);
      }
    }
  };




  const wishlistJobs = jobs.filter(j => j.status === 'WISHLIST')
    .sort((a, b) => {
      // Starred jobs always come first
      if (a.isSaved && !b.isSaved) return -1;
      if (!a.isSaved && b.isSaved) return 1;
      // Then sort by match score
      return b.matchScore - a.matchScore;
    });
  const paginatedWishlist = wishlistJobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);
  const totalPages = Math.ceil(wishlistJobs.length / jobsPerPage);

  if (isTrackedLoading && !hasScanned) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <div className="grid xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-8">
            <Skeleton className="h-6 w-32 rounded-lg mb-4" />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
          <div className="xl:col-span-4 space-y-6">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-full w-full rounded-[32px] min-h-[500px]" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-4">
        <div className="space-y-2">
          <h1 className="heading-editorial">Job Recommendations</h1>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`p-3 rounded-2xl border transition-all duration-300 ${isFiltersOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
            title="Search Filters"
          >
            <FolderOpen size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startScan(0)} 
            disabled={isScanning} 
            className="btn-primary flex items-center gap-3 px-6 py-3.5"
          >
            {isScanning ? (
              <><Loader2 className="animate-spin" size={18} /> Scanning...</>
            ) : (
              <>
                <Search size={18} /> 
                {hasScanned ? "Search" : "Find Jobs"}
                {usage && usage.tier !== 'PROFESSIONAL' && (
                  <span className="ml-1 opacity-50 font-bold">({usage.limits.scans - usage.scanCount}/{usage.limits.scans})</span>
                )}
              </>
            )}
          </motion.button>

        </div>
      </div>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 bg-white/50 border-white/80 shadow-xl mb-8 flex flex-wrap items-center gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Type</label>
                <div className="flex gap-2">
                  {['all', 'fulltime', 'contract', 'internship'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setJobType(type)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${jobType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-10 w-[1px] bg-slate-200/50 hidden md:block" />

              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Remote Preference</p>
                  <p className="text-[10px] font-medium text-slate-400">Force remote-only results</p>
                </div>
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${remoteOnly ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ x: remoteOnly ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasScanned && !isScanning ? (
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-panel p-20 text-center space-y-12 relative overflow-hidden bg-white/40"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600/0 via-blue-600/40 to-blue-600/0" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative group">
              <div className="absolute inset-0 bg-blue-500/5 rounded-[32px] animate-pulse" />
              <BrainCircuit className="text-blue-600 relative z-10" size={48} />
              
              {/* Floating micro-icons */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-50"
              >
                <Sparkles className="text-amber-400" size={18} />
              </motion.div>
            </div>

            <div className="space-y-4 max-w-lg mx-auto mb-12">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                Ready to find <span className="text-blue-600">your next job?</span>
              </h2>
              <p className="text-[17px] text-slate-500 font-medium leading-relaxed">
                You haven&apos;t tracked any jobs yet. Start a scan to find roles that match your background.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startScan(0)} 
                className="btn-primary px-16 py-5 rounded-[20px] shadow-[0_20px_40px_rgba(37,99,235,0.25)] flex items-center gap-4 text-lg"
              >
                <Search size={20} />
                Find Jobs {usage && usage.tier !== 'PROFESSIONAL' && <span className="text-white/40 font-bold text-sm">({usage.limits.scans - usage.scanCount}/{usage.limits.scans})</span>}
              </motion.button>
            </div>

          </div>
        </motion.div>
      ) : isScanning ? (
        <div className="glass-panel p-24 text-center space-y-12 relative overflow-hidden border-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="scan-line !h-[2px] !bg-blue-500 !shadow-[0_0_20px_#3b82f6] !animation-duration-[2.5s]" />
          <div className="space-y-8 relative z-10">
            <div className="flex justify-center gap-6">
              {['Indeed', 'LinkedIn', 'Glassdoor'].map((site) => (
                <div key={site} className="px-6 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.4em] shadow-2xl border border-white/20">{site}</div>
              ))}
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Searching global job boards...</h2>
            <div className="max-w-lg mx-auto h-3 bg-slate-200/40 rounded-full overflow-hidden p-[2px] border border-white/20">
              <motion.div className="h-full bg-blue-600 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.6)]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4 }} />
            </div>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-2">
                <span className="label-mono">Matches found: {wishlistJobs.length}</span>
              </div>

              <Droppable droppableId="WISHLIST">
                {(provided) => (
                  <div 
                    className="space-y-6 min-h-[200px]" 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedWishlist.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <JobCard 
                                job={job} 
                                index={index} 
                                snapshot={snapshot}
                                optimizingId={optimizingId}
                                handleToggleSave={handleToggleSave}
                                handleStatusChange={handleStatusChange}
                                handleOptimize={handleOptimize}
                                onOpenPostMortem={setRejectionJob}
                              />

                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    
                    {wishlistJobs.length > 0 && (
                      <div className="flex items-center justify-between pt-8 px-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Showing {currentPage * jobsPerPage + 1} - {Math.min((currentPage + 1) * jobsPerPage, wishlistJobs.length)} of {wishlistJobs.length} matches
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setCurrentPage(prev => Math.max(0, prev - 1)); }}
                            disabled={currentPage === 0}
                            className="btn-glass px-4 py-2 rounded-xl text-[10px] font-black uppercase disabled:opacity-30"
                          >
                            Prev
                          </button>
                          <button 
                            onClick={() => {
                              if ((currentPage + 1) * jobsPerPage >= wishlistJobs.length) {
                                startScan(currentPage + 1);
                              } else {
                                setCurrentPage(prev => prev + 1);
                              }
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={isScanning}
                            className="btn-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                          >
                            {isScanning ? "..." : "Next"}
                          </button>
                        </div>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <KanbanBoard 
                jobs={jobs}
                handleDelete={handleDelete}
                setViewJob={setViewJob}
                handleFollowUp={handleFollowUp}
                handleGenerateBrief={handleGenerateBrief}
                handleGeneratePlaybook={handleGeneratePlaybook}
                onOpenPostMortem={setRejectionJob}
              />


            </div>
          </div>
        </DragDropContext>
      )}
    </div>

      <IntelModals 
        followUpJob={followUpJob}
        setFollowUpJob={setFollowUpJob}
        isGeneratingEmail={isGeneratingEmail}
        generatedEmail={generatedEmail}
        briefingJob={briefingJob}
        setBriefingJob={setBriefingJob}
        isGeneratingBrief={isGeneratingBrief}
        interviewBrief={interviewBrief}
        playbookJob={playbookJob}
        setPlaybookJob={setPlaybookJob}
        isGeneratingPlaybook={isGeneratingPlaybook}
        playbookData={playbookData}
        viewJob={viewJob}
        setViewJob={setViewJob}
        deleteConfirmId={deleteConfirmId}
        setDeleteConfirmId={setDeleteConfirmId}
        confirmDelete={confirmDelete}
        copyToClipboard={copyToClipboard}
        hasCopied={hasCopied}
        rejectionJob={rejectionJob}
        setRejectionJob={setRejectionJob}
        onSaveRejection={handleSaveRejection}
      />

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
              onClick={() => setShowUpgradeModal(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="glass-panel w-full max-w-lg bg-white p-12 relative z-10 shadow-2xl border-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mb-8 border border-blue-100 mx-auto">
                <Zap className="text-blue-600" size={32} />
              </div>

              <div className="text-center space-y-4 mb-10">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                  {showUpgradeModal.type === 'scan' ? 'Daily Scans Full' : 
                   showUpgradeModal.type === 'optimization' ? 'Optimizations Used' : 
                   'Feature Locked'}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed px-4">
                  {showUpgradeModal.type === 'scan' ? `You've used all ${usage?.limits.scans} of your daily scans. Upgrade to Elite for 50 scans per day.` : 
                   showUpgradeModal.type === 'optimization' ? `You've used your ${usage?.limits.optimizations} monthly optimization. Upgrade to Elite for unlimited power.` : 
                   "This advanced AI feature is reserved for our Elite and Professional members."}
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => router.push('/pricing')}
                  className="btn-primary w-full py-5 text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                >
                  View Elite Plans <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => setShowUpgradeModal(null)}
                  className="w-full py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Stack */}

      <div className="fixed bottom-8 right-8 z-[200] space-y-4 w-full max-w-sm">
        <AnimatePresence>
          {notifications.filter(n => !n.read).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="glass-panel !p-6 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-white/80 flex gap-4 items-start relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">{n.title}</h4>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
              </div>
              <button 
                onClick={() => markAsRead(n.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </>

  );
}
