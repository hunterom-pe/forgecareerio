"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg",
            className
          )}
        />
      ))}
    </>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="glass-card p-8 border-white/60 dark:border-white/5 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-panel p-8 space-y-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-32 h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
