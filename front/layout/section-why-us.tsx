"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { HelpCircle, Mic, Users, TrendingUp, Rocket } from "lucide-react";

export default function SectionWhyUs() {
  const cards = [
    {
      icon: <Mic className="text-amber-400" size={28} />,
      titleId: "why_us.item1_title",
      defaultTitle: "Tempat untuk latihan",
      descId: "why_us.item1_desc",
      defaultDesc: "Mempraktikkan langsung teori yang dipelajari agar cepat melekat dan terbiasa.",
    },
    {
      icon: <Users className="text-amber-400" size={28} />,
      titleId: "why_us.item2_title",
      defaultTitle: "Lingkungan yang suportif",
      descId: "why_us.item2_desc",
      defaultDesc: "Dikelilingi oleh circle positif yang saling menyemangati, bukan menjatuhkan.",
    },
    {
      icon: <TrendingUp className="text-amber-400" size={28} />,
      titleId: "why_us.item3_title",
      defaultTitle: "Mentor yang mengarahkan",
      descId: "why_us.item3_desc",
      defaultDesc: "Mendapat feedback langsung yang konstruktif untuk perbaikan berkelanjutan.",
    },
    {
      icon: <Rocket className="text-amber-400" size={28} />,
      titleId: "why_us.item4_title",
      defaultTitle: "Kesempatan tampil langsung",
      descId: "why_us.item4_desc",
      defaultDesc: "Menyediakan panggung nyata untuk melatih mental dan jam terbang bicaramu.",
    },
  ];

  return (
    <section
      id="why-us"
      className="relative py-24 sm:py-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden border-y border-zinc-200 dark:border-zinc-800"
    >
      {/* Background visual detail */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#bc151b]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 text-amber-605 dark:text-amber-500 font-bold text-xs uppercase tracking-widest mb-4">
            <HelpCircle size={14} />
            <span>Why Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2] mb-4">
            <Edit id="why_us.heading">Kenapa Bergabung di Panggung Kreator?</Edit>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl">
            <Edit id="why_us.subheading">
              Karena belajar public speaking tidak cukup hanya menonton video tutorial saja.
            </Edit>
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {cards.map((card) => (
            <div
              key={card.titleId}
              className="flex gap-5 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition-colors">
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-zinc-900 dark:text-white mb-2">
                  <Edit id={card.titleId}>{card.defaultTitle}</Edit>
                </h3>
                <p className="text-zinc-605 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                  <Edit id={card.descId}>{card.defaultDesc}</Edit>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Big centered statement */}
        <div className="text-center max-w-3xl mx-auto pt-10 border-t border-zinc-200 dark:border-zinc-800/80">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-amber-600 dark:text-amber-400 leading-relaxed italic">
            "<Edit id="why_us.closing">Bukan hanya mengajarkan teori, tetapi memberikan panggung untuk bertumbuh.</Edit>"
          </h3>
        </div>
      </div>
    </section>
  );
}
