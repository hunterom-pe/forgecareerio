"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Briefcase, User, LogOut, Zap, Menu, Bell, CheckCircle2, Activity, MessageSquare, Settings, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useNotifications } from "@/lib/NotificationContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ui/ThemeToggle";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FEATURE FLAGS (v2.0)
const SHOW_RESUME_ANALYZER = false;

export function DashboardLayoutClient({ children, user }: { children: React.ReactNode, user?: { name?: string | null, email?: string | null, tier?: string } }) {

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const [mainRef, setMainRef] = useState<HTMLElement | null>(null);

  // Scroll to top on navigation
  useEffect(() => {
    if (mainRef) {
      mainRef.scrollTo(0, 0);
    }
  }, [pathname, mainRef]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      addNotification({
        title: "Elite Activated",
        message: "Welcome to the inner circle. Your surgical tools are now fully unlocked.",
        type: "report"
      });
      // Clean up the URL
      router.replace(pathname);
    }
  }, [searchParams, addNotification, router, pathname]);

  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Intelligence", href: "/dashboard/intelligence", icon: Activity },
    { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
    { name: "Interviews", href: "/dashboard/interviews", icon: MessageSquare },
    ...(SHOW_RESUME_ANALYZER ? [{ name: "Analyzer", href: "/dashboard/analyzer", icon: Sparkles }] : []),
    { name: "Profile", href: "/dashboard/profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex p-4 md:p-8 gap-8 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 h-[calc(100vh-3rem)] sticky top-6 z-20">
        <div className="glass-panel h-full flex flex-col p-6 border-white/60 shadow-2xl shadow-slate-200/50 overflow-y-auto scrollbar-hide">

          <div className="flex items-center pt-10 mb-32 px-4">
            <Link href="/" className="flex items-center group">
              <span className="logo-text !text-3xl tracking-[0.3em] shimmer-text">
                FORGE
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 text-[11px] font-extrabold uppercase tracking-[0.3em] relative group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-2 active-glow" 
                      : "text-slate-400 hover:bg-blue-50/50 hover:text-blue-600 border border-transparent hover:border-blue-100/50"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-500 transition-colors")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-slate-200/40 dark:border-slate-800 mt-auto pb-6 space-y-4">
            <ThemeToggle />
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </div>


        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-3rem)] min-w-0">
        <header className="glass-panel h-20 flex items-center justify-between px-8 border-white shadow-2xl shadow-slate-200/40">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-3 glass-card rounded-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={22} />
            </button>
            <h2 className="label-mono !text-slate-400 tracking-[0.4em] hidden sm:block">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            {user?.tier === 'SEEKER' && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/pricing"
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                >
                  <Zap size={12} className="fill-current" />
                  Go Elite
                </Link>
              </motion.div>
            )}

            {user?.tier === 'ELITE' && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/pricing"
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                >
                  <Sparkles size={12} className="fill-current text-indigo-200" />
                  Go Professional
                </Link>
              </motion.div>
            )}

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-3 glass-card rounded-[18px] relative text-slate-400 hover:text-slate-900 border-white bg-white/60 hover:shadow-xl transition-all"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-red-600 rounded-full border-[3px] border-white flex items-center justify-center text-[10px] font-black text-white px-1 shadow-2xl shadow-red-500/50">
                    {unreadCount}
                  </div>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-6 w-80 sm:w-96 glass-panel border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[32px] z-50 overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-6 border-b border-slate-200/40 flex justify-between items-center bg-white/60 backdrop-blur-xl">
                      <h3 className="label-mono !text-slate-900">Intelligence</h3>
                      {unreadCount > 0 && (
                        <button onClick={() => { markAllAsRead(); setIsNotifOpen(false); }} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Clear all
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto p-4 space-y-3">
                      {notifications.length === 0 ? (
                         <div className="p-12 text-center label-mono !text-slate-300">No active intel</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { markAsRead(n.id); }}
                            className={`p-5 rounded-[20px] transition-all cursor-pointer border ${n.read ? 'opacity-40 border-transparent grayscale hover:grayscale-0' : 'bg-white shadow-xl shadow-slate-200/30 border-blue-100/50 hover:scale-[1.02]'}`}
                          >
                            <div className="flex gap-4">
                              <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-600 shadow-[0_0_10px_#3b82f6]'}`} />
                              <div>
                                <h4 className={`text-[13px] font-black mb-1.5 leading-tight ${n.type === 'report' ? 'text-purple-600' : n.type === 'radar' ? 'text-blue-600' : n.type === 'intel' ? 'text-emerald-600' : 'text-slate-900'}`}>{n.title}</h4>
                                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-5 pl-8 border-l border-slate-200/40">
              <div className="text-right hidden sm:block">
                <div className="text-[13px] font-black text-slate-900 tracking-tight leading-none">{displayName}</div>
                <div className="label-mono !text-blue-600 !text-[9px] mt-1.5 opacity-80">
                  {user?.tier === 'ELITE' ? 'Elite Member' : user?.tier === 'PROFESSIONAL' ? 'Professional Member' : 'Seeker Member'}
                </div>

              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[14px] flex items-center justify-center text-white text-xs font-black shadow-2xl shadow-blue-600/30 ring-4 ring-blue-50">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main 
          ref={setMainRef}
          className="glass-panel flex-1 p-8 md:p-12 overflow-y-auto border-white/60 shadow-2xl shadow-slate-200/50 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden p-4">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-80 glass-panel h-full flex flex-col p-8 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center group">
                <span className="text-xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
                  FORGE<span className="text-blue-600">.</span>
                </span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 text-xl font-black">✕</button>
            </div>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-[12px] font-black uppercase tracking-[0.2em]", isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-400")}>
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
