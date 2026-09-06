"use client";

import React, { useState, useEffect } from "react";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Camera } from "lucide-react";

interface ImageUploaderProps {
  memberId: string;
  target: "avatar" | "portfolio" | "thumbnail";
  onUploadSuccess: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  mode?: "immediate" | "deferred";
  initialImageUrl?: string | null;
}

export default function ImageUploader({
  memberId,
  target,
  onUploadSuccess,
  onFileSelect,
  mode = "immediate",
  initialImageUrl,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setImageUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Batas validasi ukuran file: 2MB
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran gambar melebihi batas maksimal 2MB!");
      return;
    }

    if (mode === "deferred") {
      const localPreviewUrl = URL.createObjectURL(file);
      setImageUrl(localPreviewUrl);
      if (onFileSelect) {
        onFileSelect(file);
      }
      return;
    }

    setIsUploading(true);

    try {
      const compressedFile = await compressImageForTarget(file, target);
      const supabase = createClient();
      const bucketName = "member-assets";
      const fileExt = compressedFile.name.split(".").pop() || "webp";
      const fileName = `${target}_${Date.now()}.${fileExt}`;
      const path = `${memberId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, compressedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(path);

      const freshUrl = `${publicUrl}?t=${Date.now()}`;
      setImageUrl(freshUrl);
      onUploadSuccess(freshUrl);
    } catch (err: any) {
      console.error("Storage upload error:", err);
      setError(err.message || "Gagal mengunggah gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
    onUploadSuccess("");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {imageUrl ? (
        <div className="relative inline-block group">
          {/* Label pembungkus foto & badge agar seluruh area foto dapat diklik untuk ganti gambar */}
          <label className="block relative cursor-pointer group">
            <img
              src={imageUrl}
              alt="Uploaded content"
              className={`object-cover border border-zinc-200 dark:border-zinc-800 transition-all group-hover:brightness-90 ${
                target === "avatar" ? "h-24 w-24 sm:h-28 sm:w-28 rounded-full" : "h-32 w-48 rounded-none"
              }`}
            />

            {/* Overlay hint kamera saat di-hover untuk avatar */}
            {target === "avatar" && (
              <div className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Camera size={22} className="text-white drop-shadow-md" />
              </div>
            )}

            {/* Camera Button Badge di pojok kanan bawah foto profil */}
            {target === "avatar" && (
              <div
                className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-white dark:bg-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-md transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center z-10"
                title="Ganti foto profil"
              >
                {isUploading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Camera size={14} className="text-neutral-700 dark:text-neutral-200" />
                )}
              </div>
            )}

            {/* Input file yang terpicu saat mengklik area foto manapun */}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {/* Hapus foto (di luar label agar klik X tidak memicu file picker) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleRemove();
            }}
            className="absolute top-0 right-0 p-1 bg-black/75 hover:bg-[#bc151b] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 shadow-sm"
            title="Hapus foto"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 hover:border-black dark:hover:border-white transition-colors cursor-pointer relative ${
            target === "avatar" ? "h-24 w-24 sm:h-28 sm:w-28 rounded-full" : "h-32 w-48 rounded-none"
          }`}
        >
          <div className="flex flex-col items-center space-y-1 text-zinc-400">
            {isUploading ? (
              <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {target === "avatar" ? <Camera size={20} className="text-zinc-500 dark:text-zinc-400" /> : <Upload size={16} />}
                <span className="text-[8px] uppercase tracking-wider font-mono">Upload</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      )}

      {error && <span className="text-[10px] text-red-500 font-mono block text-center max-w-[180px] leading-tight">{error}</span>}
    </div>
  );
}
