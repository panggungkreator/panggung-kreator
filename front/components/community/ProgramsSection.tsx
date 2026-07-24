"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";
import Image from "next/image";

export default function ProgramsSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }
    staggerIn(cardsRef.current, 0.1, 40);
  }, [fadeUp, staggerIn]);

  const programs = [
    {
      title: "OPEN MIC",
      category: "🎤 PUBLIC SPEAKING",
      desc: "Panggung mingguan untuk berbicara bebas — melatih mental, ritme tampil, dan manajemen demam panggung.",
      linkText: "IKUT OPEN MIC",
      image: "/assets/landing-page/open-mic.jpg",
    },
    {
      title: "PUBLIC SPEAKING PRACTICE",
      category: "🎤 PUBLIC SPEAKING",
      desc: "Kelas intensif teknik komunikasi: olah vokal, artikulasi, body language, dan penyusunan presentasi efektif.",
      linkText: "IKUT KELAS",
      image: "/assets/landing-page/public-speaking.jpg",
    },
    {
      title: "MC PRACTICE",
      category: "🎤 PUBLIC SPEAKING",
      desc: "Pelatihan menjadi Master of Ceremony: memandu acara formal/informal, crowd control, dan mencairkan suasana.",
      linkText: "IKUT MC PRACTICE",
      image: "/assets/landing-page/mc-practice.jpg",
    },
    {
      title: "VOICE OVER CHALLENGE",
      category: "🎙️ OLAH SUARA",
      desc: "Tantangan mengisi suara naskah iklan/dokumenter — melatih intonasi, ekspresi, dan karakter vokal.",
      linkText: "IKUT CHALLENGE",
      image: "/assets/landing-page/voice-over.jpg",
    },
    {
      title: "NEWS PRESENTER CHALLENGE",
      category: "🎙️ OLAH SUARA",
      desc: "Simulasi penyiar TV: teknik presenting, cara delivery berita, intonasi, dan ekspresi wajah yang profesional.",
      linkText: "IKUT CHALLENGE",
      image: "/assets/landing-page/news-presenter.JPG",
    },
    {
      title: "CONTENT CREATOR CLASS",
      category: "🎬 CONTENT CREATION",
      desc: "Ide kreatif, strategi algoritma media sosial, hingga proses editing konten digital.",
      linkText: "IKUT KELAS",
      image: "/assets/landing-page/content-creator.JPG",
    },
    {
      title: "PERSONAL BRANDING CLASS",
      category: "🌟 PERSONAL BRANDING",
      desc: "Memetakan keunikan diri, membangun portofolio digital, dan menata citra diri profesional.",
      linkText: "IKUT KELAS",
      image: "/assets/landing-page/personal-branding.jpg",
    },
    {
      title: "SHARING SESSION",
      category: "💡 MINDSET & GROWTH",
      desc: "Diskusi interaktif berbasis pengalaman nyata: kesehatan mental, personal growth, dan motivasi kehidupan.",
      linkText: "IKUT SESI",
      image: "/assets/landing-page/sharing-session.jpg",
    },
    {
      title: "NETWORKING SESSION",
      category: "💡 RELASI",
      desc: "Kegiatan eksklusif bertukar peluang karier, memperluas relasi bisnis, dan menjalin kolaborasi antar-anggota.",
      linkText: "IKUT NETWORKING",
      image: "/assets/landing-page/networking.jpg",
    },
  ];

  return (
    <section id="program" className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Section Header */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ PROGRAM KOMUNITAS ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            TEMPAT BERLATIH,<br />BUKAN SEKADAR BELAJAR
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          80% praktik. Setiap anggota mendapat panggung dan kesempatan tampil yang sama, setiap minggunya.
        </p>
      </div>

      {/* Cards Layout: Grid on Mobile & Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-[#2c2c2c] dark:bg-white gap-[1px]">
        {programs.map((prog, idx) => (
          <div
            key={prog.title}
            ref={(el) => { cardsRef.current[idx] = el; }}
            className="flex flex-col group transition-all duration-300 bg-white dark:bg-[#2c2c2c] hover:bg-neutral-50 dark:hover:bg-neutral-950/40 border-b border-[#2c2c2c] dark:border-white"
          >
            {/* Card Header: Visual Placeholder */}
            <div className="w-full aspect-[16/10] border-b border-[#2c2c2c] dark:border-white/20 overflow-hidden bg-neutral-100 dark:bg-neutral-900 select-none relative">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-[#2c2c2c]/10 dark:border-white/10 group-hover:border-[#2c2c2c] dark:group-hover:border-white transition-colors duration-300 z-10"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-[#2c2c2c]/10 dark:border-white/10 group-hover:border-[#2c2c2c] dark:group-hover:border-white transition-colors duration-300 z-10"></div>

              <Image
                src={prog.image}
                alt={prog.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
              />
            </div>

            {/* Card Body */}
            <div className="p-8 md:p-10 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
                  {prog.category}
                </span>
                <h3 className="text-xl font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-4">
                  {prog.title}
                </h3>
                <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/70 dark:text-white/70 leading-relaxed mb-8 uppercase tracking-wide">
                  {prog.desc}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Bootcamp Badge */}
      <div className="border-t border-[#2c2c2c] dark:border-white p-8 md:p-12 text-center">
        <span className="text-[10px] font-black tracking-[0.3em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
          [ COMING SOON ]
        </span>
        <p className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[#2c2c2c] dark:text-white mt-3">
          BOOTCAMP — Program inkubasi intensif bersama mentor pakar industri.
        </p>
      </div>
    </section>
  );
}
