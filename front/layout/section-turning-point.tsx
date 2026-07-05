"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { Sparkles } from "lucide-react";

export default function SectionTurningPoint() {
  return (
    <section
      id="turning-point"
      className="relative py-28 sm:py-36 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden border-y border-zinc-200 dark:border-zinc-800"
    >
      {/* Light gradient highlight */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-200/20 dark:bg-amber-500/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Label */}
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-widest mb-6 reveal-up">
          <Sparkles size={14} className="animate-spin-slow" />
          <Edit id="turning_point.heading">Kabar Baiknya:</Edit>
        </div>

        {/* Text */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl text-zinc-650 dark:text-zinc-400 font-medium mb-4 font-sans tracking-tight reveal-up">
          <Edit id="turning_point.subheading">Bukan karena kamu gak bisa.</Edit>
        </h3>

        {/* Big Highlighted Text */}
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif leading-[1.15] tracking-tight max-w-3xl mt-4 reveal-words">
          <Edit id="turning_point.main_text">Kamu cuma belum ketemu </Edit>
          <br className="hidden sm:inline" />
          <span className="relative inline-block text-amber-650 dark:text-amber-400 mt-2 sm:mt-0">
            <Edit id="turning_point.emphasis_text">panggung yang tepat.</Edit>
          </span>
        </h2>
      </div>
    </section>
  );
}
