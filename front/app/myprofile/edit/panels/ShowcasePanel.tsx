"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MemberProfile,
  PortfolioItem,
  MemberExperience,
  Pillar,
  ItemType,
} from "@/lib/types/member";
import PortfolioDrawer from "@/components/member/PortfolioDrawer";
import ExperienceDrawer from "@/components/member/ExperienceDrawer";
import { toast } from "sonner";
import {
  Sparkles,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Loader2,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  Building,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";

export type ShowcaseSubTab = "portfolio" | "experience" | "achievement";

interface ShowcasePanelProps {
  member: MemberProfile;
  initialSubTab?: ShowcaseSubTab;
  previewUrl?: string;
}

const PILLARS: { value: Pillar | "all"; label: string }[] = [
  { value: "all", label: "🌟 Semua Pilar" },
  { value: "public_speaking", label: "🎤 Public Speaking" },
  { value: "content_creation", label: "🎬 Storytelling" },
  { value: "personal_branding", label: "✨ Personal Branding" },
];

export default function ShowcasePanel({
  member,
  initialSubTab = "experience",
  previewUrl,
}: ShowcasePanelProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<ShowcaseSubTab>(
    initialSubTab === "achievement" ? "portfolio" : initialSubTab
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync with initialSubTab if it changes from parent URL
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab === "achievement" ? "portfolio" : initialSubTab);
    }
  }, [initialSubTab]);

  // Auto-open drawer when navigated with action=add
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "add") {
        const sub = params.get("sub");
        if (sub === "portfolio" || (!sub && activeSubTab === "portfolio")) {
          setEditingPortfolioItem(null);
          setIsPortfolioDrawerOpen(true);
        } else if (sub === "experience" || (!sub && activeSubTab === "experience")) {
          setEditingExperience(null);
          setIsExpDrawerOpen(true);
        }
      }
    }
  }, [activeSubTab]);

  // ── Portfolio & Achievements State ─────────────────────────────────────────
  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [activePillarFilter, setActivePillarFilter] = useState<Pillar | "all">("all");
  const [isPortfolioDrawerOpen, setIsPortfolioDrawerOpen] = useState(false);
  const [isAchievementDrawerOpen, setIsAchievementDrawerOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

  // ── Experiences State ──────────────────────────────────────────────────────
  const [experiences, setExperiences] = useState<MemberExperience[]>([]);
  const [isExpLoading, setIsExpLoading] = useState(true);
  const [isExpDrawerOpen, setIsExpDrawerOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<MemberExperience | null>(null);

  // ── Fetch Portfolio & Achievements ─────────────────────────────────────────
  const fetchPortfolioData = useCallback(async () => {
    try {
      const res = await fetch("/api/member/portfolio");
      if (res.ok) {
        const json = await res.json();
        setAllItems(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setIsPortfolioLoading(false);
    }
  }, []);

  // ── Fetch Experiences ──────────────────────────────────────────────────────
  const fetchExperienceData = useCallback(async () => {
    try {
      const res = await fetch("/api/member/experience");
      if (res.ok) {
        const json = await res.json();
        setExperiences(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching experiences:", err);
    } finally {
      setIsExpLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
    fetchExperienceData();
  }, [fetchPortfolioData, fetchExperienceData]);

  // All portfolio items (including video, image, achievement, link)
  const portfolioItems = allItems
    .filter((item) => (activePillarFilter === "all" ? true : item.pillar === activePillarFilter))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const rawPortfolioCount = allItems.length;

  const achievementItems = allItems
    .filter((item) => item.item_type === "achievement")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // ── Delete Handlers ────────────────────────────────────────────────────────
  const handleDeleteItem = async (id: string, isAch = false) => {
    const label = isAch ? "prestasi/sertifikat" : "portofolio";
    if (!confirm(`Apakah Anda yakin ingin menghapus ${label} ini?`)) return;

    try {
      const res = await fetch(`/api/member/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Gagal menghapus ${label}.`);
      }
      toast.success(`${isAch ? "Prestasi" : "Karya"} berhasil dihapus.`);
      setAllItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat jam terbang ini?")) return;

    try {
      const res = await fetch(`/api/member/experience/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus pengalaman.");
      }
      toast.success("Riwayat jam terbang berhasil dihapus.");
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  // ── Reorder Handlers ───────────────────────────────────────────────────────
  const handleMovePortfolio = async (item: PortfolioItem, direction: "up" | "down") => {
    const relevantItems = allItems.filter((i) =>
      item.item_type === "achievement" ? i.item_type === "achievement" : i.item_type !== "achievement"
    );
    const currentIndex = relevantItems.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= relevantItems.length) return;

    const targetItem = relevantItems[targetIndex];
    const newCurrentOrder = targetItem.sort_order ?? targetIndex;
    const newTargetOrder = item.sort_order ?? currentIndex;

    setAllItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) return { ...i, sort_order: newCurrentOrder };
        if (i.id === targetItem.id) return { ...i, sort_order: newTargetOrder };
        return i;
      })
    );

    try {
      await Promise.all([
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
    } catch (err) {
      console.error("Reorder failed:", err);
      fetchPortfolioData();
    }
  };

  const handleMoveExperience = async (exp: MemberExperience, direction: "up" | "down") => {
    const currentIndex = experiences.findIndex((e) => e.id === exp.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const targetExp = experiences[targetIndex];
    const newCurrentOrder = targetExp.sort_order ?? targetIndex;
    const newTargetOrder = exp.sort_order ?? currentIndex;

    setExperiences((prev) =>
      prev.map((e) => {
        if (e.id === exp.id) return { ...e, sort_order: newCurrentOrder };
        if (e.id === targetExp.id) return { ...e, sort_order: newTargetOrder };
        return e;
      })
    );

    try {
      await Promise.all([
        fetch(`/api/member/experience/${exp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newCurrentOrder }),
        }),
        fetch(`/api/member/experience/${targetExp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newTargetOrder }),
        }),
      ]);
    } catch (err) {
      console.error("Experience reorder failed:", err);
      fetchExperienceData();
    }
  };

  // ── Tab Config ─────────────────────────────────────────────────────────────
  const SUB_TABS = [
    {
      id: "experience" as ShowcaseSubTab,
      label: "Jam Terbang",
      fullName: "Jam Terbang & Event",
      icon: Briefcase,
      actionLabel: "Tambah",
      onAdd: () => {
        setEditingExperience(null);
        setIsExpDrawerOpen(true);
      },
    },
    {
      id: "portfolio" as ShowcaseSubTab,
      label: "Portofolio",
      fullName: "Portofolio Karya & Rekam Jejak",
      icon: Sparkles,
      actionLabel: "Tambah",
      onAdd: () => {
        setEditingPortfolioItem(null);
        setIsPortfolioDrawerOpen(true);
      },
    },
  ];

  const currentTabObj = SUB_TABS.find((t) => t.id === activeSubTab) || SUB_TABS[0];

  return (
    <div className="bg-bg-card border border-border-default rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      {/* ══════════════════════════════════════════════════════════════
          SEGMENTED PILL TABS BAR (REFERENCE DESIGN MATCH)
          - Dark active background
          - No count data
          - Clean minimalist rounded pill container
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-default/60">
        {/* Segmented Pill Tabs Switcher */}
        <div className="flex items-center gap-1 w-full sm:w-fit shadow-2xs">
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex-1 sm:flex-initial px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-sans transition-all cursor-pointer select-none rounded-xl text-center ${isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card/40 font-medium"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Top Right Action (Contextual Add CTA - Desktop only) */}
        <div className="hidden sm:flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={currentTabObj.onAdd}
            className="h-9 px-3.5 sm:px-4 bg-text-primary text-bg-card hover:opacity-90 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>{currentTabObj.actionLabel}</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════════ */}
      <div>
        {/* ─────────────────────────────────────────────────────────────
            SUB-TAB 1: PORTOFOLIO KARYA
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === "portfolio" && (
          <div className="space-y-5 animate-fade-in">


            {/* Grid Content */}
            {isPortfolioLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-bg-well/70 border border-border-default overflow-hidden h-48"
                  />
                ))}
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="border border-dashed border-border-default py-12 text-center space-y-2.5 p-6 rounded-2xl bg-bg-well/30">
                <div className="text-xs text-text-primary font-bold uppercase tracking-wider">
                  Belum Ada Portofolio
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Dokumentasikan video, foto showcase, sertifikat prestasi, atau portofolio terbaik Anda agar tampil di etalase profil talent.
                </p>
                <button
                  type="button"
                  onClick={currentTabObj.onAdd}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary hover:opacity-80 transition-opacity cursor-pointer pt-2"
                >
                  <Plus size={14} /> Tambah Portofolio Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-bg-card border border-border-default group relative flex flex-col justify-between rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all hover:border-text-secondary/30"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden border-b border-border-default flex items-center justify-center">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-neutral-500 flex flex-col items-center gap-2">
                          {item.item_type === "video" ? (
                            <Video size={28} />
                          ) : item.item_type === "image" ? (
                            <ImageIcon size={28} />
                          ) : (
                            <LinkIcon size={28} />
                          )}
                          <span className="text-[9px] uppercase font-mono tracking-wider">
                            {item.item_type}
                          </span>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1">
                        {item.is_featured && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                            Unggulan
                          </span>
                        )}
                        {!item.is_public && (
                          <span className="bg-neutral-900/90 text-neutral-300 text-[9px] tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-white/10">
                            <Lock size={8} /> Privat
                          </span>
                        )}
                      </div>

                      {/* Media Link Overlay */}
                      {item.media_url && (
                        <a
                          href={item.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                          title="Buka Media Tautan"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                            {item.pillar ? item.pillar.replace("_", " ") : "Karya"}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-text-primary transition-colors">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Toolbars */}
                      <div className="pt-2 border-t border-border-default/60 flex items-center justify-between">
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMovePortfolio(item, "up")}
                            disabled={idx === 0}
                            className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                            title="Geser ke atas"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePortfolio(item, "down")}
                            disabled={idx === portfolioItems.length - 1}
                            className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                            title="Geser ke bawah"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPortfolioItem(item);
                              setIsPortfolioDrawerOpen(true);
                            }}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well rounded-lg hover:bg-border-default transition-colors cursor-pointer"
                            title="Edit Karya"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, false)}
                            className="p-1.5 text-text-secondary hover:text-red-500 bg-bg-well rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
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

        {/* ─────────────────────────────────────────────────────────────
            SUB-TAB 2: JAM TERBANG & EVENT
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === "experience" && (
          <div className="space-y-4 animate-fade-in">
            {isExpLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-bg-well/70 border border-border-default"
                  />
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <div className="border border-dashed border-border-default py-12 text-center space-y-2.5 p-6 rounded-2xl bg-bg-well/30">
                <div className="text-xs text-text-primary font-bold uppercase tracking-wider">
                  Belum Ada Riwayat Jam Terbang
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Catat setiap peran panggung, event MC, moderator, talkshow, atau project klien Anda untuk membangun kredibilitas.
                </p>
                <button
                  type="button"
                  onClick={currentTabObj.onAdd}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary hover:opacity-80 transition-opacity cursor-pointer pt-2"
                >
                  <Plus size={14} /> Tambah Pengalaman Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-4 sm:p-5 bg-bg-card border border-border-default rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-text-secondary/30 transition-all shadow-2xs"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-text-primary">
                          {exp.role}
                        </h4>
                        {exp.is_current && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary font-mono">
                        <span className="flex items-center gap-1 font-semibold text-text-primary">
                          <Building size={12} className="text-text-muted" />
                          {exp.institution}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-text-muted" />
                            {exp.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Calendar size={12} className="text-text-muted" />
                          {exp.start_date} — {exp.is_current ? "Sekarang" : exp.end_date || "Selesai"}
                        </span>
                      </div>

                      {exp.description && (
                        <p className="text-xs text-text-secondary leading-relaxed pt-1 border-t border-border-default/40">
                          {exp.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        onClick={() => handleMoveExperience(exp, "up")}
                        disabled={idx === 0}
                        className="p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                        title="Geser ke atas"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveExperience(exp, "down")}
                        disabled={idx === experiences.length - 1}
                        className="p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                        title="Geser ke bawah"
                      >
                        <ChevronDown size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingExperience(exp);
                          setIsExpDrawerOpen(true);
                        }}
                        className="p-2 text-text-secondary hover:text-text-primary bg-bg-well rounded-xl hover:bg-border-default transition-colors cursor-pointer ml-1"
                        title="Edit Jam Terbang"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-2 text-text-secondary hover:text-red-500 bg-bg-well rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
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

        {/* ─────────────────────────────────────────────────────────────
            SUB-TAB 3: PRESTASI & PENGHARGAAN
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === "achievement" && (
          <div className="space-y-4 animate-fade-in">
            {isPortfolioLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-bg-well/70 border border-border-default"
                  />
                ))}
              </div>
            ) : achievementItems.length === 0 ? (
              <div className="border border-dashed border-border-default py-12 text-center space-y-2.5 p-6 rounded-2xl bg-bg-well/30">
                <div className="text-xs text-text-primary font-bold uppercase tracking-wider">
                  Belum Ada Prestasi atau Sertifikat
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Tampilkan pencapaian kompetisi panggung, penghargaan, sertifikasi keahlian, atau pengakuan industri Anda.
                </p>
                <button
                  type="button"
                  onClick={currentTabObj.onAdd}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary hover:opacity-80 transition-opacity cursor-pointer pt-2"
                >
                  <Plus size={14} /> Tambah Prestasi Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievementItems.map((ach, idx) => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-2xl border border-border-default bg-bg-card shadow-2xs flex items-start justify-between gap-3 hover:border-text-secondary/30 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                        <Award size={18} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs font-bold text-text-primary line-clamp-1">
                          {ach.title}
                        </h4>
                        {ach.description && (
                          <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                            {ach.description}
                          </p>
                        )}
                        {ach.media_url && (
                          <a
                            href={ach.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-text-secondary hover:text-text-primary underline underline-offset-2 pt-0.5"
                          >
                            <span>Lihat Sertifikat</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMovePortfolio(ach, "up")}
                        disabled={idx === 0}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                        title="Geser ke atas"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePortfolio(ach, "down")}
                        disabled={idx === achievementItems.length - 1}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                        title="Geser ke bawah"
                      >
                        <ChevronDown size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPortfolioItem(ach);
                          setIsAchievementDrawerOpen(true);
                        }}
                        className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well rounded-lg hover:bg-border-default transition-colors cursor-pointer ml-1"
                        title="Edit Prestasi"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(ach.id, true)}
                        className="p-1.5 text-text-secondary hover:text-red-500 bg-bg-well rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Hapus Prestasi"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DRAWERS ──────────────────────────────────────────────────────── */}
      {/* Portfolio Item Drawer */}
      <PortfolioDrawer
        isOpen={isPortfolioDrawerOpen}
        onClose={() => {
          setIsPortfolioDrawerOpen(false);
          setEditingPortfolioItem(null);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (url.searchParams.has("action")) {
              url.searchParams.delete("action");
              window.history.replaceState({}, "", url.toString());
            }
          }
        }}
        memberId={member.id}
        itemToEdit={editingPortfolioItem}
        onSuccess={(_saved) => {
          fetchPortfolioData();
        }}
      />

      {/* Achievement Item Drawer */}
      <PortfolioDrawer
        isOpen={isAchievementDrawerOpen}
        onClose={() => {
          setIsAchievementDrawerOpen(false);
          setEditingPortfolioItem(null);
        }}
        memberId={member.id}
        itemToEdit={editingPortfolioItem}
        onSuccess={(_saved) => {
          fetchPortfolioData();
        }}
      />

      {/* Experience Item Drawer */}
      <ExperienceDrawer
        isOpen={isExpDrawerOpen}
        onClose={() => {
          setIsExpDrawerOpen(false);
          setEditingExperience(null);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (url.searchParams.has("action")) {
              url.searchParams.delete("action");
              window.history.replaceState({}, "", url.toString());
            }
          }
        }}
        experienceToEdit={editingExperience}
        onSuccess={() => {
          fetchExperienceData();
        }}
      />

      {/* 📱 MOBILE VERTICAL FLOATING ACTIONS (+ TAMBAH & PREVIEW PUBLIK) */}
      {isMounted &&
        createPortal(
          <div className="sm:hidden fixed bottom-[88px] right-6 sm:right-8 z-50 flex flex-col items-center gap-2.5 pointer-events-auto">
            {/* 1. Floating Preview Publik (Icon Only) */}
            {previewUrl && (
              <Link
                href={previewUrl}
                target="_blank"
                aria-label="Preview Halaman Publik Talent"
                className="w-13 h-13 rounded-full bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg text-text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                title="Lihat Halaman Publik Talent"
              >
                <Eye size={24} className="text-text-secondary group-hover:text-text-primary transition-colors" />
              </Link>
            )}

            {/* 2. Floating + Tambah Button (Icon Only, Enlarged) */}
            <button
              type="button"
              onClick={currentTabObj.onAdd}
              aria-label={`Tambah ${currentTabObj.label}`}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={`Tambah ${currentTabObj.label}`}
            >
              <Plus size={24} className="stroke-[2.5]" />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
