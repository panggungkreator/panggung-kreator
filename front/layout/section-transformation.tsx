"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { Frown, Smile, ArrowRight } from "lucide-react";

export default function SectionTransformation() {
  const beforeItems = [
    { id: "transformation.dulu1", defaultText: "Takut bicara" },
    { id: "transformation.dulu2", defaultText: "Minder tampil" },
    { id: "transformation.dulu3", defaultText: "Bingung mulai dari mana" },
  ];

  const afterItems = [
    { id: "transformation.sekarang1", defaultText: "Berani ngomong depan orang" },
    { id: "transformation.sekarang2", defaultText: "Punya gaya bicara sendiri" },
    { id: "transformation.sekarang3", defaultText: "Dikenal orang" },
    { id: "transformation.sekarang4", defaultText: "Punya circle berkembang" },
    { id: "transformation.sekarang5", defaultText: "Siap tampil di panggung besar" },
  ];

  return (
    <section
      id="transformation"
      className="relative py-24 sm:py-32 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-white overflow-hidden"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[#bc151b] font-bold text-xs uppercase tracking-widest mb-4 block">
            The Transformation
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2]">
            <Edit id="transformation.heading">Bayangin 3 Bulan Dari Sekarang...</Edit>
          </h2>
        </div>

        {/* Before / After Layout */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 max-w-4xl mx-auto">
          {/* Dulu Card */}
          <div className="w-full md:w-[45%] p-8 sm:p-10 rounded-3xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-800 opacity-60 hover:opacity-80 transition-opacity duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Frown className="text-zinc-500" size={24} />
              <h3 className="text-xl font-bold font-serif tracking-widest text-zinc-500 uppercase">
                <Edit id="transformation.dulu_title">Dulu</Edit>
              </h3>
            </div>

            <ul className="space-y-4">
              {beforeItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                  <span>
                    <Edit id={item.id}>{item.defaultText}</Edit>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Central Arrow */}
          <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#bc151b]/10 dark:bg-[#bc151b]/20 text-[#bc151b] shrink-0 z-10">
            <ArrowRight size={24} />
          </div>

          {/* Sekarang Card */}
          <div className="w-full md:w-[45%] p-8 sm:p-10 rounded-3xl bg-white border-2 border-amber-500 dark:bg-zinc-900 shadow-xl shadow-amber-500/10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-850">
              <Smile className="text-amber-500" size={24} />
              <h3 className="text-xl font-extrabold font-serif tracking-widest text-amber-500 uppercase">
                <Edit id="transformation.sekarang_title">Sekarang</Edit>
              </h3>
            </div>

            <ul className="space-y-4">
              {afterItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100 text-base sm:text-lg font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    <Edit id={item.id}>{item.defaultText}</Edit>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
