"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

export default function StorySection() {
  const { fadeUp, parallax } = useScrollAnimations();

  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imgContainerRef.current) {
      fadeUp(imgContainerRef.current, 0.1, 40);
    }
    if (imgRef.current) {
      parallax(imgRef.current, 0.1);
    }
    if (textContainerRef.current) {
      fadeUp(textContainerRef.current, 0.2, 30);
    }
  }, [fadeUp, parallax]);

  return (
    <section id="cerita" className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Left Column: Parallax Image Placeholder */}
        <div
          ref={imgContainerRef}
          className="relative w-full aspect-[4/3] md:h-[90vh] md:aspect-auto overflow-hidden border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
        >
          {/* Parallax Content Container */}
          <div
            ref={imgRef}
            className="absolute inset-0 w-full h-[120%] -top-[10%] bg-neutral-100 dark:bg-neutral-900 flex flex-col justify-between p-8 md:p-12 transition-transform duration-700 ease-out select-none"
          >
            {/* Visual crop lines */}
            <div className="absolute inset-0 border-x border-y border-[#2c2c2c]/5 dark:border-white/5 m-8 pointer-events-none"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
                [ VISUAL STORY ]
              </span>
              <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
                02/03
              </span>
            </div>

            <div className="relative z-10 max-w-sm mx-auto text-center my-auto pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.2em] text-[#2c2c2c]/30 dark:text-white/30 block mb-3">
                [ PHOTO PLACEHOLDER ]
              </span>
              <p className="font-sans text-xs text-[#2c2c2c]/50 dark:text-white/40 uppercase tracking-wider leading-relaxed">
                Letakkan foto portrait hitam-putih dari pendiri atau member sedang berbicara intim. Bayangan dramatis dengan fokus tajam pada mata dan ekspresi bibir saat bercerita.
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#2c2c2c]/50 dark:text-white/50 uppercase">
                FOUNDER & MEMBER STORY
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#2c2c2c]/50 dark:text-white/50 uppercase">
                EST. 2024
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Philosophy & Testimonial */}
        <div
          ref={textContainerRef}
          className="p-8 md:p-16 flex flex-col justify-between h-full min-h-[70vh] md:min-h-[90vh]"
        >
          {/* Header Block */}
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
              [ PHILOSOPHY & STORY ]
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] text-[#2c2c2c] dark:text-white mb-8">
              PANGGUNG KREATOR SEBAGAI RUANG TUMBUH
            </h2>

            <p className="font-serif italic text-2xl text-neutral-500 dark:text-neutral-400 leading-snug mb-8">
              "<span className="highlight-stabilo">OneStageOneProgress</span>. Tidak ada lompatan instan, yang ada adalah akumulasi dari keberanian-keberanian kecil yang konsisten."
            </p>

            <div className="font-sans text-sm text-[#2c2c2c]/70 dark:text-white/70 space-y-5 leading-relaxed">
              <p>
                Kami percaya bahwa rasa takut berbicara di depan umum bukanlah cacat karakter, melainkan sekadar otot yang belum terlatih. <span className="highlight-stabilo">Masalah utama kebanyakan orang bukan kurangnya teori, melainkan ketiadaan panggung yang aman untuk melakukan kesalahan.</span>
              </p>
              <p>
                Panggung Kreator lahir untuk meruntuhkan tembok ketakutan itu. Di sini, kegagalan bukan akhir, melainkan data. <span className="highlight-stabilo">Setiap kali kamu berdiri di atas panggung kami, kamu sedang menulis ulang narasi tentang batas kemampuan dirimu sendiri.</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
