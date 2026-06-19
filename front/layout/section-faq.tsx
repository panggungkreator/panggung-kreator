"use client";

import React, { useState } from "react";
import { Edit } from "@/components/editor/Edit";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function SectionFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqItems = [
    {
      qId: "faq.q1",
      aId: "faq.a1",
      defaultQ: "Apakah cocok untuk pemula?",
      defaultA: "Sangat cocok. Materi dibuat step-by-step bahkan untuk yang masih takut bicara di depan umum.",
    },
    {
      qId: "faq.q2",
      aId: "faq.a2",
      defaultQ: "Apakah harus sudah jago public speaking?",
      defaultA: "Tidak. Justru tempat ini dibuat sebagai wadah belajar dan berkembang bersama dari nol.",
    },
    {
      qId: "faq.q3",
      aId: "faq.a3",
      defaultQ: "Apakah hanya untuk mahasiswa?",
      defaultA: "Tidak. Cocok untuk mahasiswa, pekerja muda, freelancer, content creator, dan siapa pun yang ingin bertumbuh lewat skill bicara.",
    },
    {
      qId: "faq.q4",
      aId: "faq.a4",
      defaultQ: "Apakah ada praktik langsung?",
      defaultA: "Ada. Karena komunikasi tidak cukup hanya dipelajari teorinya, tapi harus dilatih secara konsisten.",
    },
    {
      qId: "faq.q5",
      aId: "faq.a5",
      defaultQ: "Apakah akan belajar personal branding juga?",
      defaultA: "Yes. Karena di era digital saat ini, kemampuan komunikasi plus personal branding adalah kombinasi paling mutakhir untuk melipatgandakan peluang karirmu.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative py-24 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-white overflow-hidden"
    >
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#bc151b] font-bold text-xs uppercase tracking-widest mb-4">
            <HelpCircle size={14} />
            <Edit id="faq.label">FAQ (Frequently Asked Questions)</Edit>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2]">
            <Edit id="faq.heading">Pertanyaan yang Sering Diajukan</Edit>
          </h2>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.qId}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/20 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-bold text-base sm:text-lg font-serif text-zinc-900 dark:text-white leading-snug">
                    <Edit id={item.qId}>{item.defaultQ}</Edit>
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-[#bc151b] transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {/* Accordion Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-60 border-t border-zinc-200 dark:border-zinc-800" : "max-h-0"
                  }`}
                >
                  <div className="px-6 py-5 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                    <Edit id={item.aId}>{item.defaultA}</Edit>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
