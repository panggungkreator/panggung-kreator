"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function KolaborasiProgramSection() {
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

  const programs = [
    {
      no: "01",
      title: "Open Mic Friday",
      pilar: "Public Speaking",
      desc: "Sesi tampil bebas setiap Jumat malam — panggung terbuka untuk semua"
    },
    {
      no: "02",
      title: "Speech Practice",
      pilar: "Public Speaking",
      desc: "Latihan pidato terstruktur dengan evaluasi dan feedback langsung"
    },
    {
      no: "03",
      title: "MC Practice",
      pilar: "Public Speaking",
      desc: "Simulasi memandu acara formal dan non-formal"
    },
    {
      no: "04",
      title: "Storytelling Night",
      pilar: "Public Speaking",
      desc: "Berlatih menyampaikan cerita yang memikat audiens"
    },
    {
      no: "05",
      title: "Creator Workshop",
      pilar: "Content Creation",
      desc: "Pelatihan produksi konten dari pra-produksi hingga distribusi"
    },
    {
      no: "06",
      title: "Podcast Lab",
      pilar: "Content Creation",
      desc: "Praktik langsung rekam podcast dengan teknik audio profesional"
    },
    {
      no: "07",
      title: "Branding Bootcamp",
      pilar: "Personal Branding",
      desc: "Workshop intensif membangun personal brand yang otentik"
    },
    {
      no: "08",
      title: "Networking Session",
      pilar: "Personal Branding",
      desc: "Sesi kolaborasi dan perluasan jaringan antar anggota"
    },
    {
      no: "09",
      title: "Mentoring Circle",
      pilar: "Personal Branding",
      desc: "Bimbingan langsung dari alumni senior dan praktisi"
    }
  ];

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      {/* Section Header */}
      <div className="p-8 md:p-16 lg:px-24">
        <span 
          ref={labelRef}
          className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-6 block"
        >
          [ PROGRAM AKTIF ]
        </span>
        <h2 
          ref={headlineRef}
          className="text-[clamp(2rem,4vw,3.5rem)] font-black uppercase tracking-tighter leading-[0.9] max-w-2xl text-[#2c2c2c] dark:text-white"
        >
          9 PROGRAM YANG BERJALAN{" "}
          <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400 lowercase">
            rutin.
          </span>
        </h2>
      </div>

      {/* Grid Program - Perfect 1px borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-[#2c2c2c] dark:bg-white gap-[1px] border-t border-[#2c2c2c] dark:border-white">
        {programs.map((item, idx) => (
          <div
            key={item.no}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            className="bg-white dark:bg-[#2c2c2c] p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/30"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-3xl font-black text-[#2c2c2c]/10 dark:text-white/10 leading-none">
                {item.no}
              </span>
              <span className="text-[8px] font-black tracking-widest uppercase border border-[#2c2c2c]/20 dark:border-white/20 text-[#2c2c2c]/50 dark:text-white/50 px-2 py-0.5 rounded-none">
                {item.pilar}
              </span>
            </div>
            
            <div>
              <h3 className="text-md font-extrabold uppercase tracking-wider mb-2 text-[#2c2c2c] dark:text-white">
                {item.title}
              </h3>
              <p className="font-sans text-xs text-[#2c2c2c]/60 dark:text-white/60 leading-relaxed uppercase tracking-wider">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
