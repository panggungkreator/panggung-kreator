"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useLandingCMS } from "./LandingCMSContext";
import { InlineEditText } from "./InlineEditText";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection({ id, isVisible, content, packages = [] }: any) {
  const { isEditMode } = useLandingCMS();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isEditMode && !isVisible) return null;

  const handleSave = async (key: string, value: any) => {
    const newContent = { ...content, [key]: value };
    await updateLandingSectionAction(id, newContent);
    router.refresh();
  };

  const handleArraySave = async (key: string, index: number, value: string) => {
    const newArray = [...(content[key] || [])];
    newArray[index] = value;
    handleSave(key, newArray);
  };

  const handleAddArrayItem = async (key: string, defaultValue: string = "Item Baru") => {
    const newArray = [...(content[key] || []), defaultValue];
    handleSave(key, newArray);
  };

  const handleRemoveArrayItem = async (key: string, index: number) => {
    const newArray = [...(content[key] || [])];
    newArray.splice(index, 1);
    handleSave(key, newArray);
  };

  return (
    <section className={`relative pt-36 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden transition-opacity ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {/* Visibility Indicator */}
      {isEditMode && !isVisible && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">
          Section ini disembunyikan
        </div>
      )}

      {/* Glow Flare Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#bc151b]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[#bc151b]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
        <InlineEditText
          tagName="span"
          className="px-4 py-1.5 rounded-full bg-[#bc151b]/10 dark:bg-[#bc151b]/15 border border-[#bc151b]/20 dark:border-[#bc151b]/30 text-[#bc151b] text-xs md:text-sm font-semibold tracking-wider uppercase mb-6 animate-pulse inline-block"
          value={content.badge || "Bukan Sekadar Belajar Ngomong."}
          onSave={(v) => handleSave("badge", v)}
        />

        <h1 className="text-4xl md:text-7xl font-title font-bold tracking-tight text-zinc-900 dark:text-white uppercase leading-tight max-w-3xl mb-8">
          <InlineEditText
            tagName="span"
            value={content.heading1 || "Tapi Belajar Gimana Cara"}
            onSave={(v) => handleSave("heading1", v)}
          />
          <br />
          <InlineEditText
            tagName="span"
            className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-[#bc151b]/70 to-[#bc151b] dark:from-white dark:via-red-200 dark:to-[#bc151b] underline decoration-[#bc151b] decoration-4 inline-block"
            value={content.heading2 || "Lo Didengar."}
            onSave={(v) => handleSave("heading2", v)}
          />
        </h1>

        <div className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-2xl space-y-4 mb-10 text-center leading-relaxed">
          {content.paragraphs && content.paragraphs.map((p: string, i: number) => (
            <div key={i} className="relative group">
              <InlineEditText
                tagName="p"
                value={p}
                onSave={(v) => handleArraySave("paragraphs", i, v)}
              />
              {isEditMode && (
                <button 
                  onClick={() => handleRemoveArrayItem("paragraphs", i)}
                  className="absolute -right-8 top-0 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                  title="Hapus paragraf"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {isEditMode && (
            <button 
              onClick={() => handleAddArrayItem("paragraphs", "Paragraf baru...")}
              className="mt-2 text-xs text-[#bc151b] flex items-center gap-1 mx-auto hover:underline"
            >
              <Plus size={14} /> Tambah Paragraf
            </button>
          )}
        </div>

        {/* Solution Highlight Box */}
        <div className="w-full max-w-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xs text-left mb-10 shadow-lg dark:shadow-xl transition-colors duration-300">
          <h3 className="font-title font-bold text-lg md:text-xl text-zinc-900 dark:text-white mb-4 uppercase tracking-wider border-b border-zinc-200 dark:border-white/10 pb-2">
            Panggung Kreator Akademi hadir buat bantu lo:
          </h3>
          <ul className="space-y-3.5 text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
            {content.benefits && content.benefits.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-3 relative group">
                <svg className="w-5 h-5 text-[#bc151b] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <div className="flex-1">
                  <InlineEditText
                    tagName="span"
                    value={item}
                    onSave={(v) => handleArraySave("benefits", index, v)}
                  />
                </div>
                {isEditMode && (
                  <button 
                    onClick={() => handleRemoveArrayItem("benefits", index)}
                    className="absolute -right-6 top-0 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {isEditMode && (
            <button 
              onClick={() => handleAddArrayItem("benefits", "Benefit baru...")}
              className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Tambah Benefit
            </button>
          )}
        </div>

        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-medium tracking-wide uppercase max-w-md border-t border-zinc-200 dark:border-white/10 pt-6 mb-8">
          <InlineEditText
            tagName="span"
            className="block"
            value={content.tagline || "Karena hari ini… Kesempatan sering datang bukan ke yang paling pintar. <br /><span class=\"text-zinc-900 dark:text-white font-bold\">Tapi ke mereka yang berani tampil.</span>"}
            allowHtml={true}
            onSave={(v) => handleSave("tagline", v)}
          />
        </p>

        <div className="relative group inline-block">
          {(() => {
            const defaultPackage = packages?.find((p: any) => p.is_default) || packages?.[0];
            const checkoutUrl = defaultPackage ? `/checkout?packageId=${defaultPackage.id}` : "/checkout";
            
            return (
              <Link href={checkoutUrl} className="px-10 py-5 text-lg font-bold text-white uppercase tracking-wider bg-[#bc151b] rounded-xl hover:bg-[#bc151b]/90 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(188,21,27,0.4)] inline-block text-center pointer-events-none">
                <InlineEditText
                  tagName="span"
                  className="pointer-events-auto"
                  value={content.ctaText || "DAFTAR SEKARANG"}
                  onSave={(v) => handleSave("ctaText", v)}
                />
              </Link>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
