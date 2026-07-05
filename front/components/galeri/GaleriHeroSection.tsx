"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function GaleriHeroSection() {
  const { fadeUp, textReveal } = useScrollAnimations();

  const labelRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (labelRef.current) {
      fadeUp(labelRef.current, 0.1, 20);
    }
    if (headlineRef.current) {
      textReveal(headlineRef.current, 0.2);
    }
    if (subheadlineRef.current) {
      fadeUp(subheadlineRef.current, 0.6, 30);
    }
  }, [fadeUp, textReveal]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white min-h-[50vh] md:min-h-[60vh] flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Label */}
        <span
          ref={labelRef}
          className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-6 block"
        >
          [ GALERI KEGIATAN ]
        </span>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-[clamp(2.25rem,6vw,5.5rem)] font-black uppercase tracking-tighter leading-[0.85] text-[#2c2c2c] dark:text-white mb-10 max-w-5xl"
        >
          BEGINILAH CARA KAMI BERTUMBUH{" "}
          <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400 lowercase">
            bersama.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-2xl leading-relaxed uppercase tracking-wider"
        >
          Dokumentasi kegiatan nyata komunitas — dari panggung Open Mic, ruang kelas intensif, hingga momen networking yang mempertemukan orang-orang luar biasa.
        </p>
      </div>
    </section>
  );
}
