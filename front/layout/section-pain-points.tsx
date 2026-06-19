"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { AlertCircle } from "lucide-react";

export default function SectionPainPoints() {
  const painPointsList = [
    { id: "pain_points.item1", defaultText: "Gugup kalau disuruh bicara depan orang" },
    { id: "pain_points.item2", defaultText: "Ide bagus tapi bingung menyampaikannya" },
    { id: "pain_points.item3", defaultText: "Kurang percaya diri tampil" },
    { id: "pain_points.item4", defaultText: "Bingung cara bangun personal branding" },
    { id: "pain_points.item5", defaultText: "Mau berkembang, tapi gak punya circle suportif" },
  ];

  return (
    <section
      id="pain-points"
      className="relative py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white overflow-hidden border-y border-zinc-200 dark:border-zinc-800"
    >
      {/* Subtle details */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-500/5 dark:bg-red-950/10 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 text-red-650 dark:text-red-500 font-bold text-xs uppercase tracking-widest mb-4">
          <AlertCircle size={16} />
          <span>The Problem</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-16 max-w-3xl leading-[1.2] reveal-up">
          <Edit id="pain_points.heading">
            Banyak Orang Punya Potensi… Tapi Terjebak Di Sini:
          </Edit>
        </h2>

        {/* List of Pain Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-parent">
          {painPointsList.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group stagger-child"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-red-500/20 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-sm font-bold">
                {idx + 1}
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white text-base sm:text-lg leading-relaxed pt-0.5 transition-colors">
                <Edit id={item.id}>{item.defaultText}</Edit>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
