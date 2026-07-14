"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function TentangHistorySection() {
  const { fadeUp } = useScrollAnimations();

  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textContainerRef.current) {
      fadeUp(textContainerRef.current, 0.1, 30);
    }
  }, [fadeUp]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      <div className="max-w-3xl mx-auto">
        {/* Centered Single Column Content */}
        <div
          ref={textContainerRef}
          className="p-8 md:p-16 flex flex-col justify-center min-h-[50vh] md:min-h-[70vh]"
        >
          <div>
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
      </div>
    </section>
  );
}
