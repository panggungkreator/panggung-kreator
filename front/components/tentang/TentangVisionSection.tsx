"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

const missions = [
  {
    num: "01",
    title: "EDUKASI APLIKATIF",
    desc: "Menyediakan ruang belajar yang praktis, interaktif, berkelanjutan, dan menyenangkan bagi semua kalangan.",
  },
  {
    num: "02",
    title: "OPTIMALISASI POTENSI",
    desc: "Mengembangkan kemampuan public speaking anggota secara terukur melalui metode praktik langsung di setiap sesi.",
  },
  {
    num: "03",
    title: "INKUBASI KREATIF",
    desc: "Menjadi wadah pembinaan bagi calon content creator dan pembentukan personal branding di era digital.",
  },
  {
    num: "04",
    title: "EKOSISTEM SUPORTIF",
    desc: "Membangun kultur komunitas yang positif, suportif, inklusif, dan penuh semangat kolaborasi.",
  },
  {
    num: "05",
    title: "SINERGI JARINGAN",
    desc: "Menciptakan peluang networking dan kemitraan strategis guna mendukung karier serta perkembangan diri anggota.",
  },
];

export default function TentangVisionSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const visionRef = useRef<HTMLDivElement>(null);
  const missionHeaderRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (visionRef.current) {
      fadeUp(visionRef.current, 0.1, 40);
    }
    if (missionHeaderRef.current) {
      fadeUp(missionHeaderRef.current, 0.1, 30);
    }
    staggerIn(colRefs.current, 0.1, 40);
  }, [fadeUp, staggerIn]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      {/* Visi Block (Inverted Background) */}
      <div
        ref={visionRef}
        className="bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c] p-8 md:p-16 lg:p-24 border-b border-[#2c2c2c] dark:border-white flex flex-col justify-center min-h-[50vh]"
      >
        <div className="max-w-4xl mx-auto w-full">
          <span className="text-xs uppercase tracking-[0.3em] font-black text-white/50 dark:text-[#2c2c2c]/50 mb-6 block">
            [ VISI ]
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3.5rem)] font-black uppercase tracking-tighter leading-[0.9] mb-8">
            MENJADI KOMUNITAS PENGEMBANGAN DIRI TERDEPAN
          </h2>
          <p className="font-serif italic text-lg md:text-2xl leading-relaxed text-white/80 dark:text-[#2c2c2c]/80 border-l border-white/20 dark:border-[#2c2c2c]/20 pl-6">
            "Yang menginspirasi dan menggerakkan masyarakat untuk berani berbicara, kreatif berkarya, serta mampu membangun personal branding yang kuat dan berdampak luas."
          </p>
        </div>
      </div>

      {/* Misi Header */}
      <div
        ref={missionHeaderRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ MISI ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            5 LANGKAH MENUJU VISI KAMI
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Bagaimana kami menjalankan komitmen hari demi hari demi menyebarkan manfaat yang berkelanjutan.
        </p>
      </div>

      {/* 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5">
        {missions.map((m, idx) => (
          <div
            key={m.title}
            ref={(el) => {
              colRefs.current[idx] = el;
            }}
            className={`p-8 md:p-10 flex flex-col justify-between group transition-colors duration-350 min-h-[250px] ${idx < 4
              ? "border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
              : "border-b md:border-b-0 border-[#2c2c2c] dark:border-white"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            <div>
              {/* Giant Number */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-4xl font-black tracking-tighter text-[#2c2c2c]/10 dark:text-white/10 group-hover:text-[#2c2c2c]/20 dark:group-hover:text-white/20 transition-colors duration-500 leading-none">
                  {m.num}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-3">
                {m.title}
              </h3>
              <p className="font-sans text-[11px] text-[#2c2c2c]/70 dark:text-white/70 leading-relaxed uppercase tracking-wide">
                {m.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
