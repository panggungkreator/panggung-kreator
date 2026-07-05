"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useScrollAnimations } from "../community/useScrollAnimations";
import { MessageSquare, Mail, ArrowRight } from "lucide-react";

export default function KolaborasiCTASection() {
  const { fadeUp } = useScrollAnimations();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeUp(containerRef.current, 0.1, 40);
    }
  }, [fadeUp]);

  const contacts = [
    {
      label: "WHATSAPP",
      value: "0878 2323 9575 (Aldi)",
      href: "https://wa.me/6287823239575",
      icon: <MessageSquare className="w-4 h-4 text-neutral-500" />
    },
    {
      label: "INSTAGRAM",
      value: "@panggungkreator",
      href: "https://instagram.com/panggungkreator",
      icon: (
        <svg
          className="w-4 h-4 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      label: "EMAIL",
      value: "panggungkreator.idn@gmail.com",
      href: "mailto:panggungkreator.idn@gmail.com",
      icon: <Mail className="w-4 h-4 text-neutral-500" />
    }
  ];

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white py-20 md:py-28 z-10">
      <div className="max-w-5xl mx-auto px-6">
        <div ref={containerRef} className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Section Label */}
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40 mb-6 block">
            [ HUBUNGI KAMI ]
          </span>

          {/* Headline */}
          <h2 className="text-[clamp(2.25rem,5vw,4.5rem)] font-black uppercase tracking-tighter leading-[0.85] text-[#2c2c2c] dark:text-white mb-6">
            TERTARIK{" "}
            <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400 lowercase">
              bermitra?
            </span>
          </h2>

          {/* Description */}
          <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/60 dark:text-white/60 max-w-lg mb-12 leading-relaxed uppercase tracking-wider">
            Kami terbuka untuk berbagai bentuk kolaborasi. Hubungi kami langsung untuk diskusi lebih lanjut dan dapatkan Media Kit cetak lengkap kami.
          </p>

          {/* Contact Details Grid - 3 cols with vertical lines */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 border border-[#2c2c2c]/20 dark:border-white/20 mb-12 bg-neutral-50/50 dark:bg-neutral-900/10">
            {contacts.map((c, i) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 dark:hover:bg-neutral-950/40 transition-colors duration-300 ${
                  i < 2 ? "border-b md:border-b-0 md:border-r border-[#2c2c2c]/20 dark:border-white/20" : ""
                }`}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  {c.icon}
                  <span className="text-[9px] font-black tracking-widest text-[#2c2c2c]/40 dark:text-white/40 uppercase">
                    {c.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#2c2c2c] dark:text-white uppercase tracking-wider hover:underline">
                  {c.value}
                </span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href="https://wa.me/6287823239575"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] text-xs font-black uppercase tracking-[0.25em] px-10 py-5 border border-[#2c2c2c] dark:border-white hover:bg-transparent hover:text-[#2c2c2c] dark:hover:bg-transparent dark:hover:text-white transition-all duration-350 rounded-none inline-block"
            >
              HUBUNGI VIA WHATSAPP
            </a>
            
            <Link
              href="/tentang"
              className="w-full sm:w-auto bg-transparent text-[#2c2c2c] dark:text-white text-xs font-black uppercase tracking-[0.25em] px-10 py-5 border border-[#2c2c2c] dark:border-white hover:bg-[#2c2c2c] hover:text-white dark:hover:bg-white dark:hover:text-[#2c2c2c] transition-all duration-350 rounded-none inline-flex items-center justify-center gap-2"
            >
              <span>KENALI KAMI LEBIH DEKAT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
