"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

const founder = {
  name: "ALDI",
  role: "FOUNDER & KETUA",
  placeholder: "[ Foto portrait Aldi — formal namun hangat, background netral. ]",
  quote: "Panggung Kreator bukan tentang siapa yang paling pintar berbicara di depan publik, tapi tentang siapa yang paling berani memulai langkah pertamanya dan konsisten berprogres.",
};

const team = [
  { name: "RIANDI", role: "TIM INTI" },
  { name: "RESTU", role: "TIM INTI" },
  { name: "AHMAD", role: "TIM INTI" },
  { name: "EDO", role: "TIM INTI" },
  { name: "RIJAL", role: "TIM INTI" },
  { name: "RAHMA", role: "TIM INTI" },
  { name: "BAGAS", role: "TIM INTI" },
  { name: "ADEL", role: "TIM INTI" },
  { name: "TITO", role: "TIM INTI" },
  { name: "AWI", role: "TIM INTI" },
];

export default function TentangTeamSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const founderRef = useRef<HTMLDivElement>(null);
  const teamRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }
    if (founderRef.current) {
      fadeUp(founderRef.current, 0.15, 40);
    }
    staggerIn(teamRefs.current, 0.08, 30);
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
            [ STRUKTUR ORGANISASI ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            ORANG-ORANG DI BALIK PANGGUNG
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Tim inti yang menggerakkan visi komunitas setiap harinya.
        </p>
      </div>

      {/* Founder Block */}
      <div
        ref={founderRef}
        className="grid grid-cols-1 md:grid-cols-2 border-b border-[#2c2c2c] dark:border-white"
      >
        {/* Founder Portrait Box */}
        <div className="relative w-full aspect-square md:aspect-auto md:h-[60vh] overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-8 text-center border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white select-none">
          <div className="absolute inset-0 border-x border-y border-[#2c2c2c]/5 dark:border-white/5 m-8 pointer-events-none"></div>
          <span className="font-sans text-xs text-[#2c2c2c]/40 dark:text-white/40 uppercase tracking-wide max-w-xs leading-relaxed">
            {founder.placeholder}
          </span>
        </div>

        {/* Founder Details */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <span className="text-[10px] font-black tracking-widest text-[#2c2c2c]/40 dark:text-white/40 uppercase mb-2 block">
            {founder.role}
          </span>
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#2c2c2c] dark:text-white mb-6">
            {founder.name}
          </h3>
          <p className="font-serif italic text-lg md:text-xl text-[#2c2c2c]/80 dark:text-white/80 leading-relaxed pl-6 border-l border-[#2c2c2c]/20 dark:border-white/20">
            "{founder.quote}"
          </p>
        </div>
      </div>

      {/* Core Team Grid (2 columns on mobile, 5 columns on desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-5">
        {team.map((member, idx) => (
          <div
            key={member.name}
            ref={(el) => {
              teamRefs.current[idx] = el;
            }}
            className={`p-6 md:p-8 flex flex-col items-center text-center group transition-all duration-300 border-b border-[#2c2c2c] dark:border-white ${idx % 2 === 0
                ? "border-r border-[#2c2c2c] dark:border-white"
                : "md:border-r"
              } ${idx % 5 === 4 ? "md:border-r-0" : "md:border-r"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            {/* Aspect Square Placeholder */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-100 dark:bg-neutral-900 border border-[#2c2c2c]/10 dark:border-white/10 group-hover:border-[#2c2c2c] dark:group-hover:border-white transition-colors duration-300 flex items-center justify-center p-2 mb-4 select-none">
              <span className="font-sans text-[8px] text-[#2c2c2c]/40 dark:text-white/40 uppercase tracking-wider leading-relaxed">
                [ FOTO ]
              </span>
            </div>

            {/* Member Details */}
            <h4 className="text-sm font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-1">
              {member.name}
            </h4>
          </div>
        ))}
      </div>
    </section>
  );
}
