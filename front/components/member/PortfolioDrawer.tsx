"use client";

import React, { useState, useEffect } from "react";
import { PortfolioItem, Pillar, ItemType, MediaSource } from "@/lib/types/member";
import VideoLinkInput from "./VideoLinkInput";
import ImageUploader from "./ImageUploader";
import MultiImageUploader, { StagedImageItem, uploadStagedImagesToStorage } from "./MultiImageUploader";
import { Modal } from "@/components/ui/Modal";
import { useModalValidation, FieldError } from "@/hooks/useModalValidation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Video, Image as ImageIcon, Award, Link as LinkIcon, Loader2, Sparkles, VectorSquare } from "lucide-react";

export interface PortfolioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  itemToEdit?: PortfolioItem | null;
  defaultPillar?: Pillar | null;
  initialItemType?: ItemType | null;
  onSuccess: (saved: PortfolioItem) => void;
}

const PILLARS: { value: Pillar; label: string }[] = [
  { value: "public_speaking", label: "Public Speaking" },
  { value: "content_creation", label: "Storytelling & Konten" },
  { value: "personal_branding", label: "Personal Branding" },
];

type PortfolioFields = "itemType" | "pillar" | "title" | "mediaUrl";

export default function PortfolioDrawer({
  isOpen,
  onClose,
  memberId,
  itemToEdit,
  defaultPillar = null,
  initialItemType = null,
  onSuccess,
}: PortfolioDrawerProps) {
  const [itemType, setItemType] = useState<ItemType | null>(initialItemType || null);
  const [pillar, setPillar] = useState<Pillar | null>(defaultPillar || null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaSource, setMediaSource] = useState<MediaSource>("youtube");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [stagedImages, setStagedImages] = useState<StagedImageItem[]>([]);

  const {
    errors,
    validate,
    clearError,
    resetErrors,
    getInputClassName,
    createChangeHandler,
  } = useModalValidation<PortfolioFields>();

  useEffect(() => {
    if (isOpen) {
      resetErrors();
      if (itemToEdit) {
        setItemType(itemToEdit.item_type || null);
        setPillar(itemToEdit.pillar || null);
        setTitle(itemToEdit.title || "");
        setDescription(itemToEdit.description || "");
        setMediaUrl(itemToEdit.media_url || "");
        setMediaSource(itemToEdit.media_source || "youtube");
        setThumbnailUrl(itemToEdit.thumbnail_url || null);
        setIsFeatured(itemToEdit.is_featured || false);
        setIsPublic(itemToEdit.is_public ?? true);

        const initialStaged: StagedImageItem[] = (itemToEdit.media_url || "")
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean)
          .map((url, idx) => ({
            id: `remote-${idx}-${url}`,
            previewUrl: url,
            isRemote: true,
          }));
        setStagedImages(initialStaged);
      } else {
        setItemType(initialItemType || null);
        setPillar(defaultPillar || null);
        setTitle("");
        setDescription("");
        setMediaUrl("");
        setMediaSource("youtube");
        setThumbnailUrl(null);
        setIsFeatured(false);
        setIsPublic(true);
        setStagedImages([]);
      }
    }
  }, [isOpen, itemToEdit, initialItemType, defaultPillar, resetErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate({
      itemType: {
        value: itemType,
        required: "Pilih tipe portofolio terlebih dahulu.",
      },
      pillar: {
        value: pillar,
        required: "Pilih pilar kompetensi terlebih dahulu.",
      },
      title: { value: title, required: "Judul portofolio wajib diisi." },
      mediaUrl: {
        value: itemType === "image" ? (stagedImages.length > 0 ? "staged" : "") : mediaUrl,
        custom: (val) => {
          if (!itemType) return null;
          if (itemType === "video" && !val) {
            return "Tautan video (YouTube/TikTok/IG) wajib diisi.";
          }
          if (itemType === "image" && (!stagedImages || stagedImages.length === 0)) {
            return "Silakan unggah minimal 1 gambar karya terlebih dahulu.";
          }
          if (itemType === "link") {
            if (!val) return "Tautan URL karya wajib diisi.";
            try {
              new URL(val);
            } catch {
              return "Format tautan URL tidak valid (harus menyertakan https://).";
            }
          }
          return null;
        },
      },
    });

    if (!isValid || !itemType || !pillar) return;

    setIsLoading(true);
    try {
      let finalMediaUrl = mediaUrl.trim() || null;
      let finalThumbnailUrl = thumbnailUrl || null;
      let finalMediaSource = mediaSource;

      // ── DEFERRED UPLOAD: Eksekusi upload ke Supabase Storage hanya saat form disubmit ──
      if (itemType === "image") {
        finalMediaSource = "storage";
        const uploadedUrls = await uploadStagedImagesToStorage(stagedImages, {
          memberId,
          target: "portfolio",
        });

        if (uploadedUrls.length > 0) {
          finalMediaUrl = uploadedUrls[0];
          finalThumbnailUrl = uploadedUrls[0];
        }
      }

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
        media_url: finalMediaUrl,
        media_source: finalMediaSource,
        thumbnail_url: finalThumbnailUrl,
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
        return <VectorSquare className="w-5 h-5 text-text-primary" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={getIcon()}
      title={itemToEdit ? "Edit Portofolio" : "Tambah Portofolio"}
      subtitle={
        itemToEdit
          ? "Perbarui informasi atau tautan karya portofolio Anda."
          : "Unggah karya video, foto, sertifikat prestasi, atau tautan Anda."
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
            <span>
              {isLoading
                ? itemType === "image"
                  ? "Mengunggah & Menyimpan..."
                  : "Menyimpan..."
                : itemToEdit
                  ? "Simpan Perubahan"
                  : "Simpan Portofolio"}
            </span>
          </button>
        </div>
      }
    >
      <form id="portfolio-form" noValidate onSubmit={handleSubmit} className="space-y-4 pt-1">
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
                    clearError("itemType");
                    clearError("mediaUrl");
                    if (cat.type === "video") setMediaSource("youtube");
                    else if (cat.type === "image") setMediaSource("storage");
                    else if (cat.type === "link") setMediaSource("external");
                    else if (cat.type === "achievement") setMediaSource("storage");
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-text-primary text-bg-page border-text-primary shadow-xs"
                      : errors.itemType
                        ? "bg-bg-well/50 text-text-secondary border-red-500/70 hover:border-red-500 hover:text-text-primary"
                        : "bg-bg-well/50 text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          <FieldError error={errors.itemType} />
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
                  onClick={() => {
                    setPillar(p.value);
                    clearError("pillar");
                  }}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium",
                    isSelected
                      ? "bg-text-primary text-bg-page border-text-primary shadow-xs"
                      : errors.pillar
                        ? "bg-bg-well/50 text-text-secondary border-red-500/70 hover:border-red-500 hover:text-text-primary"
                        : "bg-bg-well/50 text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <FieldError error={errors.pillar} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Judul Portofolio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={createChangeHandler("title", setTitle)}
            placeholder="Contoh: Keynote Speaker di Youth Tech Summit 2024"
            className={getInputClassName("title")}
          />
          <FieldError error={errors.title} />
        </div>

        {/* Conditional Media Input */}
        {itemType ? (
          <div className="pt-2 border-t border-border-default/60 space-y-3">
            {itemType === "video" && (
              <div>
                <VideoLinkInput
                  value={mediaUrl}
                  initialThumbnailUrl={thumbnailUrl}
                  onUrlChange={(url: string, src: MediaSource, thumb: string) => {
                    setMediaUrl(url);
                    clearError("mediaUrl");
                    setMediaSource(src);
                    if (thumb) setThumbnailUrl(thumb);
                  }}
                />
                <FieldError error={errors.mediaUrl} />
              </div>
            )}

            {itemType === "image" && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Unggah Gambar Karya (Kompresi Lossless) <span className="text-red-500">*</span>
                </label>
                <MultiImageUploader
                  memberId={memberId}
                  target="portfolio"
                  initialUrls={mediaUrl ? mediaUrl.split(",").map((u) => u.trim()).filter(Boolean) : []}
                  onStagedChange={(staged) => {
                    setStagedImages(staged);
                    if (staged.length > 0) {
                      clearError("mediaUrl");
                      setMediaSource("storage");
                    }
                  }}
                />
                <FieldError error={errors.mediaUrl} />
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
                  value={mediaUrl}
                  onChange={createChangeHandler("mediaUrl", setMediaUrl)}
                  placeholder="https://..."
                  className={getInputClassName("mediaUrl")}
                />
                <FieldError error={errors.mediaUrl} />
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2 border-t border-border-default/60">
            <div className="p-3.5 rounded-xl border border-dashed border-border-default text-center text-xs text-text-tertiary bg-bg-well/20">
              Pilih tipe portofolio di atas untuk memasukkan media atau tautan
            </div>
          </div>
        )}

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
