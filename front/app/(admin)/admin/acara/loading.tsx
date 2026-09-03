import React from "react";

export default function AcaraLoading() {
  return (
    <div className="space-y-6 pb-28 animate-pulse select-none">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/40">
        <div className="space-y-2">
          {/* Tagline */}
          <div className="h-2.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          {/* Title */}
          <div className="h-7 w-52 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-full sm:w-64 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="hidden sm:block h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
      </div>

      {/* ═══ MOBILE CARDS SKELETON (Visible on mobile) ═══ */}
      <div className="space-y-4 md:hidden">
        {/* Section title */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>

        {/* Event Cards Skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-default/70 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs"
          >
            {/* Top row: Status pill & Type */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>

            {/* Middle: Title & Time */}
            <div className="space-y-2 py-1">
              <div className="h-5 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>

            {/* Bottom row: Date/Location & Avatars */}
            <div className="pt-3 border-t border-border-default/40 flex items-end justify-between gap-3">
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 ring-2 ring-bg-card"></div>
                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 ring-2 ring-bg-card"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ DESKTOP TABLE SKELETON (Visible on md/lg) ═══ */}
      <div className="hidden md:block space-y-4">
        {/* Filter Toolbar */}
        <div className="flex items-center gap-4 py-1">
          <div className="h-9 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-9 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-9 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>

        {/* Boxed Table Skeleton */}
        <div className="bg-bg-card border border-border-default/40 rounded-2xl p-5 space-y-4">
          <div className="border border-border-default/40 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-6 bg-bg-well/50 border-b border-border-default/40 p-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((h) => (
                <div key={h} className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              ))}
            </div>

            {/* Rows */}
            {[1, 2, 3, 4, 5].map((row) => (
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
