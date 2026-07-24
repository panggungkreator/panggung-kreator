"use client";

import React, { useState, useEffect } from "react";
import VideoLinkInput from "./VideoLinkInput";
import ImageUploader from "./ImageUploader";
import { PortfolioItem, Pillar, ItemType, MediaSource } from "@/lib/types/member";
import { toast } from "sonner";
import { Plus, Trash2, Globe, Lock, Star, ExternalLink, Video, Image as ImageIcon, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface PortfolioManagerProps {
  memberId: string;
}

const PILLARS: { value: Pillar; label: string }[] = [
  { value: "public_speaking", label: "🎤 Public Speaking" },
  { value: "content_creation", label: "🎬 Content Creation" },
  { value: "personal_branding", label: "✨ Personal Branding" },
];

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: "video", label: "Video" },
  { value: "image", label: "Gambar" },
  { value: "article", label: "Artikel / Tulisan" },
  { value: "link", label: "Tautan Karya" },
  { value: "achievement", label: "Prestasi / Sertifikasi" },
];

export default function PortfolioManager({ memberId }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activePillar, setActivePillar] = useState<Pillar>("public_speaking");
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States inside Modal
  const [pillar, setPillar] = useState<Pillar>("public_speaking");
  const [itemType, setItemType] = useState<ItemType>("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaSource, setMediaSource] = useState<MediaSource>("external");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/member/portfolio");
      if (response.ok) {
        const json = await response.json();
        setItems(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const resetForm = () => {
    setPillar("public_speaking");
    setItemType("video");
    setTitle("");
    setDescription("");
    setMediaUrl("");
    setMediaSource("external");
    setThumbnailUrl("");
    setIsFeatured(false);
    setIsPublic(true);
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul wajib diisi!");
      return;
    }

    const payload = {
      pillar,
      item_type: itemType,
      title,
      description: description || null,
      media_url: mediaUrl || null,
      media_source: mediaSource,
      thumbnail_url: thumbnailUrl || null,
      is_featured: isFeatured,
      is_public: isPublic,
    };

    try {
      const url = modalMode === "add" ? "/api/member/portfolio" : `/api/member/portfolio/${editingId}`;
      const method = modalMode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menyimpan item.");
      }

      toast.success(modalMode === "add" ? "Item portofolio ditambahkan!" : "Item portofolio diperbarui!");
      setIsModalOpen(false);
      fetchPortfolio();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan jaringan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item portofolio ini?")) return;

    try {
      const res = await fetch(`/api/member/portfolio/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus.");
      }

      toast.success("Item portofolio berhasil dihapus.");
      fetchPortfolio();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus.");
    }
  };

  const filteredItems = items.filter((item) => item.pillar === activePillar);

  return (
    <div className="space-y-6">
      {/* Pillar Tabs Selector */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-1">
        {PILLARS.map((p) => (
          <button
            key={p.value}
            onClick={() => setActivePillar(p.value)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border border-b-0 rounded-none cursor-pointer ${activePillar === p.value
              ? "bg-neutral-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
          >
            {p.label}
          </button>
        ))}

        <button
          onClick={handleOpenAdd}
          className="ml-auto px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-none flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={12} /> Tambah Item
        </button>
      </div>

      {/* Grid Portfolio */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-800 py-12 text-center text-xs text-zinc-500 dark:text-zinc-450 font-mono">
          [ BELUM ADA KARYA DI PILAR INI. KLIK '+ TAMBAH ITEM' DI ATAS ]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 group relative flex flex-col justify-between"
            >
              {/* Thumbnail Display */}
              <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-zinc-500 flex flex-col items-center gap-2">
                    {item.item_type === "video" ? <Video size={28} /> : item.item_type === "image" ? <ImageIcon size={28} /> : <FileText size={28} />}
                    <span className="text-[9px] uppercase font-mono tracking-wider">{item.item_type}</span>
                  </div>
                )}

                {/* Feature & Visibility badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {item.is_featured && (
                    <span className="bg-amber-500 text-white font-sans text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-amber-600">
                      Featured
                    </span>
                  )}
                  {!item.is_public && (
                    <span className="bg-zinc-800 text-zinc-400 font-sans text-[8px] uppercase tracking-wider px-1.5 py-0.5 border border-zinc-700 flex items-center gap-0.5">
                      <Lock size={8} /> Private
                    </span>
                  )}
                </div>

                {/* External link button */}
                {item.media_url && (
                  <a
                    href={item.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 p-1.5 bg-black/80 hover:bg-[#bc151b] text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Buka Link Karya"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-tight text-black dark:text-white line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-450 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-zinc-450 border-t border-zinc-100 dark:border-zinc-900 mt-2">
                  <span>{item.media_source.toUpperCase()}</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-zinc-400 hover:text-[#bc151b] transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] border border-zinc-300 dark:border-zinc-800 text-black dark:text-white w-full max-w-xl p-6 md:p-8 rounded-none space-y-5 relative">
            <h3 className="text-lg font-serif italic text-black dark:text-white">
              {modalMode === "add" ? "Tambah Portofolio Karya" : "Edit Portofolio Karya"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Pilar Selector */}
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                    PILAR
                  </label>
                  <Select value={pillar} onValueChange={(val) => setPillar(val as Pillar)}>
                    <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 py-1 px-0 h-auto text-xs rounded-none focus:outline-none focus:ring-0">
                      <SelectValue placeholder="Pilih Pilar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none p-1">
                      {PILLARS.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Item Type Selector */}
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                    TIPE KARYA
                  </label>
                  <Select value={itemType} onValueChange={(val) => setItemType(val as ItemType)}>
                    <SelectTrigger className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 py-1 px-0 h-auto text-xs rounded-none focus:outline-none focus:ring-0">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none p-1">
                      {ITEM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-none cursor-pointer">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  JUDUL KARYA *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Presentasi Grand Final Speech Competition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Media input conditional rendering */}
              {itemType === "video" ? (
                <VideoLinkInput
                  value={mediaUrl}
                  initialThumbnailUrl={thumbnailUrl}
                  onUrlChange={(url, src, thumb) => {
                    setMediaUrl(url);
                    setMediaSource(src);
                    setThumbnailUrl(thumb);
                  }}
                />
              ) : itemType === "image" ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                    UNGGAH GAMBAR PORTFOLIO *
                  </label>
                  <ImageUploader
                    memberId={memberId}
                    target="portfolio"
                    initialImageUrl={mediaUrl}
                    onUploadSuccess={(url) => {
                      setMediaUrl(url);
                      setMediaSource("storage");
                      setThumbnailUrl(url); // thumbnail sama dengan media url untuk gambar
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                    TAUTAN LINK KARYA (OPSIONAL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://medium.com/artikel-saya"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setMediaSource("external");
                    }}
                    className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-450 uppercase block mb-1">
                  DESKRIPSI SINGKAT
                </label>
                <textarea
                  placeholder="Ceritakan proses pembuatan atau cerita dibalik karya ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors h-16 resize-none"
                />
              </div>

              {/* Featured & Public toggles */}
              <div className="flex gap-6 pt-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
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
              <div className="pt-4 flex justify-end gap-3 text-[10px] font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-none hover:border-black dark:hover:border-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-[#bc151b] dark:hover:bg-[#bc151b] dark:hover:text-white rounded-none cursor-pointer"
                >
                  Simpan Karya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
