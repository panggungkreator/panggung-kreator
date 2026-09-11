"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<(HTMLElement | null)[]>([]);

  // State to track images that fail to load, falling back to typography badge
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const cardEl = cardRef.current;
    const sectionEl = containerRef.current;
    if (!sectionEl || !cardEl) return;

    const validLogos = logoRefs.current.filter((el): el is HTMLElement => el !== null);

    // Initial state: hidden slightly below
    gsap.set(cardEl, { opacity: 0, y: 30 });
    if (validLogos.length > 0) {
      gsap.set(validLogos, { opacity: 0, y: 20 });
    }

    let isTriggered = false;

    const triggerEntrance = () => {
      if (isTriggered) return;
      isTriggered = true;

      const tl = gsap.timeline();
      tl.to(cardEl, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      if (validLogos.length > 0) {
        tl.to(
          validLogos,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.35"
        );
      }
    };

    // 1. Primary: IntersectionObserver to guarantee trigger on mobile (triggers as soon as 10% enters viewport)
    let observer: IntersectionObserver | null = null;
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerEntrance();
            observer?.disconnect();
          }
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -50px 0px",
        }
      );
      observer.observe(sectionEl);
    }

    // 2. ScrollTrigger with early start threshold and once: true
    const st = ScrollTrigger.create({
      trigger: sectionEl,
      start: "top 92%",
      onEnter: triggerEntrance,
      invalidateOnRefresh: true,
      once: true,
    });

    ScrollTrigger.refresh();

    return () => {
      if (observer) observer.disconnect();
      st.kill();
      // Ensure elements remain visible on unmount
      if (cardEl) {
        cardEl.style.opacity = "1";
        cardEl.style.transform = "none";
      }
      validLogos.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    };
  }, []);

  const handleImageError = (partnerId: string) => {
    setFailedImages((prev) => ({ ...prev, [partnerId]: true }));
  };

  return (
    <section
      id="kolaborasi"
      ref={containerRef}
      className="relative bg-white py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-16 transition-colors duration-300"
    >
      {/* Main Container (Clean, Minimalist & Focused) */}
      <div
        ref={cardRef}
        className="max-w-6xl mx-auto bg-white dark:bg-[#2c2c2c] border border-[#2c2c2c]/15 dark:border-white/15 p-8 sm:p-12 md:p-16 lg:p-20 relative rounded-none shadow-none"
      >
        {/* Centered Heading Block (Matching the reference layout) */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
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
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 md:gap-20 max-w-5xl mx-auto">
            {partners.map((partner, idx) => {
              const hasLogo = Boolean(partner.logo_url) && !failedImages[partner.id];

              return (
                <div
                  key={partner.id}
                  ref={(el: any) => {
                    logoRefs.current[idx] = el as HTMLElement | null;
                  }}
                  title={`${partner.name}${partner.type ? ` (${partner.type})` : ""}`}
                  className="flex items-center justify-center transition-all duration-300"
                >
                  {hasLogo ? (
                    <div className="relative flex items-center justify-center p-2 min-h-[80px] sm:min-h-[96px] md:min-h-[112px]">
                      {/* Crisp, enlarged partner logo without destructive filters */}
                      <img
                        src={partner.logo_url!}
                        alt={partner.name}
                        onError={() => handleImageError(partner.id)}
                        className="h-12 sm:h-20 md:h-24 lg:h-20 w-auto max-w-[220px] sm:max-w-[280px] md:max-w-[340px] object-contain opacity-90 hover:opacity-100 hover:scale-105 dark:invert dark:brightness-125 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    /* Crisp wordmark fallback for partners without image logo */
                    <div className="flex items-center justify-center p-2 min-h-[40px] sm:min-h-[96px] md:min-h-[112px]">
                      <span className="font-sans font-black text-xl sm:text-xl md:text-xl tracking-tighter uppercase text-[#2c2c2c] dark:text-white hover:opacity-80 transition-opacity">
                        {partner.name}
                      </span>
                    </div>
                  )}
                </div>
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
