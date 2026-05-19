"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Target, Shield, Zap, ArrowRight, BrainCircuit, BarChart3, Clock, Sparkles, Loader2, Info, Lock } from "lucide-react";
import { Skeleton, StatsSkeleton } from "@/components/ui/Skeleton";

export default function IntelligencePage() {
  const { data: intelData, isLoading: isIntelLoading } = useSWR("/api/jobs/intelligence", {
    refreshInterval: 60000 // Refresh every minute
  });
  
  const { data: userData } = useSWR("/api/user/usage");

  if (isIntelLoading || !intelData) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <StatsSkeleton />
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-10">
            <Skeleton className="h-96 w-full rounded-[32px]" />
          </div>
          <div className="lg:col-span-5 space-y-10">
            <Skeleton className="h-64 w-full rounded-[32px]" />
            <Skeleton className="h-80 w-full rounded-[32px]" />
          </div>
        </div>
      </div>
    );
  }

  const data = intelData;
  const usage = userData?.usage;

  const statsWithIcons = data.stats.map((stat: any) => {
    if (stat.label === "Weekly Velocity") return { ...stat, icon: TrendingUp };
    if (stat.label === "Avg DNA Match") return { ...stat, icon: Target };
    return { ...stat, icon: Shield };
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="heading-editorial shimmer-text inline-block">Intelligence Hub</h1>
          <p className="label-mono opacity-70">Strategic search audit and market analysis</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
          <Clock size={16} className="animate-pulse" />
          <span className="label-mono !text-[11px]">Last Sync: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {statsWithIcons.map((stat: any, i: number) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-600 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider text-${stat.color}-600 bg-${stat.color}-50 px-2.5 py-1 rounded-lg`}>
                {stat.sub}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Search Friction Analysis */}
        <div className="lg:col-span-7 space-y-10">
          <div className="glass-panel p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-red-600" size={22} />
                <h2 className="text-xl font-extrabold text-slate-800">Search Friction</h2>
              </div>
              <span className="label-mono !text-[10px] text-red-500">Rejection Audit</span>
            </div>

            {data.friction && data.friction.length > 0 ? (
              <div className="space-y-8">
                {data.friction.map((item: any) => (
                  <div key={item.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-extrabold text-slate-700 flex items-center gap-2">
                        {item.name}
                      </span>
                      <span className="label-mono !text-slate-900">{item.count} Signal{item.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic border-t border-slate-100 pt-6">
                  <Info size={14} className="inline mr-2 text-slate-400" />
                  These signals represent friction points identified in your Post-Mortem notes.
                </p>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300">
                  <Target size={32} />
                </div>
                <div className="max-w-xs">
                  <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inconclusive Data</p>
                  <p className="text-[12px] text-slate-400 font-medium">Log your first "Post-Mortem" rejection to identify search friction patterns.</p>
                </div>
              </div>
            )}
          </div>

          {/* Market Skills from Scans */}
          <div className="glass-panel p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-indigo-600" size={22} />
                <h2 className="text-xl font-extrabold text-slate-800">Market Skills</h2>
              </div>
              <span className="label-mono !text-[10px]">From Your Scans</span>
            </div>

            <div className="space-y-8">
              {data.marketSkills.map((skill: any) => (
                <div key={skill.name} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-slate-700 flex items-center gap-2">
                      {skill.name}
                      {skill.trending && <Sparkles size={14} className="text-amber-500" />}
                    </span>
                    <span className="label-mono !text-slate-900">{skill.level}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Trends */}
          <div className="glass-panel p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-500" size={22} />
                <h2 className="text-xl font-extrabold text-slate-800">Industry Trends</h2>
              </div>
              <span className="label-mono !text-[10px]">Market Benchmarks</span>
            </div>

            <div className="space-y-8">
              {data.industryTrends.map((trend: any) => (
                <div key={trend.name} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-slate-700 flex items-center gap-2">
                      {trend.name}
                    </span>
                    <span className="label-mono !text-slate-900">{trend.level}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${trend.level}%` }}
                      className="h-full rounded-full bg-slate-400" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Strategic Insight & Usage */}
        <div className="lg:col-span-5 space-y-10">
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            className="glass-panel p-10 bg-gradient-to-br from-slate-900 to-slate-800 border-none relative overflow-hidden active-glow"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={120} className="text-white" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                <Sparkles size={24} className="text-indigo-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-white text-2xl font-extrabold tracking-tight italic">Strategic Audit</h3>
                <p className="text-slate-300 text-[15px] font-medium leading-relaxed">
                  "{data.insight}"
                </p>
              </div>
              <div className="h-[1px] w-full bg-white/10" />
              <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Deep Analysis Complete</p>
            </div>
          </motion.div>

          {/* Usage Command Center */}
          <div className="glass-panel p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-indigo-600" size={20} />
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Search Quotas</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${usage?.tier === 'ELITE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {usage?.tier || 'Seeker'} Tier
              </span>
            </div>

            <div className="space-y-8">
              {[
                { label: 'Market Scans', current: usage?.scanCount, max: usage?.limits.scans, color: 'blue' },
                { label: 'Resume Optimizations', current: usage?.optimizationCount, max: usage?.limits.optimizations, color: 'indigo' },
                { label: 'Intelligence Briefs', current: usage?.briefCount, max: usage?.limits.briefs, color: 'violet' }
              ].map((quota) => (
                <div key={quota.label} className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                    <span>{quota.label}</span>
                    <span>{quota.current} / {quota.max}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((quota.current / quota.max) * 100, 100)}%` }}
                      className={`h-full bg-${quota.color}-600 rounded-full`}
                    />
                  </div>
                  {quota.max === 0 && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Lock size={10} /> Upgrade to Unlock
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              onClick={async () => {
                const res = await fetch("/api/create-portal-session", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else window.location.href = '/pricing';
              }}
              className="w-full py-4 bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-3"
            >
              Upgrade Subscription <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
