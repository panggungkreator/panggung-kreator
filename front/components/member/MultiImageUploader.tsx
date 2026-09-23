"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { compressImageLossless } from "@/lib/utils/image-compress";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  UploadCloud,
  X,
  Star,
  Loader2,
  Sparkles,
  Plus,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

export interface StagedImageItem {
  id: string;
  previewUrl: string; // URL preview lokal (blob:) atau URL remote jika sudah di storage
  file?: File; // File hasil kompresi (ada jika belum diunggah ke storage)
  isRemote: boolean; // true jika file sudah ada di Supabase sebelumnya
  originalName?: string;
  originalSize?: number;
  compressedSize?: number;
  savedPercent?: number;
}

export interface MultiImageUploaderProps {
  memberId?: string;
  target?: "portfolio" | "avatar" | "thumbnail" | "proof";
  initialUrls?: string[];
  maxImages?: number;
  maxFileSizeMB?: number;
  onStagedChange?: (items: StagedImageItem[]) => void;
  onImagesChange?: (urls: string[]) => void;
  onUploadSuccess?: (primaryUrl: string, allUrls: string[]) => void;
  disabled?: boolean;
  className?: string;
}

const SESSION_STORAGE_KEY_PREFIX = "pk_staged_images_draft_";

/**
 * Komponen Reusable MultiImageUploader dengan fitur Local Staging (Deferred Upload):
 * 1. Gambar dikompresi Lossless langsung di browser saat dipilih.
 * 2. Ditampung sementara di local state & sessionStorage (TIDAK langsung dikirim ke Supabase).
 * 3. Gambar baru benar-benar diunggah ke Supabase Storage hanya ketika member mengklik simpan data.
 */
