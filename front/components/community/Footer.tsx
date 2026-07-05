"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const links = [
    { label: "Tentang Kami", href: "/tentang" },
    { label: "Galeri Kegiatan", href: "/galeri" },
    { label: "Platform Akademi", href: "https://akademi.panggungkreator.web.id" },
    { label: "Ajukan Kolaborasi", href: "/kolaborasi" },
    { label: "Media Kit Komunitas", href: "/media-kit" },
  ];

  const authLinks = [
    { label: "Masuk Akun", href: "/login" },
    { label: "Daftar Member", href: "/register" },
  ];

  return (
    <footer className="bg-[#2c2c2c] text-white/60 border-t border-[#2c2c2c] dark:border-white pt-20 pb-12 transition-colors duration-300 z-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* Main Grid with stark borders */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-0 pb-16">

          {/* Col 1: Brand & Partners (6/12 cols) */}
          <div className="md:col-span-6 md:pr-12 md:border-r border-white/10">
            <span className="font-sans font-black tracking-[0.25em] text-white text-sm uppercase block mb-4">
              PANGGUNG KREATOR
            </span>
            <p className="font-sans text-xs text-white/70 max-w-sm leading-relaxed uppercase tracking-wider mb-8">
              Komunitas pengembangan diri berbasis praktik untuk melatih mental, public speaking, content creation, dan personal branding di Bandung.
            </p>

            {/* Integrated Partners (Simplified from PartnerSection) */}
            <div className="border-t border-white/10 pt-6">
              <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase block mb-3">
                [ SUPPORTING PARTNERS ]
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black tracking-widest text-white/40 uppercase">
                <span>COMING SOON — PARTNER VENUE BANDUNG</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links (3/12 cols) */}
          <div className="md:col-span-3 md:pl-12 md:pr-6 md:border-r border-white/10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white font-black block mb-6">
              NAVIGASI
            </span>
            <ul className="space-y-3.5">
              {links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors font-bold block"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="font-sans text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors font-bold block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact & Access (3/12 cols) */}
          <div className="md:col-span-3 md:pl-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white font-black block mb-6">
              KONTAK & SOSIAL
            </span>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-2.5">
                <svg className="w-3.5 h-3.5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <a
                  href="https://instagram.com/panggungkreator"
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors font-bold"
                >
                  @PANGGUNGKREATOR
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-3.5 h-3.5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <a
                  href="https://wa.me/6287823239575"
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors font-bold"
                >
                  0878-2323-9575
                </a>
              </li>
              <li className="flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.15em] text-white/40 font-bold">
                <svg className="w-3.5 h-3.5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a
                  href="#"
                  target="_self"
                  rel="noreferrer"
                  className="font-sans text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors font-bold"
                >panggungkreator.idn@gmail.com</a>
              </li>

              {/* Integrated Auth Links */}
              <div className="pt-6 border-t border-white/10 space-y-3.5 mt-6">
                {authLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors font-black block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </div>
            </ul>
          </div>

        </div>

        {/* Big Tagline Headline (Magazine/Editorial style) */}
        <div className="border-t border-white/10 pt-10 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-white/15 select-none leading-tight mb-8">
            Mari Bertumbuh Bersama. #OneStageOneProgress
          </h2>

          {/* Copy & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between font-sans text-[9px] uppercase tracking-[0.2em] text-white/40 border-t border-white/5 pt-6">
            <span>© {new Date().getFullYear()} PANGGUNG KREATOR. ALL RIGHTS RESERVED.</span>
            <span className="mt-2 sm:mt-0">📍 BANDUNG, INDONESIA</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
