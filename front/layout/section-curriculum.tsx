"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { Video, Award, Mic2 } from "lucide-react";

export default function SectionCurriculum() {
  const programs = [
    {
      icon: <Video className="text-[#bc151b]" size={28} />,
      titleId: "program.p1_title",
      defaultTitle: "Sesi Panggung",
      descId: "program.p1_desc",
      defaultDesc: "Kelas mentoring intensif dengan tema spesifik. Mulai dari: Public Speaking Fundamental, Voice Over, MC, Siaran, Presentasi, Storytelling, Personal Branding.",
      extraId: "program.p1_extra",
      defaultExtra: "Sudah berjalan dari Panggung Kesatu hingga Panggung Kesepuluh. Setiap sesi dirancang bertahap dan terstruktur.",
    },
    {
      icon: <Award className="text-[#bc151b]" size={28} />,
      titleId: "program.p2_title",
      defaultTitle: "Level Up Session",
      descId: "program.p2_desc",
      defaultDesc: "Mentoring kelompok bersama mentor melalui sistem Mentoring Carousel. Kamu akan belajar langsung dari beberapa mentor secara bergilir.",
      extraId: "program.p2_extra",
      defaultExtra: "Lebih fokus. Lebih personal. Lebih cepat berkembang.",
    },
    {
      icon: <Mic2 className="text-[#bc151b]" size={28} />,
      titleId: "program.p3_title",
      defaultTitle: "Open Mic Teman Sepanggung",
      descId: "program.p3_desc",
      defaultDesc: "Mini stage untuk member tampil dan bercerita. Tentang impian. Perjuangan. Pengalaman hidup.",
      extraId: "program.p3_extra",
      defaultExtra: "Tempat melatih keberanian, rasa percaya diri, dan koneksi emosional dengan audiens.",
    },
  ];

  return (
    <section
      id="program"
      className="relative py-24 sm:py-32 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-white overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-up">
          <span className="text-[#bc151b] font-bold text-xs uppercase tracking-widest mb-4 block">
            Our Programs
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2]">
            <Edit id="program.heading">Jalan Bertumbuhmu Sudah Kami Siapkan</Edit>
          </h2>
        </div>

        {/* 3 Columns Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-parent">
          {programs.map((prog, idx) => (
            <div
              key={prog.titleId}
              className="flex flex-col justify-between p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-[#bc151b]/30 dark:hover:border-[#bc151b]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 stagger-child"
            >
              <div>
                {/* Icon Wrapper */}
                <div className="w-14 h-14 rounded-2xl bg-[#bc151b]/10 dark:bg-[#bc151b]/20 flex items-center justify-center mb-6">
                  {prog.icon}
                </div>

                {/* Number counter */}
                <span className="text-xs font-bold text-[#bc151b] uppercase tracking-wider block mb-2">
                  Program 0{idx + 1}
                </span>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold font-serif mb-4 text-zinc-950 dark:text-white">
                  <Edit id={prog.titleId}>{prog.defaultTitle}</Edit>
                </h3>

                {/* Description */}
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">
                  <Edit id={prog.descId}>{prog.defaultDesc}</Edit>
                </p>
              </div>

              {/* Extra Info */}
              <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <p className="text-zinc-500 dark:text-zinc-500 text-xs sm:text-sm italic leading-relaxed">
                  <Edit id={prog.extraId}>{prog.defaultExtra}</Edit>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
