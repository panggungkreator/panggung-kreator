"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function KolaborasiOverviewSection() {
  const { fadeUp, counterUp } = useScrollAnimations();

  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      fadeUp(textRef.current, 0.1, 20);
    }
    if (statsRef.current) {
      fadeUp(statsRef.current, 0.2, 30);
    }
    if (numRef.current) {
      counterUp(numRef.current, 300, "+");
    }
  }, [fadeUp, counterUp]);

  const stats = [
    {
      isNumber: true,
      ref: numRef,
      suffix: "+",
      label: "Anggota Aktif"
    },
    {
      isNumber: false,
      value: "Weekly",
      label: "Kegiatan Rutin"
    },
    {
      isNumber: false,
      value: "Multi-Venue",
      label: "Kafe & Hub di Bandung"
    },
    {
      isNumber: false,
      value: "Alumni Pro",
      label: "MC, Podcaster, Creator"
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px]">
        {/* Left: Teks Deskripsi (60% / 3 cols on lg) */}
        <div
          ref={textRef}
          className="lg:col-span-3 p-8 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#2c2c2c] dark:border-white"
        >
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-6 block">
            [ TENTANG KAMI ]
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider mb-6 text-[#2c2c2c] dark:text-white">
            PANGGUNG KREATOR ADALAH SALAH SATU EKOSISTEM PENGEMBANGAN DIRI DI BANDUNG.
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/65 dark:text-white/65 leading-relaxed uppercase tracking-wider">
            Panggung Kreator adalah komunitas pengembangan diri berbasis di Bandung yang <span className="highlight-stabilo">berfokus pada public speaking, content creation, dan personal branding.</span> Kami menyelenggarakan kegiatan rutin mingguan di berbagai kafe dan creative hub, memberikan wadah nyata bagi siapa saja yang ingin bertumbuh di depan publik.
          </p>
        </div>

        {/* Right: Grid Statistik (40% / 2 cols on lg) */}
        <div
          ref={statsRef}
          className="lg:col-span-2 grid grid-cols-1 bg-[#2c2c2c] dark:bg-white gap-[1px]"
        >
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="p-6 md:p-10 flex flex-col items-center justify-center text-center bg-white dark:bg-[#2c2c2c] hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-all duration-300"
            >
              {stat.isNumber ? (
                <div
                  ref={stat.ref}
                  className="text-3xl md:text-5xl font-black tracking-tighter text-[#2c2c2c] dark:text-white leading-none mb-3"
                >
                  0{stat.suffix}
                </div>
              ) : (
                <div className="text-xl md:text-3xl font-black tracking-tighter text-[#2c2c2c] dark:text-white leading-none mb-3 uppercase">
                  {stat.value}
                </div>
              )}
              <div className="text-[10px] font-black tracking-[0.2em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
