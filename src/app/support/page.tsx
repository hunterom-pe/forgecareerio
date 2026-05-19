"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
      {/* Mesh Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-400/10 blur-[120px]" />

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-6">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <Link href="/" className="logo-text !text-2xl tracking-[0.4em] flex items-center gap-2">
            FORGE
          </Link>
          <Link href="/" className="label-mono flex items-center gap-2 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-[800px] mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
            <MessageSquare size={14} /> Support Command Center
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            How can we <span className="text-blue-600">help?</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Have a question about the engine or need technical assistance? Our surgical support team is standing by.
          </p>
        </motion.div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Message Received</h2>
              <p className="text-slate-500 font-medium">
                Our team has been notified. You can expect a response at <strong>{formData.email}</strong> within 24 hours.
              </p>
            </div>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              Return to Dashboard
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 md:p-12 shadow-2xl shadow-slate-200/50"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-mono ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="input-glass"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-mono ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@company.com" 
                    className="input-glass"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-mono ml-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="How can we help?" 
                  className="input-glass"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="label-mono ml-1">Message</label>
                <textarea 
                  rows={6}
                  placeholder="Describe your inquiry in detail..." 
                  className="input-glass resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required 
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-primary py-5 flex items-center justify-center gap-3 text-base uppercase tracking-[0.2em]"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-600 font-medium flex items-center justify-center gap-2">
            <Mail size={16} /> Direct inquiries: <a href="mailto:hello@forgecareer.io" className="text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:decoration-blue-600">hello@forgecareer.io</a>
          </p>
        </div>
      </main>
    </div>
  );
}
