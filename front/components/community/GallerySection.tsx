"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";
import Link from "next/link";

export default function GallerySection() {
  const { fadeUp, parallax, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }

    // Stagger gallery items entry
    staggerIn(itemsRef.current, 0.15, 40);

    // Apply parallax on each image element inside the cards
    imgRefs.current.forEach((img) => {
      if (img) parallax(img, 0.1);
    });
  }, [fadeUp, staggerIn, parallax]);

  const activities = [
    {
      title: "Open Mic Night",
      category: "🎤 PUBLIC SPEAKING",
      desc: "Dokumentasi keseruan panggung Open Mic mingguan.",
      placeholder: "Foto suasana Open Mic Night — peserta di panggung mini dengan mikrofon, audiens tertawa gembira.",
    },
    {
      title: "Public Speaking Practice",
      category: "🎤 PUBLIC SPEAKING",
      desc: "Suasana kelas yang fokus dan interaktif.",
      placeholder: "Foto kelas Public Speaking — peserta berdiskusi kelompok, saling memberikan feedback.",
    },
    {
      title: "Networking Session",
      category: "💡 RELASI & GATHERING",
      desc: "Interaksi hangat antar-anggota dalam gathering.",
      placeholder: "Foto kumpul santai di cafe, keceriaan anggota saling bertukar cerita.",
    },
    {
      title: "Content Creator Class",
      category: "🎬 CONTENT CREATION",
      desc: "Aksi kreatif belajar membuat konten.",
      placeholder: "Foto belajar ngedit video, member memegang kamera mirrorless sambil tersenyum.",
    },
  ];

  return (
    <section id="galeri" className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white">
      {/* Section Header */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ GALERI KEGIATAN ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            BEGINILAH CARA KAMI BERTUMBUH BERSAMA
          </h2>
        </div>
        <div className="flex flex-col items-start gap-4">
          <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
            Momen otentik dari ruang latihan, panggung pertunjukan, hingga kolaborasi di balik layar yang membentuk perjalanan setiap member.
          </p>
          <Link
            href="/galeri"
            className="bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] text-[10px] font-bold uppercase tracking-[0.25em] px-6 py-3.5 border border-[#2c2c2c] dark:border-white hover:bg-transparent hover:text-[#2c2c2c] dark:hover:bg-transparent dark:hover:text-white transition-all duration-350 rounded-none inline-block whitespace-nowrap"
          >
            LIHAT SEMUA DOKUMENTASI →
          </Link>
        </div>
      </div>

      {/* 2x2 Grid with Stark Mid-borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#2c2c2c] dark:bg-white gap-0 md:gap-[1px]">
        {activities.map((act, idx) => (
          <div
            key={act.title}
            ref={(el) => { itemsRef.current[idx] = el; }}
            className="relative aspect-[4/3] md:aspect-video overflow-hidden group flex flex-col justify-end bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white md:border-b-0 md:border-r-0"
          >
            {/* Parallax Image Placeholder Container */}
            <div
              ref={(el) => { imgRefs.current[idx] = el; }}
              className="absolute inset-0 w-full h-[120%] -top-[10%] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-8 text-center transition-transform duration-700 ease-out group-hover:scale-105 select-none"
            >
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px]"></div>

              <div className="max-w-md px-6 pointer-events-none">
                <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/30 dark:text-white/30 block mb-2">
                  [ RENCANA VISUAL ]
                </span>
                <p className="font-sans text-xs text-[#2c2c2c]/40 dark:text-white/30 uppercase tracking-wider leading-relaxed">
                  {act.placeholder}
                </p>
              </div>
            </div>

            {/* Stark Monochromatic Overlay - Fade on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2c]/90 via-[#2c2c2c]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none"></div>

            {/* Text Overlay content (Always visible) */}
            <div className="relative z-10 p-8 md:p-12 text-white pointer-events-none flex flex-col justify-end h-full">
              <span className="text-[10px] font-black tracking-[0.3em] text-white/60 mb-2 block">
                {act.category}
              </span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider mb-3">
                {act.title}
              </h3>
              <p className="font-sans text-xs text-white/70 max-w-md leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-350 ease-out">
                {act.desc}
              </p>
            </div>

            {/* Corner Bracket Detail for Premium Editorial feel */}
            <div className="absolute top-6 right-6 z-10 w-4 h-4 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-6 right-6 z-10 w-4 h-4 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
