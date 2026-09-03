import React from "react";

export default function PackagesLoading() {
  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-pulse select-none">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/40">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-7 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
      </div>

      {/* Stats Summary Horizontal Pills Skeleton */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl flex items-center gap-1.5 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        ))}
      </div>

      {/* ═══ MOBILE CARDS SKELETON (Visible on mobile) ═══ */}
      <div className="space-y-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-default/70 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            </div>

            {/* Middle */}
            <div className="space-y-2 py-1">
              <div className="h-5 w-2/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3.5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>

            {/* Bottom row */}
            <div className="pt-3 border-t border-border-default/40 flex items-center justify-between gap-3">
              <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="flex gap-1.5">
                {[1, 2].map((b) => (
                  <div key={b} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ DESKTOP TABLE SKELETON (Visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <div className="border border-border-default/40 rounded-xl overflow-hidden m-4">
            <div className="grid grid-cols-6 bg-bg-well/50 border-b border-border-default/40 p-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((h) => (
                <div key={h} className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              ))}
            </div>
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="grid grid-cols-6 border-b border-border-default/30 last:border-b-0 p-4 gap-4 items-center"
              >
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <div key={col} className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
