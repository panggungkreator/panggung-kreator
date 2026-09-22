"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VideoLinkInput from "./VideoLinkInput";
import ImageUploader from "./ImageUploader";
import { PortfolioItem, Pillar, ItemType, MediaSource } from "@/lib/types/member";
import { toast } from "sonner";
import {
  Video,
  Image as ImageIcon,
  FileText,
  Award,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface PortfolioFormProps {
  memberId: string;
  initialData?: PortfolioItem | null;
  mode: "add" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PILLARS: { value: Pillar; label: string }[] = [
  { value: "public_speaking", label: "🎤 Public Speaking" },
  { value: "content_creation", label: "🎬 Content Creation" },
  { value: "personal_branding", label: "✨ Personal Branding" },
];

const ITEM_TYPE_OPTIONS: {
  value: ItemType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hint: string;
}[] = [
  { value: "video", label: "Link Video", icon: Video, hint: "YouTube, TikTok, IG" },
  { value: "achievement", label: "Sertifikat", icon: Award, hint: "Prestasi & Kredensial" },
  { value: "image", label: "Gambar / Foto", icon: ImageIcon, hint: "Dokumentasi & Galeri" },
  { value: "link", label: "Tautan Karya", icon: ExternalLink, hint: "Website eksternal" },
];

const DRAFT_STORAGE_KEY = "pk_portfolio_add_draft";

export default function PortfolioForm({
  memberId,
  initialData,
  mode,
  onSuccess,
  onCancel,
}: PortfolioFormProps) {
  const router = useRouter();

  // Helper to read initial draft
  const getDraft = () => {
    if (typeof window !== "undefined" && mode === "add") {
      try {
        const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    return null;
  };

  const [pillar, setPillar] = useState<Pillar>(
    () => getDraft()?.pillar || initialData?.pillar || "public_speaking"
  );
  const [itemType, setItemType] = useState<ItemType>(
    () => getDraft()?.itemType || initialData?.item_type || "video"
  );
  const [title, setTitle] = useState(
    () => getDraft()?.title || initialData?.title || ""
  );
  const [description, setDescription] = useState(
    () => getDraft()?.description || initialData?.description || ""
  );
  const [mediaUrl, setMediaUrl] = useState(
    () => getDraft()?.mediaUrl || initialData?.media_url || ""
  );
  const [mediaSource, setMediaSource] = useState<MediaSource>(
    () => getDraft()?.mediaSource || initialData?.media_source || "external"
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    () => getDraft()?.thumbnailUrl || initialData?.thumbnail_url || ""
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(() => {
    const draft = getDraft();
    if (typeof draft?.isFeatured === "boolean") return draft.isFeatured;
    return initialData?.is_featured || false;
  });
  const [isPublic, setIsPublic] = useState<boolean>(() => {
    const draft = getDraft();
    if (typeof draft?.isPublic === "boolean") return draft.isPublic;
    return initialData?.is_public ?? true;
  });
  const [achievementInputType, setAchievementInputType] = useState<"image" | "link">(() => {
    const draft = getDraft();
    if (draft?.achievementInputType) return draft.achievementInputType;
    return initialData?.item_type === "achievement" && initialData?.media_source === "storage"
      ? "image"
      : "link";
  });
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save draft in "add" mode
  useEffect(() => {
    if (mode === "add") {
      try {
        const draft = {
          pillar,
          itemType,
          title,
          description,
          mediaUrl,
          mediaSource,
          thumbnailUrl,
          isFeatured,
          isPublic,
          achievementInputType,
        };
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.error("Failed to persist draft", err);
      }
    }
  }, [
    mode,
    pillar,
    itemType,
    title,
    description,
    mediaUrl,
    mediaSource,
    thumbnailUrl,
    isFeatured,
    isPublic,
    achievementInputType,
  ]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/myprofile?tab=portfolio");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul wajib diisi!");
      return;
    }

    setIsSaving(true);

    const payload = {
      pillar,
      item_type: itemType,
      title: title.trim(),
      description: description.trim() || null,
      media_url: mediaUrl.trim() || null,
      media_source: mediaSource,
      thumbnail_url: thumbnailUrl || null,
      is_featured: isFeatured,
      is_public: isPublic,
    };

    try {
      const url = mode === "add" ? "/api/member/portfolio" : `/api/member/portfolio/${initialData?.id}`;
      const method = mode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menyimpan item.");
      }

      // Clear draft on successful submit
      if (mode === "add") {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      toast.success(mode === "add" ? "Item portofolio berhasil ditambahkan!" : "Item portofolio berhasil diperbarui!");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/myprofile?tab=portfolio");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Pilar Selector */}
      <div>
        <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1.5">
          PILAR KOMPETENSI *
        </label>
        <Select value={pillar} onValueChange={(val) => setPillar(val as Pillar)}>
          <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 py-1.5 px-0 h-auto text-xs rounded-none focus:outline-none focus:ring-0">
            <SelectValue placeholder="Pilih Pilar" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none p-1">
            {PILLARS.map((p) => (
              <SelectItem
                key={p.value}
                value={p.value}
                className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer"
              >
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipe Karya Selector Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
          TIPE KARYA *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ITEM_TYPE_OPTIONS.map((t) => {
            const Icon = t.icon;
            const isSelected = itemType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setItemType(t.value);
                  if (t.value === "video") setMediaSource("external");
                  else if (t.value === "image") setMediaSource("storage");
                  else if (t.value === "achievement")
                    setMediaSource(achievementInputType === "image" ? "storage" : "external");
                  else setMediaSource("external");
                }}
                className={`p-3 text-left border rounded-none transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-transparent text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon size={14} />
                  <span>{t.label}</span>
                </div>
                <span
                  className={`text-[9px] mt-1.5 font-mono leading-tight ${
                    isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
          JUDUL KARYA / PRESTASI *
        </label>
        <input
          type="text"
          required
          placeholder="Misal: Presentasi Grand Final Speech Competition / Juara 1 Content Challenge"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
        />
      </div>

      {/* Dynamic Media Input Area */}
      <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-900">
        {/* 1. Video Type */}
        {itemType === "video" && (
          <div className="space-y-2">
            <VideoLinkInput
              value={mediaUrl}
              initialThumbnailUrl={thumbnailUrl}
              onUrlChange={(url, src, thumb) => {
                setMediaUrl(url);
                setMediaSource(src);
                setThumbnailUrl(thumb);
              }}
            />
            <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/40 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
              <Info size={14} className="shrink-0 mt-0.5 text-zinc-400" />
              <span>
                [ EFISIENSI STORAGE ] Video disematkan via link eksternal (YouTube, TikTok, IG). Thumbnail otomatis diekstrak tanpa membebani kapasitas hosting.
              </span>
            </div>
          </div>
        )}

        {/* 2. Achievement / Sertifikat Type */}
        {itemType === "achievement" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setAchievementInputType("image");
                  setMediaSource("storage");
                }}
                className={`px-3 py-1.5 border rounded-none transition-colors cursor-pointer text-[10px] uppercase tracking-wider ${
                  achievementInputType === "image"
                    ? "bg-black dark:bg-white text-white dark:text-black font-bold border-black dark:border-white"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                Unggah Gambar Sertifikat
              </button>
              <button
                type="button"
                onClick={() => {
                  setAchievementInputType("link");
                  setMediaSource("external");
                }}
                className={`px-3 py-1.5 border rounded-none transition-colors cursor-pointer text-[10px] uppercase tracking-wider ${
                  achievementInputType === "link"
                    ? "bg-black dark:bg-white text-white dark:text-black font-bold border-black dark:border-white"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                Tautan Kredensial Online
              </button>
            </div>

            {achievementInputType === "image" ? (
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                  BERKAS GAMBAR SERTIFIKAT
                </label>
                <ImageUploader
                  memberId={memberId}
                  target="portfolio"
                  initialImageUrl={mediaUrl}
                  onUploadSuccess={(url) => {
                    setMediaUrl(url);
                    setMediaSource("storage");
                    setThumbnailUrl(url);
                  }}
                />
                <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/40 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  [ EFISIENSI STORAGE ] Gambar sertifikat dikompresi otomatis ke format WebP (&lt;1MB) sebelum diunggah ke storage.
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
                  URL KREDENSIAL / SERTIFIKAT ONLINE
                </label>
                <input
                  type="url"
                  placeholder="https://coursera.org/verify/... atau https://credential.net/..."
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setMediaSource("external");
                  }}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            )}
          </div>
        )}

        {/* 3. Image Type */}
        {itemType === "image" && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
              UNGGAH GAMBAR PORTFOLIO *
            </label>
            <ImageUploader
              memberId={memberId}
              target="portfolio"
              initialImageUrl={mediaUrl}
              onUploadSuccess={(url) => {
                setMediaUrl(url);
                setMediaSource("storage");
                setThumbnailUrl(url);
              }}
            />
            <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/40 text-[10px] font-mono text-zinc-500 dark:text-zinc-450">
              [ EFISIENSI STORAGE ] Gambar otomatis dioptimasi dan dikonversi ke format WebP ramah bandwidth.
            </div>
          </div>
        )}



        {/* 5. Generic Link Type */}
        {itemType === "link" && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block">
              TAUTAN KARYA / PROJECT *
            </label>
            <input
              type="url"
              required
              placeholder="https://portofolio-proyek.com"
              value={mediaUrl}
              onChange={(e) => {
                setMediaUrl(e.target.value);
                setMediaSource("external");
              }}
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
          DESKRIPSI KARYA
        </label>
        <textarea
          placeholder="Ceritakan ringkas proses pembuatan, dampak, atau cerita di balik karya ini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors h-20 resize-none"
        />
      </div>

      {/* Featured & Public toggles */}
      <div className="flex flex-wrap gap-6 pt-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-3.5 h-3.5 border-zinc-300 dark:border-zinc-700 rounded-none bg-transparent cursor-pointer"
          />
          <span>Pin ke Unggulan (Featured)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-3.5 h-3.5 border-zinc-300 dark:border-zinc-700 rounded-none bg-transparent cursor-pointer"
          />
          <span>Tampilkan Publik</span>
        </label>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white transition-colors cursor-pointer rounded-none disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white transition-colors cursor-pointer rounded-none disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          <span>{mode === "add" ? "Simpan Karya Baru" : "Simpan Perubahan"}</span>
        </button>
      </div>
    </form>
  );
}
