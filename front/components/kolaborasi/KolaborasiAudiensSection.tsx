"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function KolaborasiAudiensSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const labelRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (labelRef.current) fadeUp(labelRef.current, 0.1, 20);
    if (headlineRef.current) fadeUp(headlineRef.current, 0.2, 30);
    
    const validCards = cardsRef.current.filter((c) => c !== null) as HTMLElement[];
    if (validCards.length > 0) {
      staggerIn(validCards, 0.08, 40);
    }
  }, [fadeUp, staggerIn]);

  const audiens = [
    {
      no: "01",
      title: "Pelajar & Mahasiswa",
      desc: "Generasi muda yang ingin mengasah kemampuan berbicara dan berkreasi sejak dini"
    },
    {
      no: "02",
      title: "Pekerja Kantoran",
      desc: "Profesional yang butuh skill presentasi dan personal branding untuk karir"
    },
    {
      no: "03",
      title: "Content Creator Pemula",
      desc: "Kreator yang ingin membangun audiens dan memperkuat storytelling"
    },
    {
      no: "04",
      title: "Calon MC & Public Speaker",
      desc: "Individu yang ingin memulai karir sebagai pembawa acara profesional"
    },
    {
      no: "05",
      title: "Profesional & Praktisi",
      desc: "Pakar di bidangnya yang ingin berbagi ilmu dan memperluas jaringan"
    },
    {
      no: "06",
      title: "Komunitas Bandung",
      desc: "Lokasi utama: Bandung & sekitarnya — basis komunitas yang solid"
    }
  ];

  return (
    <section className="relative bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      {/* Section Header */}
      <div className="p-8 md:p-16 lg:px-24">
        <span 
          ref={labelRef}
          className="text-xs uppercase tracking-[0.3em] font-black text-white/40 dark:text-[#2c2c2c]/40 mb-6 block"
        >
          [ PROFIL AUDIENS KAMI ]
        </span>
        <h2 
          ref={headlineRef}
          className="text-[clamp(2rem,4vw,3.5rem)] font-black uppercase tracking-tighter leading-[0.9] max-w-2xl"
        >
          SIAPA YANG KAMI{" "}
          <span className="font-serif italic font-normal text-neutral-400 dark:text-neutral-500 lowercase">
            jangkau?
          </span>
        </h2>
      </div>

      {/* Grid Profil Audiens - Perfect 1px borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white dark:bg-[#2c2c2c] gap-[1px] border-t border-[#2c2c2c] dark:border-white">
        {audiens.map((item, idx) => (
          <div
            key={item.no}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            className="bg-[#2c2c2c] dark:bg-white p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:bg-[#333333] dark:hover:bg-neutral-50"
          >
            <div className="text-4xl md:text-5xl font-black text-white/10 dark:text-[#2c2c2c]/10 mb-6 self-start">
              {item.no}
            </div>
            
            <div>
              <h3 className="text-md font-extrabold uppercase tracking-wider mb-2 text-white dark:text-[#2c2c2c]">
                {item.title}
              </h3>
              <p className="font-sans text-xs text-white/60 dark:text-[#2c2c2c]/60 leading-relaxed uppercase tracking-wider">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
