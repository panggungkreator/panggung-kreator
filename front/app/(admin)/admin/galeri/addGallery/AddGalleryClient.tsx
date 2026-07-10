"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  X,
  Upload,
  Globe,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";

interface Album {
  id: string;
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
}

const CATEGORIES = [
  { value: "open-mic", label: "Open Mic" },
  { value: "public-speaking", label: "Public Speaking" },
  { value: "mc-practice", label: "MC Practice" },
  { value: "networking", label: "Networking" },
  { value: "content-class", label: "Content Class" },
  { value: "lainnya", label: "Lainnya" }
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

export default function AddGalleryClient({ initialAlbum }: AddGalleryClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialAlbum?.title || "");
  const [category, setCategory] = useState(initialAlbum?.category || "open-mic");

  // Set default date to initialAlbum date or today in YYYY-MM-DD local format
  const [eventDate, setEventDate] = useState(() => {
    if (initialAlbum?.event_date) return initialAlbum.event_date;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const isUploadedImage = initialAlbum?.hero_image_url?.includes("storage/v1/object/public/gallery") || false;
  const [heroImageMode, setHeroImageMode] = useState<"upload" | "url">(isUploadedImage ? "upload" : "url");
  const [heroImageUrl, setHeroImageUrl] = useState(initialAlbum?.hero_image_url || "");
  const [albumLink, setAlbumLink] = useState(initialAlbum?.album_link || "");
  const [description, setDescription] = useState(initialAlbum?.description || "");
  const [isPublished, setIsPublished] = useState(initialAlbum ? initialAlbum.is_published : true);
  const [displayOrder, setDisplayOrder] = useState(initialAlbum?.display_order || 0);

  // Slug generator helper
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  // Handle image upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const compressedFile = await compressImage(file);

      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = createClient();

      const { data, error } = await supabase.storage
        .from("gallery")
        .upload(filePath, compressedFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      // Delete old file if present
      if (heroImageUrl) {
        const oldPath = getStoragePathFromUrl(heroImageUrl, "gallery");
        if (oldPath) {
          await supabase.storage.from("gallery").remove([oldPath]);
        }
      }

      setHeroImageUrl(publicUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah gambar: " + (error.message || error));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Form Submit (Insert / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      alert("Judul dan tanggal kegiatan harus diisi!");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const slug = generateSlug(title);

      const albumData = {
        title,
        slug,
        category,
        event_date: eventDate,
        hero_image_url: heroImageUrl.trim() || null,
        album_link: albumLink.trim() || null,
        description: description.trim() || null,
        is_published: isPublished,
        display_order: displayOrder,
        updated_at: new Date().toISOString()
      };

      if (initialAlbum?.id) {
        // UPDATE
        const { error } = await supabase
          .from("gallery_albums")
          .update(albumData)
          .eq("id", initialAlbum.id);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from("gallery_albums")
          .insert([albumData]);

        if (error) throw error;
      }

      toast.success(
        initialAlbum
          ? "Album galeri berhasil diperbarui!"
          : "Album galeri baru berhasil ditambahkan!"
      );
      router.push("/admin/galeri");
      router.refresh();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Gagal menyimpan data: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/galeri"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest font-title">
                {initialAlbum ? "EDIT ALBUM DOKUMENTASI" : "TAMBAH ALBUM BARU"}
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Silakan isi data album galeri secara lengkap di bawah ini.
              </p>
            </div>
          </div>

          {/* Mode Indicator Badge */}
          <div>
            {initialAlbum ? (
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/10 font-bold">
                MODE: EDIT DATA
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/10 font-bold">
                MODE: TAMBAH BARU
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div className="space-y-1.5">
            <Label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Judul Album / Nama Kegiatan *
            </Label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Panggung ke-10"
              className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
            />
          </div>

          {/* Kategori & Tanggal (Sejajar Flex) */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Kategori */}
            <div className="flex-1 space-y-1.5">
              <Label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Kategori Kegiatan *
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val)}>
                <SelectTrigger className="w-full h-[50px]">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal */}
            <div className="flex-1 space-y-1.5">
              <Label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Tanggal Kegiatan *
              </Label>
              <DatePicker
                value={eventDate}
                onChange={setEventDate}
                placeholder="Pilih Tanggal"
              />
            </div>
          </div>

          {/* Link Album */}
          <div className="space-y-1.5">
            <Label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Link Album Lengkap (Google Drive, dll)
            </Label>
            <Input
              type="url"
              value={albumLink}
              onChange={(e) => setAlbumLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Deskripsi Singkat (Opsional)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Deskripsi singkat kegiatan..."
              className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
            />
          </div>

          {/* Hero Image Setup */}
          <div className="border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
            <Label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Hero Image (Foto Bersama / Sampul)
            </Label>

            {/* Tabs */}
            <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <Button
                type="button"
                onClick={() => setHeroImageMode("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer h-auto ${heroImageMode === "upload"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs hover:bg-white dark:hover:bg-zinc-700"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent shadow-none hover:bg-transparent"
                  }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </Button>
              <Button
                type="button"
                onClick={() => setHeroImageMode("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer h-auto ${heroImageMode === "url"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs hover:bg-white dark:hover:bg-zinc-700"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent shadow-none hover:bg-transparent"
                  }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>External URL</span>
              </Button>
            </div>

            {heroImageMode === "upload" ? (
              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-805 rounded-xl p-6 text-center hover:bg-zinc-50/10 dark:hover:bg-zinc-850/10 transition-colors">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer animate-none p-0 border-none bg-transparent"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-500">Mengunggah file...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-zinc-405" />
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-450">
                          Klik / Tarik foto untuk upload
                        </span>
                        <span className="text-[9px] font-semibold text-zinc-400">
                          PNG, JPG, JPEG (Max. 5MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Input
                  type="text"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
                />
              </div>
            )}

            {/* URL Mirror & Image Preview */}
            {heroImageUrl && (
              <div className="mt-3 space-y-2">
                <div className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 truncate">
                  URL: <span className="font-semibold text-zinc-650 dark:text-zinc-350">{heroImageUrl}</span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => setHeroImageUrl("")}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer h-auto w-auto min-w-0"
                    title="Hapus gambar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Status Toggle & Order */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                type="checkbox"
                id="is_published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded-sm border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer p-0"
              />
              <Label htmlFor="is_published" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest cursor-pointer select-none">
                Publish Album (Tampilkan di website publik)
              </Label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Link href="/admin/galeri" className="flex-1">
              <Button
                type="button"
                disabled={isLoading}
                className="w-full py-4 text-xs font-bold rounded-full border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 transition-colors uppercase tracking-widest cursor-pointer disabled:opacity-50 h-auto"
              >
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-widest cursor-pointer disabled:opacity-50 h-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
