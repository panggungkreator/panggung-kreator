"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import { Mic, CheckCircle2, Award } from "lucide-react";

export default function SectionPerformerVision() {
  const qualityList = [
    { id: "performer_vision.bullet1", defaultText: "Skill Public Speaking" },
    { id: "performer_vision.bullet2", defaultText: "Cara bicara berkarakter" },
    { id: "performer_vision.bullet3", defaultText: "Mental tampil" },
    { id: "performer_vision.bullet4", defaultText: "Personal Branding kuat" },
    { id: "performer_vision.bullet5", defaultText: "Siap jadi pembicara, MC, presenter, host, kreator, maupun leader" },
  ];

  return (
    <section
      id="performer-vision"
      className="relative py-24 sm:py-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden border-y border-zinc-200 dark:border-zinc-800"
    >
      {/* Dramatic spotlight / background radial gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/5 to-transparent blur-[140px]" />
        <div className="absolute -left-[10%] bottom-[10%] w-[350px] h-[350px] rounded-full bg-red-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Manifesto */}
          <div className="lg:col-span-6 flex flex-col">
            <span className="text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Mic size={14} />
              <span>Our Vision</span>
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2] mb-6 reveal-up">
              <Edit id="performer_vision.heading">Kami Tidak Sekadar Membuat Member.</Edit>
            </h2>

            <h3 className="text-2xl sm:text-3xl font-serif text-amber-600 dark:text-amber-400 font-semibold mb-8 reveal-up">
              <Edit id="performer_vision.subheading">Kami ingin menciptakan Performer.</Edit>
            </h3>

            <span className="text-zinc-550 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mb-6 block">
              <Edit id="performer_vision.bullets_title">Orang-orang yang punya:</Edit>
            </span>

            {/* List */}
            <ul className="space-y-4 stagger-parent">
              {qualityList.map((item) => (
                <li key={item.id} className="flex items-start gap-3 group stagger-child">
                  <CheckCircle2 size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-650 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors text-base sm:text-lg">
                    <Edit id={item.id}>{item.defaultText}</Edit>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Spotlight visual */}
          <div className="lg:col-span-6">
            <div className="relative p-8 sm:p-12 rounded-3xl border border-amber-500/20 bg-zinc-50 dark:bg-zinc-900/60 backdrop-blur-sm text-center flex flex-col items-center shadow-2xl reveal-up">
              {/* Decorative light cone */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />
              
              <Award size={48} className="text-amber-550 dark:text-amber-400 mb-6 animate-pulse" />

              <span className="text-xs uppercase tracking-widest text-zinc-550 dark:text-zinc-400 font-extrabold mb-4 block">
                <Edit id="performer_vision.allstar_pre">Dan suatu hari… Mereka akan berdiri di acara utama kami:</Edit>
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider font-serif text-zinc-900 dark:text-white mb-4 bg-gradient-to-r from-zinc-900 via-amber-600 to-amber-800 dark:from-white dark:via-amber-200 dark:to-amber-400 bg-clip-text text-transparent">
                <Edit id="performer_vision.allstar_heading">PANGGUNG KREATOR ALL STAR</Edit>
              </h2>

              <p className="text-zinc-600 dark:text-zinc-400 max-w-sm text-sm sm:text-base leading-relaxed">
                <Edit id="performer_vision.allstar_desc">Panggung besar tempat performer terbaik bersinar.</Edit>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
