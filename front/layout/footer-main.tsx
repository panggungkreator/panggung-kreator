"use client";

import React from "react";
import { Edit } from "@/components/editor/Edit";
import Link from "next/link";
import Logo from "../components/ui/Logo";

export default function FooterMain() {
  const footerLinks = [
    { label: "Tentang", href: "#origin-story" },
    { label: "Program", href: "#program" },
    { label: "Harga", href: "#pricing" },
    { label: "Kontak", href: "#closing-cta" },
  ];

  return (
    <footer className="relative bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-900 overflow-hidden py-16 sm:py-20">
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Brand Col */}
        <Link href="/" className="mb-6 block">
          <Logo size="lg" isLink={false} />
        </Link>

        <p className="text-zinc-600 dark:text-zinc-400 text-lg sm:text-xl max-w-xl leading-relaxed mb-8 font-sans">
          <Edit id="footer.tagline">
            Bicara Bukan Sekadar Skill. Tapi Jalan Untuk Membuka Banyak Panggung Dalam Hidup Lo.
          </Edit>
        </p>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <a
            href="#"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-150"
            title="Instagram"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-150"
            title="Youtube"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-150"
            title="Twitter"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-150"
            title="WhatsApp"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 text-center w-full">
          <p className="text-zinc-500 text-xs sm:text-sm mb-4">
            <Edit id="footer.copyright">
              © 2026 Panggung Kreator Akademi. All rights reserved.
            </Edit>
          </p>
          <div className="flex justify-center gap-6 text-zinc-500 dark:text-zinc-500 text-xs font-semibold">
            <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
