"use client";

import React, { useState, useEffect } from "react";
import { PortfolioItem, Pillar, ItemType, MediaSource } from "@/lib/types/member";
import VideoLinkInput from "./VideoLinkInput";
import ImageUploader from "./ImageUploader";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Video, Image as ImageIcon, Award, Link as LinkIcon, Loader2 } from "lucide-react";

export interface PortfolioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  itemToEdit?: PortfolioItem | null;
  defaultPillar?: Pillar;
  initialItemType?: ItemType;
  onSuccess: (saved: PortfolioItem) => void;
}

const PILLARS: { value: Pillar; label: string }[] = [
  { value: "public_speaking", label: "Public Speaking" },
  { value: "content_creation", label: "Storytelling & Konten" },
  { value: "personal_branding", label: "Personal Branding" },
];

export default function PortfolioDrawer({
  isOpen,
  onClose,
  memberId,
  itemToEdit,
  defaultPillar = "public_speaking",
  initialItemType,
  onSuccess,
}: PortfolioDrawerProps) {
  const [itemType, setItemType] = useState<ItemType>(initialItemType || "video");
  const [pillar, setPillar] = useState<Pillar>(defaultPillar);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaSource, setMediaSource] = useState<MediaSource>(
    initialItemType === "achievement" ? "storage" : "youtube"
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setItemType(itemToEdit.item_type || "video");
        setPillar(itemToEdit.pillar || defaultPillar);
        setTitle(itemToEdit.title || "");
        setDescription(itemToEdit.description || "");
        setMediaUrl(itemToEdit.media_url || "");
        setMediaSource(itemToEdit.media_source || "youtube");
        setThumbnailUrl(itemToEdit.thumbnail_url || null);
        setIsFeatured(itemToEdit.is_featured || false);
        setIsPublic(itemToEdit.is_public ?? true);
      } else {
        const defaultType: ItemType = initialItemType || "video";
        setItemType(defaultType);
        setPillar(defaultPillar);
        setTitle("");
        setDescription("");
        setMediaUrl("");
        setMediaSource(defaultType === "achievement" ? "storage" : "youtube");
        setThumbnailUrl(null);
        setIsFeatured(false);
        setIsPublic(true);
      }
    }
  }, [isOpen, itemToEdit, initialItemType, defaultPillar]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul karya/prestasi wajib diisi.");
      return;
    }

    if (itemType === "video" && !mediaUrl) {
      toast.error("Tautan video (YouTube/TikTok/IG) wajib diisi.");
      return;
    }

    if (itemType === "image" && !mediaUrl) {
      toast.error("Silakan unggah gambar karya terlebih dahulu.");
      return;
    }

    if (itemType === "link" && !mediaUrl) {
      toast.error("Tautan URL karya wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const isEditing = !!itemToEdit;
      const url = isEditing
        ? `/api/member/portfolio/${itemToEdit.id}`
        : "/api/member/portfolio";
      const method = isEditing ? "PATCH" : "POST";

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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || json.error || "Gagal menyimpan karya.");
      }

      const { data } = await res.json();
      toast.success(
        isEditing
          ? "Karya berhasil diperbarui."
          : "Karya baru berhasil ditambahkan."
      );
      onSuccess(data);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    switch (itemType) {
      case "video":
        return <Video className="w-5 h-5 text-text-primary" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-text-primary" />;
      case "achievement":
        return <Award className="w-5 h-5 text-text-primary" />;
      case "link":
        return <LinkIcon className="w-5 h-5 text-text-primary" />;
      default:
        return <Video className="w-5 h-5 text-text-primary" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={getIcon()}
      title={itemToEdit ? "Edit Portofolio / Prestasi" : "Tambah Portofolio / Prestasi"}
      subtitle={
        itemToEdit
          ? "Perbarui informasi atau tautan karya portofolio Anda."
          : "Unggah karya video, foto, sertifikat, atau tautan pencapaian Anda."
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="portfolio-form"
            disabled={isLoading}
            className="px-5 py-2.5 bg-text-primary text-bg-page hover:opacity-90 font-medium text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{itemToEdit ? "Simpan Perubahan" : "Simpan Karya"}</span>
          </button>
        </div>
      }
    >
      <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Tipe Portofolio <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { type: "video" as ItemType, label: "Video", icon: Video },
              { type: "image" as ItemType, label: "Gambar", icon: ImageIcon },
              { type: "achievement" as ItemType, label: "Prestasi", icon: Award },
              { type: "link" as ItemType, label: "Tautan", icon: LinkIcon },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = itemType === cat.type;
              return (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => {
                    setItemType(cat.type);
                    if (cat.type === "video") setMediaSource("youtube");
                    else if (cat.type === "image") setMediaSource("storage");
                    else if (cat.type === "link") setMediaSource("external");
                    else if (cat.type === "achievement") setMediaSource("storage");
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-text-primary text-bg-page border-text-primary shadow-xs"
                      : "bg-bg-well/50 text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pillar Selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Pilar Kompetensi <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PILLARS.map((p) => {
              const isSelected = pillar === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPillar(p.value)}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium",
                    isSelected
                      ? "bg-text-primary text-bg-page border-text-primary shadow-xs"
                      : "bg-bg-well/50 text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Judul Karya / Prestasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Keynote Speaker di Youth Tech Summit 2024"
            className="w-full bg-bg-well/60 border border-border-default px-3.5 py-2 text-xs sm:text-sm rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
          />
        </div>

        {/* Conditional Media Input */}
        <div className="pt-2 border-t border-border-default/60 space-y-3">
          {itemType === "video" && (
            <div>
              <VideoLinkInput
                value={mediaUrl}
                initialThumbnailUrl={thumbnailUrl}
                onUrlChange={(url: string, src: MediaSource, thumb: string) => {
                  setMediaUrl(url);
                  setMediaSource(src);
                  if (thumb) setThumbnailUrl(thumb);
                }}
              />
            </div>
          )}

          {itemType === "image" && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Unggah Gambar Karya (Kompresi Otomatis) <span className="text-red-500">*</span>
              </label>
              <ImageUploader
                memberId={memberId}
                target="portfolio"
                initialImageUrl={mediaUrl}
                onUploadSuccess={(url) => {
                  setMediaUrl(url);
                  setThumbnailUrl(url);
                  setMediaSource("storage");
                }}
              />
            </div>
          )}

          {itemType === "achievement" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Bukti Sertifikat / Piagam (Opsional)
                </label>
                <ImageUploader
                  memberId={memberId}
                  target="portfolio"
                  initialImageUrl={mediaUrl}
                  onUploadSuccess={(url) => {
                    setMediaUrl(url);
                    setThumbnailUrl(url);
                    setMediaSource("storage");
                  }}
                />
              </div>
              <div>
                <span className="block text-[11px] text-text-tertiary mb-1">
                  Atau Tautan Kredensial Online (URL Opsional)
                </span>
                <input
                  type="url"
                  value={mediaUrl.startsWith("http") && !mediaUrl.includes("supabase.co") ? mediaUrl : ""}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setMediaSource("external");
                  }}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full bg-bg-well/60 border border-border-default px-3.5 py-2 text-xs rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                />
              </div>
            </div>
          )}

          {itemType === "link" && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Tautan URL Karya <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-bg-well/60 border border-border-default px-3.5 py-2 text-xs sm:text-sm rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-border-default/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-text-secondary">
              Deskripsi (Opsional)
            </label>
            <span className="text-[10px] text-text-tertiary font-mono">
              {description.length}/500
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Jelaskan konteks karya, peranmu, atau pencapaian dari karya ini..."
            className="w-full bg-bg-well/60 border border-border-default p-3 text-xs rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Toggles: Featured & Public */}
        <div className="pt-2 border-t border-border-default/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border-default/70 bg-bg-well/30 hover:bg-bg-well/60 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-text-primary rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-medium text-text-primary block">Sematkan Unggulan</span>
              <span className="text-[11px] text-text-tertiary">Tampilkan di posisi teratas profil</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border-default/70 bg-bg-well/30 hover:bg-bg-well/60 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-text-primary rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-medium text-text-primary block">Publikasikan</span>
              <span className="text-[11px] text-text-tertiary">Tampilkan di halaman profil publik</span>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
}
