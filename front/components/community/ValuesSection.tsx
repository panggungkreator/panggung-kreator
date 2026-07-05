"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

const values = [
  {
    icon: "🌱",
    title: "GROWTH",
    sub: "Pertumbuhan",
    desc: "Berkomitmen untuk terus belajar dan bertumbuh melampaui batasan diri setiap harinya.",
  },
  {
    icon: "💪",
    title: "CONFIDENCE",
    sub: "Kepercayaan Diri",
    desc: "Menumbuhkan keberanian internal untuk menyuarakan ide dan tampil secara autentik.",
  },
  {
    icon: "🎨",
    title: "CREATIVITY",
    sub: "Kreativitas",
    desc: "Selalu mendorong inovasi dan cara-cara baru dalam menghasilkan karya yang menarik.",
  },
  {
    icon: "🤝",
    title: "COLLABORATION",
    sub: "Kolaborasi",
    desc: "Menjunjung tinggi kerja sama tim — kita melangkah lebih jauh jika berjalan bersama.",
  },
  {
    icon: "🌟",
    title: "IMPACT",
    sub: "Dampak",
    desc: "Setiap ilmu dan kegiatan memberikan nilai manfaat nyata bagi diri dan masyarakat.",
  },
];

export default function ValuesSection() {
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
    <section id="values" className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white">
      {/* Section Title Block */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ NILAI KOMUNITAS ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            NILAI YANG KAMI PEGANG SETIAP HARI
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Fondasi karakter dan etos kerja kolektif yang membentuk interaksi dan proses pembelajaran kami.
        </p>
      </div>

      {/* 5-Column Grid with Rigid Borders */}
      <div className="grid grid-cols-1 md:grid-cols-5">
        {values.map((v, idx) => (
          <div
            key={v.title}
            ref={(el) => { colRefs.current[idx] = el; }}
            className={`p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 ${idx < 4
              ? "border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
              : "border-b md:border-b-0 border-[#2c2c2c] dark:border-white"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-1">
                {v.title}
              </h3>
              <span className="text-[10px] font-black tracking-widest text-[#2c2c2c]/40 dark:text-white/40 uppercase block mb-4">
                [ {v.sub} ]
              </span>
              <p className="font-sans text-xs text-[#2c2c2c]/70 dark:text-white/70 leading-relaxed">
                {v.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
