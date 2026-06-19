"use client";

import React from "react";
import Link from "next/link";
import { Edit } from "@/components/editor/Edit";
import { Check, Crown, HelpCircle } from "lucide-react";

interface SectionPricingProps {
  packagesData: any[];
}

export default function SectionPricing({ packagesData }: SectionPricingProps) {
  return (
    <section
      id="pricing"
      className="relative py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden border-y border-zinc-200 dark:border-zinc-850"
    >
      {/* Background glowing gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-red-700/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-up">
          <span className="text-[#bc151b] font-bold text-xs uppercase tracking-widest mb-4 block">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-[1.2] mb-4">
            <Edit id="pricing.heading">Pilih Cara Bertumbuh yang Sesuai Dengan Targetmu</Edit>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            <Edit id="pricing.subheading">
              Baik kamu yang baru ingin memulai maupun yang ingin berkembang lebih cepat, kami sudah menyiapkan jalurnya.
            </Edit>
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 max-w-4xl mx-auto stagger-parent">
          {packagesData.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 w-full">Belum ada paket yang tersedia.</div>
          ) : (
            packagesData.map((pkg) => {
              const isMVP = pkg.is_highlighted;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col w-full md:w-1/2 rounded-3xl transition-all duration-300 stagger-child ${
                    isMVP
                      ? "bg-zinc-900 text-white border-2 border-amber-500 shadow-[0_10px_40px_rgba(212,160,23,0.15)] md:-mt-4 md:mb-4 z-10"
                      : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 shadow-sm"
                  } hover:scale-[1.02]`}
                >
                  {/* Highlight Badge */}
                  {isMVP && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <Crown size={12} />
                      <span>MOST POPULAR / MVP</span>
                    </div>
                  )}

                  {/* Top card block */}
                  <div className="p-8 sm:p-10 border-b border-zinc-100 dark:border-zinc-800 text-center flex flex-col items-center">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                        isMVP ? "text-amber-400" : "text-[#bc151b]"
                      }`}
                    >
                      {isMVP ? "👑 PREMIUM MENTORING" : "🎟️ REGULAR MEMBERSHIP"}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-serif mb-4">
                      {pkg.name}
                    </h3>
                    
                    {pkg.subtitle && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mb-6 min-h-[32px] line-clamp-2">
                        {pkg.subtitle}
                      </p>
                    )}

                    <div className="flex flex-col items-center justify-center">
                      {pkg.original_price && (
                        <span className="text-sm text-red-500 font-bold line-through mb-1 opacity-70">
                          {pkg.original_price}
                        </span>
                      )}
                      <div className="flex items-baseline">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                          {pkg.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Benefit list */}
                  <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                    <ul className="space-y-4 text-sm leading-relaxed mb-8 flex-1">
                      {pkg.benefits &&
                        pkg.benefits.map((benefit: any, idx: number) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-3 ${
                              !benefit.isIncluded ? "opacity-40" : ""
                            }`}
                          >
                            <Check
                              size={18}
                              className={`flex-shrink-0 mt-0.5 ${
                                isMVP ? "text-amber-400" : "text-[#bc151b]"
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                isMVP ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"
                              } ${!benefit.isIncluded ? "line-through" : ""}`}
                            >
                              {benefit.text}
                            </span>
                          </li>
                        ))}
                    </ul>

                    {/* Button */}
                    <Link
                      href={`/checkout?packageId=${pkg.id}`}
                      className={`block w-full py-4 rounded-xl text-center text-sm font-extrabold uppercase tracking-widest transition-all duration-150 ${
                        isMVP
                          ? "bg-amber-400 text-zinc-950 hover:bg-amber-500 shadow-lg shadow-amber-500/10 active:scale-[0.98]"
                          : "bg-zinc-900 text-white hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-[0.98]"
                      }`}
                    >
                      {pkg.cta_text || "JOIN SEKARANG"}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
