"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useScrollAnimations } from "./useScrollAnimations";

export interface PartnerItem {
  id: string;
  name: string;
  type: string;
  logo_url?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  description?: string | null;
  is_active: boolean;
  order_index?: number;
}

interface CollaborationsClientProps {
  partners: PartnerItem[];
}

export default function CollaborationsClient({ partners }: CollaborationsClientProps) {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<(HTMLElement | null)[]>([]);

  // State to track images that fail to load, falling back to typography badge
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Disable animations on small mobile screens to avoid layout jumps
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      if (cardRef.current) {
        cardRef.current.style.opacity = "1";
        cardRef.current.style.transform = "none";
      }
      logoRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      return;
    }

    if (cardRef.current) {
      fadeUp(cardRef.current, 0.1, 40);
    }

    const validLogoElements = logoRefs.current.filter((el) => el !== null) as HTMLElement[];
    if (validLogoElements.length > 0) {
      staggerIn(validLogoElements, 0.08, 30);
    }
  }, [fadeUp, staggerIn]);

  const handleImageError = (partnerId: string) => {
    setFailedImages((prev) => ({ ...prev, [partnerId]: true }));
  };

  return (
    <section
      id="kolaborasi"
      ref={containerRef}
      className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-16 transition-colors duration-300"
    >
      {/* Main Container (Clean, Minimalist & Focused) */}
      <div
        ref={cardRef}
        className="max-w-6xl mx-auto border border-[#2c2c2c]/15 dark:border-white/15 bg-white dark:bg-[#2c2c2c] p-8 sm:p-12 md:p-16 lg:p-20 relative rounded-none shadow-none"
      >
        {/* Centered Heading Block (Matching the reference layout) */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#2c2c2c]/40 dark:text-white/40 mb-3 block">
            [ OUR PARTNERS & COLLABORATORS ]
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.95] text-[#2c2c2c] dark:text-white mb-4">
            KOLABORASI{" "}
            <span className="font-serif italic font-normal normal-case text-neutral-500 dark:text-neutral-400">
              dan mitra
            </span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#2c2c2c]/65 dark:text-white/65 leading-relaxed uppercase tracking-wider">
            Tumbuh dan bergerak bersama mitra strategis, ruang kreatif, dan brand pendukung ekosistem kreator.
          </p>
        </div>

        {/* Logos Container */}
        {partners.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#2c2c2c]/40 dark:text-white/40">
              [ Belum ada mitra aktif terdaftar ]
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 max-w-4xl mx-auto">
            {partners.map((partner, idx) => {
              const hasLogo = Boolean(partner.logo_url) && !failedImages[partner.id];
              const targetUrl = partner.website_url || partner.instagram_url;
              const WrapperTag = targetUrl ? "a" : "div";
              const wrapperProps = targetUrl
                ? {
                  href: targetUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  title: `${partner.name}${partner.type ? ` (${partner.type})` : ""} - Kunjungi`,
                }
                : {
                  title: `${partner.name}${partner.type ? ` (${partner.type})` : ""}`,
                };

              return (
                <WrapperTag
                  key={partner.id}
                  ref={(el: any) => {
                    logoRefs.current[idx] = el as HTMLElement | null;
                  }}
                  {...wrapperProps}
                  className="flex items-center justify-center transition-all duration-300 focus:outline-none"
                >
                  {hasLogo ? (
                    <div className="relative flex items-center justify-center p-2 min-h-[48px]">
                      {/* Responsive monochrome partner logo with clean hover */}
                      <img
                        src={partner.logo_url!}
                        alt={partner.name}
                        onError={() => handleImageError(partner.id)}
                        className="h-10 sm:h-12 md:h-14 w-auto max-w-[130px] sm:max-w-[150px] md:max-w-[160px] object-contain filter grayscale opacity-70 contrast-125 dark:brightness-110 dark:contrast-100 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    /* High-contrast typographic fallback badge for partners without logo */
                    <div className="border border-[#2c2c2c]/25 dark:border-white/25 px-5 py-2.5 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-[#2c2c2c] dark:hover:border-white hover:bg-[#2c2c2c] hover:text-white dark:hover:bg-white dark:hover:text-[#2c2c2c] transition-all duration-300">
                      <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase">
                        {partner.name}
                      </span>
                    </div>
                  )}
                </WrapperTag>
              );
            })}
          </div>
        )}

        {/* Bottom Editorial Link to /kolaborasi */}
        <div className="mt-14 md:mt-18 pt-8 border-t border-[#2c2c2c]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span className="text-[10px] md:text-xs font-mono tracking-widest uppercase text-[#2c2c2c]/50 dark:text-white/50">
            [ TERTARIK BERKOLABORASI DENGAN KAMI? ]
          </span>
          <Link
            href="/kolaborasi"
            className="text-xs font-black uppercase tracking-[0.2em] text-[#2c2c2c] dark:text-white hover:opacity-75 transition-all duration-200 flex items-center gap-2 group py-1"
          >
            <span>PELAJARI PROGRAM KEMITRAAN</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
