"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";
import Link from "next/link";

export default function ClosingCTA() {
  const { textReveal, fadeUp } = useScrollAnimations();

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headlineRef.current) {
      textReveal(headlineRef.current, 0.1);
    }
    if (containerRef.current) {
      fadeUp(containerRef.current, 0.4, 30);
    }
    if (bottomGridRef.current) {
      fadeUp(bottomGridRef.current, 0.6, 20);
    }
  }, [textReveal, fadeUp]);

  return (
    <section
      id="gabung"
      className="relative bg-[#2c2c2c] text-white py-20 md:py-32 border-b border-[#2c2c2c] dark:border-white overflow-hidden"
    >
      {/* Decorative vertical lines for editorial touch */}
      <div className="absolute inset-0 pointer-events-none opacity-5 grid grid-cols-4 px-6 max-w-7xl mx-auto">
        <div className="border-r border-white h-full"></div>
        <div className="border-r border-white h-full"></div>
        <div className="border-r border-white h-full"></div>
        <div></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">

        {/* Giant Headline */}
        <h2
          ref={headlineRef}
          className="font-sans text-[clamp(2.25rem,6.5vw,5.5rem)] leading-[0.85] font-black uppercase tracking-tighter text-white mb-10"
        >
          PANGGUNGMU DIMULAI hari INI.
        </h2>

        {/* CTA Button Block */}
        <div ref={containerRef} className="flex flex-col items-center mb-20">
          <p className="font-sans text-xs md:text-sm text-white/70 max-w-lg mb-10 leading-relaxed uppercase tracking-wider">
            Bergabunglah bersama 300+ anggota yang sudah membuktikan bahwa bertumbuh lebih menyenangkan jika dilakukan bersama.
          </p>

          <a
            href="https://wa.me/6287823239575"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#2c2c2c] text-xs font-bold uppercase tracking-[0.25em] px-10 py-5 border border-white hover:bg-transparent hover:text-white transition-all duration-350 rounded-none inline-block mb-6"
          >
            GABUNG MEMBER — MULAI GRATIS
          </a>

          <p className="text-[10px] text-white/50 uppercase tracking-widest">
            Ingin kolaborasi?{" "}
            <Link href="/kolaborasi" className="underline hover:text-white transition-colors">
              → /kolaborasi
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}
