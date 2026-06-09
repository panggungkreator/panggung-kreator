"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLandingCMS } from "./LandingCMSContext";
import { InlineEditText } from "./InlineEditText";
import { InlineImage } from "./InlineImage";
import { updateLandingSectionAction } from "@/lib/actions/landing-actions";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Generic hook for sections
function useSectionEditor(id: string, content: any) {
  const router = useRouter();
  
  const handleSave = async (key: string, value: any) => {
    const newContent = { ...content, [key]: value };
    await updateLandingSectionAction(id, newContent);
    router.refresh();
  };

  const handleArraySave = async (key: string, index: number, value: any) => {
    const newArray = [...(content[key] || [])];
    newArray[index] = value;
    handleSave(key, newArray);
  };

  const handleAddArrayItem = async (key: string, defaultValue: any) => {
    const newArray = [...(content[key] || []), defaultValue];
    handleSave(key, newArray);
  };

  const handleRemoveArrayItem = async (key: string, index: number) => {
    const newArray = [...(content[key] || [])];
    newArray.splice(index, 1);
    handleSave(key, newArray);
  };

  return { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem };
}

export function TargetAudienceSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);

  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#bc151b]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="max-w-4xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
            <InlineEditText tagName="span" value={content.heading || "Siapa yang <span class=\"text-[#bc151b]\">Cocok Gabung?</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            <InlineEditText tagName="span" value={content.subheading || "Panggung Kreator Akademi dirancang khusus untuk memfasilitasi kebutuhan pertumbuhan komunikasi lo."} onSave={(v) => handleSave("subheading", v)} />
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 backdrop-blur-xs shadow-lg dark:shadow-xl transition-colors duration-300">
          <h3 className="font-title font-bold text-lg md:text-xl text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-center border-b border-zinc-200 dark:border-white/10 pb-3">
            Panggung Kreator Akademi cocok buat lo yang:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
            {content.items && content.items.map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3 bg-zinc-50 dark:bg-[#0a0a0a]/30 p-4 rounded-xl border border-zinc-200 dark:border-white/5 relative group">
                <div className="w-6 h-6 rounded-full bg-[#bc151b]/15 border border-[#bc151b]/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#bc151b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1">
                  <InlineEditText tagName="span" value={item} onSave={(v) => handleArraySave("items", index, v)} />
                </div>
                {isEditMode && (
                  <button onClick={() => handleRemoveArrayItem("items", index)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditMode && (
            <button onClick={() => handleAddArrayItem("items", "Target baru...")} className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 mx-auto hover:underline">
              <Plus size={14} /> Tambah Target
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function CommunityValuesSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-white/5 relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-[#bc151b] text-xs font-bold uppercase tracking-wider mb-3 block">
          <InlineEditText tagName="span" value={content.label || "This Is More Than A Course"} onSave={(v) => handleSave("label", v)} />
        </span>
        <h2 className="text-3xl md:text-6xl font-title font-bold uppercase tracking-tight text-zinc-900 dark:text-white mb-6">
          <InlineEditText tagName="span" value={content.heading || "Ini Bukan Sekadar Kelas. <br /><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-[#bc151b] to-red-400\">Ini Tempat Lo Bertumbuh.</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
        </h2>
        <div className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed space-y-4 max-w-2xl mx-auto mb-12">
          <InlineEditText tagName="p" value={content.paragraphs?.[0] || "Di Panggung Kreator Akademi, lo akan ketemu banyak orang yang juga sedang berproses."} onSave={(v) => handleArraySave("paragraphs", 0, v)} />
          <InlineEditText tagName="p" value={content.paragraphs?.[1] || "Karena kadang… <span class=\"text-zinc-950 dark:text-white font-semibold\">yang bikin kita berkembang bukan cuma materi. Tapi lingkungan.</span>"} allowHtml={true} onSave={(v) => handleArraySave("paragraphs", 1, v)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {content.cards && content.cards.map((item: any, index: number) => (
            <div key={index} className="bg-white dark:bg-zinc-900/35 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center relative group">
              {isEditMode && (
                <button onClick={() => handleRemoveArrayItem("cards", index)} className="absolute right-2 top-2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              )}
              <div className="w-12 h-12 rounded-full bg-[#bc151b]/10 border border-[#bc151b]/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#bc151b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h4 className="font-title font-bold text-base uppercase text-zinc-900 dark:text-white mb-2 text-center">
                <InlineEditText tagName="span" value={item.title} onSave={(v) => handleArraySave("cards", index, { ...item, title: v })} />
              </h4>
              <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed text-center">
                <InlineEditText tagName="span" value={item.description} onSave={(v) => handleArraySave("cards", index, { ...item, description: v })} />
              </p>
            </div>
          ))}
        </div>
        {isEditMode && (
          <button onClick={() => handleAddArrayItem("cards", { title: "Value Baru", description: "Deskripsi value..." })} className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 mx-auto hover:underline">
            <Plus size={14} /> Tambah Value
          </button>
        )}
      </div>
    </section>
  );
}

export function VisionSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-4xl mx-auto z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wide mb-6 text-zinc-900 dark:text-white">
          <InlineEditText tagName="span" value={content.heading || "Bayangin Kalau <span class=\"text-[#bc151b]\">6 Bulan Dari Sekarang…</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base mb-10 max-w-xl mx-auto">
          <InlineEditText tagName="span" value={content.subheading || "Sebuah perubahan nyata yang akan lo rasakan setelah konsisten melatih kemampuan komunikasimu:"} onSave={(v) => handleSave("subheading", v)} />
        </p>

        <div className="max-w-xl mx-auto text-left space-y-4 mb-12">
          {content.items && content.items.map((item: string, index: number) => (
            <div key={index} className="flex items-center gap-4 bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-white/5 relative group">
              <span className="text-[#bc151b] font-title font-bold text-sm">✓</span>
              <div className="flex-1">
                <InlineEditText tagName="span" className="text-zinc-700 dark:text-zinc-200 text-sm md:text-base font-medium" value={item} onSave={(v) => handleArraySave("items", index, v)} />
              </div>
              {isEditMode && (
                <button onClick={() => handleRemoveArrayItem("items", index)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {isEditMode && (
            <button onClick={() => handleAddArrayItem("items", "Visi baru...")} className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 hover:underline">
              <Plus size={14} /> Tambah Visi
            </button>
          )}
        </div>

        <div className="inline-block py-4 px-8 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl mb-8">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            <InlineEditText tagName="span" value={content.bottomText || "Dan semua itu… dimulai dari satu keputusan kecil: <span class=\"text-zinc-900 dark:text-white font-bold uppercase tracking-wide text-base ml-1\">Berani mulai.</span>"} allowHtml={true} onSave={(v) => handleSave("bottomText", v)} />
          </p>
        </div>
      </div>
    </section>
  );
}

export function FacilitiesSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-white/5 relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-6xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white">
            <InlineEditText tagName="span" value={content.heading || "Fasilitas & <span class=\"text-[#bc151b]\">Bonus Member</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            <InlineEditText tagName="span" value={content.subheading || "Ekosistem belajar super lengkap untuk menunjang penuh perjalanan karir dan rasa percaya diri lo."} onSave={(v) => handleSave("subheading", v)} />
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-title font-bold text-xl md:text-2xl text-zinc-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <span className="w-2.5 h-6 bg-[#bc151b] rounded-full" />
              Fasilitas yang Akan Lo Dapatkan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.facilities && content.facilities.map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-3 bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-zinc-200 dark:border-white/5 relative group">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <div className="flex-1">
                    <InlineEditText tagName="span" className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold" value={item} onSave={(v) => handleArraySave("facilities", index, v)} />
                  </div>
                  {isEditMode && (
                    <button onClick={() => handleRemoveArrayItem("facilities", index)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditMode && (
              <button onClick={() => handleAddArrayItem("facilities", "Fasilitas baru")} className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 hover:underline">
                <Plus size={14} /> Tambah Fasilitas
              </button>
            )}
          </div>

          <div>
            <h3 className="font-title font-bold text-xl md:text-2xl text-[#bc151b] uppercase tracking-wider mb-6 flex items-center gap-3">
              <span className="w-2.5 h-6 bg-zinc-900 dark:bg-white rounded-full transition-colors duration-300" />
              Bonus Khusus Member
            </h3>
            <div className="space-y-3">
              {content.bonuses && content.bonuses.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-[#bc151b]/20 relative group">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">🎁</span>
                    <div className="flex-1 pr-16">
                      <InlineEditText tagName="span" className="text-zinc-900 dark:text-white text-sm md:text-base font-bold uppercase tracking-wide block" value={item.title} onSave={(v) => handleArraySave("bonuses", index, { ...item, title: v })} />
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#bc151b] bg-[#bc151b]/10 border border-[#bc151b]/25 px-2.5 py-1 rounded-full text-center">
                    <InlineEditText tagName="span" value={item.badge} onSave={(v) => handleArraySave("bonuses", index, { ...item, badge: v })} />
                  </span>
                  {isEditMode && (
                    <button onClick={() => handleRemoveArrayItem("bonuses", index)} className="absolute -right-8 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditMode && (
              <button onClick={() => handleAddArrayItem("bonuses", { title: "Bonus Baru", badge: "Badge" })} className="mt-4 text-xs text-[#bc151b] flex items-center gap-1 hover:underline">
                <Plus size={14} /> Tambah Bonus
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#bc151b] text-xs font-bold uppercase tracking-wider block mb-3">
            <InlineEditText tagName="span" value={content.label || "Social Proof & Alumni Voice"} onSave={(v) => handleSave("label", v)} />
          </span>
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            <InlineEditText tagName="span" value={content.heading || "Mereka Juga Pernah Ada <br class=\"sm:hidden\" />Di <span class=\"text-[#bc151b]\">Posisi Lo Sekarang.</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.items && content.items.map((item: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-zinc-900/35 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between relative group">
              {isEditMode && (
                <button onClick={() => handleRemoveArrayItem("items", idx)} className="absolute right-2 top-2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              )}
              <div className="mb-6">
                <span className="text-4xl text-[#bc151b] font-serif leading-none block mb-2">“</span>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base italic leading-relaxed">
                  <InlineEditText tagName="span" value={item.quote} onSave={(v) => handleArraySave("items", idx, { ...item, quote: v })} />
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-zinc-200 dark:border-white/5 pt-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold font-title text-zinc-500 shrink-0">
                  <InlineImage 
                    src={item.avatar || `https://ui-avatars.com/api/?name=${item.name || 'M'}&background=bc151b&color=fff`} 
                    alt={`${item.name} Avatar`} 
                    onSave={(v) => handleArraySave("items", idx, { ...item, avatar: v })} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-zinc-900 dark:text-white text-xs font-bold">
                    <InlineEditText tagName="span" value={item.name || "Member PKA"} onSave={(v) => handleArraySave("items", idx, { ...item, name: v })} />
                  </p>
                  <p className="text-zinc-500 text-[10px]">
                    <InlineEditText tagName="span" value={item.role || "Verified Alumni"} onSave={(v) => handleArraySave("items", idx, { ...item, role: v })} />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {isEditMode && (
          <button onClick={() => handleAddArrayItem("items", { quote: "Testimoni baru...", initial: "A", name: "Anonim", role: "Member" })} className="mt-8 text-xs text-[#bc151b] flex items-center gap-1 mx-auto hover:underline">
            <Plus size={14} /> Tambah Testimoni
          </button>
        )}
      </div>
    </section>
  );
}

export function ClosingCtaSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-28 px-6 md:px-12 bg-zinc-100/50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/5 relative overflow-hidden text-center transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-4xl mx-auto z-10 relative">
        <h2 className="text-3xl md:text-6xl font-title font-bold uppercase tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
          <InlineEditText tagName="span" value={content.heading || "Dunia gak selalu butuh orang paling sempurna. <br /><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#bc151b]\">Tapi dunia butuh orang yang berani tampil.</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
        </h2>

        <div className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed space-y-4 max-w-2xl mx-auto mb-10">
          {content.paragraphs && content.paragraphs.map((p: string, i: number) => (
            <div key={i} className="relative group">
              <InlineEditText tagName="p" value={p} allowHtml={true} onSave={(v) => handleArraySave("paragraphs", i, v)} />
              {isEditMode && (
                <button onClick={() => handleRemoveArrayItem("paragraphs", i)} className="absolute -right-8 top-0 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {isEditMode && (
            <button onClick={() => handleAddArrayItem("paragraphs", "Paragraf tambahan...")} className="mt-2 text-xs text-[#bc151b] flex items-center gap-1 mx-auto hover:underline">
              <Plus size={14} /> Tambah Paragraf
            </button>
          )}
        </div>

        <div className="inline-block relative">
          <Link href="/checkout" className="px-12 py-5 text-xl font-bold text-white uppercase tracking-wider bg-[#bc151b] rounded-xl inline-block pointer-events-none">
            <InlineEditText tagName="span" className="pointer-events-auto" value={content.ctaText || "DAFTAR SEKARANG"} onSave={(v) => handleSave("ctaText", v)} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!isEditMode && !isVisible) return null;

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className={`py-24 px-6 md:px-12 bg-zinc-50 dark:bg-[#0a0a0a] transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#bc151b] text-xs font-bold uppercase tracking-wider block mb-3">
            <InlineEditText tagName="span" value={content.label || "FAQ (Frequently Asked Questions)"} onSave={(v) => handleSave("label", v)} />
          </span>
          <h2 className="text-3xl md:text-5xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            <InlineEditText tagName="span" value={content.heading || "Pertanyaan yang <span class=\"text-[#bc151b]\">Sering Diajukan</span>"} allowHtml={true} onSave={(v) => handleSave("heading", v)} />
          </h2>
        </div>

        <div className="space-y-4">
          {content.items && content.items.map((faq: any, i: number) => (
            <div key={i} className="border border-zinc-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-900/40 transition-all relative group">
              {isEditMode && (
                <button onClick={() => handleRemoveArrayItem("items", i)} className="absolute -left-10 top-4 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              )}
              <div
                onClick={(e) => {
                  if (isEditMode && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'path' && (e.target as HTMLElement).tagName !== 'svg') {
                    // Do nothing if editing
                  } else {
                    toggleFaq(i);
                  }
                }}
                className={`w-full px-6 py-5 text-left font-semibold text-sm md:text-base flex justify-between items-center transition-colors ${!isEditMode ? 'cursor-pointer hover:bg-[#bc151b]/5' : ''}`}
              >
                <div className="flex-1 pr-4">
                  <InlineEditText tagName="span" className="text-zinc-800 dark:text-white font-title tracking-wide uppercase block" value={faq.question} onSave={(v) => handleArraySave("items", i, { ...faq, question: v })} />
                </div>
                <button onClick={() => toggleFaq(i)} className="focus:outline-none shrink-0 p-2">
                  <svg className={`w-5 h-5 text-[#bc151b] transform transition-transform ${activeFaq === i || isEditMode ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {(activeFaq === i || isEditMode) && (
                <div className="px-6 py-5 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-black/40">
                  <InlineEditText tagName="div" value={faq.answer} onSave={(v) => handleArraySave("items", i, { ...faq, answer: v })} />
                </div>
              )}
            </div>
          ))}
        </div>
        {isEditMode && (
          <button onClick={() => handleAddArrayItem("items", { question: "Pertanyaan baru?", answer: "Jawaban pertanyaan." })} className="mt-8 text-xs text-[#bc151b] flex items-center gap-1 mx-auto hover:underline bg-[#bc151b]/10 px-4 py-2 rounded-full font-bold">
            <Plus size={14} /> Tambah FAQ
          </button>
        )}
      </div>
    </section>
  );
}

export function FooterSection({ id, isVisible, content }: any) {
  const { isEditMode } = useLandingCMS();
  const { handleSave, handleArraySave, handleAddArrayItem, handleRemoveArrayItem } = useSectionEditor(id, content);
  if (!isEditMode && !isVisible) return null;

  return (
    <section className={`py-20 px-6 md:px-12 bg-zinc-100 dark:bg-black border-t border-zinc-200 dark:border-white/5 text-center relative transition-opacity duration-300 ${!isVisible ? "opacity-50 grayscale" : ""}`}>
      {isEditMode && !isVisible && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded z-50">Section disembunyikan</div>}
      <div className="max-w-4xl mx-auto">
        <div className="w-auto h-auto rounded-xl flex items-center justify-center font-title font-bold text-white text-lg mx-auto mb-6">
          <div className="block dark:hidden w-36 h-auto">
            <InlineImage 
              src={content.logoLight || "/logo-light.png"} 
              alt={`${content.brandName} Logo Light`} 
              onSave={(v) => handleSave("logoLight", v)} 
            />
          </div>
          <div className="hidden dark:block w-36 h-auto">
            <InlineImage 
              src={content.logoDark || "/logo-dark.png"} 
              alt={`${content.brandName} Logo Dark`} 
              onSave={(v) => handleSave("logoDark", v)} 
            />
          </div>
        </div>
        <h2 className="text-3xl md:text-5xl font-title font-bold uppercase text-zinc-900 dark:text-white tracking-widest mb-4">
          <InlineEditText tagName="span" value={content.brandName || "Panggung Kreator Akademi"} onSave={(v) => handleSave("brandName", v)} />
        </h2>
        <h3 className="text-lg md:text-xl font-medium text-zinc-600 dark:text-[#bc151b] uppercase tracking-wide max-w-2xl mx-auto mb-12">
          <InlineEditText tagName="span" value={content.tagline || "Bicara Bukan Sekadar Skill. <br class=\"sm:hidden\" />Tapi Jalan Untuk Membuka Banyak Panggung Dalam Hidup Lo."} allowHtml={true} onSave={(v) => handleSave("tagline", v)} />
        </h3>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-zinc-200 dark:border-white/5 pt-8 text-xs text-zinc-500 transition-colors">
          <p><InlineEditText tagName="span" value={content.copyright || "© 2026 Panggung Kreator Akademi. All rights reserved."} onSave={(v) => handleSave("copyright", v)} /></p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            {content.links && content.links.map((link: any, idx: number) => (
              <div key={idx} className="relative group flex items-center gap-1">
                <InlineEditText tagName="span" className="text-zinc-500 hover:text-[#bc151b] dark:text-zinc-400 dark:hover:text-white transition-colors" value={link.label} onSave={(v) => handleArraySave("links", idx, { ...link, label: v })} />
                {isEditMode && (
                  <button onClick={() => handleRemoveArrayItem("links", idx)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button onClick={() => handleAddArrayItem("links", { label: "Link Baru", url: "#" })} className="text-xs text-[#bc151b] flex items-center gap-1 hover:underline">
                <Plus size={12} /> Tambah Link
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
