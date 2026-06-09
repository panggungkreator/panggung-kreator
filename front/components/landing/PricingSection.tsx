"use client";

import React from "react";
import Link from "next/link";
import { useLandingCMS } from "./LandingCMSContext";
import { InlineEditText } from "./InlineEditText";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface PricingSectionProps {
  id: string;
  isVisible: boolean;
  content: any;
  packagesData: any[];
}

export function PricingSection({ id, isVisible, content, packagesData }: PricingSectionProps) {
  const { isEditMode, isAdmin } = useLandingCMS();
  const router = useRouter();

  if (!isEditMode && !isVisible) return null;

  const handleSave = async (key: string, value: any) => {
    const newContent = { ...content, [key]: value };
    await updateLandingSectionAction(id, newContent);
    router.refresh();
  };

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-100 dark:bg-black relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {/* Visibility Indicator */}
      {isEditMode && !isVisible && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">
          Section ini disembunyikan
        </div>
      )}

      {/* Admin Notice */}
      {isEditMode && (
        <div className="max-w-6xl mx-auto mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-4 rounded-xl flex items-start gap-3">
          <div className="mt-0.5 text-blue-500">ℹ️</div>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Informasi Data Paket:</strong> Judul dan deskripsi di bawah ini bisa diedit secara langsung (Inline Edit). Namun, untuk isi <strong>Kartu Paket (Harga & Benefit)</strong> diambil secara dinamis dari database. Untuk menambah, mengubah, atau menghapus paket, silakan menuju menu <Link href="/admin/packages" className="underline font-bold hover:text-blue-600">Data Paket di Dashboard Admin</Link>.
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
            <InlineEditText
              tagName="span"
              value={content.heading || "Pilih <span class=\"text-[#bc151b]\">Level Lo</span>"}
              allowHtml={true}
              onSave={(v) => handleSave("heading", v)}
            />
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            <InlineEditText
              tagName="span"
              value={content.subheading || "Investasi leher ke atas terbaik yang bakal ngubah cara lo berkomunikasi selamanya."}
              onSave={(v) => handleSave("subheading", v)}
            />
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
          {packagesData.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 w-full">Belum ada paket yang tersedia.</div>
          ) : (
            packagesData.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`relative flex flex-col w-full lg:w-1/3 bg-white dark:bg-[#0a0a0a] rounded-3xl transition-all duration-300 ${
                  pkg.is_highlighted 
                    ? "border-2 border-[#bc151b] shadow-[0_0_40px_rgba(188,21,27,0.15)] lg:-mt-4 lg:mb-4 z-10" 
                    : "border border-zinc-200 dark:border-white/5 shadow-md dark:shadow-none mt-0 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Popular Badge */}
                {pkg.is_highlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#bc151b] text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Rekomendasi
                  </div>
                )}

                <div className="p-8 text-center border-b border-zinc-100 dark:border-white/5">
                  <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2">
                    Storytelling Corner Level:
                  </p>
                  <h3 className={`text-3xl font-title font-bold uppercase mb-4 ${pkg.is_highlighted ? "text-[#bc151b]" : "text-zinc-900 dark:text-white"}`}>
                    {pkg.name}
                  </h3>
                  
                  {pkg.subtitle && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-line mb-6">
                      {pkg.subtitle}
                    </p>
                  )}

                  <div className="flex flex-col items-center justify-center">
                    {pkg.original_price && (
                      <span className="text-lg text-red-500 font-bold line-through decoration-2 decoration-red-500/50 mb-1 opacity-70">
                        {pkg.original_price}
                      </span>
                    )}
                    <span className="text-4xl md:text-5xl font-title font-bold text-zinc-900 dark:text-white">
                      {pkg.price}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-6 text-left">
                    Benefit:
                  </p>
                  <ul className="space-y-4 text-sm text-left flex-1">
                    {pkg.benefits && pkg.benefits.map((benefit: any, idx: number) => (
                      <li key={idx} className={`flex items-start gap-3 ${!benefit.isIncluded ? "opacity-50" : ""}`}>
                        {benefit.isIncluded ? (
                          <Check className="w-5 h-5 text-[#bc151b] shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-zinc-700 dark:text-zinc-300 font-medium ${!benefit.isIncluded ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`}>
                          {benefit.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                      <Link 
                      href="/checkout" 
                      className={`block w-full py-4 rounded-xl text-center font-bold uppercase tracking-wider transition-all duration-300 text-white ${
                        pkg.is_highlighted
                          ? "bg-[#bc151b] hover:bg-[#a01116] shadow-[0_0_20px_rgba(188,21,27,0.4)]"
                          : "bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {pkg.cta_text || "JOIN SEKARANG"}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
