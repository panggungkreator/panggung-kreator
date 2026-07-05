"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function KolaborasiHeroSection() {
  const { fadeUp } = useScrollAnimations();

  const labelRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (labelRef.current) {
      fadeUp(labelRef.current, 0.1, 20);
    }
    if (headlineRef.current) {
      fadeUp(headlineRef.current, 0.3, 30);
    }
    if (subheadlineRef.current) {
      fadeUp(subheadlineRef.current, 0.5, 30);
    }
  }, [fadeUp]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white min-h-[50vh] flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Label */}
        <span
          ref={labelRef}
          className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-6 block"
        >
          [ KOLABORASI & MEDIA KIT ]
        </span>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-[clamp(2.25rem,6vw,5.5rem)] font-black uppercase tracking-tighter leading-[0.85] text-[#2c2c2c] dark:text-white mb-10 max-w-5xl"
        >
          KENALI EKOSISTEM{" "}
          <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400 lowercase">
            panggung kreator.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-2xl leading-relaxed uppercase tracking-wider"
        >
          Data komunitas yang terstruktur untuk keputusan kemitraan yang tepat.
        </p>
      </div>
    </section>
  );
}