export default function MultiImageUploader({
  memberId,
  target = "portfolio",
  initialUrls = [],
  maxImages = 6,
  maxFileSizeMB = 10,
  onStagedChange,
  onImagesChange,
  onUploadSuccess,
  disabled = false,
  className,
}: MultiImageUploaderProps) {
  const [items, setItems] = useState<StagedImageItem[]>(() => {
    return (initialUrls || []).filter(Boolean).map((url, i) => ({
      id: `remote-${i}-${url}`,
      previewUrl: url,
      isRemote: true,
    }));
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync saat initialUrls dari database berubah (misal saat edit item)
  useEffect(() => {
    const currentRemoteUrls = items.filter((i) => i.isRemote).map((i) => i.previewUrl);
    const hasChanged =
      initialUrls.length !== currentRemoteUrls.length ||
      initialUrls.some((u, idx) => u !== currentRemoteUrls[idx]);

    if (hasChanged && !items.some((i) => !i.isRemote)) {
      const initialStaged: StagedImageItem[] = initialUrls.filter(Boolean).map((url, i) => ({
        id: `remote-${i}-${url}`,
        previewUrl: url,
        isRemote: true,
      }));
      setItems(initialStaged);
    }
  }, [initialUrls]);

  // Simpan ringkasan draft ke sessionStorage
  const saveDraftToSession = useCallback(
    (stagedList: StagedImageItem[]) => {
      if (typeof window === "undefined") return;
      try {
        const sessionKey = `${SESSION_STORAGE_KEY_PREFIX}${memberId || "general"}`;
        const draftMeta = stagedList.map((item) => ({
          id: item.id,
          previewUrl: item.isRemote ? item.previewUrl : "",
          isRemote: item.isRemote,
          originalName: item.originalName,
          savedPercent: item.savedPercent,
        }));
        sessionStorage.setItem(sessionKey, JSON.stringify(draftMeta));
      } catch (err) {
        console.warn("[MultiImageUploader] Failed to save to sessionStorage:", err);
      }
    },
    [memberId]
  );

  // Notifikasi ke parent
  const notifyParent = useCallback(
    (newItems: StagedImageItem[]) => {
      if (onStagedChange) {
        onStagedChange(newItems);
      }

      const allUrls = newItems.map((i) => i.previewUrl).filter(Boolean);
      if (onImagesChange) {
        onImagesChange(allUrls);
      }
      if (onUploadSuccess && allUrls.length > 0) {
        onUploadSuccess(allUrls[0], allUrls);
      }
    },
    [onStagedChange, onImagesChange, onUploadSuccess]
  );

  // Panggil notifyParent saat inisialisasi agar parent menerima state awal
  useEffect(() => {
    notifyParent(items);
  }, []);

  // Proses file lokal (kompresi lossless & simpan ke staging lokal)
  const handleFiles = async (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList);
    if (!rawFiles.length) return;

    setGlobalError(null);

    const imageFiles = rawFiles.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length !== rawFiles.length) {
      toast.warning("Hanya file gambar (JPG, PNG, WebP) yang dapat diunggah.");
    }

    const availableSlots = maxImages - items.length;
    if (availableSlots <= 0) {
      setGlobalError(`Maksimal ${maxImages} gambar.`);
      toast.error(`Maksimal ${maxImages} gambar tercapai.`);
      return;
    }

    const filesToProcess = imageFiles.slice(0, availableSlots);
    if (imageFiles.length > availableSlots) {
      toast.info(`Hanya ${availableSlots} gambar pertama yang diproses.`);
    }

    const maxBytes = maxFileSizeMB * 1024 * 1024;
    setIsProcessing(true);

    try {
      const newStagedItems: StagedImageItem[] = [];

      for (const file of filesToProcess) {
        if (file.size > maxBytes) {
          toast.error(`File "${file.name}" melebihi batas ukuran ${maxFileSizeMB}MB!`);
          continue;
        }

        // 1. Kompresi lossless di browser secara lokal
        const compressResult = await compressImageLossless(file, {
          maxWidth: 2560,
          maxHeight: 2560,
          quality: 0.92,
        });

        // 2. Buat URL preview lokal tanpa mengirim ke Supabase
        const previewUrl = URL.createObjectURL(compressResult.file);
        const tempId = `staged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        newStagedItems.push({
          id: tempId,
          previewUrl,
          file: compressResult.file,
          isRemote: false,
          originalName: file.name,
          originalSize: file.size,
          compressedSize: compressResult.compressedSize,
          savedPercent: compressResult.savedPercent,
        });
      }

      if (newStagedItems.length > 0) {
        setItems((prev) => {
          const updated = [...prev, ...newStagedItems];
          notifyParent(updated);
          saveDraftToSession(updated);
          return updated;
        });

        toast.success(
          newStagedItems.length === 1
            ? "1 foto berhasil dikompresi & ditampung."
            : `${newStagedItems.length} foto berhasil dikompresi & ditampung.`
        );
      }
    } catch (err: any) {
      console.error("Local compression error:", err);
      toast.error("Gagal memproses gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Hapus satu gambar dari staging lokal
  const handleRemove = (idToRemove: string) => {
    setItems((prev) => {
      const targetItem = prev.find((item) => item.id === idToRemove);
      if (targetItem && !targetItem.isRemote && targetItem.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(targetItem.previewUrl);
      }

      const next = prev.filter((item) => item.id !== idToRemove);
      notifyParent(next);
      saveDraftToSession(next);
      return next;
    });
  };

  // Jadikan gambar sebagai Cover / Utama (pindah ke indeks 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      const next = [target, ...rest];
      notifyParent(next);
      saveDraftToSession(next);
      toast.success("Foto utama / cover berhasil diatur.");
      return next;
    });
  };

  const canAddMore = items.length < maxImages && !disabled && !isProcessing;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── INFO BANNER: LOSSLESS COMPRESSION & LOCAL STAGING ───────── */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-bg-well/40 border border-border-default/70 text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Kompresi Lossless Aktif: Kualitas resolusi tinggi tetap tajam & jernih</span>
        </div>
        <span className="font-mono text-[10px] text-text-tertiary">
          {items.length}/{maxImages} Foto
        </span>
      </div>

      {/* ── IMAGE PREVIEW GRID ─────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {items.map((item, idx) => {
            const isPrimary = idx === 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative aspect-video rounded-xl overflow-hidden border transition-all bg-neutral-950 flex items-center justify-center shadow-xs",
                  isPrimary
                    ? "border-text-primary ring-2 ring-text-primary/20"
                    : "border-border-default hover:border-text-primary/40"
                )}
              >
                {/* Image Preview */}
                <img
                  src={item.previewUrl}
                  alt={item.originalName || `Foto ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Primary / Cover Badge */}
                {isPrimary && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider shadow-xs z-10">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>UTAMA</span>
                  </div>
                )}

                {/* Staging indicator badge */}
                {!item.isRemote && (
                  <div className="absolute top-2 right-2 bg-amber-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10">
                    Draft Lokal
                  </div>
                )}

                {/* Lossless Savings Badge */}
                {typeof item.savedPercent === "number" && item.savedPercent > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-medium flex items-center gap-0.5 z-10">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>-{item.savedPercent}%</span>
                  </div>
                )}

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none group-hover:pointer-events-auto z-20">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="px-2 py-1 bg-white/95 dark:bg-neutral-800/95 text-text-primary hover:bg-white rounded-lg text-[10px] font-medium shadow-xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-1"
                      title="Jadikan sebagai foto utama / cover"
                    >
                      <Star className="w-3 h-3 text-amber-500" />
                      <span>Cover</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-xs transition-transform hover:scale-105 cursor-pointer"
                    title="Hapus foto ini"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Compact '+ Tambah Foto' card inside grid if under quota */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="aspect-video rounded-xl border border-dashed border-border-default hover:border-text-primary/60 bg-bg-well/30 hover:bg-bg-well/70 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-text-secondary hover:text-text-primary disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-text-primary" />
                  <span className="text-[10px] font-mono text-text-tertiary">Mengompres...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-text-tertiary" />
                  <span className="text-[11px] font-medium">Tambah Foto</span>
                  <span className="text-[9px] text-text-tertiary font-mono">
                    {items.length}/{maxImages}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── MAIN DROPZONE (Bila belum ada foto) ────────────────────── */}
      {items.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={cn(
            "p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3",
            isDragging
              ? "border-text-primary bg-text-primary/5 scale-[0.99]"
              : "border-border-default hover:border-text-primary/60 bg-bg-well/30 hover:bg-bg-well/60",
            (disabled || isProcessing) && "opacity-50 pointer-events-none"
          )}
        >
          <div className="w-12 h-12 rounded-2xl bg-bg-card border border-border-default flex items-center justify-center text-text-secondary shadow-xs">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 text-text-primary animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6 text-text-primary" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-text-primary">
              {isProcessing ? "Sedang Mengompres Gambar..." : "Klik atau tarik gambar ke sini"}
            </p>
            <p className="text-[11px] text-text-secondary">
              Dapat memilih langsung banyak foto (Maks. {maxImages} foto, hingga {maxFileSizeMB}MB/foto)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] text-text-tertiary">
            <span className="px-2 py-0.5 rounded-full bg-bg-well border border-border-default/60">
              Format: JPG, PNG, WebP
            </span>
            <span className="px-2 py-0.5 rounded-full bg-bg-well border border-border-default/60">
              Auto-Lossless WebP
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Staging Lokal (Upload saat Simpan)
            </span>
          </div>
        </div>
      )}

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        disabled={disabled || isProcessing || items.length >= maxImages}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
        className="hidden"
      />

      {/* Error Message */}
      {globalError && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Fungsi helper untuk mengeksekusi upload file-file yang sudah ditampung (staged)
 * ke Supabase Storage hanya ketika member mengklik Simpan/Submit.
 */
export async function uploadStagedImagesToStorage(
  stagedItems: StagedImageItem[],
  options?: {
    memberId?: string;
    target?: string;
  }
): Promise<string[]> {
  if (!stagedItems || stagedItems.length === 0) return [];

  const supabase = createClient();
  let targetMemberId = options?.memberId;
  if (!targetMemberId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    targetMemberId = user?.id || "general";
  }

  const target = options?.target || "portfolio";
  const preferredBucket = target === "portfolio" ? "portfolio-images" : "member-assets";

  const uploadedUrls: string[] = [];

  for (const item of stagedItems) {
    // 1. Jika sudah berupa remote URL (misal dari data lama), gunakan langsung
    if (item.isRemote || !item.file) {
      if (item.previewUrl) {
        uploadedUrls.push(item.previewUrl);
      }
      continue;
    }

    // 2. Jika file baru yang ditampung, upload sekarang ke Supabase Storage
    const file = item.file;
    const fileExt = file.name.split(".").pop() || "webp";
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${target}_${Date.now()}_${randomSuffix}.${fileExt}`;
    const path = `${targetMemberId}/${fileName}`;

    let uploadSuccess = false;
    let finalBucket = preferredBucket;

    // Coba upload ke bucket utama
    const { error: primaryError } = await supabase.storage
      .from(preferredBucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!primaryError) {
      uploadSuccess = true;
    } else {
      console.warn(`[Storage Upload] Bucket "${preferredBucket}" error:`, primaryError.message);

      // Fallback ke bucket alternatif jika preferredBucket belum ada / gagal
      const fallbackBucket = preferredBucket === "portfolio-images" ? "member-assets" : "portfolio-images";
      const { error: fallbackError } = await supabase.storage
        .from(fallbackBucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!fallbackError) {
        uploadSuccess = true;
        finalBucket = fallbackBucket;
      } else {
        throw new Error(
          `Gagal mengunggah foto "${file.name}": ${primaryError.message || fallbackError.message}`
        );
      }
    }

    if (uploadSuccess) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(finalBucket).getPublicUrl(path);

      uploadedUrls.push(`${publicUrl}?t=${Date.now()}`);
    }
  }

  return uploadedUrls;
}
