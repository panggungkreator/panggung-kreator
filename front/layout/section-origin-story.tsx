"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { History, Users, Award, Compass } from "lucide-react";

export default function SectionOriginStory() {
  const storySteps = [
    {
      icon: <Users className="text-amber-500" size={20} />,
      id: "origin_story.step1",
      defaultText: "Panggung Kreator lahir dari tongkrongan sederhana.",
    },
    {
      icon: <Compass className="text-amber-500" size={20} />,
      id: "origin_story.step2",
      defaultText: "Ngumpul bareng. Latihan ngomong bareng. Belajar bareng.",
    },
    {
      icon: <History className="text-amber-500" size={20} />,
      id: "origin_story.step3",
      defaultText: "Dari panggung kecil-kecilan… sampai sekarang berhasil bikin panggung sungguhan.",
    },
  ];

  return (
    <section
      id="origin-story"
      className="relative py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white overflow-hidden border-y border-zinc-200 dark:border-zinc-800"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Narrative & Timeline */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="inline-flex items-center gap-2 text-zinc-550 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4">
              <span>Our Story</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2] mb-12 reveal-up">
              <Edit id="origin_story.heading">Kita Mulai dari Titik yang Sama:</Edit>
            </h2>

            {/* Timeline Steps */}
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-8 space-y-10 stagger-parent">
              {storySteps.map((step) => (
                <div key={step.id} className="relative group stagger-child">
                  {/* Indicator Dot */}
                  <div className="absolute -left-[49px] top-1 w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm group-hover:border-amber-500 dark:group-hover:border-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/10 transition-all duration-300">
                    {step.icon}
                  </div>
                  <p className="text-zinc-650 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white text-lg leading-relaxed transition-colors">
                    <Edit id={step.id}>{step.defaultText}</Edit>
                  </p>
                </div>
              ))}
            </div>

            {/* Big quote box at the bottom */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 max-w-2xl reveal-up">
              <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 font-medium italic leading-relaxed">
                "<Edit id="origin_story.quote">
                  Karena kami tahu: Semua orang bisa berkembang, asal ada tempat bertumbuh yang benar.
                </Edit>"
              </p>
            </div>
          </div>

          {/* Right Column - Visual mockup / Grid */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/10 to-red-500/10 rounded-3xl blur-2xl opacity-60 pointer-events-none" />
            <div className="relative grid grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 p-6 flex flex-col justify-end text-white shadow-xl hover:scale-[1.02] transition-transform duration-300">
                <Users size={32} className="text-amber-400 mb-4" />
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Tongkrongan</span>
                <span className="text-sm font-semibold mt-1">Latihan Bareng</span>
              </div>
              {/* Card 2 */}
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-6 flex flex-col justify-end text-white shadow-xl translate-y-8 hover:scale-[1.02] transition-transform duration-300">
                <Compass size={32} className="text-white mb-4 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-amber-200 font-bold">Perjalanan</span>
                <span className="text-sm font-semibold mt-1">Tempat Bertumbuh</span>
              </div>
              {/* Card 3 */}
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 flex flex-col justify-end text-white shadow-xl hover:scale-[1.02] transition-transform duration-300">
                <Award size={32} className="text-amber-400 mb-4" />
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Prestasi</span>
                <span className="text-sm font-semibold mt-1">Panggung Utama</span>
              </div>
              {/* Card 4 */}
              <div className="aspect-[4/5] rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-end text-zinc-700 dark:text-zinc-300 shadow-xl translate-y-8 hover:scale-[1.02] transition-transform duration-300">
                <span className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Masa Depan</span>
                <span className="text-sm font-bold mt-1 text-zinc-950 dark:text-white">Menjadi Performer</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
