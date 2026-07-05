"use client";

import React, { useTransition } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { InlineEditText } from "./InlineEditText";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function WelcomeSection({ id, isVisible, content }: any) {
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
    <section className={`py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950/80 border-y border-zinc-200 dark:border-white/5 relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {/* Visibility Indicator */}
      {isEditMode && !isVisible && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">
          Section ini disembunyikan
        </div>
      )}

      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#bc151b]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-4xl mx-auto z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wide mb-4 text-zinc-900 dark:text-white">
            <InlineEditText
              tagName="span"
              value={content.heading || "Welcome to <span class=\"text-[#bc151b]\">Panggung Kreator Akademi</span>"}
              allowHtml={true}
              onSave={(v) => handleSave("heading", v)}
            />
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            <InlineEditText
              tagName="span"
              value={content.subheading || "Tempat dimana orang biasa belajar jadi versi terbaik dirinya lewat komunikasi."}
              onSave={(v) => handleSave("subheading", v)}
            />
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-8 backdrop-blur-xs shadow-md dark:shadow-none transition-colors duration-300">
          <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base mb-6 text-center italic">
            Di sini lo gak cuma belajar teori public speaking. Lo akan belajar:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
            {content.items && content.items.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-3 bg-zinc-50 dark:bg-[#2c2c2c]/50 p-4 rounded-xl border border-zinc-200/60 dark:border-white/5 transition-colors duration-300 relative group">
                <div className="w-2.5 h-2.5 rounded-full bg-[#bc151b] flex-shrink-0" />
                <div className="flex-1">
                  <InlineEditText
                    tagName="span"
                    className="text-zinc-800 dark:text-zinc-200 font-medium block"
                    value={item}
                    onSave={(v) => handleArraySave("items", index, v)}
                  />
                </div>
                {isEditMode && (
                  <button
                    onClick={() => handleRemoveArrayItem("items", index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditMode && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => handleAddArrayItem("items", "Materi baru...")}
                className="text-xs text-[#bc151b] flex items-center gap-1 hover:underline bg-[#bc151b]/10 px-3 py-1.5 rounded-full"
              >
                <Plus size={14} /> Tambah Item
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-semibold uppercase tracking-wider border-t border-zinc-200 dark:border-white/5 pt-6">
            <InlineEditText
              tagName="span"
              value={content.tagline || "Karena di dunia sekarang… orang yang bisa menyampaikan value dirinya dengan baik, <span class=\"text-zinc-900 dark:text-white\">akan punya peluang lebih besar.</span>"}
              allowHtml={true}
              onSave={(v) => handleSave("tagline", v)}
            />
          </p>
        </div>
      </div>
    </section>
  );
}
