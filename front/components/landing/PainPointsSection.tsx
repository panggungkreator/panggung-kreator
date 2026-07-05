"use client";

import React, { useTransition } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { InlineEditText } from "./InlineEditText";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function PainPointsSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isEditMode && !isVisible) return null;

  const handleSave = async (key: string, value: any) => {
    const newContent = { ...content, [key]: value };
    await updateLandingSectionAction(id, newContent);
    router.refresh();
  };

  const handleCardSave = async (index: number, key: string, value: string) => {
    const newCards = [...(content.cards || [])];
    newCards[index] = { ...newCards[index], [key]: value };
    handleSave("cards", newCards);
  };

  const handleAddCard = () => {
    const newCards = [...(content.cards || []), { title: "Judul Baru", description: "Deskripsi baru..." }];
    handleSave("cards", newCards);
  };

  const handleRemoveCard = (index: number) => {
    const newCards = [...(content.cards || [])];
    newCards.splice(index, 1);
    handleSave("cards", newCards);
  };

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#2c2c2c] relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {/* Visibility Indicator */}
      {isEditMode && !isVisible && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">
          Section ini disembunyikan
        </div>
      )}

      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#bc151b]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-5xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
            <InlineEditText
              tagName="span"
              value={content.heading || "Kenapa Banyak Orang <span class=\"text-[#bc151b] underline decoration-wavy decoration-2\">Sulit Bertumbuh?</span>"}
              allowHtml={true}
              onSave={(v) => handleSave("heading", v)}
            />
          </h2>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-semibold">
            Apakah ini hambatan yang sering lo hadapi sehari-hari?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {content.cards && content.cards.map((item: any, index: number) => (
            <div key={index} className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl hover:border-[#bc151b]/40 hover:bg-[#bc151b]/5 dark:hover:bg-[#bc151b]/5 transition-all group shadow-xs dark:shadow-none relative">
              {isEditMode && (
                <button
                  onClick={() => handleRemoveCard(index)}
                  className="absolute right-2 top-2 text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full transition-opacity z-10"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="w-10 h-10 rounded-lg bg-[#bc151b]/10 flex items-center justify-center mb-4 group-hover:bg-[#bc151b]/20 transition-all">
                <span className="text-[#bc151b] font-bold font-title">0{index + 1}</span>
              </div>
              <h3 className="font-title font-bold text-lg text-zinc-900 dark:text-white mb-2 uppercase group-hover:text-[#bc151b] transition-all">
                <InlineEditText
                  tagName="span"
                  value={item.title}
                  onSave={(v) => handleCardSave(index, "title", v)}
                />
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                <InlineEditText
                  tagName="span"
                  value={item.description}
                  onSave={(v) => handleCardSave(index, "description", v)}
                />
              </p>
            </div>
          ))}
          {isEditMode && (
            <div
              onClick={handleAddCard}
              className="bg-zinc-50 dark:bg-zinc-900/10 border border-dashed border-zinc-300 dark:border-zinc-700 p-6 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:text-[#bc151b] hover:border-[#bc151b] hover:bg-[#bc151b]/5 transition-all cursor-pointer min-h-[200px]"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium text-sm">Tambah Hambatan</span>
            </div>
          )}
        </div>

        <div className="text-center max-w-xl mx-auto bg-gradient-to-r from-zinc-100 via-[#bc151b]/5 to-zinc-100 dark:from-zinc-950 dark:via-[#bc151b]/10 dark:to-zinc-950 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl shadow-md dark:shadow-lg transition-colors duration-300">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider mb-2 font-medium">Padahal…</p>
          <h4 className="text-2xl md:text-3xl font-title font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
            Public Speaking Bukan Bakat.
          </h4>
          <p className="text-lg md:text-xl font-bold text-[#bc151b] uppercase">
            <InlineEditText
              tagName="span"
              value={content.bottomHighlight || "Public Speaking adalah Skill. <span class=\"text-zinc-600 dark:text-zinc-400 font-normal text-sm lowercase block mt-1\">Dan skill bisa dilatih.</span>"}
              allowHtml={true}
              onSave={(v) => handleSave("bottomHighlight", v)}
            />
          </p>
        </div>
      </div>
    </section>
  );
}
