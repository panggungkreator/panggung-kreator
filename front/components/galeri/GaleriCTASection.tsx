"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function GaleriCTASection() {
  const { fadeUp } = useScrollAnimations();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeUp(containerRef.current, 0.1, 40);
    }
  }, [fadeUp]);

  return (
    <section className="relative bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c] py-20 md:py-28 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={containerRef} className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Section Label */}
          <span className="text-xs uppercase tracking-[0.3em] font-black text-white/50 dark:text-[#2c2c2c]/50 mb-6 block">
            [ GABUNG SEKARANG ]
          </span>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            MAU JADI BAGIAN DARI CERITA INI?
          </h2>

          {/* Description */}
          <p className="font-sans text-xs md:text-sm text-white/70 dark:text-[#2c2c2c]/70 max-w-lg mb-10 leading-relaxed uppercase tracking-wider">
            Setiap foto di atas adalah momen nyata dari anggota kami. Kamu bisa menjadi bagian dari cerita selanjutnya.
          </p>

          {/* Primary CTA */}
          <a
            href="https://wa.me/6287823239575"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#2c2c2c] dark:bg-[#2c2c2c] dark:text-white text-xs font-bold uppercase tracking-[0.25em] px-10 py-5 border border-white dark:border-[#2c2c2c] hover:bg-transparent hover:text-white dark:hover:bg-transparent dark:hover:text-[#2c2c2c] transition-all duration-350 rounded-none inline-block mb-8"
          >
            DAFTAR GRATIS SEBAGAI MEMBER — MULAI GRATIS
          </a>

          {/* Secondary CTA */}
          <p className="text-[10px] text-white/50 dark:text-[#2c2c2c]/50 uppercase tracking-widest">
            Atau{" "}
            <Link
              href="/"
              className="underline hover:text-white dark:hover:text-[#2c2c2c] transition-colors"
            >
              Kembali ke beranda
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
