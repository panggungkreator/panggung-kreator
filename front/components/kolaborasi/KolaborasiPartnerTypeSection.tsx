"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function KolaborasiPartnerTypeSection() {
  const { fadeUp, parallax, staggerIn } = useScrollAnimations();

  const labelRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (labelRef.current) fadeUp(labelRef.current, 0.1, 20);
    if (headlineRef.current) fadeUp(headlineRef.current, 0.2, 30);
    
    const validCards = cardsRef.current.filter((c) => c !== null) as HTMLElement[];
    if (validCards.length > 0) {
      staggerIn(validCards, 0.08, 40);
    }
  }, [fadeUp, staggerIn]);

  useEffect(() => {
    imgRefs.current.forEach((img) => {
      if (img) parallax(img, 0.08);
    });
  }, [parallax]);

  const partners = [
    {
      no: "01",
      title: "Kafe & Coffee Shop",
      desc: "Menjadi venue tetap kegiatan mingguan — exposure langsung ke 300+ member aktif",
      examples: ["Diskon member", "Branding di venue", "Co-host event mingguan"],
      placeholder: "[ Foto suasana kegiatan Panggung Kreator di Kafe Bandung — interaksi akrab, kopi, panggung mini ]"
    },
    {
      no: "02",
      title: "Kampus & Institusi",
      desc: "Kolaborasi program workshop, seminar, dan pelatihan di lingkungan kampus",
      examples: ["Guest lecture", "Joint workshop", "Magang MC & Host acara"],
      placeholder: "[ Foto seminar/workshop Panggung Kreator di aula kampus — audiens mahasiswa, pembicara berbagi ]"
    },
    {
      no: "03",
      title: "Brand & UMKM",
      desc: "Sponsorship program atau endorsement melalui jaringan kreator komunitas",
      examples: ["Product placement", "Content collaboration", "Brand ambassador program"],
      placeholder: "[ Visual sponsorship Panggung Kreator — merchandise brand, banner penempatan logo produk ]"
    },
    {
      no: "04",
      title: "Media Partner & EO",
      desc: "Kolaborasi liputan event, cross-promotion, dan co-organizing acara",
      examples: ["Media coverage", "Cross-promotion sosmed", "Joint-event production"],
      placeholder: "[ Visual publikasi & flyer acara kolaborasi — logo media partner, liputan dokumentasi ]"
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
          [ BENTUK KOLABORASI ]
        </span>
        <h2 
          ref={headlineRef}
          className="text-[clamp(2rem,4vw,3.5rem)] font-black uppercase tracking-tighter leading-[0.9] max-w-2xl text-[#2c2c2c] dark:text-white"
        >
          EMPAT JALUR{" "}
          <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400 lowercase">
            kemitraan.
          </span>
        </h2>
      </div>

      {/* Grid 2x2 - Perfect 1px borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#2c2c2c] dark:bg-white gap-[1px] border-t border-[#2c2c2c] dark:border-white">
        {partners.map((item, idx) => (
          <div
            key={item.no}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            className="bg-white dark:bg-[#2c2c2c] p-8 flex flex-col justify-between group"
          >
            {/* Aspect 3/2 Image Placeholder with Parallax */}
            <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-[#2c2c2c]/10 dark:border-white/10 mb-8 rounded-none">
              <div 
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                className="absolute inset-0 w-full h-[120%] -top-[10%] p-6 flex flex-col justify-center items-center text-center transition-transform duration-700 ease-out group-hover:scale-105 select-none"
              >
                {/* Subtle grid pattern background */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/30 dark:text-white/30 block mb-2">
                  [ VISUAL KEMITRAAN ]
                </span>
                <p className="font-sans text-[10px] text-[#2c2c2c]/40 dark:text-white/30 uppercase tracking-wider leading-relaxed max-w-sm">
                  {item.placeholder}
                </p>
              </div>

              {/* Giant number overlay */}
              <div className="absolute top-4 left-4 text-5xl font-black text-[#2c2c2c]/10 dark:text-white/10 select-none">
                {item.no}
              </div>
            </div>

            {/* Content info */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-2 text-[#2c2c2c] dark:text-white">
                {item.title}
              </h3>
              <p className="font-sans text-xs text-[#2c2c2c]/60 dark:text-white/65 leading-relaxed uppercase tracking-wider mb-6">
                {item.desc}
              </p>

              {/* Examples checklist */}
              <div className="border-t border-[#2c2c2c]/10 dark:border-white/10 pt-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#2c2c2c]/40 dark:text-white/40 block mb-2">
                  CONTOH KOLABORASI:
                </span>
                <ul className="space-y-1.5">
                  {item.examples.map((ex, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-[#2c2c2c]/70 dark:text-white/70 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-[#2c2c2c] dark:bg-white rounded-none" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
