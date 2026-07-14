"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";
import Image from "next/image";

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
      image: "/assets/landing-page/journey-section/01-datng-duduk.jpg",
    },
    {
      num: "02",
      title: "BERANI TAMPIL",
      desc: "Pertama kali naik panggung mini untuk melatih keberanian dasar berbicara langsung di depan orang.",
      image: "/assets/landing-page/journey-section/02-berani-tampil.jpg",
      position: "50% 38%",
    },
    {
      num: "03",
      title: "EVALUASI & BERTUMBUH",
      desc: "Menerima feedback terstruktur, mengikuti kelas intensif mingguan, dan membangun kemampuan teknis.",
      image: "/assets/landing-page/journey-section/03-evaluasi.jpg",
      position: "50% 28%",
    },
    {
      num: "04",
      title: "MENJADI PERFORMER",
      desc: "Percaya diri tampil di berbagai sesi, membangun portofolio bicara, dan merintis karier kreatif.",
      image: "/assets/landing-page/journey-section/04-tampilaja.jpg",
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

              {/* Landscape Visual Box */}
              <div className="w-full aspect-[16/10] relative overflow-hidden border border-[#2c2c2c]/10 dark:border-white/10 rounded-none bg-neutral-100/50 dark:bg-neutral-900/50 mb-6 group-hover:border-[#2c2c2c] dark:group-hover:border-white transition-colors duration-300">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-80 dark:opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  style={{ objectPosition: step.position || "center" }}
                />
                {/* Dark overlay to make the image fit the stark aesthetic */}
                <div className="absolute inset-0 bg-[#2c2c2c]/5 dark:bg-black/35 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
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
          "Setiap panggung yang kita pijak - sekecil apapun - adalah <span className="highlight-stabilo">satu langkah nyata menuju versi terbaik dari diri sendiri.</span>"
        </p>
      </div>
    </section>
  );
}
