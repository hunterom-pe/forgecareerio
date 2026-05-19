/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { User, Mail, MapPin, Briefcase, FileText, UploadCloud, Loader2, Search, Trash2, ShieldCheck, Lock, AlertCircle, CheckCircle2, Info, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { calculatePasswordStrength } from "@/lib/password";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [location, setLocation] = useState(user?.location || "");
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Modal State
  const [alert, setAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");

  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleRescan = async () => {
    if (!jobTitle || !location) return;
    setIsScanning(true);
    
    try {
      const response = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          jobTitle: jobTitle.trim(), 
          location: location.trim() 
        }),
      });
      
      if (response.ok) {
        window.location.href = "/dashboard?scan=true";
      } else {
        const errData = await response.json();
        setAlert({
          title: "Update Failed",
          message: "Could not save your new search preferences.",
          type: "error"
        });
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Rescan error:", error);
      setIsScanning(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!currentPassword || !newPassword) {
      setPasswordError("Both current and new passwords are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    
    try {
      const res = await fetch("/api/user/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      
      setPasswordSuccess("Password successfully updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.name.endsWith(".docx")) {
      setAlert({
        title: "Invalid File Type",
        message: "Please upload a .docx file only.",
        type: "warning"
      });
      return;
    }

    setIsUploading(true);
    
    // Safari-Safe: Ensure the file is captured immediately
    const fileToUpload = selectedFile;
    const formData = new FormData();
    formData.append("file", fileToUpload);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();

      if (res.ok) {
        setAlert({
          title: "Upload Successful",
          message: "Your resume has been securely stored and indexed for matching.",
          type: "success"
        });
      } else {
        setAlert({
          title: "Upload Failed",
          message: data.error || "We encountered an error while securing your file. Please try again.",
          type: "error"
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setAlert({
        title: "System Error",
        message: "An unexpected error occurred during the upload process.",
        type: "error"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewResume = async () => {
    setIsLoadingPreview(true);
    try {
      const res = await fetch("/api/user/resume/view");
      const data = await res.json();
      if (res.ok) {
        setResumeText(data.text);
        setResumeFileName(data.fileName);
        setIsPreviewing(true);
      } else {
        setAlert({ title: "View Failed", message: data.error || "Could not retrieve resume content.", type: "error" });
      }
    } catch (err) {
      setAlert({ title: "Error", message: "Failed to connect to the document server.", type: "error" });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-[15px] text-slate-500 font-medium mt-2">Manage your account details, resume, and job search preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Account Details Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Account Details</h2>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-slate-900 rounded-[24px] flex items-center justify-center text-2xl text-white font-black shadow-2xl shadow-slate-900/20">
              {initials}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{displayName}</h3>
              <div className="text-[13px] font-bold text-indigo-600 mt-1">
                {user?.tier === 'ELITE' ? 'Elite Member' : user?.tier === 'PROFESSIONAL' ? 'Pro Member' : 'Seeker Member'}
              </div>

            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" defaultValue={user?.email || ""} className="input-glass pl-12 bg-slate-50/50 text-slate-500" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" defaultValue={user?.name || ""} className="input-glass pl-12 bg-slate-50/50 text-slate-500" disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Plan & Usage Section */}
        <div className="glass-card p-8 bg-indigo-50/30 border-indigo-100 shadow-xl shadow-indigo-500/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Plan & Usage</h2>
            <div className="px-3 py-1 bg-white border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
              {(() => {
                try {
                  const d = user?.lastResetDate ? new Date(user.lastResetDate) : new Date();
                  if (isNaN(d.getTime())) return "Reset: Next Month";
                  d.setMonth(d.getMonth() + 1);
                  return `Next Reset: ${d.toLocaleDateString()}`;
                } catch (e) {
                  return "Reset: Monthly";
                }
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Optimizations', used: user?.optimizationCount || 0, limit: user?.tier === 'SEEKER' ? 1 : user?.tier === 'ELITE' ? 100 : 9999, timeframe: 'Monthly' },
              { label: 'Job Scans', used: user?.scanCount || 0, limit: user?.tier === 'SEEKER' ? 3 : user?.tier === 'ELITE' ? 50 : 9999, timeframe: 'Daily' },
              { label: 'Intel Briefs', used: user?.briefCount || 0, limit: user?.tier === 'SEEKER' ? 0 : user?.tier === 'ELITE' ? 25 : 9999, timeframe: 'Monthly' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 p-6 rounded-2xl border border-white shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{stat.timeframe}</span>
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">{stat.limit > 500 ? 'Unlimited' : `${stat.used}/${stat.limit}`}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stat.limit > 500 ? '100%' : `${(stat.used / Math.max(1, stat.limit)) * 100}%` }}
                    className={`h-full rounded-full ${stat.used >= stat.limit && stat.limit < 500 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                  />
                </div>
              </div>
            ))}
          </div>


          {user?.tier !== 'PROFESSIONAL' && (
            <div className="mt-8 pt-8 border-t border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">Need more power?</h4>
                <p className="text-sm text-slate-500 font-medium">Upgrade your plan to unlock higher limits and premium AI features.</p>
              </div>
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                {user?.tier !== 'SEEKER' && (
                  <button 
                    onClick={async () => {
                      const res = await fetch("/api/create-portal-session", { method: "POST" });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else setAlert({ title: "Portal Error", message: "Could not open your billing portal. Please try again later.", type: "error" });
                    }}
                    className="flex-1 md:flex-none px-8 py-3.5 border border-indigo-200 text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
                  >
                    Manage Subscription
                  </button>
                )}
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                >
                  {user?.tier === 'SEEKER' ? 'Upgrade to Elite' : 'View Other Plans'}
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Job Preferences Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Job Preferences</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-text" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / Remote</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY or Remote"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-text" 
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleRescan} 
            disabled={isScanning || !jobTitle || !location} 
            className="btn-primary w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-indigo-500/20"
          >
            {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {isScanning ? "Updating & Scanning..." : "Update & Rescan Jobs"}
          </button>
        </div>

        {/* Resume Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Your Resume</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center border-2 border-dashed border-slate-200/60 rounded-[24px] p-6 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-indigo-600">
              <FileText size={28} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">Active Resume</h4>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                  {user?.resumePath ? (user.resumePath.split('-').slice(2).join('-') || "Document Active") : "No File Uploaded"}
                </span>
                {user?.resumePath && (
                  <button 
                    onClick={handleViewResume}
                    disabled={isLoadingPreview}
                    className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                  >
                    {isLoadingPreview ? <Loader2 className="animate-spin" size={10} /> : <Search size={10} />}
                    View Content
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".docx"
                onChange={handleResumeUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <button disabled={isUploading} className="btn-glass px-6 py-3 flex items-center gap-2 rounded-xl text-[12px] uppercase tracking-widest pointer-events-none">
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {isUploading ? "Uploading..." : "Replace File"}
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Security</h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-2 px-1 pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${calculatePasswordStrength(newPassword).text}`}>
                        {calculatePasswordStrength(newPassword).label}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      {[0, 1, 2, 3].map((idx) => {
                        const strength = calculatePasswordStrength(newPassword);
                        const scoreMap: any = { "Weak": 1, "Fair": 2, "Good": 3, "Strong": 4, "Elite": 4 };
                        const score = scoreMap[strength.label] || 0;
                        return (
                          <div 
                            key={idx} 
                            className={`flex-1 rounded-full transition-all duration-500 ${idx < score ? strength.color : 'bg-slate-100'}`} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" 
                  />
                  {confirmNewPassword && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {newPassword === confirmNewPassword ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {passwordSuccess}
              </div>
            )}

            <button 
              type="submit"
              disabled={isUpdatingPassword}
              className="btn-glass border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              {isUpdatingPassword ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Privacy Section */}
        <div className="glass-card p-8 bg-emerald-50/30 border-emerald-100/50 shadow-xl shadow-emerald-500/5">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-emerald-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Your Privacy is Our Priority</h4>
              <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                We operate on a strict <span className="text-emerald-700 font-bold">Zero-Access Policy</span>. This means your personal data, resumes, and job matches are securely encrypted and only accessible by you. We don&apos;t have access to your private files, we never sell your data, and we don&apos;t monitor your applications. Your career journey is your business, we&apos;re just here to help you navigate it.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-panel p-8 md:p-12 border-red-100/30 bg-red-50/10 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Danger Zone</h2>
              <p className="text-[11px] font-black text-red-500 uppercase tracking-widest">Manage your career data</p>
              <p className="text-[14px] text-slate-500 font-medium max-w-md mt-4">
                Wiping your search history will permanently delete all job recommendations and tracked applications. This action cannot be undone.
              </p>
            </div>
            <button 
              onClick={() => setShowConfirmReset(true)}
              className="btn-glass border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Reset Search History
            </button>
          </div>
        </div>

        {/* Modal Logic */}
        <AnimatePresence>
          {/* Global Alert Modal */}
          {alert && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 h-screen overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={() => setAlert(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="glass-panel w-full max-w-md bg-white p-10 relative z-10 shadow-2xl border-white text-center">
                <div className={cn(
                  "w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 border",
                  alert.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                  alert.type === 'error' ? "bg-red-50 border-red-100 text-red-500" :
                  "bg-amber-50 border-amber-100 text-amber-500"
                )}>
                  {alert.type === 'success' ? <CheckCircle2 size={32} /> : alert.type === 'error' ? <AlertCircle size={32} /> : <Info size={32} />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{alert.title}</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">{alert.message}</p>
                <button onClick={() => setAlert(null)} className="btn-primary w-full py-4.5">Understood</button>
              </motion.div>
            </div>
          )}

          {/* Confirm Reset Modal */}
          {showConfirmReset && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 h-screen overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={() => setShowConfirmReset(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="glass-panel w-full max-w-md bg-white p-10 relative z-10 shadow-2xl border-white text-center">
                <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-red-100">
                  <Trash2 className="text-red-500" size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Wipe Everything?</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4 text-[15px]">This will permanently delete all your job matches and application history. <span className="text-red-600 font-bold">This cannot be undone.</span></p>
                
                <div className="flex gap-4">
                  <button onClick={() => setShowConfirmReset(false)} className="flex-1 btn-glass !py-4.5 !text-[12px]">Cancel</button>
                  <button 
                    disabled={isWiping}
                    onClick={async () => {
                      setIsWiping(true);
                      try {
                        const res = await fetch("/api/jobs/reset", { method: "POST" });
                        if (res.ok) {
                          setAlert({ title: "History Wiped", message: "Your search history has been deleted. Your dashboard is now fresh.", type: "success" });
                          setTimeout(() => window.location.reload(), 2000);
                        }
                      } catch (e) {
                        setAlert({ title: "Action Failed", message: "We couldn't reset your history. Please try again.", type: "error" });
                      } finally {
                        setShowConfirmReset(false);
                        setIsWiping(false);
                      }
                    }} 
                    className="flex-1 py-4.5 bg-red-500 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isWiping ? <Loader2 className="animate-spin" size={16} /> : "Wipe Now"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
          {/* Resume Preview Modal */}
          {isPreviewing && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 h-screen overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsPreviewing(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col border border-white"
              >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{resumeFileName || "Document Preview"}</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Read-Only Mode</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPreviewing(false)}
                    className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-50/30">
                  <div className="max-w-2xl mx-auto bg-white shadow-2xl shadow-slate-200/50 rounded-lg p-12 min-h-full border border-slate-100">
                    <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-700 selection:bg-indigo-100">
                      {resumeText}
                    </pre>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" /> Secure View Active
                  </div>
                  <button onClick={() => setIsPreviewing(false)} className="btn-primary px-8 py-3">Close Preview</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
