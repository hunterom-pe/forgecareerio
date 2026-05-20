"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap, Shield, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'quarter' | 'year'>('month');

  const handleCheckout = async (plan: 'ELITE' | 'PROFESSIONAL') => {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initiate checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-blue-200">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
              FORGE<span className="text-blue-600">.</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 transition-colors">Product</Link>
            <Link href="/pricing" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Pricing</Link>
          </div>
          <div className="flex items-center gap-6">
            {session ? (
              <Link href="/dashboard" className="btn-primary px-8 py-3.5 flex items-center gap-2">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
                <Link href="/onboarding" className="btn-primary px-8 py-3.5 hidden sm:flex items-center gap-2">
                  Start Free <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <div className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          Invest in your <span className="shimmer-text">future</span>.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Choose the plan that fits your job hunt. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* Billing Interval Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1 bg-slate-200/50 backdrop-blur-md rounded-2xl border border-slate-300/40 shadow-inner relative gap-1">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 relative z-10 ${
                billingInterval === 'month'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('quarter')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 relative z-10 ${
                billingInterval === 'quarter'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Quarterly
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
                Save 20%
              </span>
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 relative z-10 ${
                billingInterval === 'year'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Yearly
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Seeker Tier */}
          <div className="glass-card p-10 bg-white/60 border border-slate-200/60 rounded-[32px] shadow-xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-slate-400" size={24} />
              <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-600">Seeker</h2>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-slate-900">$0</span>
              <span className="text-slate-500 font-medium"> / forever</span>
            </div>
            <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed">Perfect for organizing your hunt and testing the surgical engine.</p>
            <Link href="/onboarding" className="btn-glass w-full py-4 mb-8 flex justify-center text-[12px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900">
              Get Started Free
            </Link>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Track up to 10 Jobs
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> 1 Surgical Resume Download
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Basic Kanban Tracker
              </li>
            </ul>
          </div>

          {/* Elite Tier (Middle - Highlighted) */}
          <div className="glass-card p-12 bg-slate-900 border-slate-800 rounded-[32px] shadow-2xl shadow-blue-900/20 relative transform md:-translate-y-4 active-glow group">
            <div className="absolute inset-0 bg-white/5 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[32px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
              Most Popular
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-blue-400" size={24} />
              <h2 className="text-[13px] font-black uppercase tracking-widest text-blue-400">Elite</h2>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">
                {billingInterval === 'month' ? '$15' : billingInterval === 'quarter' ? '$36' : '$119'}
              </span>
              <span className="text-slate-400 font-medium">
                {billingInterval === 'month' ? ' / month' : billingInterval === 'quarter' ? ' / 3 months' : ' / year'}
              </span>
              {billingInterval !== 'month' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {billingInterval === 'quarter' ? 'effectively $12/mo' : 'effectively $9.90/mo'}
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {billingInterval === 'quarter' ? 'Save $9' : 'Save $61'}
                  </span>
                </div>
              )}
              {billingInterval === 'month' && (
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-2">Early Adopter Pricing</p>
              )}
            </div>
            <p className="text-[14px] text-slate-300 font-medium mb-8 leading-relaxed">The standard for serious job seekers. Full AI intelligence suite.</p>
            <button 
              onClick={() => handleCheckout('ELITE')}
              disabled={loading !== null}
              className="w-full py-4 mb-8 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/30"
            >
              {loading === 'ELITE' ? 'Initializing...' : 'Go Elite'} <ArrowRight size={16} />
            </button>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Unlimited Job Tracking
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Unlimited Surgical Optimizations
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Live Negotiation Playbooks
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Interview Intelligence Briefs
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> AI Follow-up Generation
              </li>
            </ul>
          </div>

          {/* Professional Tier */}
          <div className="glass-card p-10 bg-white/60 border border-slate-200/60 rounded-[32px] shadow-xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-slate-400" size={24} />
              <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-600">Professional</h2>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-slate-900">
                {billingInterval === 'month' ? '$29' : billingInterval === 'quarter' ? '$69' : '$229'}
              </span>
              <span className="text-slate-500 font-medium">
                {billingInterval === 'month' ? ' / month' : billingInterval === 'quarter' ? ' / 3 months' : ' / year'}
              </span>
              {billingInterval !== 'month' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    {billingInterval === 'quarter' ? 'effectively $23/mo' : 'effectively $19.08/mo'}
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {billingInterval === 'quarter' ? 'Save $18' : 'Save $119'}
                  </span>
                </div>
              )}
              {billingInterval === 'month' && (
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">Early Adopter Pricing</p>
              )}
            </div>

            <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed">For high-level pivots and multi-role career management.</p>
            <button 
              onClick={() => handleCheckout('PROFESSIONAL')}
              disabled={loading !== null}
              className="btn-glass w-full py-4 mb-8 flex justify-center text-[12px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {loading === 'PROFESSIONAL' ? 'Initializing...' : 'Start Professional'}
            </button>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Everything in Elite
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Multi-Resume Personas
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Career Funnel Analytics
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Priority AI Processing
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="max-w-4xl mx-auto px-6 pb-40">
        <div className="glass-card p-12 bg-white/40 border-white/80 shadow-2xl text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-blue-100">
            <Shield className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your Privacy is Non-Negotiable</h2>
          <p className="text-[13px] font-black text-blue-600 uppercase tracking-widest mb-6">Zero-Access Policy</p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">Encrypted By Default</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Your resumes, job matches, and negotiation scripts are encrypted. Even we cannot read them.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">You Own Your Data</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">We don't sell data. We don't track your identity. Your career moves are your business, and yours alone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
