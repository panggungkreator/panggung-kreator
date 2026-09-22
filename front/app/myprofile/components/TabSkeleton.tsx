"use client";

import React from "react";
import { ProfileTab } from "./ProfileTabs";

interface TabSkeletonProps {
  activeTab: ProfileTab;
}

export default function TabSkeleton({ activeTab }: TabSkeletonProps) {
  if (activeTab === "overview") {
    return (
      <div className="w-full space-y-8 animate-pulse">
        {/* HERO SKELETON */}
        <div className="w-full flex flex-col md:flex-row items-start gap-6 sm:gap-8 pb-8 border-b border-[#212121]/10 dark:border-white/10">
          <div className="w-full sm:w-[220px] md:w-[240px] lg:w-[260px] aspect-[3/4] min-h-[320px] md:min-h-[360px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl shrink-0" />
          <div className="flex-1 w-full flex flex-col justify-end self-stretch py-0.5 space-y-4">
            <div className="space-y-2">
              <div className="h-10 sm:h-12 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-4 w-56 bg-neutral-200 dark:bg-neutral-800 rounded-md mt-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[#212121]/10 dark:border-white/10">
              <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-4 w-44 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#212121]/10 dark:border-white/10">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-8 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>

        {/* SECTION 1 SKELETON */}
        <div className="space-y-4 pt-1">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
            <div className="lg:col-span-8 h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
          </div>
        </div>

        {/* SECTION 2 SKELETON */}
        <div className="space-y-4 pt-1">
          <div className="h-6 w-56 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
            <div className="md:col-span-5 h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "attendance") {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* STATS TILES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
          ))}
        </div>

        {/* HISTORY LIST */}
        <div className="space-y-3 pt-4 border-t border-[#212121]/10 dark:border-white/10">
          <div className="h-6 w-56 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
        </div>
      </div>
    );
  }

  if (activeTab === "portfolio") {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* HEADER / TAB SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#212121]/10 dark:border-white/10 gap-3">
          <div className="h-9 w-64 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-9 w-40 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* PILLS */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>

        {/* GRID ITEMS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 overflow-hidden">
              <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "affiliate") {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* HEADER SKELETON */}
        <div className="flex items-center justify-between pb-4 border-b border-[#212121]/10 dark:border-white/10">
          <div className="h-7 w-64 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-7 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* 3 BENTO METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
          ))}
        </div>

        {/* CLIPBOARD SKELETON */}
        <div className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />

        {/* TABLE SKELETON */}
        <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
      </div>
    );
  }

  return null;
}
