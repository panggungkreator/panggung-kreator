import React from "react";

export default function AcaraDetailLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse select-none">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-default/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE DETAIL SKELETON ═══ */}
      <div className="space-y-4 md:hidden">
        {/* Card 1: Event Info Card */}
        <div className="bg-bg-card border border-border-default/70 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="pt-3 border-t border-border-default/40 space-y-2">
            <div className="h-3.5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Card 2: Attendance Card */}
        <div className="bg-bg-card border border-border-default/70 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          </div>
          <div className="space-y-2 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 w-full bg-bg-well/60 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP DETAIL SKELETON ═══ */}
      <div className="hidden md:block space-y-6">
        <div className="bg-bg-card border border-border-default/70 rounded-xl p-5 shadow-xs">
          <div className="grid grid-cols-3 gap-6 divide-x divide-border-default/40">
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg pl-6"></div>
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg pl-6"></div>
          </div>
        </div>
        <div className="h-72 w-full bg-bg-card border border-border-default/70 rounded-xl"></div>
      </div>
    </div>
  );
}
