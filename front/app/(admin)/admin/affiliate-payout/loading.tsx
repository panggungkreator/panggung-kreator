import React from "react";

export default function AffiliatePayoutLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-border-default">
        <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-default rounded-2xl p-5 min-h-[120px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded my-2" />
            <div className="h-2.5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border-default">
          <div className="h-6 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-9 w-60 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
