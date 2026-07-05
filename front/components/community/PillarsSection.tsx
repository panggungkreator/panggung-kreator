"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

export default function PillarsSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }

    // Stagger column cards entry
    staggerIn(colRefs.current, 0.12, 40);
  }, [fadeUp, staggerIn]);

  const pillars = [
    {
      num: "01",
      title: "PUBLIC SPEAKING",
      desc: "Latih keberanian berbicara di depan publik secara langsung. Kami menyediakan panggung mingguan yang aman untuk mencoba, gagal, dan tumbuh bersama.",
      points: ["OPEN MIC WEEKLY", "MC PRACTICE", "VOICE OVER CHALLENGE"],
    },
    {
      num: "02",
      title: "CONTENT CREATION",
      desc: "Ubah gagasan menjadi konten digital yang berdampak. Belajar strategi algoritma, teknik editing, hingga storytelling yang memikat audiens.",
      points: ["CONTENT CREATOR CLASS", "RADIO ANNOUNCER CHALLENGE", "STORYTELLING STRUCTURE"],
    },
    {
      num: "03",
      title: "PERSONAL BRANDING",
      desc: "Petakan nilai unik dirimu dan bangun reputasi digital yang kuat, autentik, dan relevan di era yang terus bergerak cepat.",
      points: ["PERSONAL BRANDING CLASS", "NETWORKING SESSION", "DIGITAL PORTFOLIO"],
    },
  ];

  return (
    <section id="pilar" className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white">
      {/* Section Title Block */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ TIGA PILAR UTAMA ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            SATU KOMUNITAS.<br /> TIGA SKILL MASA DEPAN.
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Satu tempat untuk melatih public speaking, membangun konten, dan membentuk personal branding yang berdampak.
        </p>
      </div>

      {/* 3-Column Grid with Rigid Borders */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {pillars.map((p, idx) => (
          <div
            key={p.num}
            ref={(el) => { colRefs.current[idx] = el; }}
            className={`p-8 md:p-12 flex flex-col justify-between group transition-all duration-300 ${idx < 2
              ? "border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
              : "border-b md:border-b-0 border-[#2c2c2c] dark:border-white"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            <div>
              {/* Giant Outline/Stark Number */}
              <div className="text-6xl md:text-[5.5rem] font-black tracking-tighter text-neutral-200 dark:text-neutral-800 group-hover:text-[#2c2c2c] dark:group-hover:text-white transition-colors duration-500 leading-none mb-6">
                {p.num}
              </div>

              <h3 className="text-lg font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-4">
                {p.title}
              </h3>

              <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/70 dark:text-white/70 leading-relaxed mb-8">
                {p.desc}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="border-t border-[#2c2c2c]/10 dark:border-white/10 pt-6">
              <ul className="space-y-2.5">
                {p.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#2c2c2c] dark:bg-white flex-shrink-0"></span>
                    <span className="text-[10px] font-black tracking-widest text-[#2c2c2c]/60 dark:text-white/60 uppercase">
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
