"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function TentangHistorySection() {
  const { fadeUp, parallax } = useScrollAnimations();

  const textContainerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textContainerRef.current) {
      fadeUp(textContainerRef.current, 0.1, 30);
    }
    if (imgContainerRef.current) {
      fadeUp(imgContainerRef.current, 0.2, 40);
    }
    if (imgRef.current) {
      parallax(imgRef.current, 0.1);
    }
  }, [fadeUp, parallax]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Content */}
        <div
          ref={textContainerRef}
          className="p-8 md:p-16 flex flex-col justify-center h-full min-h-[60vh] md:min-h-[90vh] order-2 md:order-1"
        >
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
              [ SEJARAH PERJALANAN ]
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] text-[#2c2c2c] dark:text-white mb-8">
              DARI 6 ORANG DI KAFE, MENJADI 300+{" "}
              <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400 lowercase">
                anggota
              </span>
            </h2>

            <div className="font-sans text-xs md:text-sm text-[#2c2c2c]/75 dark:text-white/75 space-y-6 leading-relaxed uppercase tracking-wider mb-8">
              <p>
                Dimulai dari momentum sederhana di sudut kota Bandung. Awalnya hanya tongkrongan{" "}
                <span className="highlight-stabilo">~6 orang</span> yang rutin berkumpul di kafe, dengan keresahan yang sama: ingin lancar berbicara di depan umum dan saling mendukung untuk keluar dari zona nyaman.
              </p>
              <p>
                Tanpa konsep awal yang kaku, pertemuan tersebut bertransformasi menjadi ruang diskusi yang hangat dan inklusif. Peserta yang datang makin beragam – pelajar, mahasiswa, pekerja kantoran, content creator, pemula di dunia MC, hingga para profesional.
              </p>
              <p>
                Melihat kebutuhan besar akan ruang berkembang, wadah informal ini diresmikan menjadi{" "}
                <span className="highlight-stabilo">komunitas Panggung Kreator</span> dengan program kreatif yang distrukturkan secara rapi.
              </p>
            </div>

            <p className="font-serif italic text-lg md:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-[#2c2c2c]/10 dark:border-white/10 pt-6">
              "Kini dari 6 orang, telah berkembang menjadi 300+ anggota aktif. Banyak alumni dan anggota yang berhasil berkarier sebagai MC profesional, public speaker, maupun content creator handal."
            </p>
          </div>
        </div>

        {/* Right Column: Parallax Image Placeholder */}
        <div
          ref={imgContainerRef}
          className="relative w-full aspect-[4/3] md:h-[90vh] md:aspect-auto overflow-hidden border-b md:border-b-0 md:border-l border-[#2c2c2c] dark:border-white order-1 md:order-2"
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
                [ VISUAL SEJARAH ]
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
                [ Foto suasana awal — 6 orang duduk melingkar di kafe kecil Bandung, berdiskusi hangat, suasana intim dan autentik. ]
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#2c2c2c]/50 dark:text-white/50 uppercase">
                FOUNDER STORY
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#2c2c2c]/50 dark:text-white/50 uppercase">
                EST. 2024
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
