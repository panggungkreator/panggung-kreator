"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SectionClosingCta() {
  return (
    <section
      id="closing-cta"
      className="relative min-h-[90vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden py-24 border-t border-zinc-200 dark:border-zinc-800"
    >
      {/* Background spotlights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-750/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Sparkle Icon */}
        <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/5 flex items-center justify-center mb-8 animate-pulse">
          <Sparkles className="text-amber-600 dark:text-amber-400" size={20} />
        </div>

        {/* Large Quote */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-[1.25] tracking-tight mb-8 max-w-3xl">
          <Edit id="closing_cta.heading">
            Semua Performer Hebat Pernah Memulai Dari Panggung Kecil.
          </Edit>
        </h2>

        {/* Story Text */}
        <p className="text-zinc-650 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-6 font-sans">
          <Edit id="closing_cta.p1">
            Hari ini mungkin kamu masih belajar berbicara.
          </Edit>
        </p>
        <p className="text-zinc-650 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-sans">
          <Edit id="closing_cta.p2">
            Besok, bisa jadi kamu yang berdiri di depan panggung, membawakan acara, menjadi pembicara, atau menginspirasi banyak orang.
          </Edit>
        </p>

        {/* Brand Statement */}
        <div className="mb-12">
          <span className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">
            Bergabunglah Bersama
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-amber-605 dark:text-amber-400 mb-2">
            <Edit id="closing_cta.brand">Panggung Kreator</Edit>
          </h1>
          <p className="text-zinc-700 dark:text-zinc-300 font-medium italic text-sm sm:text-base">
            <Edit id="closing_cta.sub_brand">Mulai perjalananmu hari ini.</Edit>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/checkout?packageId=regular" // Fallback query or link
            className="w-full sm:w-auto text-center text-sm font-bold text-zinc-700 dark:text-white bg-white hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-850 rounded-lg px-8 py-4 transition-all shadow-sm active:scale-[0.98]"
          >
            <Edit id="closing_cta.btn_regular">Gabung Member Regular Rp49.000</Edit>
          </Link>
          
          <Link
            href="/checkout?packageId=mvp" // Fallback query or link
            className="w-full sm:w-auto text-center text-sm font-extrabold text-black bg-amber-400 hover:bg-amber-500 rounded-lg px-8 py-4 transition-all shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] duration-150"
          >
            <Edit id="closing_cta.btn_mvp">Jadi MVP Rp249.000</Edit>
          </Link>
        </div>
      </div>
    </section>
  );
}
