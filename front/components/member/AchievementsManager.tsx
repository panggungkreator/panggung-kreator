"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PortfolioItem } from "@/lib/types/member";
import PortfolioDrawer from "./PortfolioDrawer";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit2,
  Award,
  ExternalLink,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface AchievementsManagerProps {
  memberId: string;
}

export default function AchievementsManager({ memberId }: AchievementsManagerProps) {
  void memberId;
  const [achievements, setAchievements] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      const response = await fetch("/api/member/portfolio");
      if (response.ok) {
        const json = await response.json();
        const allItems: PortfolioItem[] = json.data || [];
        setAchievements(allItems.filter((item) => item.item_type === "achievement"));
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus prestasi/sertifikat ini?")) return;

    try {
      const res = await fetch(`/api/member/portfolio/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus.");
      }

      toast.success("Prestasi berhasil dihapus.");
      setAchievements((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const handleMove = async (item: PortfolioItem, direction: "up" | "down") => {
    const currentIndex = achievements.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;

    const targetItem = achievements[targetIndex];
    let currentOrder = item.sort_order ?? currentIndex;
    let targetOrder = targetItem.sort_order ?? targetIndex;

    if (currentOrder === targetOrder) {
      currentOrder = currentIndex;
      targetOrder = targetIndex;
    }

    const newCurrentOrder = targetOrder;
    const newTargetOrder = currentOrder;

    // Optimistic update
    setAchievements((prev) =>
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
        throw new Error("Gagal menyimpan urutan.");
      }
      toast.success("Urutan berhasil diperbarui.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui urutan.");
      fetchAchievements();
    }
  };

  const sortedList = [...achievements].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-4">
      {/* Header & Action Button */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#212121]/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#212121] dark:text-white flex items-center justify-center font-bold text-xs font-mono">
            4
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121] dark:text-[#F4F4F4]">
            Daftar Prestasi & Sertifikasi
          </h2>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-9 px-3.5 bg-[#212121] dark:bg-white text-white dark:text-[#212121] hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-2xs"
        >
          <Plus size={14} />
          <span>Tambah Prestasi</span>
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="py-12 flex justify-center items-center gap-2 text-neutral-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat daftar prestasi...</span>
        </div>
      ) : sortedList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#212121]/20 dark:border-white/20 bg-white/40 dark:bg-[#151B18]/40 py-12 text-center space-y-2.5 font-mono">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
            [ BELUM ADA PRESTASI / SERTIFIKAT ]
          </div>
          <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
            Cantumkan sertifikat kelas panggung atau piagam kejuaraan untuk memperkuat kredibilitas profilmu.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#212121] dark:text-white hover:opacity-75 transition-opacity cursor-pointer pt-1"
          >
            <Plus size={14} /> Tambah Prestasi / Sertifikat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedList.map((ach, idx) => (
            <div
              key={ach.id}
              className="p-3.5 rounded-2xl border border-[#212121]/10 dark:border-white/10 bg-white dark:bg-[#151B18] shadow-2xs flex items-start justify-between gap-3 hover:border-[#212121]/30 dark:hover:border-white/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-[#EFF0A3]/30 dark:bg-[#EFF0A3]/10 border border-[#EFF0A3]/60 dark:border-[#EFF0A3]/30 flex items-center justify-center text-[#212121] dark:text-[#EFF0A3]">
                  <Award size={18} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-tight text-[#212121] dark:text-white line-clamp-1">
                    {ach.title}
                  </h4>
                  {ach.description && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {ach.description}
                    </p>
                  )}
                  {ach.media_url && (
                    <a
                      href={ach.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 hover:text-black dark:hover:text-white pt-0.5 underline underline-offset-2"
                    >
                      <span>Lihat Kredensial / Lampiran</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-0.5 border border-[#212121]/10 dark:border-white/10 rounded-xl px-1.5 py-1 bg-[#F6F5FA] dark:bg-[#1E2622]">
                  <button
                    type="button"
                    onClick={() => handleMove(ach, "up")}
                    disabled={idx === 0}
                    className="p-0.5 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Pindah ke Atas"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(ach, "down")}
                    disabled={idx === sortedList.length - 1}
                    className="p-0.5 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Pindah ke Bawah"
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(ach)}
                  className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white border border-[#212121]/10 dark:border-white/10 rounded-xl hover:border-[#212121]/30 dark:hover:border-white/30 cursor-pointer transition-colors"
                  title="Edit Prestasi"
                >
                  <Edit2 size={12} />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(ach.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-600 border border-[#212121]/10 dark:border-white/10 rounded-xl hover:border-red-500/30 cursor-pointer transition-colors"
                  title="Hapus Prestasi"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <PortfolioDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        memberId={memberId}
        itemToEdit={editingItem}
        onSuccess={() => {
          fetchAchievements();
        }}
      />
    </div>
  );
}
