"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  COLOR_RANGERS,
  ColorRangerSlug,
  colorRangerStyle,
} from "@/lib/constants";
import {
  searchMembersForAdminPromotionAction,
  promoteMemberToAdminAction,
  getTakenColorsAction,
} from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import {
  Search,
  User,
  Check,
  Shield,
  Loader2,
  X,
  Mail,
  Phone,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface MemberCandidate {
  id: string;
  full_name: string;
  stage_name?: string | null;
  email: string;
  whatsapp_number?: string | null;
  username?: string | null;
  role: string;
  avatar_url?: string | null;
}

interface TakenColorInfo {
  color: string;
  fullName: string;
}

interface AddAdminFromMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAdminFromMemberDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddAdminFromMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberCandidate | null>(null);
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorRangerSlug | "">("");
  const [takenColors, setTakenColors] = useState<TakenColorInfo[]>([]);
  const [isPending, startTransition] = useTransition();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedMember(null);
      setLabel("");
      setSelectedColor("");
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsSearching(true);
    try {
      const [membersRes, colorsRes] = await Promise.all([
        searchMembersForAdminPromotionAction(""),
        getTakenColorsAction(),
      ]);

      if (membersRes.success && membersRes.data) {
        setCandidates(membersRes.data as MemberCandidate[]);
      }
      if (colorsRes.success && colorsRes.data) {
        setTakenColors(colorsRes.data);
      }
    } catch (err) {
      console.error("Error loading initial candidates:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search query
  useEffect(() => {
    if (!isOpen || selectedMember) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchMembersForAdminPromotionAction(searchQuery);
        if (res.success && res.data) {
          setCandidates(res.data as MemberCandidate[]);
        }
      } catch (err) {
        console.error("Error searching members:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, selectedMember]);

  const isColorTaken = (slug: string) => {
    return takenColors.some((tc) => tc.color === slug);
  };

  const getTakenByName = (slug: string) => {
    const found = takenColors.find((tc) => tc.color === slug);
    return found ? found.fullName : "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      toast.error("Silakan pilih member terlebih dahulu.");
      return;
    }

    if (!label.trim()) {
      toast.error("Label jabatan admin wajib diisi.");
      return;
    }

    if (!selectedColor) {
      toast.error("Silakan pilih warna Color Ranger.");
      return;
    }

    if (isColorTaken(selectedColor)) {
      toast.error(`Warna ${COLOR_RANGERS[selectedColor]?.label} sudah digunakan.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await promoteMemberToAdminAction({
          memberId: selectedMember.id,
          color: selectedColor,
          label: label.trim(),
        });

        if (!res.success) {
          throw new Error(res.error || "Gagal menambahkan admin.");
        }

        toast.success(`Member "${selectedMember.full_name}" berhasil dijadikan Admin!`);
        onOpenChange(false);
        onSuccess();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Terjadi kesalahan saat memproses permintaan.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white dark:bg-zinc-950 border border-border-default/80 p-6 sm:p-7 rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh]">
        <DialogHeader className="pb-3 border-b border-border-default/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0">
              <Shield size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-text-primary">
                Tambah Admin dari Member
              </DialogTitle>
              <p className="text-xs text-text-secondary mt-0.5">
                Pilih member yang sudah terdaftar untuk dipromosikan menjadi Administrator.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* ═══ STEP 1: PILIH MEMBER ═══ */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              1. Pilih Member <span className="text-red-500">*</span>
            </label>

            {selectedMember ? (
              // Selected Member Card
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-300 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-border-default flex items-center justify-center overflow-hidden shrink-0">
                    {selectedMember.avatar_url ? (
                      <img
                        src={selectedMember.avatar_url}
                        alt={selectedMember.full_name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User size={18} className="text-text-secondary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {selectedMember.full_name}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 truncate">
                        <Mail size={11} /> {selectedMember.email}
                      </span>
                      {selectedMember.whatsapp_number && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone size={11} /> {selectedMember.whatsapp_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="px-2.5 py-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-white dark:bg-zinc-800 border border-border-default rounded-lg hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
                >
                  Ganti
                </button>
              </div>
            ) : (
              // Search & Candidate List
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, email, username, no WA member..."
                    className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-bg-well/70 border border-border-default focus:border-text-primary focus:outline-none transition-all placeholder:text-text-muted"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Candidate Dropdown List */}
                <div className="border border-border-default/70 rounded-2xl max-h-44 overflow-y-auto bg-bg-card divide-y divide-border-default/40 shadow-2xs">
                  {isSearching ? (
                    <div className="p-6 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mencari member...</span>
                    </div>
                  ) : candidates.length === 0 ? (
                    <div className="p-6 text-center text-xs text-text-muted">
                      {searchQuery
                        ? "Tidak ada member non-admin yang cocok."
                        : "Tidak ada member yang tersedia untuk dipromosikan."}
                    </div>
                  ) : (
                    candidates.map((cand) => (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => setSelectedMember(cand)}
                        className="w-full text-left p-2.5 px-3.5 hover:bg-bg-well/50 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-bg-well border border-border-default flex items-center justify-center overflow-hidden shrink-0 text-text-secondary">
                            {cand.avatar_url ? (
                              <img
                                src={cand.avatar_url}
                                alt={cand.full_name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <User size={13} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary group-hover:underline truncate">
                              {cand.full_name}
                            </p>
                            <p className="text-[10px] text-text-muted truncate">
                              {cand.email} {cand.username ? `(@${cand.username})` : ""}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white px-2 py-0.5 rounded-full bg-bg-well border border-border-default/60 shrink-0">
                          Pilih
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ═══ STEP 2: LABEL JABATAN ═══ */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-label-input"
              className="text-xs font-bold text-text-primary uppercase tracking-wider block"
            >
              2. Label Jabatan / Peran <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Community Lead, Event Coordinator, Operasional"
              className="w-full h-9 px-3 text-xs rounded-xl bg-bg-well/70 border border-border-default focus:border-text-primary focus:outline-none transition-all placeholder:text-text-muted"
            />
            <p className="text-[10px] text-text-muted">
              Label ini akan ditampilkan sebagai jabatan resmi admin di seluruh dashboard.
            </p>
          </div>

          {/* ═══ STEP 3: COLOR RANGER SELECTOR ═══ */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              3. Pilih Color Ranger <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(COLOR_RANGERS) as ColorRangerSlug[]).map((slug) => {
                const ranger = COLOR_RANGERS[slug];
                const isTaken = isColorTaken(slug);
                const isSelected = selectedColor === slug;
                const takenBy = getTakenByName(slug);

                return (
                  <button
                    key={slug}
                    type="button"
                    disabled={isTaken}
                    onClick={() => setSelectedColor(slug)}
                    className={`relative p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isTaken
                        ? "opacity-40 bg-zinc-100 dark:bg-zinc-900 border-dashed border-zinc-300 dark:border-zinc-800 cursor-not-allowed"
                        : isSelected
                        ? "border-zinc-900 dark:border-white bg-zinc-900/5 dark:bg-white/5 ring-1 ring-zinc-900 dark:ring-white shadow-xs"
                        : "border-border-default/80 hover:border-zinc-400 bg-bg-card hover:bg-bg-well/40"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: ranger.hex }}
                    >
                      {isSelected && <Check size={10} className="stroke-[3]" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {ranger.label}
                      </p>
                      {isTaken ? (
                        <p className="text-[9px] text-red-500 truncate" title={`Dipakai: ${takenBy}`}>
                          Dipakai ({takenBy || "Admin"})
                        </p>
                      ) : (
                        <p className="text-[9px] text-text-muted font-mono uppercase">
                          Tersedia
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ PREVIEW BADGE ═══ */}
          {selectedColor && (
            <div className="p-3 bg-bg-well/60 border border-border-default/60 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-text-secondary font-medium">
                Pratinjau Badge:
              </span>
              <span
                className="inline-block text-[10px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider"
                style={colorRangerStyle(selectedColor)}
              >
                {COLOR_RANGERS[selectedColor]?.label}
              </span>
            </div>
          )}

          {/* ═══ ACTION BUTTONS ═══ */}
          <div className="pt-3 border-t border-border-default/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 px-4 rounded-xl border border-border-default text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedMember || !label.trim() || !selectedColor}
              className="h-9 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Jadikan Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
