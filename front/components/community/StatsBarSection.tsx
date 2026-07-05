"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

export default function StatsBarSection() {
  const { counterUp } = useScrollAnimations();

  const numRef1 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (numRef1.current) counterUp(numRef1.current, 300, "+");
  }, [counterUp]);

  const stats = [
    {
      ref: numRef1,
      isNumber: true,
      suffix: "+",
      label: "ANGGOTA AKTIF",
      desc: "Anggota aktif yang tersebar di wilayah Bandung dan sekitarnya",
    },
    {
      isNumber: false,
      value: "Weekly",
      label: "KEGIATAN RUTIN",
      desc: "Kegiatan pengembangan diri diselenggarakan setiap minggu tanpa absen",
    },
    {
      isNumber: false,
      value: "Alumni Pro",
      label: "ALUMNI PRO",
      desc: "Anggota pemula berhasil meraih peluang kerja sebagai MC, podcaster, dan content creator",
    },
    {
      isNumber: false,
      value: "Multi-Venue",
      label: "MULTI-VENUE",
      desc: "Kemitraan strategis dengan berbagai kafe lokal, creative hub, dan ruang kreatif di Bandung",
    },
    {
      isNumber: false,
      value: "Media Coverage",
      label: "MEDIA COVERAGE",
      desc: "Publikasi dan eksposur positif dari media partner lokal dan komunitas kreatif regional",
    },
  ];

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-20">
      {/* 4-Column Metric Grid with stark border divisions */}
      <div className="grid grid-cols-2 md:grid-cols-5">
        {stats.map((s, idx) => (
          <div
            key={s.label}
            className={`p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 ${idx % 3 === 0 ? "border-r border-[#2c2c2c] dark:border-white" : ""
              } ${idx < 3 ? "border-b border-[#2c2c2c] dark:border-white" : ""} md:border-b-0 ${idx < 4 ? "md:border-r md:border-[#2c2c2c] md:dark:border-white" : "md:border-r-0"
              }`}
          >
            {/* Giant Number / Text Value */}
            {s.isNumber ? (
              <div
                ref={s.ref}
                className="text-4xl md:text-6xl font-black tracking-tighter text-[#2c2c2c] dark:text-white leading-none mb-3"
              >
                0{s.suffix}
              </div>
            ) : (
              <div className="text-2xl md:text-4xl font-black tracking-tighter text-[#2c2c2c] dark:text-white leading-none mb-3 uppercase font-sans">
                {s.value}
              </div>
            )}

            {/* Uppercase Label */}
            <div className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/40 dark:text-white/40 mb-2 uppercase">
              {s.label}
            </div>

            {/* Micro description */}
            <p className="font-sans text-[10px] text-[#2c2c2c]/50 dark:text-white/50 max-w-[200px] leading-normal uppercase">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
