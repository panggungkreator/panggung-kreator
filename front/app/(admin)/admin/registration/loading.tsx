import React from "react";

export default function RegistrationLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/40">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-7 w-52 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-9 w-full sm:w-64 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
      </div>

      {/* Cards Bar Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-bg-card border border-border-default/40 rounded-2xl p-3"></div>
        ))}
      </div>

      <div className="bg-bg-card border border-border-default/40 rounded-2xl p-5 space-y-4">
        <div className="border border-border-default/40 rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 bg-bg-well/50 border-b border-border-default/40 p-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <div key={h} className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-6 border-b border-border-default/30 last:border-b-0 p-4 gap-4 items-center">
              {[1, 2, 3, 4, 5, 6].map((col) => (
                <div key={col} className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
