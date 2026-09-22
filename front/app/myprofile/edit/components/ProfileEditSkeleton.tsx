"use client";

import React from "react";

export default function ProfileEditSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-16 font-sans text-text-primary">
      {/* HEADER SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-bg-well border border-border-default shrink-0" />
          <div className="space-y-2">
            <div className="w-36 h-3 bg-bg-well rounded" />
            <div className="w-56 h-7 bg-bg-well rounded-lg" />
            <div className="w-72 sm:w-96 max-w-full h-3.5 bg-bg-well rounded" />
          </div>
        </div>
        <div className="hidden sm:block w-36 h-10 rounded-xl bg-bg-well" />
      </div>

      {/* GRID SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR SKELETON (col-span-3) */}
        <div className="lg:col-span-3 space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-bg-card border border-border-default p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-bg-well shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-24 h-3 bg-bg-well rounded" />
                <div className="w-32 h-2.5 bg-bg-well rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* MAIN PANEL CONTENT SKELETON (col-span-9) */}
        <div className="lg:col-span-9">
          <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header line */}
            <div className="border-b border-border-default/60 pb-4 space-y-2">
              <div className="w-48 h-5 bg-bg-well rounded" />
              <div className="w-72 h-3 bg-bg-well rounded" />
            </div>

            {/* Avatar circle skeleton */}
            <div className="flex flex-col items-center justify-center gap-3 py-4 border-b border-border-default/60">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-bg-well border-2 border-border-default" />
              <div className="w-32 h-3 bg-bg-well rounded" />
            </div>

            {/* 4 Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-28 h-3 bg-bg-well rounded" />
                  <div className="w-full h-10 rounded-xl bg-bg-well" />
                </div>
              ))}
            </div>

            {/* Large Bio area */}
            <div className="space-y-2 pt-2">
              <div className="w-32 h-3 bg-bg-well rounded" />
              <div className="w-full h-24 rounded-xl bg-bg-well" />
            </div>

            {/* Bottom action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border-default/60">
              <div className="w-20 h-9 rounded-xl bg-bg-well" />
              <div className="w-36 h-10 rounded-xl bg-bg-well" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
