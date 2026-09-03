"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveResourceAction } from "@/lib/actions/resource-actions";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size_kb: number;
  package_tier: string;
  category: string;
  is_published: boolean;
  order_index: number;
  uploaded_by: string;
  created_at: string;
}

interface AddResourceClientProps {
  initialResource: Resource | null;
}

const CATEGORIES = [
  { value: "materi", label: "Materi / E-Book" },
  { value: "rekaman", label: "Rekaman Video / Audio" },
  { value: "template", label: "Template / Assets" },
  { value: "referensi", label: "Referensi / Link" },
  { value: "lainnya", label: "Lainnya" },
];

const TIERS = [
  { value: "all", label: "Free (Terbuka untuk Semua Member)" },
  { value: "regular", label: "Regular Tier" },
  { value: "mvp", label: "MVP Tier" },
];

const mapFileType = (ext: string): string => {
  const normalized = ext.toLowerCase();
  if (normalized === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(normalized)) return "image";
  return "doc";
};

const getStoragePathFromUrl = (url: string, bucketName: string): string | null => {
  try {
    const parts = url.split(`/${bucketName}/`);
    if (parts.length > 1) {
      return parts[1];
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export default function AddResourceClient({ initialResource }: AddResourceClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [title, setTitle] = useState(initialResource?.title || "");
  const [description, setDescription] = useState(initialResource?.description || "");
  const [category, setCategory] = useState(initialResource?.category || "materi");
  const [tier, setTier] = useState(initialResource?.package_tier || "all");
  const [file, setFile] = useState<File | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Judul materi wajib diisi.");
      return;
    }

    if (!initialResource && !file) {
      setFormError("File berkas wajib diisi untuk materi baru.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      let fileUrl = initialResource?.file_url || "";
      let fileType = initialResource?.file_type || "doc";
      let fileSizeKb = initialResource?.file_size_kb || 0;

      if (file) {
        // 1. Upload new file
        const compressedFile = await compressImage(file);
        const fileExt = compressedFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, compressedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: compressedFile.type || "application/octet-stream",
          });

        if (uploadError) throw new Error("Upload berkas gagal: " + uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("resources").getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileType = fileExt ? mapFileType(fileExt) : "doc";
        fileSizeKb = Math.round(compressedFile.size / 1024);

        // Delete old file from storage if updating
        if (initialResource) {
          const oldPath = getStoragePathFromUrl(initialResource.file_url, "resources");
          if (oldPath) {
            await supabase.storage.from("resources").remove([oldPath]);
          }
        }
      }

      // Save database record with dual-sync
      const res = await saveResourceAction(
        {
          title: title.trim(),
          description: description.trim(),
          package_tier: tier,
          category: category,
          file_url: fileUrl,
          file_type: fileType,
          file_size_kb: fileSizeKb,
          is_published: initialResource ? initialResource.is_published : true,
          order_index: initialResource?.order_index || 0,
        },
        initialResource?.id
      );

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan database materi.");
      }

      toast.success(
        initialResource ? "Materi berhasil diperbarui!" : "Materi baru berhasil diunggah!"
      );
      router.push("/admin/resources");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Terjadi kesalahan.";
      setFormError(msg);
      toast.error("Gagal menyimpan materi: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (kb: number) => {
    if (kb >= 1024) {
      return (kb / 1024).toFixed(1) + " MB";
    }
    return kb.toFixed(0) + " KB";
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER ═══ */}
      <div className="flex items-center justify-between border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/resources"
            className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Resources"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
              [ AKADEMI ]
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {initialResource ? "Edit Materi Belajar" : "Upload Resource Baru"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Silakan lengkapi berkas dan informasi materi edukasi di bawah ini.
            </p>
          </div>
        </div>

        <div>
          {initialResource ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Mode: Edit
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Mode: Baru
            </span>
          )}
        </div>
      </div>

      {/* ═══ FORM CONTAINER ═══ */}
      <div className="bg-white dark:bg-[#121212] border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Judul Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: E-Book Panduan Personal Branding Kreator"
              className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Deskripsi Singkat
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ringkasan materi, modul yang dibahas, atau manfaat membaca..."
              rows={3}
              className="w-full p-3.5 text-xs rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary leading-relaxed"
            />
          </div>

          {/* Kategori & Hak Akses Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Kategori Materi
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Hak Akses Paket (Minimal Tier)
              </label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium">
                  <SelectValue placeholder="Pilih Hak Akses" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Berkas / File Materi {!initialResource && <span className="text-red-500">*</span>}
            </label>
            <div
              onClick={handleContainerClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-2.5 cursor-pointer transition-all ${
                isDragging
                  ? "border-[#0369a1] bg-sky-500/10 scale-[1.01]"
                  : "border-border-default bg-bg-well/40 hover:bg-bg-well/70 hover:border-text-primary"
              }`}
            >
              <Upload className="w-7 h-7 text-text-muted" />
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">
                  {isDragging
                    ? "Lepaskan berkas di sini..."
                    : initialResource
                    ? "Klik atau seret file baru untuk mengganti berkas"
                    : "Klik atau seret file materi ke area ini"}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Mendukung PDF, PPTX, MP4, ZIP, PNG, dll (Maks. 50MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              {file ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    Berkas Baru: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : initialResource ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[11px] text-[#0369a1] dark:text-sky-400 font-bold bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    Berkas Aktif: {initialResource.file_url.split("/").pop()} (
                    {formatFileSize(initialResource.file_size_kb)})
                  </span>
                </div>
              ) : null}
            </div>
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
            <Link href="/admin/resources" className="flex-1 sm:flex-initial">
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full sm:w-32 h-10 rounded-xl border border-border-default text-xs font-bold text-text-secondary hover:bg-bg-well hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial sm:w-44 h-10 rounded-xl bg-text-primary text-bg-card hover:opacity-90 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{initialResource ? "Simpan Perubahan" : "Unggah Materi"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
