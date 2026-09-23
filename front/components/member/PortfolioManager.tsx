"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { PortfolioItem, MemberExperience, Pillar } from "@/lib/types/member";
import PortfolioDrawer from "./PortfolioDrawer";
import ExperienceDrawer from "./ExperienceDrawer";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Lock,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Award,
  Link as LinkIcon,
  Edit2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
  Briefcase,
  Calendar,
  MapPin,
  Building,
  Eye,
} from "lucide-react";

interface PortfolioManagerProps {
  memberId: string;
  username?: string;
}

type SubSection = "portfolio" | "experience";

const PILLARS: { value: Pillar | "all"; label: string }[] = [
  { value: "all", label: "🌟 Semua Pilar" },
  { value: "public_speaking", label: "🎤 Public Speaking" },
  { value: "content_creation", label: "🎬 Storytelling" },
  { value: "personal_branding", label: "✨ Personal Branding" },
];

export default function PortfolioManager({ memberId, username }: PortfolioManagerProps) {
  void memberId;
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SubSection>("portfolio");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Portfolio State
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<Pillar | "all">("all");
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [isPortfolioDrawerOpen, setIsPortfolioDrawerOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

  // Experience State
  const [experiences, setExperiences] = useState<MemberExperience[]>([]);
  const [isExpLoading, setIsExpLoading] = useState(true);
  const [isExpDrawerOpen, setIsExpDrawerOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<MemberExperience | null>(null);

  // Fetch Portfolios
  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch("/api/member/portfolio");
      if (response.ok) {
        const json = await response.json();
        setItems(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setIsPortfolioLoading(false);
    }
  }, []);

  // Fetch Experiences
  const fetchExperiences = useCallback(async () => {
    try {
      const response = await fetch("/api/member/experience");
      if (response.ok) {
        const json = await response.json();
        setExperiences(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching experience:", err);
    } finally {
      setIsExpLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    fetchExperiences();
  }, [fetchPortfolio, fetchExperiences]);

  // Portfolio Actions
  const handleOpenAddPortfolio = () => {
    setEditingPortfolioItem(null);
    setIsPortfolioDrawerOpen(true);
  };

  const handleOpenEditPortfolio = (item: PortfolioItem) => {
    setEditingPortfolioItem(item);
    setIsPortfolioDrawerOpen(true);
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karya ini?")) return;

    try {
      const res = await fetch(`/api/member/portfolio/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus.");
      }

      toast.success("Karya berhasil dihapus.");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const handleMovePortfolio = async (item: PortfolioItem, direction: "up" | "down") => {
    const currentIndex = filteredItems.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    const targetItem = filteredItems[targetIndex];

    let currentOrder = item.sort_order ?? currentIndex;
    let targetOrder = targetItem.sort_order ?? targetIndex;

    if (currentOrder === targetOrder) {
      currentOrder = currentIndex;
      targetOrder = targetIndex;
    }

    const newCurrentOrder = targetOrder;
    const newTargetOrder = currentOrder;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) return { ...i, sort_order: newCurrentOrder };
        if (i.id === targetItem.id) return { ...i, sort_order: newTargetOrder };
        return i;
      })
    );

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/member/portfolio/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newCurrentOrder }),
        }),
        fetch(`/api/member/portfolio/${targetItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newTargetOrder }),
        }),
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error("Gagal menyimpan urutan karya.");
      }
      toast.success("Urutan karya berhasil diperbarui.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui urutan.");
      fetchPortfolio();
    }
  };

  // Experience Actions
  const handleOpenAddExperience = () => {
    setEditingExperience(null);
    setIsExpDrawerOpen(true);
  };

  const handleOpenEditExperience = (exp: MemberExperience) => {
    setEditingExperience(exp);
    setIsExpDrawerOpen(true);
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman jam terbang ini?")) return;

    try {
      const res = await fetch(`/api/member/experience/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus.");
      }

      toast.success("Jam terbang berhasil dihapus.");
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const filteredItems = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-4">
      {/* ═══ JUDUL DIATAS FILTER KARYA DAN JAM TERBANG TANPA BORDER BOTTOM ═══ */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121] dark:text-white">
          Daftar Portofolio & Jam Terbang
        </h2>
      </div>

      {/* ═══ TOP SUB-SECTION SWITCHER (CAPSULE PILLS) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-4 gap-3">
        {/* Left: Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 rounded-full w-full sm:w-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSection("portfolio")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 rounded-full active:scale-95 ${activeSection === "portfolio"
              ? "bg-[#212121] text-white dark:bg-white dark:text-[#212121] shadow-2xs"
              : "text-neutral-600 dark:text-neutral-400 hover:text-[#212121] dark:hover:text-white"
              }`}
          >
            <span>Portofolio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("experience")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 rounded-full active:scale-95 ${activeSection === "experience"
              ? "bg-[#212121] text-white dark:bg-white dark:text-[#212121] shadow-2xs"
              : "text-neutral-600 dark:text-neutral-400 hover:text-[#212121] dark:hover:text-white"
              }`}
          >
            <span>Jam Terbang</span>
          </button>
        </div>

        {/* Right: Public Talent Page Link & Tambah Button (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          {username && (
            <Link
              href={`/talent/${username}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] hover:bg-[#F6F5FA] dark:hover:bg-neutral-800 text-[#212121] dark:text-neutral-200 text-xs font-sans font-semibold uppercase tracking-wider transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
            >
              <Eye size={13} />
              <span>Lihat Profil Talent</span>
              <ExternalLink size={11} className="text-neutral-400" />
            </Link>
          )}

          <Link
            href={
              activeSection === "portfolio"
                ? "/myprofile/edit?tab=portofolio&sub=portfolio&action=add"
                : "/myprofile/edit?tab=portofolio&sub=experience&action=add"
            }
            className="h-9 px-3.5 bg-[#212121] dark:bg-white text-white dark:text-[#212121] hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shrink-0 rounded-xl shadow-2xs"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: PORTOFOLIO KARYA & SERTIFIKAT
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "portfolio" && (
        <div className="space-y-4 animate-fade-in">
          {/* Grid Portfolio Content */}
          {isPortfolioLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10 overflow-hidden">
                  <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="border border-dashed border-[#212121]/20 dark:border-white/20 py-12 text-center space-y-2.5 font-sans p-6 rounded-2xl bg-white/50 dark:bg-[#151B18]/50">
              <div className="text-xs text-[#212121] dark:text-white font-bold uppercase tracking-wider">
                Belum Ada Karya
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Semua dokumentasi video dan foto yang Anda tambahkan akan otomatis tampil di halaman etalase publik kreator Anda.
              </p>
              <Link
                href="/myprofile/edit?tab=portofolio&sub=portfolio&action=add"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#212121] dark:text-white hover:opacity-80 transition-opacity cursor-pointer pt-2"
              >
                <Plus size={14} /> Tambah Karya Pertama
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 group relative flex flex-col justify-between rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail Display */}
                  <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden border-b border-[#212121]/10 dark:border-white/10 flex items-center justify-center">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : item.item_type === "achievement" ? (
                      <div className="text-neutral-300 dark:text-neutral-400 flex flex-col items-center gap-1.5 p-4 text-center">
                        <Award size={32} className="text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                          Sertifikat / Prestasi
                        </span>
                      </div>
                    ) : (
                      <div className="text-neutral-500 flex flex-col items-center gap-2">
                        {item.item_type === "video" ? (
                          <Video size={28} />
                        ) : item.item_type === "image" ? (
                          <ImageIcon size={28} />
                        ) : (
                          <LinkIcon size={28} />
                        )}
                        <span className="text-[9px] uppercase font-mono tracking-wider">{item.item_type}</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.is_featured && (
                        <span className="bg-amber-500 text-white font-sans text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                          ★ Unggulan
                        </span>
                      )}
                      {!item.is_public && (
                        <span className="bg-neutral-900/90 text-neutral-300 font-sans text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-white/10">
                          <Lock size={8} /> Privat
                        </span>
                      )}
                    </div>

                    {/* External Link */}
                    {item.media_url && (
                      <a
                        href={item.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 bg-black/80 hover:bg-neutral-800 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        title="Buka Link Karya"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Card Meta & Actions */}
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-neutral-400 mb-1">
                        <span>{item.pillar?.replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>{item.item_type}</span>
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-tight text-neutral-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mt-1 font-sans">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 flex justify-between items-center text-[10px] font-mono text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => handleMovePortfolio(item, "up")}
                          disabled={index === 0}
                          className="p-1 text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed rounded-full"
                          title="Pindah ke Atas"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePortfolio(item, "down")}
                          disabled={index === filteredItems.length - 1}
                          className="p-1 text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed rounded-full"
                          title="Pindah ke Bawah"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPortfolio(item)}
                          className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
                          title="Edit Karya"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePortfolio(item.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Hapus Karya"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: JAM TERBANG & PENGALAMAN (EXPERIENCE TIMELINE)
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "experience" && (
        <div className="space-y-4 animate-fade-in">

          {/* Experience List Content */}
          {isExpLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-[#212121]/10 dark:border-white/10" />
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <div className="border border-dashed border-[#212121]/20 dark:border-white/20 py-12 text-center space-y-2.5 font-sans p-6 rounded-2xl bg-white/50 dark:bg-[#151B18]/50">
              <div className="text-xs text-[#212121] dark:text-white font-bold uppercase tracking-wider">
                Belum Ada Riwayat Jam Terbang
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Catat setiap event, project MC, talkshow, dan kolaborasi untuk meningkatkan kredibilitas Anda di hadapan klien.
              </p>
              <Link
                href="/myprofile/edit?tab=portofolio&sub=experience&action=add"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#212121] dark:text-white hover:opacity-80 transition-opacity cursor-pointer pt-2"
              >
                <Plus size={14} /> Tambah Pengalaman Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold uppercase tracking-tight text-[#212121] dark:text-white font-sans">
                        {exp.role}
                      </h4>
                      {exp.is_current && (
                        <span className="px-2.5 py-0.5 text-[9px] font-sans uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold rounded-full">
                          Aktif Sekarang
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      <span className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200">
                        <Building size={12} className="text-neutral-400" />
                        {exp.institution}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-neutral-400" />
                          {exp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                        <Calendar size={12} className="text-neutral-400" />
                        {exp.start_date} — {exp.is_current ? "Sekarang" : exp.end_date || "Selesai"}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1 font-sans">
                        {exp.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-900">
                    <button
                      type="button"
                      onClick={() => handleOpenEditExperience(exp)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
                      title="Edit Jam Terbang"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="p-2 text-neutral-500 hover:text-red-600 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors cursor-pointer"
                      title="Hapus Jam Terbang"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ DRAWERS ═══ */}
      <PortfolioDrawer
        isOpen={isPortfolioDrawerOpen}
        onClose={() => setIsPortfolioDrawerOpen(false)}
        memberId={memberId}
        itemToEdit={editingPortfolioItem}
        onSuccess={() => {
          fetchPortfolio();
        }}
      />

      <ExperienceDrawer
        isOpen={isExpDrawerOpen}
        onClose={() => setIsExpDrawerOpen(false)}
        experienceToEdit={editingExperience}
        onSuccess={() => {
          fetchExperiences();
        }}
      />

      {/* 📱 MOBILE VERTICAL FLOATING ACTIONS (+ TAMBAH & PREVIEW PUBLIK) */}
      {isMounted &&
        createPortal(
          <div className="sm:hidden fixed bottom-[88px] right-6 sm:right-8 z-50 flex flex-col items-center gap-2.5 pointer-events-auto">
            {/* 1. Floating Preview Publik (Icon Only) */}
            {username && (
              <Link
                href={`/talent/${username}`}
                target="_blank"
                aria-label="Preview Halaman Publik Talent"
                className="w-13 h-13 rounded-full bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg text-text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                title="Lihat Halaman Publik Talent"
              >
                <Eye size={24} className="text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </Link>
            )}

            {/* 2. Floating + Tambah Button (Icon Only, Enlarged) */}
            <Link
              href={
                activeSection === "portfolio"
                  ? "/myprofile/edit?tab=portofolio&sub=portfolio&action=add"
                  : "/myprofile/edit?tab=portofolio&sub=experience&action=add"
              }
              aria-label={activeSection === "portfolio" ? "Tambah Portofolio" : "Tambah Jam Terbang"}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={activeSection === "portfolio" ? "Tambah Portofolio" : "Tambah Jam Terbang"}
            >
              <Plus size={24} className="stroke-[2.5]" />
            </Link>
          </div>,
          document.body
        )}
    </div>
  );
}
