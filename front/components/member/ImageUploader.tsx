"use client";

import React, { useState, useEffect } from "react";
import { compressImageForTarget } from "@/lib/utils/image-compress";
import { createClient } from "@/lib/supabase/client";
import { Upload, X } from "lucide-react";

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

    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan!");
      return;
    }

    setError("");

    // Mode deferred: simpan lokal (penampungan sementara) dan buat object URL untuk preview
    if (mode === "deferred") {
      const localPreviewUrl = URL.createObjectURL(file);
      setImageUrl(localPreviewUrl);
      if (onFileSelect) {
        onFileSelect(file);
      }
      onUploadSuccess(localPreviewUrl);
      return;
    }

    // Mode immediate: kompresi dan upload langsung ke Supabase
    setIsUploading(true);
    try {
      const supabase = createClient();
      const compressedFile = await compressImageForTarget(file, target);
      const bucketName =
        target === "avatar"
          ? "member-avatars"
          : target === "portfolio"
          ? "portfolio-images"
          : "portfolio-thumbnails";
      const fileName =
        target === "avatar"
          ? "avatar.webp"
          : `${Math.random().toString(36).substring(2, 10)}.webp`;
      const path = `${memberId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, compressedFile, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
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
    <div className="space-y-2">
      {error && <span className="text-[10px] text-red-500 font-mono block">{error}</span>}

      {imageUrl ? (
        <div className="relative inline-block group">
          <img
            src={imageUrl}
            alt="Uploaded content"
            className={`object-cover border border-zinc-200 dark:border-zinc-800 ${
              target === "avatar" ? "h-24 w-24 rounded-full" : "h-32 w-48 rounded-none"
            }`}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-black/75 hover:bg-[#bc151b] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Hapus foto"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 hover:border-black dark:hover:border-white transition-colors cursor-pointer ${
            target === "avatar" ? "h-24 w-24 rounded-full" : "h-32 w-48 rounded-none"
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
                <Upload size={16} />
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
    </div>
  );
}
