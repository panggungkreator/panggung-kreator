"use client";

import React from "react";
import { Construction, ArrowLeft } from "lucide-react";

interface UnderConstructionProps {
  title: string;
  description?: string;
  onBackToOverview?: () => void;
}

export default function UnderConstruction({
  title,
  description = "Fitur ini sedang dalam proses pengembangan dan penyempurnaan oleh tim Panggung Kreator. Nantikan pembaruan selanjutnya!",
  onBackToOverview,
}: UnderConstructionProps) {
  return (
    <div className="w-full bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 flex flex-col items-center text-center space-y-6 animate-fade-in shadow-xs">
      {/* Icon Badge */}
      <div className="p-4 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 shrink-0">
        <Construction size={32} />
      </div>

      {/* Text Container */}
      <div className="max-w-md space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
          [ 🚧 UNDER CONSTRUCTION ]
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans pt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
