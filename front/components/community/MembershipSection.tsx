"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

const benefits = [
  {
    icon: "📒",
    title: "E-JOURNAL & MODUL EKSKLUSIF",
    desc: "Panduan berkala untuk mencatat dan mengukur perkembangan skill pribadimu secara terstruktur.",
  },
  {
    icon: "📱",
    title: "MATERI PEMBELAJARAN PREMIUM",
    desc: "Akses materi pembelajaran digital dari mentor tamu dan praktisi industri.",
  },
  {
    icon: "🧑‍🏫",
    title: "MENTORING TERBIMBING",
    desc: "Berdiskusi langsung dengan pengurus dan mentor tentang progres kemampuan komunikasimu.",
  },
  {
    icon: "⭐",
    title: "PRIORITAS SESI PRAKTIK",
    desc: "Hak utama mengisi kuota tampil di panggung Open Mic dan kelas praktik mingguan.",
  },
  {
    icon: "🎟️",
    title: "UNDANGAN NETWORKING EKSKLUSIF",
    desc: "Akses ke acara internal komunitas untuk memperluas peluang karier dan bisnis.",
  },
];

export default function MembershipSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const benefitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable animations on mobile to prevent layout shift and border clipping
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      if (headerRef.current) {
        headerRef.current.style.opacity = "1";
        headerRef.current.style.transform = "none";
      }
      benefitRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      if (ctaRef.current) {
        ctaRef.current.style.opacity = "1";
        ctaRef.current.style.transform = "none";
      }
      return;
    }

    if (headerRef.current) fadeUp(headerRef.current, 0.1, 30);
    staggerIn(benefitRefs.current, 0.1, 40);
    if (ctaRef.current) fadeUp(ctaRef.current, 0.2, 20);
  }, [fadeUp, staggerIn]);

  return (
    <section id="membership" className="relative bg-[#2c2c2c] text-white border-b border-neutral-700 z-10">
      {/* Section Header */}
      <div ref={headerRef} className="p-6 md:p-16 border-b border-neutral-700 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-white/40 mb-3 block">
            [ MEMBERSHIP ]
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
            IKUT LEBIH DALAM.<br />
            <span className="font-serif italic font-normal normal-case text-white/60">Tumbuh lebih cepat.</span>
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Daftarkan dirimu sebagai Member Resmi Panggung Kreator dan dapatkan akses eksklusif ke materi, mentoring, dan platform belajar kami.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5">
        {benefits.map((b, idx) => (
          <div
            key={b.title}
            ref={(el) => { benefitRefs.current[idx] = el; }}
            className={`p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 bg-[#2c2c2c] hover:bg-white/5 border-b border-neutral-700 md:border-b-0 ${idx < 4 ? "md:border-r md:border-neutral-700" : "md:border-r-0"
              }`}
          >
            {/* Title / Label */}
            <div className="text-[14px] font-black tracking-[0.2em] md:tracking-[0.25em] text-white mb-2 uppercase">
              {b.title}
            </div>

            {/* Description */}
            <p className="font-sans text-xs md:text-[10px] text-white/50 max-w-[260px] md:max-w-[200px] leading-normal uppercase">
              {b.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Block */}
      <div ref={ctaRef} className="border-t border-neutral-700 p-6 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase block mb-2">
            [ PLATFORM BELAJAR ]
          </span>
          <p className="text-white/50 text-xs uppercase tracking-wider mt-2 md:mt-3">
            Ingin bergabung gratis dulu? ↓ Scroll ke bawah
          </p>
        </div>
        <a
          href="https://akademi.panggungkreator.web.id"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto text-center flex items-center justify-center bg-white text-[#2c2c2c] text-xs font-bold uppercase tracking-wider sm:tracking-[0.25em] px-6 md:px-10 py-4 md:py-5 border border-white hover:bg-transparent hover:text-white transition-all duration-300 rounded-none whitespace-normal sm:whitespace-nowrap"
        >
          JELAJAHI PLATFORM BELAJAR KAMI →
        </a>
      </div>
    </section>
  );
}
