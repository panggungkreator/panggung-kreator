"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoricalInsight } from "../types";

interface MonetizationInterestsChartProps {
  interests: CategoricalInsight[];
}

export function MonetizationInterestsChart({ interests }: MonetizationInterestsChartProps) {
  const displayItems = interests.slice(0, 4);

  return (
    <Card className="rounded-2xl border border-[#E5E7EB] dark:border-[#2A2E42] bg-[#FFFFFF] dark:bg-[#1A1D27] shadow-none h-[280px] flex flex-col justify-between">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111111] dark:text-white tracking-tight">
              Minat Monetisasi
            </h3>
            <p className="text-[11px] text-[#6B7280] dark:text-[#8B8FA8] mt-0.5">
              Rencana komersialisasi karya member
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#6B7280] dark:text-[#8B8FA8] bg-[#F2F4F7] dark:bg-zinc-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Komersial
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-center space-y-3.5">
        {displayItems.map((item, idx) => (
          <div key={idx} className="space-y-1.5 group">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111] dark:text-zinc-200 truncate max-w-[180px]">
                {item.name}
              </span>
              <span className="font-mono text-[11px] font-medium text-[#6B7280] dark:text-[#8B8FA8] tabular-nums">
                {item.percentage}% <span className="text-[10px] text-zinc-400">({item.count})</span>
              </span>
            </div>
            {/* Minimalist Horizontal Bar Track & Fill */}
            <div className="h-1.5 w-full bg-[#F2F4F7] dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111111] dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
