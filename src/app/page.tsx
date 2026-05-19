"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, Search, Zap, FileText, CheckCircle2, 
  Shield, Target, Sparkles, Mail, ShieldCheck, 
  BrainCircuit, DollarSign, ExternalLink, Play 
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-[1200px] mx-auto glass-panel px-10 py-4 flex justify-between items-center border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <Link href="/" className="logo-text !text-2xl tracking-[0.4em] flex items-center gap-2">
            FORGE
          </Link>
          <div className="hidden md:flex items-center gap-12">
            <Link href="#features" className="label-mono !text-slate-900 opacity-60 hover:opacity-100 transition-all">Engine</Link>
            <Link href="#intelligence" className="label-mono !text-slate-900 opacity-60 hover:opacity-100 transition-all">Intelligence</Link>
            <Link href="/pricing" className="label-mono !text-slate-900 opacity-60 hover:opacity-100 transition-all">Pricing</Link>
            <Link href="/support" className="label-mono !text-slate-900 opacity-60 hover:opacity-100 transition-all">Support</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link href="/login" className="btn-primary !py-3 !px-8">Get Started</Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section: Cinematic Launch */}
      <section ref={containerRef} className="relative pt-48 pb-12 overflow-hidden bg-mesh-glow">
        <div className="max-w-[1400px] mx-auto px-8 md:px-20 text-center relative z-10">
          
          <motion.div 
            style={{ opacity, scale }}
            className="space-y-12 mb-24"
          >
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm"
            >
              <Sparkles size={14} className="animate-pulse" /> AI-Powered Job Search v2.0
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <motion.h1 variants={fadeInUp} className="text-7xl md:text-[110px] font-black text-slate-900 tracking-tighter leading-[0.85]">
                Get Seen By More <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent text-glow-blue">Hiring Managers.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed tracking-tight">
                We find the perfect roles for your background and automatically optimize your resume to guarantee you stand out in the pile.
              </motion.p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row justify-center gap-8 pt-6"
            >
              <Link href="/pricing" className="btn-pill-blue !px-14 !py-6 text-base group">
                Go Elite <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
              </Link>
              <Link href="/login?signup=true" className="btn-pill-gray !px-14 !py-6 text-base flex items-center gap-3">
                Start Free <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Product Reveal: The Dashboard Mockup (Now independent of the hero fade) */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="glass-panel p-4 md:p-6 bg-white/40 border-white/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative z-10 rounded-[48px]">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[32px] border border-white/50 bg-slate-50">
                <Image 
                  src="/hero-mockup.png" 
                  alt="Forge Dashboard" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Bento: The Core Engine */}
      <section id="features" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="space-y-4 max-w-xl">
              <div className="label-mono !text-blue-600">The Core Engine</div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">Built for High-Growth Professionals.</h2>
            </div>
            <p className="text-xl text-slate-500 font-medium max-w-sm pb-2 leading-relaxed">Everything you need to forge your path and dominate the application process.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 h-auto md:h-[650px]">
            {/* Bento 1: Deep Scan */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-7 bento-card p-12 flex flex-col justify-between group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -mr-20 -mt-20 transition-all duration-500 group-hover:scale-110" />
              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Search className="text-white" size={28} />
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Surgical Deep Scan</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">Our crawler bypasses the noise, scanning 50+ global job boards in real-time to find roles that match your DNA score.</p>
              </div>
              <div className="pt-8 flex gap-4">
                {['LinkedIn', 'Indeed', 'Ottis', 'Greenhouse'].map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">{tag}</span>
                ))}
              </div>
            </motion.div>

            {/* Bento 2: DNA Match */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-5 bento-card p-12 flex flex-col justify-center text-center bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative group"
            >
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-center mx-auto border border-white/30 pulse-glow">
                  <Target className="text-white" size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black tracking-tight">DNA Matching</h3>
                  <p className="text-blue-100 text-lg font-medium">98% Accuracy in profile-to-job alignment. No more "maybe" applications.</p>
                </div>
                <div className="text-6xl font-black text-white/20 tracking-tighter group-hover:text-white/40 transition-colors">98.4%</div>
              </div>
            </motion.div>

            {/* Bento 3: Resume Morph */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-12 bento-card p-12 flex flex-col md:flex-row items-center gap-12 bg-slate-50/50 border-slate-200/50"
            >
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mx-auto md:mx-0">
                  <FileText className="text-white" size={28} />
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Auto-Optimization Engine</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">The engine surgically rewrites your professional summary and experience bullets to mirror the job description's terminology. Real-time ATS hacking.</p>
              </div>
              <div className="flex-1 w-full max-w-md space-y-4">
                <div className="glass-card p-6 bg-white border-slate-100 shadow-sm opacity-90 scale-95 blur-[1px]">
                  <p className="text-[10px] font-black uppercase text-slate-700 mb-2">Original Bullet</p>
                  <p className="text-sm font-medium text-slate-800 italic">"Responsible for managing team projects and hitting deadlines."</p>
                </div>
                <div className="glass-card p-6 bg-blue-600 text-white border-blue-500 shadow-2xl relative">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <Zap size={18} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-blue-50 mb-2 tracking-widest">Optimized Bullet</p>
                  <p className="text-sm font-bold leading-relaxed">"Orchestrated cross-functional Agile workflows to deliver high-stakes product releases with a 98% on-time completion rate."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Intelligence Section: Beyond The Application */}
      <section id="intelligence" className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.03),transparent_50%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto mb-24">
            <div className="label-mono !text-indigo-600">The Intelligence Suite</div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Win Before The Interview Starts.</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">Our AI doesn't stop at the application. We provide the tactical intelligence you need to dominate the entire hiring cycle.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Intelligence Card 1: Interview Brief */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-panel p-12 space-y-10 bg-white/80 border-white/90 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <ShieldCheck className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Surgical Interview Briefs</h3>
              </div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">We analyze the JD to predict exact technical and behavioral questions you'll face. We even build a "Company Dossier" on their likely values and culture.</p>
              <div className="space-y-4">
                {['Predicted Questions', 'Company Dossier', 'Reverse Strategy'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Intelligence Card 2: Negotiation Playbook */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-panel p-12 space-y-10 bg-white/80 border-white/90 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <DollarSign className="text-emerald-600" size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Negotiation Playbooks</h3>
              </div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">Don't leave money on the table. We calculate your market leverage and provide scripts for a 10-15% increase in base salary.</p>
              <div className="space-y-4">
                {['Market Benchmarks', 'Leverage Points', 'Negotiation Scripts'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA: Final Launch */}
      <section className="py-40 relative">
        <div className="max-w-[1200px] mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="bg-white border border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] rounded-[64px] p-20 md:p-32 text-center space-y-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.08),transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(79,70,229,0.05),transparent_70%)] pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">Ready for the <br /> <span className="text-blue-600">new elite?</span></h2>
              <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">Join the top 5% of candidates who forge their path and land interviews with surgical precision.</p>
            </div>
            
            <div className="relative z-10 pt-8 flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/login" className="btn-pill-blue !px-16 !py-6 !text-base">Create Free Account</Link>
              <Link href="/support" className="btn-pill-gray !px-16 !py-6 !text-base !bg-slate-50 !border-slate-200 !text-slate-600 hover:!bg-white">Contact Support</Link>
            </div>

            <div className="pt-12 flex justify-center items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 relative z-10">
              <span>No Credit Card</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span>Instant Access</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span>Full Privacy</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto px-8 grid md:grid-cols-12 gap-16">
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="logo-text !text-3xl">FORGE</Link>
            <p className="text-slate-500 font-medium leading-relaxed">The only surgical intelligence engine built to automate the high-growth job search. Forge your professional path.</p>
            <div className="flex gap-4">
              {/* Social icons placeholder */}
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><Target size={18} /></div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><FileText size={18} /></div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><Mail size={18} /></div>
            </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="label-mono !text-slate-900">Product</h3>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Surgical Scan</Link></li>
                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Optimization Engine</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="label-mono !text-slate-900">Intelligence</h3>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="#intelligence" className="hover:text-blue-600 transition-colors">Interview Briefs</Link></li>
                <li><Link href="#intelligence" className="hover:text-blue-600 transition-colors">Salary Leverage</Link></li>
                <li><Link href="#intelligence" className="hover:text-blue-600 transition-colors">Career Dossier</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="label-mono !text-slate-900">Company</h3>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link></li>
                <li><Link href="/support" className="hover:text-blue-600 transition-colors">Support Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">© 2026 FORGE SYSTEMS • ALL RIGHTS RESERVED</div>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <Shield size={12} className="text-emerald-500" /> BANK-LEVEL SECURITY • AES-256 ENCRYPTED
          </div>
        </div>
      </footer>
    </div>
  );
}
