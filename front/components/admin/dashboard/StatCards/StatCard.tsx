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
    <Card className="hover:border-zinc-400/50 dark:hover:border-zinc-700 transition-all duration-200">
      <CardContent className="p-5 sm:p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] dark:text-white block font-mono">
            {value}
          </span>
          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#8B8FA8] block">
            {label}
          </span>
          <div className="flex items-center gap-1.5 pt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                growth.isPositive
                  ? "bg-[#BAFF6A] text-[#2D5A00]"
                  : "bg-[#FF6B6B]/15 text-[#CC0000]"
              }`}
            >
              {growth.value}
            </span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#8B8FA8]">
              {growth.period}
            </span>
          </div>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-24 sm:w-28 h-12 shrink-0">
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
