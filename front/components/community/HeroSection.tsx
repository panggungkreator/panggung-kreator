"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

export default function HeroSection() {
  const { textReveal, parallax, fadeUp } = useScrollAnimations();

  const badgeRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (badgeRef.current) {
      fadeUp(badgeRef.current, 0.1, 20);
    }
    if (headlineRef.current) {
      fadeUp(headlineRef.current, 0.2, 30, 1.2);
    }
    if (ctaRef.current) {
      fadeUp(ctaRef.current, 0.6, 30);
    }
    if (imgRef.current) {
      parallax(imgRef.current, 0.12);
    }
    if (imgContainerRef.current) {
      fadeUp(imgContainerRef.current, 0.4, 40);
    }
  }, [fadeUp, parallax]);

  return (
    <section className="relative min-h-[90vh] flex items-center border-b border-[#2c2c2c] dark:border-white py-16 md:py-24">
      {/* Background Grid Lines for Editorial Vibe */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-12 px-6 max-w-7xl mx-auto">
        <div className="col-span-7 border-r border-[#2c2c2c]/5 dark:border-white/5 h-full"></div>
        <div className="col-span-5 h-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">

          {/* Left Column: Headline and CTAs */}
          <div className="md:col-span-7 flex flex-col items-start pr-0 md:pr-8">
            <span
              ref={badgeRef}
              className="font-sans text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-6 block"
            >
              KOMUNITAS PANGGUNG KREATOR · BANDUNG
            </span>

            <h1
              ref={headlineRef}
              className="font-sans text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.85] font-black uppercase tracking-tighter text-[#2c2c2c] dark:text-white mb-8"
            >
              DARI panggung KECIL, MENJADI <span className="highlight-stabilo">VERSI TERBAIK DIRIMU</span>
            </h1>

            <div ref={ctaRef} className="w-full">
              <p className="font-sans text-sm md:text-base text-[#2c2c2c]/70 dark:text-white/70 max-w-xl mb-10 leading-relaxed">
                Komunitas pengembangan diri yang berfokus pada <b>Public Speaking, Content Creation, dan Personal Branding</b> untuk kamu yang ingin bertumbuh bersama lingkungan yang suportif, praktis, dan penuh kesempatan tampil.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <a
                  href="#gabung"
                  className="bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 border border-[#2c2c2c] dark:border-white text-center hover:bg-transparent hover:text-[#2c2c2c] dark:hover:bg-transparent dark:hover:text-white transition-all duration-350 rounded-none"
                >
                  GABUNG — MULAI GRATIS
                </a>
                <a
                  href="#program"
                  className="bg-transparent text-[#2c2c2c] dark:text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 border border-[#2c2c2c] dark:border-white text-center hover:bg-[#2c2c2c] hover:text-white dark:hover:bg-white dark:hover:text-[#2c2c2c] transition-all duration-350 rounded-none"
                >
                  JELAJAHI PROGRAM
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Parallax Image Placeholder */}
          <div
            ref={imgContainerRef}
            className="md:col-span-5 w-full flex justify-center"
          >
            <div className="w-full max-w-[420px] aspect-[3/4] border-2 border-[#2c2c2c] dark:border-white rounded-none bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden flex items-center justify-center group">
              {/* Parallax Content Container */}
              <div
                ref={imgRef}
                className="absolute inset-0 w-full h-[120%] -top-[10%] select-none"
              >
                {/* Real Image with grayscale hover transition */}
                <img
                  src="/assets/hero.JPG"
                  alt="Open Mic Panggung Kreator"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                />

                {/* Editorial text overlays on top of the image */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 bg-gradient-to-t from-[#2c2c2c]/95 via-[#2c2c2c]/50 to-transparent text-white">

                  {/* Stacked content at the bottom for readability */}
                  <div className="space-y-4">
                    {/* Badge and Year (moved to bottom) */}
                    <div className="flex justify-between items-center text-white/95">
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase bg-black/40 px-2 py-0.5 border border-white/10">
                        [ OPEN MIC · BANDUNG ]
                      </span>
                    </div>

                    {/* Tagline "1 Stage, 1 Progress" */}
                    <div className="text-left">
                      <p className="font-serif italic text-2xl md:text-3xl text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        "1 Stage, 1 Progress"
                      </p>
                    </div>

                    {/* Bottom labels with border */}
                    <div className="flex justify-between items-end border-t border-white/20 pt-4">
                      <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/80">
                        PANGGUNG KREATOR
                      </span>
                      <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/80">
                        OPEN MIC WEEKLY
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section >
  );
}
