"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GrowthBadge } from "../types";

interface StatCardProps {
  label: string;
  value: string | number;
  growth: GrowthBadge;
  sparklineColor?: string;
  sparklinePath?: string;
}

export function StatCard({
  label,
  value,
  growth,
  sparklineColor = "#BAFF6A",
  sparklinePath = "M 0,30 Q 25,38 40,15 T 75,25 T 100,8",
}: StatCardProps) {
  return (
    <Card className="rounded-3xl border border-border-default/70 bg-bg-card shadow-xs hover:border-zinc-400/50 dark:hover:border-zinc-700 active:scale-[0.99] transition-all duration-200">
      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary block font-mono">
            {value}
          </span>
          <span className="text-xs font-semibold text-text-secondary block">
            {label}
          </span>
          <div className="flex items-center gap-1.5 pt-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                growth.isPositive
                  ? "bg-[#BAFF6A] text-[#2D5A00]"
                  : "bg-[#FF6B6B]/15 text-[#CC0000] dark:bg-red-950/40 dark:text-red-400"
              }`}
            >
              {growth.value}
            </span>
            <span className="text-[11px] text-text-muted">
              {growth.period}
            </span>
          </div>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-20 sm:w-28 h-10 sm:h-12 shrink-0">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <path
              d={sparklinePath}
              fill="none"
              stroke={sparklineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
