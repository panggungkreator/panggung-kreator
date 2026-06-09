"use client";

import React, { useTransition } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { InlineEditText } from "./InlineEditText";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CurriculumSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isEditMode && !isVisible) return null;

  const handleSave = async (key: string, value: any) => {
    const newContent = { ...content, [key]: value };
    await updateLandingSectionAction(id, newContent);
    router.refresh();
  };

  const handleCardSave = async (index: number, key: string, value: any) => {
    const newCards = [...(content.cards || [])];
    newCards[index] = { ...newCards[index], [key]: value };
    handleSave("cards", newCards);
  };

  const handleArrayItemSave = async (cardIndex: number, itemIndex: number, value: string) => {
    const newCards = [...(content.cards || [])];
    const newItems = [...(newCards[cardIndex].items || [])];
    newItems[itemIndex] = value;
    newCards[cardIndex] = { ...newCards[cardIndex], items: newItems };
    handleSave("cards", newCards);
  };

  const handleAddArrayItem = async (cardIndex: number) => {
    const newCards = [...(content.cards || [])];
    const newItems = [...(newCards[cardIndex].items || []), "Materi baru..."];
    newCards[cardIndex] = { ...newCards[cardIndex], items: newItems };
    handleSave("cards", newCards);
  };

  const handleRemoveArrayItem = async (cardIndex: number, itemIndex: number) => {
    const newCards = [...(content.cards || [])];
    const newItems = [...(newCards[cardIndex].items || [])];
    newItems.splice(itemIndex, 1);
    newCards[cardIndex] = { ...newCards[cardIndex], items: newItems };
    handleSave("cards", newCards);
  };

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-white/5 relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {/* Visibility Indicator */}
      {isEditMode && !isVisible && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">
          Section ini disembunyikan
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#bc151b] text-xs font-bold uppercase tracking-widest block mb-3">
            <InlineEditText
              tagName="span"
              value={content.label || "Kurikulum Utama PKA"}
              onSave={(v) => handleSave("label", v)}
            />
          </span>
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            <InlineEditText
              tagName="span"
              value={content.heading || "Apa yang Akan <span class=\"text-[#bc151b]\">Lo Pelajari?</span>"}
              allowHtml={true}
              onSave={(v) => handleSave("heading", v)}
            />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.cards && content.cards.map((card: any, index: number) => (
            <div key={index} className="bg-white dark:bg-zinc-900/55 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 hover:border-[#bc151b]/35 transition-all shadow-md dark:shadow-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#bc151b]/10 border border-[#bc151b]/20 rounded-xl flex items-center justify-center text-xl text-[#bc151b] font-bold font-title">
                  {index + 1}
                </div>
                <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase flex-1">
                  <InlineEditText
                    tagName="span"
                    value={card.title}
                    onSave={(v) => handleCardSave(index, "title", v)}
                  />
                </h3>
              </div>
              
              {/* Optional Description per card - Since it wasn't in DB originally we can conditionally add it or skip it, I will skip it for now and use hardcoded ones as previously since they are not in the DB schema, wait I can just add description to cards if it doesn't exist */}
              
              <div className="border-t border-zinc-200 dark:border-white/5 pt-4 mt-6">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3">
                  <InlineEditText
                    tagName="span"
                    value={card.subtitle || "Materi Pembelajaran:"}
                    onSave={(v) => handleCardSave(index, "subtitle", v)}
                  />
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                  {card.items && card.items.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 relative group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc151b] flex-shrink-0" />
                      <div className="flex-1">
                        <InlineEditText
                          tagName="span"
                          value={item}
                          onSave={(v) => handleArrayItemSave(index, idx, v)}
                        />
                      </div>
                      {isEditMode && (
                        <button 
                          onClick={() => handleRemoveArrayItem(index, idx)}
                          className="absolute -right-6 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditMode && (
                  <button 
                    onClick={() => handleAddArrayItem(index)}
                    className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Tambah Materi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
