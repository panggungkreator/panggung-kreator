"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";

export default function TentangAboutSection() {
  const { fadeUp, parallax } = useScrollAnimations();

  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imgContainerRef.current) {
      fadeUp(imgContainerRef.current, 0.1, 40);
    }
    if (imgRef.current) {
      parallax(imgRef.current, 0.1);
    }
    if (textContainerRef.current) {
      fadeUp(textContainerRef.current, 0.2, 30);
    }
  }, [fadeUp, parallax]);

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Parallax Image Placeholder */}
        <div
          ref={imgContainerRef}
          className="relative w-full aspect-[4/3] md:h-[90vh] md:aspect-auto overflow-hidden border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white"
        >
          {/* Parallax Content Container */}
          <div
            ref={imgRef}
            className="absolute inset-0 w-full h-[120%] -top-[10%] bg-neutral-100 dark:bg-neutral-900 flex flex-col justify-between p-8 md:p-12 transition-transform duration-700 ease-out select-none"
          >
            {/* Visual crop lines */}
            <div className="absolute inset-0 border-x border-y border-[#2c2c2c]/5 dark:border-white/5 m-8 pointer-events-none"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
                [ VISUAL TENTANG ]
              </span>
              <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
                01/03
              </span>
            </div>

            <div className="relative z-10 max-w-sm mx-auto text-center my-auto pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.2em] text-[#2c2c2c]/30 dark:text-white/30 block mb-3">
                [ PHOTO PLACEHOLDER ]
              </span>
              <p className="font-sans text-xs text-[#2c2c2c]/50 dark:text-white/40 uppercase tracking-wider leading-relaxed">
                [ Foto suasana komunitas — anggota berkumpul, berdiskusi, suasana hangat dan inklusif di kafe Bandung. ]
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#2c2c2c]/50 dark:text-white/50 uppercase">
                PANGGUNG KREATOR
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#2c2c2c]/50 dark:text-white/50 uppercase">
                EST. 2024
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div
          ref={textContainerRef}
          className="p-8 md:p-16 flex flex-col justify-center h-full min-h-[60vh] md:min-h-[90vh]"
        >
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
              [ TENTANG PANGGUNG KREATOR ]
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] text-[#2c2c2c] dark:text-white mb-8">
              RUANG TUMBUH BAGI MEREKA YANG BERANI BERPROSES
            </h2>

            <div className="font-sans text-xs md:text-sm text-[#2c2c2c]/75 dark:text-white/75 space-y-6 leading-relaxed uppercase tracking-wider">
              <p>
                Panggung Kreator merupakan komunitas pengembangan diri (self-development) inovatif yang berfokus pada tiga pilar utama:{" "}
                <span className="highlight-stabilo">Public Speaking, Content Creation, dan Personal Branding.</span> Komunitas ini hadir sebagai ruang belajar, berlatih, bertumbuh, dan berkolaborasi bagi siapa saja yang ingin meningkatkan kemampuan komunikasi, membangun kepercayaan diri, serta melejitkan potensi diri di era digital.
              </p>
              <p>
                Kami percaya bahwa lingkungan yang tepat adalah kunci dari sebuah pertumbuhan. Oleh karena itu, Panggung Kreator mengedepankan metode{" "}
                <span className="highlight-stabilo">praktik langsung (action-oriented).</span> Setiap anggota diberikan panggung dan kesempatan yang sama untuk tampil, berekspresi, dan melatih kapasitas dirinya secara berkala.
              </p>
              <p>
                Dengan semangat kolaborasi, Panggung Kreator membantu setiap individu bertransformasi menjadi versi terbaik mereka –{" "}
                <span className="highlight-stabilo">berani tampil, adaptif, dan siap menghadapi tantangan</span> di dunia profesional maupun kehidupan sehari-hari.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
