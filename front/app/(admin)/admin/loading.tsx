import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      
      {/* Page Header Skeleton */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default/40">
        <div className="space-y-2">
          {/* Tagline / Module name */}
          <div className="h-2.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          {/* Title */}
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        {/* Action Button */}
        <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
      </div>

      {/* Metrik Cards Grid Skeleton (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-bg-card border border-border-default/40 rounded-2xl p-5 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
            <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-2.5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Filter toolbar Skeleton */}
      <div className="bg-bg-card border border-border-default/40 rounded-2xl p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full"></div>
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full"></div>
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full"></div>
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full"></div>
        </div>
      </div>

      {/* Grid Boxed Table Skeleton */}
      <div className="bg-bg-card border border-border-default/40 rounded-2xl p-5 space-y-4">
        {/* Table Title */}
        <div className="h-3.5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>

        {/* Fake Table Grid */}
        <div className="border border-border-default/40 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 bg-bg-well/50 border-b border-border-default/40 p-4 gap-4">
            {[1, 2, 3, 4, 5].map((h) => (
              <div key={h} className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            ))}
          </div>

          {/* Table Body (5 Rows) */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div 
              key={row} 
              className="grid grid-cols-5 border-b border-border-default/30 last:border-b-0 p-4 gap-4"
            >
              {[1, 2, 3, 4, 5].map((col) => (
                <div key={col} className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
