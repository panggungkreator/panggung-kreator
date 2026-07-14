"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

const phases = [
  {
    num: "01",
    phase: "FASE AWAL",
    title: "TONGKRONGAN 6 ORANG",
    desc: "Pertemuan informal 6 orang pemula di kafe Bandung — berbagi keresahan yang sama tentang rasa takut berbicara di depan umum.",
    placeholder: "Langkah 1: 6 orang duduk melingkar di kafe.",
  },
  {
    num: "02",
    phase: "FASE PERTAMA",
    title: "DEKLARASI KOMUNITAS",
    desc: "Wadah informal diresmikan menjadi komunitas Panggung Kreator. Peluncuran Open Mic perdana sebagai program unggulan.",
    placeholder: "Langkah 2: Mic stand di atas panggung kecil kafe.",
  },
  {
    num: "03",
    phase: "FASE EKSPANSI",
    title: "DIVERSIFIKASI KELAS",
    desc: "Perluasan program: MC Practice, Voice Over Challenge, Content Creator Class — menjangkau audiens yang lebih beragam.",
    placeholder: "Langkah 3: Kegiatan kelas yang berbeda-beda.",
  },
  {
    num: "04",
    phase: "FASE KINI",
    title: "300+ ANGGOTA AKTIF",
    desc: "Penyatuan 300+ anggota aktif, peluncuran resmi sistem membership, dan pemantapan tiga pilar utama.",
    placeholder: "Langkah 4: Foto grup besar anggota komunitas.",
  },
  {
    num: "05",
    phase: "FASE DEPAN",
    title: "EKOSISTEM DIGITAL",
    desc: "Peluncuran website resmi, aplikasi belajar mandiri, dan persiapan bootcamp berskala nasional.",
    placeholder: "Langkah 5: Layar website dan aplikasi belajar.",
  },
];

export default function TentangTimelineSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      fadeUp(headerRef.current, 0.1, 30);
    }
    staggerIn(cardsRef.current, 0.1, 40);
  }, [fadeUp, staggerIn]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      {/* Section Header */}
      <div
        ref={headerRef}
        className="p-8 md:p-16 border-b border-[#2c2c2c] dark:border-white flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ TIMELINE PENGEMBANGAN ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#2c2c2c] dark:text-white">
            PERJALANAN YANG TERUS BERLANJUT
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Dari pertemuan informal 6 orang hingga ekosistem komunitas dengan 300+ anggota — setiap fase adalah fondasi untuk fase berikutnya.
        </p>
      </div>

      {/* 5-Phase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5">
        {phases.map((phase, idx) => (
          <div
            key={phase.num}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            className={`p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 ${idx < 4
                ? "border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
                : "border-b md:border-b-0 border-[#2c2c2c] dark:border-white"
              } hover:bg-neutral-50 dark:hover:bg-neutral-950/40`}
          >
            <div>
              {/* Giant Number and Phase Badge */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-5xl md:text-6xl font-black tracking-tighter text-[#2c2c2c]/15 dark:text-white/15 group-hover:text-[#2c2c2c] dark:group-hover:text-white transition-colors duration-500 leading-none">
                  {phase.num}
                </span>
                <span className="text-[9px] font-black tracking-widest text-[#2c2c2c]/40 dark:text-white/40 border border-[#2c2c2c]/10 dark:border-white/10 px-2 py-0.5 uppercase">
                  {phase.phase}
                </span>
              </div>


              {/* Phase Title */}
              <h3 className="text-base font-black uppercase tracking-wider text-[#2c2c2c] dark:text-white mb-3">
                {phase.title}
              </h3>
            </div>
            <p className="font-sans text-xs text-[#2c2c2c]/60 dark:text-white/60 leading-relaxed uppercase tracking-wide">
              {phase.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
