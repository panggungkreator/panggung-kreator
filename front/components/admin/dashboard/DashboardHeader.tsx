"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  adminName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  adminName = "Admin",
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/60">
      <div>
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
          [ DASHBOARD UTAMA ]
        </span>
        <div className="flex items-center gap-2.5 mt-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome Back, {adminName}!
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {onRefresh && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Segarkan data dashboard"
            className="hidden sm:inline-flex items-center justify-center h-9 w-9 text-text-muted hover:text-text-primary bg-bg-well/60 hover:bg-bg-well border border-border-default rounded-full transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-text-primary" : ""} />
          </button>
        </div>
      )}
    </div>
  );
}
