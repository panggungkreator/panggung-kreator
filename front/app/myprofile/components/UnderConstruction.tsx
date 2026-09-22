"use client";

import React from "react";
import { Construction } from "lucide-react";

interface UnderConstructionProps {
  title: string;
  description?: string;
  onBackToOverview?: () => void;
}

export default function UnderConstruction({
  title,
  description = "Fitur ini sedang dalam proses pengembangan dan penyempurnaan oleh tim Panggung Kreator. Nantikan pembaruan selanjutnya!",
}: UnderConstructionProps) {
  return (
    <div className="w-full bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 p-8 sm:p-12 flex flex-col items-center text-center space-y-5 animate-fade-in rounded-2xl shadow-2xs">
      {/* Icon Badge */}
      <div className="p-4 bg-[#EFF0A3] dark:bg-[#38371F] border border-[#212121]/10 dark:border-white/10 rounded-2xl text-[#212121] dark:text-[#EFF0A3] shrink-0 shadow-2xs">
        <Construction size={28} />
      </div>

      {/* Text Container */}
      <div className="max-w-md space-y-2">
        <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md">
          [ FITUR DALAM PENGEMBANGAN ]
        </span>
        <h3 className="font-sans text-xl sm:text-2xl font-black uppercase tracking-tight text-[#212121] dark:text-white pt-1">
          {title}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans pt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
