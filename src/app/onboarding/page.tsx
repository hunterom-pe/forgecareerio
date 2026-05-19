/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Upload, Search, MapPin, CheckCircle2, Loader2, Zap, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTier, setSelectedTier] = useState<"SEEKER" | "ELITE" | "PROFESSIONAL">("SEEKER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login?signup=true");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: targetRole, location, tier: selectedTier }),
      });

      if (res.ok) {
        if (selectedTier === 'SEEKER') {
          router.push("/dashboard?scan=true");
          router.refresh();
        } else {
          // Trigger Stripe Checkout for paid tiers
          const checkoutRes = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: selectedTier }),
          });
          
          const checkoutData = await checkoutRes.json();
          
          if (checkoutData.url) {
            window.location.href = checkoutData.url;
          } else {
            // Show error details if available
            setAlert({
              title: "Payment Setup Failed",
              message: checkoutData.details || checkoutData.error || "We couldn't connect to Stripe. Please try again or contact support.",
              type: "error"
            });
            setIsSubmitting(false);
          }
        }
      } else {
        const data = await res.json();
        setAlert({
          title: "Setup Failed",
          message: data.error || "We couldn't save your profile preferences. Please try again.",
          type: "error"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".docx")) {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          startAnalysis();
        } else {
          setAlert({
            title: "Upload Failed",
            message: "We encountered an error while securing your resume. Please try again.",
            type: "error"
          });
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.error("Upload error:", err);
        setAlert({
          title: "System Error",
          message: "An unexpected error occurred during the upload process.",
          type: "error"
        });
        setIsAnalyzing(false);
      }
    } else {
      setAlert({
        title: "Invalid File",
        message: "Please upload a .docx file only to ensure the engine can parse your skills correctly.",
        type: "warning"
      });
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    const statuses = ["Reading your resume...", "Extracting your skills...", "Setting up your profile...", "Almost done!"];
    let i = 0;
    const interval = setInterval(() => {
      setAnalysisStatus(statuses[i]);
      i++;
      if (i === statuses.length) {
        clearInterval(interval);
        setTimeout(() => { setIsAnalyzing(false); setStep(2); }, 800);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans relative overflow-hidden">
      {/* Immersive Light Background Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />
      
      {/* Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="logo-text text-2xl">
          FORGE
        </Link>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase mb-2">
                  Step 1 of 3
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Upload your resume
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
                  Provide your most up-to-date `.docx` file. We&apos;ll use this to build your profile and find matching jobs.
                </p>
              </div>

              {!isAnalyzing ? (
                <div className="relative group cursor-pointer">
                  {/* Hover Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-[2rem] blur opacity-10 group-hover:opacity-30 transition duration-500" />
                  
                  <div className="relative bg-white p-16 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300">
                    <input type="file" accept=".docx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-slate-200/50 group-hover:scale-110 group-hover:border-blue-400/30 transition-all duration-500">
                        <Upload className="text-blue-600" size={32} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-slate-800">Drag & drop or browse</p>
                        <p className="text-sm font-medium text-slate-400">Microsoft Word (.docx) only</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-white p-16 rounded-[2rem] border border-blue-100 text-center space-y-8 overflow-hidden shadow-2xl shadow-blue-500/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent scan-line !animation-duration-[2s]" />
                  <div className="relative z-10 space-y-8">
                    <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                      <Zap className="text-blue-500 animate-pulse" size={32} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{analysisStatus}</p>
                      <p className="text-sm font-bold text-blue-500 uppercase tracking-widest opacity-80">Please wait</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Resume Uploaded
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
                  Your profile is ready. Now, tell us what kind of opportunities you&apos;re looking for.
                </p>
              </div>

              <div className="bg-white p-10 space-y-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Role</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="e.g. Senior UX Designer" 
                      className="w-full pl-14 pr-6 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Remote, San Francisco, or New York" 
                      className="w-full pl-14 pr-6 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(3)} 
                  disabled={!targetRole || !location}
                  className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-xl disabled:opacity-50 mt-4 shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:shadow-[0_0_60px_rgba(37,99,235,0.3)] transition-all duration-300"
                >
                  Continue to Plans <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="space-y-8">

              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-600 text-[10px] font-black tracking-[0.2em] uppercase mb-2">
                  Final Step
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Choose your speed
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
                  Select the membership that fits your career goals. You can change this anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'SEEKER', name: 'Seeker', price: 'Free', desc: 'Core job search tools', perks: ['1 Optimization/mo', '3 Daily Scans'] },
                  { id: 'ELITE', name: 'Elite', price: '$15', desc: 'Accelerated placement', perks: ['100 Optimizations/mo', 'Intel Briefs', 'Negotiation Playbooks'] },
                  { id: 'PROFESSIONAL', name: 'Professional', price: '$29', desc: 'White-glove career hunt', perks: ['Unlimited Everything', 'Priority Support', 'Strategy Call'] }
                ].map((plan) => (

                  <button
                    key={plan.id}
                    onClick={() => setSelectedTier(plan.id as any)}
                    className={`relative p-8 rounded-[2rem] border-2 text-left transition-all duration-500 group ${
                      selectedTier === plan.id 
                      ? 'bg-white border-blue-500 shadow-2xl shadow-blue-500/10 scale-[1.02]' 
                      : 'bg-white/50 border-slate-100 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                        <p className="text-sm font-medium text-slate-400">{plan.desc}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">{plan.price}</div>
                        {plan.price !== 'Free' && <div className="text-[10px] font-bold text-slate-400 uppercase">per month</div>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {plan.perks.map(perk => (
                        <span key={perk} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">{perk}</span>
                      ))}
                    </div>
                    {selectedTier === plan.id && (
                      <motion.div layoutId="activePlan" className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                        <CheckCircle2 size={16} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleCompleteOnboarding} 
                disabled={isSubmitting}
                className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-xl disabled:opacity-50 shadow-[0_0_40px_rgba(37,99,235,0.2)]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Launch my Career <ArrowRight size={20} /></>}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Global Alert Modal */}
      <AnimatePresence>
        {alert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={() => setAlert(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="glass-panel w-full max-w-md bg-white p-10 relative z-10 shadow-2xl border-white text-center">
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 border ${
                alert.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                alert.type === 'error' ? "bg-red-50 border-red-100 text-red-500" :
                "bg-amber-50 border-amber-100 text-amber-500"
              }`}>
                {alert.type === 'success' ? <CheckCircle2 size={32} /> : alert.type === 'error' ? <Zap className="fill-current" size={32} /> : <FileText size={32} />}
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{alert.title}</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">{alert.message}</p>
              <button onClick={() => setAlert(null)} className="btn-primary w-full py-4.5">Understood</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
