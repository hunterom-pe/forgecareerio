"use client";

import { useTheme } from "../ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl w-full text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400 border border-transparent">
       <div className="w-5 h-5" />
       Loading Mode
    </div>
  );

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-5 px-6 py-4 rounded-2xl w-full text-[11px] font-extrabold uppercase tracking-[0.3em] text-slate-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100/50 dark:hover:border-blue-900/50 group"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <motion.div
          animate={{ scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1, rotate: isDark ? 90 : 0 }}
          className="absolute"
        >
          <Sun size={18} className="text-amber-500" />
        </motion.div>
        <motion.div
          animate={{ scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0, rotate: isDark ? 0 : -90 }}
          className="absolute"
        >
          <Moon size={18} className="text-indigo-400" />
        </motion.div>
      </div>
      {isDark ? "Dark Mode" : "Light Mode"}
    </button>
  );
}
