"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import Link from "next/link";

export default function SectionHero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between items-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden pt-28"
    >
      {/* Background gradients and visual effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-red-700/10 blur-[160px]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center flex-grow py-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <Edit id="hero.badge">PANGGUNG KREATOR AKADEMI</Edit>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif leading-[1.15] max-w-4xl mb-8 reveal-words">
          <Edit id="hero.heading">
            Komunitas Public Speaking Paling Supportif untuk Kamu Yang Ingin Bertumbuh Lewat Skill Bicara
          </Edit>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mb-10 leading-relaxed font-sans reveal-up">
          <Edit id="hero.subheading">
            Belajar Public Speaking dan Personal Branding untuk Ciptakan Panggung Pertamamu
          </Edit>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto reveal-up">
          <Link
            href="/checkout"
            className="w-full sm:w-auto text-center text-sm font-bold text-black bg-amber-400 hover:bg-amber-500 rounded-lg px-8 py-4 transition-all shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] duration-150"
          >
            <Edit id="hero.cta">Gabung Jadi Member Baru</Edit>
          </Link>
          <a
            href="#pain-points"
            className="w-full sm:w-auto text-center text-sm font-semibold text-zinc-650 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 rounded-lg px-8 py-4 transition-all duration-150"
          >
            Pelajari Lebih Lanjut
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 text-xs animate-bounce pointer-events-none pb-8 mt-auto">
        <span>SCROLL DOWN</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
