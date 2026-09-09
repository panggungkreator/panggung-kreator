"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoricalInsight } from "../types";

interface TopSkillsBarChartProps {
  skills: CategoricalInsight[];
}

export function TopSkillsBarChart({ skills }: TopSkillsBarChartProps) {
  const displayItems = skills.slice(0, 4);

  return (
    <Card className="rounded-3xl border border-border-default/70 bg-bg-card shadow-xs h-[280px] flex flex-col justify-between">
      <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">
              Topik & Minat Belajar
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Preferensi materi yang ingin dikuasai
            </p>
          </div>
          <span className="text-[10px] font-bold text-text-muted bg-bg-well border border-border-default px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Topik
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 flex-1 flex flex-col justify-center space-y-3.5">
        {displayItems.map((item, idx) => (
          <div key={idx} className="space-y-1.5 group">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary truncate max-w-[180px]">
                {item.name}
              </span>
              <span className="font-mono text-[11px] font-medium text-text-secondary tabular-nums">
                {item.percentage}% <span className="text-[10px] text-text-muted">({item.count})</span>
              </span>
            </div>
            {/* Minimalist Horizontal Bar Track & Fill */}
            <div className="h-1.5 w-full bg-bg-well rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
