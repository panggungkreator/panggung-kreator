"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

const philosophy = [
  {
    num: "01",
    icon: "🎭",
    title: "PANGGUNG",
    desc: "Melambangkan keberanian untuk tampil di depan publik, menyuarakan gagasan, mengambil peran, serta menunjukkan potensi terbaik tanpa ragu.",
  },
  {
    num: "02",
    icon: "✨",
    title: "KREATOR",
    desc: "Melambangkan individu yang tidak sekadar menjadi penonton, melainkan aktif belajar, berkarya, berinovasi, dan menciptakan dampak positif bagi lingkungan sekitar.",
  },
  {
    num: "03",
    icon: "🎯",
    title: "1 STAGE, 1 PROGRESS",
    desc: "Setiap panggung yang dipijak — sekecil apa pun — adalah satu langkah kemajuan nyata menuju versi terbaik dari diri sendiri. Tidak ada proses yang sia-sia; setiap penampilan adalah sebuah progres.",
  },
];

export default function TentangPhilosophySection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }
    staggerIn(colRefs.current, 0.1, 40);
  }, [fadeUp, staggerIn]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      {/* Section Header */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ FILOSOFI NAMA & TAGLINE ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            APA MAKNA DI BALIK NAMA KAMI
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Setiap kata dalam identitas kami memiliki makna yang membentuk semangat dan arah perjuangan komunitas.
        </p>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {philosophy.map((p, idx) => (
          <div
            key={p.title}
            ref={(el) => {
              colRefs.current[idx] = el;
            }}
            className={`p-8 md:p-10 flex flex-col justify-between group transition-all duration-350 min-h-[300px] ${idx < 2
              ? "border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
              : "border-b md:border-b-0 border-[#2c2c2c] dark:border-white"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            <div>
              {/* Giant Number and Icon */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-5xl md:text-6xl font-black tracking-tighter text-[#2c2c2c]/10 dark:text-white/10 group-hover:text-[#2c2c2c]/20 dark:group-hover:text-white/20 transition-colors duration-500 leading-none">
                  {p.num}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-4">
                {p.title}
              </h3>
              <p className="font-sans text-xs text-[#2c2c2c]/70 dark:text-white/70 leading-relaxed uppercase tracking-wide">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
