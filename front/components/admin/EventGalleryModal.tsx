"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  ImageIcon,
  ExternalLink,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";
import { compressImage } from "@/lib/file-compress";
import { createClient } from "@/lib/supabase/client";
import { saveGalleryAlbumAction } from "@/lib/actions/gallery-actions";
import { toast } from "sonner";

export interface GalleryData {
  id?: string;
  event_id?: string | null;
  hero_image_url?: string | null;
  album_link?: string | null;
  description?: string | null;
  is_published?: boolean;
}

export interface EventInfo {
  id: string;
  title: string;
  event_type?: string;
  event_date?: string;
}

interface EventGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventInfo;
  initialGallery?: GalleryData | null;
  canEdit?: boolean;
  onSaved?: (updated: GalleryData) => void;
}

export function EventGalleryModal({
  isOpen,
  onClose,
  event,
  initialGallery,
  canEdit = true,
  onSaved,
}: EventGalleryModalProps) {
  // Check if gallery has existing data (thumbnail or drive link)
  const hasExistingData = Boolean(
    initialGallery?.hero_image_url || initialGallery?.album_link
  );

  const [mode, setMode] = useState<"view" | "edit">(
    hasExistingData ? "view" : "edit"
  );

  // Form States
  const [gallery, setGallery] = useState<GalleryData | null>(initialGallery || null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialGallery?.hero_image_url || ""
  );
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState<string>(
    initialGallery?.album_link || ""
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    initialGallery?.is_published ?? false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync state on open or initialGallery change
  useEffect(() => {
    if (!isOpen) return;

    if (initialGallery !== undefined) {
      setGallery(initialGallery || null);
      setPreviewUrl(initialGallery?.hero_image_url || "");
      setHeroImageFile(null);
      setDriveLink(initialGallery?.album_link || "");
      setIsPublished(initialGallery?.is_published ?? false);
      setFormError("");

      const hasData = Boolean(
        initialGallery?.hero_image_url || initialGallery?.album_link
      );
      setMode(hasData ? "view" : "edit");
    } else if (event?.id) {
      setIsLoading(true);
      const supabase = createClient();
      supabase
        .from("gallery_albums")
        .select("id, hero_image_url, album_link, is_published, description, event_id")
        .eq("event_id", event.id)
        .maybeSingle()
        .then((res: { data: GalleryData | null; error: unknown }) => {
          setIsLoading(false);
          const data = res.data;
          const error = res.error;
          if (data && !error) {
            setGallery(data);
            setPreviewUrl(data.hero_image_url || "");
            setDriveLink(data.album_link || "");
            setIsPublished(data.is_published ?? false);
            const hasData = Boolean(data.hero_image_url || data.album_link);
            setMode(hasData ? "view" : "edit");
          } else {
            setGallery(null);
            setPreviewUrl("");
            setDriveLink("");
            setIsPublished(false);
            setMode("edit");
          }
        });
    }
  }, [isOpen, initialGallery, event?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diizinkan!");
        return;
      }
      setHeroImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setHeroImageFile(null);
    setPreviewUrl("");
  };

  const getStoragePathFromUrl = (
    url: string,
    bucketName: string
  ): string | null => {
    try {
      const parts = url.split(`/public/${bucketName}/`);
      if (parts.length > 1) {
        return decodeURIComponent(parts[1]);
      }
    } catch (e) {
      console.error("Failed to parse storage path from url:", e);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      let finalHeroImageUrl = previewUrl;

      // 1. Upload new image if selected
      if (heroImageFile) {
        try {
          let compressedFile = await compressImage(heroImageFile);
          if (compressedFile.size > 2 * 1024 * 1024) {
            compressedFile = await compressImage(compressedFile, 1200, 1200, 0.6);
          }

          const fileExt = compressedFile.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("gallery")
            .upload(filePath, compressedFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: compressedFile.type || "image/jpeg",
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("gallery").getPublicUrl(filePath);

          finalHeroImageUrl = publicUrl;
        } catch (uploadErr: any) {
          console.error("Gallery upload error:", uploadErr);
          throw new Error(
            "Gagal mengunggah foto sampul: " + (uploadErr.message || uploadErr)
          );
        }
      } else if (!previewUrl) {
        finalHeroImageUrl = "";
      }

      // 2. Save album
      const cleanCategory =
        (event.event_type || "lainnya")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "") || "lainnya";

      const res = await saveGalleryAlbumAction(
        {
          event_id: event.id,
          title: event.title.trim(),
          category: cleanCategory,
          event_date: event.event_date || new Date().toISOString().split("T")[0],
          hero_image_url: finalHeroImageUrl.trim() || null,
          album_link: driveLink.trim() || null,
          is_published: isPublished,
        },
        gallery?.id
      );

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan galeri.");
      }

      // 3. Clean up old image if replaced
      const oldUrl = gallery?.hero_image_url || "";
      if (oldUrl && oldUrl !== finalHeroImageUrl) {
        const oldPath = getStoragePathFromUrl(oldUrl, "gallery");
        if (oldPath) {
          await supabase.storage.from("gallery").remove([oldPath]);
        }
      }

      const updatedData: GalleryData = {
        id: gallery?.id,
        event_id: event.id,
        hero_image_url: finalHeroImageUrl.trim() || null,
        album_link: driveLink.trim() || null,
        is_published: isPublished,
      };

      setGallery(updatedData);
      toast.success("Dokumentasi galeri berhasil disimpan!");
      if (onSaved) onSaved(updatedData);
      setMode("view");
    } catch (err: any) {
      console.error("Submit gallery error:", err);
      const msg = err.message || "Terjadi kesalahan saat menyimpan galeri.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      icon={<ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
      title={
        mode === "view"
          ? "Dokumentasi & Galeri"
          : hasExistingData
          ? "Edit Dokumentasi & Galeri"
          : "Tambah Dokumentasi & Galeri"
      }
      subtitle={`Acara: ${event.title}`}
      headerRight={
        mode === "view" && canEdit ? (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-well hover:bg-bg-well/80 border border-border-default text-text-primary transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        ) : null
      }
    >
      {mode === "view" ? (
        /* ═══ VIEW (READONLY) MODE ═══ */
        <div className="space-y-4 py-1">
          {/* Foto Sampul */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Foto Sampul / Banner
            </p>
            {gallery?.hero_image_url ? (
              <div className="rounded-2xl overflow-hidden border border-border-default aspect-video w-full relative bg-bg-well shadow-2xs">
                <img
                  src={gallery.hero_image_url}
                  alt="Thumbnail Galeri"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-default p-6 flex flex-col items-center justify-center text-center aspect-video w-full bg-bg-well/40 text-text-muted">
                <ImageIcon className="w-8 h-8 mb-1.5 opacity-40" />
                <p className="text-xs font-medium">Belum ada foto sampul kegiatan</p>
              </div>
            )}
          </div>

          {/* Tautan Google Drive */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Tautan Google Drive
            </p>
            {gallery?.album_link ? (
              <a
                href={gallery.album_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-3 w-full p-3 rounded-2xl bg-bg-well hover:bg-bg-well/80 border border-border-default text-xs font-semibold text-text-primary transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">{gallery.album_link}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 shrink-0">
                  Buka Folder ↗
                </span>
              </a>
            ) : (
              <p className="text-xs text-text-muted font-medium italic p-2 rounded-xl bg-bg-well/30 border border-border-default/40">
                Belum ada tautan Google Drive yang disimpan.
              </p>
            )}
          </div>

          {/* Status Publikasi */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Status Publikasi Galeri
            </p>
            <div>
              {gallery?.is_published ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Terpublikasi di Galeri Komunitas</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Draft (Belum Dipublikasikan)</span>
                </span>
              )}
            </div>
          </div>

          {/* Footer View Mode */}
          <div className="pt-3 border-t border-border-default/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-text-primary text-bg-card hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Galeri</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ═══ EDIT / ADD MODE ═══ */
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {formError && (
            <div className="p-3 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl">
              {formError}
            </div>
          )}

          {/* Upload Foto Sampul */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-text-secondary">
              Foto Sampul / Banner Galeri
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-border-default aspect-video w-full bg-bg-well">
                <img
                  src={previewUrl}
                  alt="Preview Sampul"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                  title="Hapus Foto"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border-default bg-bg-well/40 hover:bg-bg-well/70 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all w-full">
                <ImageIcon className="w-8 h-8 text-text-muted" />
                <p className="text-xs font-bold text-text-primary">
                  Pilih Foto Sampul Dokumentasi
                </p>
                <p className="text-[10px] text-text-muted">Maksimal 5MB (JPG, PNG, WEBP)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Link Google Drive */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
              Tautan Google Drive (Folder Dokumentasi Lengkap)
            </label>
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
            />
          </div>

          {/* Checklist Publikasi Galeri */}
          <div className="pt-2 border-t border-border-default/40">
            <label className="flex items-center gap-2.5 text-xs text-text-primary font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border-default bg-bg-well text-blue-600 focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
              />
              <span>Publikasikan album ini langsung ke halaman Galeri Komunitas</span>
            </label>
          </div>

          {/* Footer Edit Mode */}
          <div className="pt-3 border-t border-border-default/60 flex items-center justify-end gap-2.5">
            {hasExistingData && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setMode("view")}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-text-primary text-bg-card hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Galeri</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
