"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  X,
  Upload,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveGalleryAlbumAction } from "@/lib/actions/gallery-actions";
import { toast } from "sonner";

export interface EventItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
}

export interface ExistingGalleryItem {
  id: string;
  event_id?: string | null;
  title: string;
}

interface Album {
  id: string;
  event_id?: string | null;
  title: string;
  slug: string;
  category: string;
  event_date: string;
  hero_image_url: string | null;
  album_link: string | null;
  description: string | null;
  is_published: boolean;
  display_order: number;
}

interface AddGalleryClientProps {
  initialAlbum: Album | null;
  events?: EventItem[];
  existingGalleries?: ExistingGalleryItem[];
}

const CATEGORIES = [
  { value: "open-mic", label: "Open Mic" },
  { value: "public-speaking", label: "Public Speaking" },
  { value: "mc-practice", label: "MC Practice" },
  { value: "networking", label: "Networking" },
  { value: "content-class", label: "Content Class" },
  { value: "lainnya", label: "Lainnya" },
];

const getStoragePathFromUrl = (url: string, bucketName: string): string | null => {
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

export default function AddGalleryClient({
  initialAlbum,
  events = [],
  existingGalleries = [],
}: AddGalleryClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Determine initial selected event ID
  const initialEventId = (() => {
    if (initialAlbum?.event_id) return initialAlbum.event_id;
    if (initialAlbum?.title) {
      const match = events.find(
        (e) =>
          e.title.toLowerCase().trim() === initialAlbum.title.toLowerCase().trim()
      );
      if (match) return match.id;
    }
    return "";
  })();

  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [title, setTitle] = useState(initialAlbum?.title || "");
  const [category, setCategory] = useState(initialAlbum?.category || "open-mic");
  const [eventDate, setEventDate] = useState(() => {
    if (initialAlbum?.event_date) return initialAlbum.event_date;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [initialHeroImageUrl] = useState(initialAlbum?.hero_image_url || "");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialAlbum?.hero_image_url || "");
  const [albumLink, setAlbumLink] = useState(initialAlbum?.album_link || "");
  const [description, setDescription] = useState(initialAlbum?.description || "");
  const [isPublished, setIsPublished] = useState(
    initialAlbum ? initialAlbum.is_published : true
  );

  // Set of used event IDs and titles already assigned to other galleries
  const usedEventIds = new Set<string>();
  const usedEventTitles = new Set<string>();

  existingGalleries.forEach((g) => {
    // Jangan anggap event milik album yang sedang diedit ini sebagai "terpakai oleh galeri lain"
    if (initialAlbum && g.id === initialAlbum.id) return;
    if (g.event_id) {
      usedEventIds.add(g.event_id);
    }
    if (g.title) {
      usedEventTitles.add(g.title.trim().toLowerCase());
    }
  });

  // Filter acara yang masih tersedia:
  // 1. Acara yang sedang dipilih pada album saat ini (jika sedang edit/pilih), ATAU
  // 2. Acara yang ID maupun Judulnya belum dipakai di galeri manapun
  const availableEvents = events.filter((ev) => {
    if (selectedEventId && ev.id === selectedEventId) {
      return true;
    }
    const isIdUsed = usedEventIds.has(ev.id);
    const isTitleUsed = usedEventTitles.has(ev.title.trim().toLowerCase());
    return !isIdUsed && !isTitleUsed;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setTitle(ev.title);
      if (ev.event_date) setEventDate(ev.event_date);
      if (ev.event_type) {
        const cleanType = ev.event_type.replace(/_/g, "-");
        setCategory(cleanType);
      }
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Silakan pilih acara (event) untuk dokumentasi ini.");
      return;
    }

    if (!eventDate) {
      setFormError("Tanggal kegiatan wajib diisi.");
      return;
    }

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
          console.error("Upload error:", uploadErr);
          throw new Error("Gagal mengunggah foto: " + (uploadErr.message || uploadErr));
        }
      } else if (!previewUrl) {
        finalHeroImageUrl = "";
      }

      // 2. Save album with dual-sync
      const res = await saveGalleryAlbumAction(
        {
          event_id: selectedEventId || null,
          title: title.trim(),
          category,
          event_date: eventDate,
          hero_image_url: finalHeroImageUrl.trim() || null,
          album_link: albumLink.trim() || null,
          description: description.trim() || null,
          is_published: isPublished,
        },
        initialAlbum?.id
      );

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan album galeri.");
      }

      // 3. Clean up old image if replaced or removed
      if (initialHeroImageUrl && initialHeroImageUrl !== finalHeroImageUrl) {
        const oldPath = getStoragePathFromUrl(initialHeroImageUrl, "gallery");
        if (oldPath) {
          await supabase.storage.from("gallery").remove([oldPath]);
        }
      }

      toast.success(
        initialAlbum
          ? "Album galeri berhasil diperbarui!"
          : "Album galeri baru berhasil ditambahkan!"
      );
      router.push("/admin/galeri");
      router.refresh();
    } catch (err: any) {
      console.error("Submit error:", err);
      const msg = err.message || "Terjadi kesalahan.";
      setFormError(msg);
      toast.error("Gagal menyimpan data: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER ═══ */}
      <div className="flex items-center justify-between border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/galeri"
            className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Galeri"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
              [ KOMUNITAS ]
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {initialAlbum ? "Edit Album Dokumentasi" : "Tambah Album Dokumentasi"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Kelola arsip foto kegiatan, Google Drive folder, dan kategori komunitas.
            </p>
          </div>
        </div>

        <div>
          {initialAlbum ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
              Mode: Edit
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              Mode: Baru
            </span>
          )}
        </div>
      </div>

      {/* ═══ FORM CONTAINER ═══ */}
      <div className="bg-transparent sm:bg-card border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-1 sm:p-8 shadow-none sm:shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Image Upload */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
              Foto Sampul / Banner Kegiatan
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-border-default aspect-video max-w-md">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border-default bg-bg-well/40 hover:bg-bg-well/70 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all max-w-md">
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

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-default/40">
            {/* Pilih Acara / Event Terkait */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-text-secondary">
                  Kaitkan dengan Acara (Event) <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-text-muted font-mono">
                  {availableEvents.length} acara tersedia
                </span>
              </div>

              <Select value={selectedEventId} onValueChange={handleEventSelect}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium focus:outline-none focus:border-text-primary">
                  <SelectValue placeholder="-- Pilih Acara / Event yang Belum Dikaitkan --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl max-h-60">
                  {availableEvents.length === 0 ? (
                    <div className="p-3 text-xs text-text-muted text-center">
                      Semua acara sudah memiliki galeri dokumentasi.
                    </div>
                  ) : (
                    availableEvents.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id} className="text-xs py-2">
                        {ev.title} ({ev.event_date})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Label Nama Galeri di bawahnya */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-text-muted">Nama Galeri:</span>
                <span className="text-xs font-semibold text-text-primary px-2.5 py-1 rounded-lg bg-bg-well border border-border-default/70 inline-flex items-center gap-1.5">
                  {title || initialAlbum?.title || "(Pilih acara di atas)"}
                </span>
                {initialAlbum?.title && initialAlbum.title !== title && (
                  <span className="text-[10px] text-text-muted italic">
                    (Nama galeri lama: "{initialAlbum.title}")
                  </span>
                )}
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Kategori Kegiatan <span className="text-red-500">*</span>
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Acara */}
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Tanggal Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full h-10 px-3.5 text-xs font-medium font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
              />
            </div>

            {/* Link Google Drive */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Tautan Google Drive (Folder Dokumentasi Lengkap)
              </label>
              <input
                type="url"
                value={albumLink}
                onChange={(e) => setAlbumLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
              />
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Deskripsi Singkat Acara
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ringkasan jalannya acara, keseruan peserta, atau poin penting..."
                rows={3}
                className="w-full p-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary leading-relaxed transition-all"
              />
            </div>
          </div>

          {/* Status Publikasi */}
          <div className="flex items-center gap-3 pt-2 border-t border-border-default/40">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="isPublished"
              className="text-xs font-bold text-text-primary cursor-pointer select-none"
            >
              Publikasikan album ini langsung ke halaman Galeri Komunitas
            </label>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border-default/60">
            <Link href="/admin/galeri" className="flex-1 sm:flex-initial">
              <button
                type="button"
                disabled={isLoading}
                className="w-full sm:w-32 h-10 rounded-xl border border-border-default text-xs font-bold text-text-secondary hover:bg-bg-well hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial sm:w-44 h-10 rounded-xl bg-text-primary text-bg-card hover:opacity-90 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{initialAlbum ? "Simpan Perubahan" : "Simpan Album"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
