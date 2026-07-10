"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
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
  { value: "lainnya", label: "Lainnya" }
];

const TIERS = [
  { value: "all", label: "Free (Terbuka untuk Semua)" },
  { value: "regular", label: "Regular Tier" },
  { value: "mvp", label: "MVP Tier" }
];

const mapFileType = (ext: string): string => {
  const normalized = ext.toLowerCase();
  if (normalized === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(normalized)) return "image";
  return "doc"; // Maps all other document/zip files to 'doc'
};

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

const formatFileSize = (kb: number) => {
  if (kb >= 1024) {
    return (kb / 1024).toFixed(1) + " MB";
  }
  return kb.toFixed(0) + " KB";
};

export default function AddResourceClient({ initialResource }: AddResourceClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [title, setTitle] = useState(initialResource?.title || "");
  const [description, setDescription] = useState(initialResource?.description || "");
  const [tier, setTier] = useState(initialResource?.package_tier || "all");
  const [category, setCategory] = useState(initialResource?.category || "materi");
  const [file, setFile] = useState<File | null>(null);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi pengguna tidak ditemukan.");

      if (initialResource) {
        let fileUrl = initialResource.file_url;
        let fileType = initialResource.file_type;
        let fileSizeKb = initialResource.file_size_kb;

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
              contentType: compressedFile.type || "application/octet-stream"
            });

          if (uploadError) throw new Error("Upload berkas baru gagal: " + uploadError.message);

          const { data: { publicUrl } } = supabase.storage
            .from("resources")
            .getPublicUrl(filePath);

          fileUrl = publicUrl;
          fileType = fileExt ? mapFileType(fileExt) : "doc";
          fileSizeKb = Math.round(compressedFile.size / 1024);

          // 2. Delete old file from storage
          const oldPath = getStoragePathFromUrl(initialResource.file_url, "resources");
          if (oldPath) {
            await supabase.storage.from("resources").remove([oldPath]);
          }
        }

        // UPDATE DB & METADATA
        const { error } = await supabase
          .from("resources")
          .update({
            title: title.trim(),
            description: description.trim(),
            package_tier: tier,
            category: category,
            file_url: fileUrl,
            file_type: fileType,
            file_size_kb: fileSizeKb,
            updated_at: new Date().toISOString()
          })
          .eq("id", initialResource.id);

        if (error) throw new Error(error.message);
      } else {
        // INSERT WITH FILE UPLOAD
        if (!file) return;
        const compressedFile = await compressImage(file);
        const fileExt = compressedFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, compressedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: compressedFile.type || "application/octet-stream"
          });

        if (uploadError) throw new Error("Upload berkas gagal: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from("resources")
          .getPublicUrl(filePath);

        // Get total count for order_index
        const { count } = await supabase
          .from("resources")
          .select("*", { count: "exact", head: true });

        const { error: dbError } = await supabase
          .from("resources")
          .insert({
            title: title.trim(),
            description: description.trim(),
            file_url: publicUrl,
            file_type: fileExt ? mapFileType(fileExt) : "doc",
            file_size_kb: Math.round(compressedFile.size / 1024),
            package_tier: tier,
            category: category,
            is_published: true,
            uploaded_by: user.id,
            order_index: (count || 0) + 1
          });

        if (dbError) throw new Error("Gagal menyimpan ke database: " + dbError.message);
      }

      toast.success(
        initialResource
          ? "Materi belajar berhasil diperbarui!"
          : "Materi belajar baru berhasil ditambahkan!"
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

  return (
    <div className="min-h-screen bg-card py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card border border-zinc-400 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/resources"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest font-title">
                {initialResource ? "EDIT MATERI BELAJAR" : "TAMBAH MATERI BARU"}
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Silakan isi data materi edukasi secara lengkap di bawah ini.
              </p>
            </div>
          </div>

          {/* Mode Indicator Badge */}
          <div>
            {initialResource ? (
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
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Judul Materi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: E-Book Public Speaking Hacks"
              className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Deskripsi Materi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara singkat isi atau panduan materi ini..."
              rows={4}
              className="flex w-full rounded-md border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
            />
          </div>

          {/* Kategori & Hak Akses (Flex Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Kategori Materi
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-[50px] border-zinc-400">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hak Akses / Paket */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Hak Akses (Min. Tier)
              </label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="w-full h-[50px] border-zinc-400">
                  <SelectValue placeholder="Pilih Hak Akses" />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* File Upload */}
          <div
            onClick={handleContainerClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all duration-200 ${isDragging
              ? "border-sky-500 bg-sky-50/50 dark:border-sky-500/40 dark:bg-sky-950/10 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700"
              }`}
          >
            <Upload className={`w-8 h-8 transition-colors ${isDragging ? "text-sky-500" : "text-zinc-450 dark:text-zinc-500"}`} />
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {isDragging
                  ? "Lepaskan berkas di sini..."
                  : initialResource
                    ? "Seret & Letakkan berkas baru atau Klik untuk mengganti berkas lama"
                    : "Seret & Letakkan berkas atau Klik untuk memilih *"}
              </p>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium mt-1">
                Mendukung PDF, MP4, ZIP, PPTX, dll (Maks. 50MB)
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
                className="flex items-center gap-1.5 text-[10px] text-[#15803d] dark:text-emerald-400 font-bold bg-[#dcfce7] dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-500/10"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Berkas Baru: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            ) : initialResource ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[10px] text-[#0369a1] dark:text-sky-400 font-bold bg-[#e0f2fe] dark:bg-sky-950/20 px-3 py-1 rounded-full border border-sky-500/10"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Berkas Aktif: {initialResource.file_url.split("/").pop()} ({formatFileSize(initialResource.file_size_kb)})</span>
              </div>
            ) : null}
          </div>

          {/* Error Message */}
          {formError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-zinc-400 dark:border-zinc-800">
            <Link href="/admin/resources" className="flex-1">
              <Button
                type="button"
                disabled={isSubmitting}
                className="w-full py-4 text-xs font-bold rounded-full border border-zinc-400 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 transition-colors uppercase tracking-widest cursor-pointer disabled:opacity-50 h-auto"
              >
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-widest cursor-pointer disabled:opacity-50 h-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>{initialResource ? "Update" : "Simpan"}</span>
                </>
              )}
            </Button>
          </div>


        </form>

      </div>
    </div>
  );
}
