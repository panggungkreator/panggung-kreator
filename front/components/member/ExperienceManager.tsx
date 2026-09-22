"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MemberExperience } from "@/lib/types/member";
import ExperienceDrawer from "./ExperienceDrawer";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface ExperienceManagerProps {
  memberId: string;
}

export default function ExperienceManager({ memberId }: ExperienceManagerProps) {
  void memberId;
  const [experiences, setExperiences] = useState<MemberExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<MemberExperience | null>(null);

  const fetchExperiences = useCallback(async () => {
    try {
      const res = await fetch("/api/member/experience");
      if (res.ok) {
        const json = await res.json();
        setExperiences(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching experiences:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleOpenAdd = () => {
    setEditingExperience(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (exp: MemberExperience) => {
    setEditingExperience(exp);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman ini?")) return;

    try {
      const res = await fetch(`/api/member/experience/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus pengalaman.");
      }

      toast.success("Pengalaman berhasil dihapus.");
      setExperiences((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const handleMove = async (exp: MemberExperience, direction: "up" | "down") => {
    const currentIndex = experiences.findIndex((i) => i.id === exp.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const targetItem = experiences[targetIndex];
    let currentOrder = exp.sort_order ?? currentIndex;
    let targetOrder = targetItem.sort_order ?? targetIndex;

    if (currentOrder === targetOrder) {
      currentOrder = currentIndex;
      targetOrder = targetIndex;
    }

    const newCurrentOrder = targetOrder;
    const newTargetOrder = currentOrder;

    // Optimistic update
    setExperiences((prev) => {
      const cloned = [...prev];
      cloned[currentIndex] = { ...targetItem, sort_order: newTargetOrder };
      cloned[targetIndex] = { ...exp, sort_order: newCurrentOrder };
      return cloned;
    });

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/member/experience/${exp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newCurrentOrder }),
        }),
        fetch(`/api/member/experience/${targetItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newTargetOrder }),
        }),
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error("Gagal menyimpan urutan.");
      }
      toast.success("Urutan berhasil diperbarui.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui urutan.");
      fetchExperiences();
    }
  };

  const formatPeriod = (start: string, end: string | null, isCurrent: boolean) => {
    const formatYear = (dateStr: string) => {
      if (!dateStr) return "";
      if (dateStr.length === 4) return dateStr;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : `${d.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`;
    };

    const s = formatYear(start);
    if (isCurrent) return `${s} - Sekarang`;
    const e = end ? formatYear(end) : "";
    return e ? `${s} - ${e}` : s;
  };

  return (
    <div className="space-y-4">
      {/* Header & Action Button */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#212121]/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#212121] dark:text-white flex items-center justify-center font-bold text-xs font-mono">
            2
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121] dark:text-[#F4F4F4]">
            Daftar Jam Terbang & Pengalaman
          </h2>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-9 px-3.5 bg-[#212121] dark:bg-white text-white dark:text-[#212121] hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-2xs"
        >
          <Plus size={14} />
          <span>Tambah Pengalaman</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 flex justify-center items-center gap-2 text-neutral-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat riwayat jam terbang...</span>
        </div>
      ) : experiences.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#212121]/20 dark:border-white/20 bg-white/40 dark:bg-[#151B18]/40 py-12 text-center space-y-2.5 font-mono">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
            [ BELUM ADA RIWAYAT PENGALAMAN / JAM TERBANG ]
          </div>
          <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
            Tambahkan pengalaman pertama Anda sebagai bukti jam terbang profesional kepada klien dan komunitas.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#212121] dark:text-white hover:opacity-75 transition-opacity cursor-pointer pt-1"
          >
            <Plus size={14} /> Tambah Pengalaman Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="p-4 rounded-2xl border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:border-[#212121]/30 dark:hover:border-white/30 shadow-2xs"
            >
              {/* Info Column */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[#212121] dark:text-white uppercase font-sans">
                    {exp.role}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <Building size={12} className="text-neutral-400" />
                    {exp.institution}
                  </span>
                  {exp.is_current && (
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded-full bg-[#EFF0A3] text-[#212121] border border-[#212121]/15">
                      Aktif
                    </span>
                  )}
                </div>

                {/* Meta details: Period & Location */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatPeriod(exp.start_date, exp.end_date, exp.is_current)}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {exp.location}
                    </span>
                  )}
                </div>

                {/* Description */}
                {exp.description && (
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                    {exp.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#212121]/10 dark:border-white/10">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-0.5 border border-[#212121]/10 dark:border-white/10 rounded-xl px-1.5 py-1 bg-[#F6F5FA] dark:bg-[#1E2622]">
                  <button
                    type="button"
                    onClick={() => handleMove(exp, "up")}
                    disabled={idx === 0}
                    className="p-0.5 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Pindah ke Atas"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(exp, "down")}
                    disabled={idx === experiences.length - 1}
                    className="p-0.5 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Pindah ke Bawah"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(exp)}
                  className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white border border-[#212121]/10 dark:border-white/10 rounded-xl hover:border-[#212121]/30 dark:hover:border-white/30 cursor-pointer transition-colors"
                  title="Edit Pengalaman"
                >
                  <Edit2 size={12} />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-600 border border-[#212121]/10 dark:border-white/10 rounded-xl hover:border-red-500/30 cursor-pointer transition-colors"
                  title="Hapus Pengalaman"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <ExperienceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        experienceToEdit={editingExperience}
        onSuccess={() => {
          fetchExperiences();
        }}
      />
    </div>
  );
}
