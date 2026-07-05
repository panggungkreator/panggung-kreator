"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

export default function JourneySection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }
    staggerIn(cardsRef.current, 0.12, 40);
  }, [fadeUp, staggerIn]);

  const steps = [
    {
      num: "01",
      title: "DATANG & BERGABUNG",
      desc: "Masuk komunitas, rasakan atmosfer suportif, dan mulailah dengan menjadi penonton Open Mic pertama.",
      placeholder: "Langkah 1: Member duduk di barisan audiens mengamati panggung.",
    },
    {
      num: "02",
      title: "BERANI TAMPIL",
      desc: "Pertama kali naik panggung mini untuk melatih keberanian dasar berbicara langsung di depan orang.",
      placeholder: "Langkah 2: Tangan memegang mikrofon di bawah pancaran sorot lampu panggung.",
    },
    {
      num: "03",
      title: "EVALUASI & BERTUMBUH",
      desc: "Menerima feedback terstruktur, mengikuti kelas intensif mingguan, dan membangun kemampuan teknis.",
      placeholder: "Langkah 3: Lembar catatan evaluasi terstruktur untuk perbaikan.",
    },
    {
      num: "04",
      title: "MENJADI PERFORMER",
      desc: "Percaya diri tampil di berbagai sesi, membangun portofolio bicara, dan merintis karier kreatif.",
      placeholder: "Langkah 4: Siluet member tampil penuh percaya diri di panggung utama.",
    },
  ];

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      {/* Section Header */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ 1 STAGE, 1 PROGRESS ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            SETIAP PANGGUNG ADALAH SEBUAH KEMAJUAN
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Metodologi empat tahap teruji untuk membimbingmu bertransformasi dari pengamat pasif menjadi pembicara yang berdampak.
        </p>
      </div>

      {/* 4-Step Grid with rigid border system */}
      <div className="grid grid-cols-1 md:grid-cols-4">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            ref={(el) => { cardsRef.current[idx] = el; }}
            className={`p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 ${idx < 3
              ? "border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
              : "border-b md:border-b-0 border-[#2c2c2c] dark:border-white"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            <div>
              {/* Giant Number and Step Badge */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-5xl md:text-6xl font-black tracking-tighter text-[#2c2c2c]/15 dark:text-white/15 group-hover:text-[#2c2c2c] dark:group-hover:text-white transition-colors duration-500 leading-none">
                  {step.num}
                </span>
                <span className="text-[9px] font-black tracking-widest text-[#2c2c2c]/40 dark:text-white/40 border border-[#2c2c2c]/10 dark:border-white/10 px-2 py-0.5 uppercase">
                  PHASE {step.num}
                </span>
              </div>

              {/* Landscape Visual Placeholder Box */}
              <div className="w-full aspect-[16/10] border border-[#2c2c2c]/10 dark:border-white/10 rounded-none bg-neutral-100/50 dark:bg-neutral-900/50 mb-6 flex items-center justify-center p-4 text-center group-hover:border-[#2c2c2c] dark:group-hover:border-white transition-colors duration-300">
                <span className="font-sans text-[10px] text-[#2c2c2c]/40 dark:text-white/40 uppercase tracking-wide leading-relaxed">
                  {step.placeholder}
                </span>
              </div>

              {/* Step Title & Description */}
              <h3 className="text-base font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-3">
                {step.title}
              </h3>
            </div>
            <p className="font-sans text-xs text-[#2c2c2c]/60 dark:text-white/60 leading-relaxed uppercase tracking-wide">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Filosofi Tagline Block */}
      <div className="border-t border-[#2c2c2c] dark:border-white p-8 md:p-16 text-center bg-neutral-50 dark:bg-neutral-950/40">
        <p className="font-serif italic text-lg md:text-2xl text-[#2c2c2c]/80 dark:text-white/80 max-w-3xl mx-auto leading-relaxed">
          "S  etiap panggung yang kita pijak - sekecil apapun - adalah <span className="highlight-stabilo">satu langkah nyata menuju versi terbaik dari diri sendiri.</span>"
        </p>
      </div>
    </section>
  );
}
