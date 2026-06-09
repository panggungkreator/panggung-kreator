"use client";

import React, { useRef, useState } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { Camera, Loader2 } from "lucide-react";

interface InlineImageProps {
  src: string;
  alt: string;
  className?: string;
  onSave: (newUrl: string) => Promise<void> | void;
}

export function InlineImage({ src, alt, className = "", onSave }: InlineImageProps) {
  const { isEditMode } = useLandingCMS();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    if (!isEditMode) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");

      const data = await res.json();
      if (data.url) {
        await onSave(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah gambar. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div 
      className={`relative inline-block group cursor-pointer ${className}`}
      onClick={handleClick}
      title="Klik untuk mengubah gambar"
    >
      <img src={src} alt={alt} className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-75'}`} />
      
      {/* Upload Overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
            <span className="text-white text-xs font-medium">Mengunggah...</span>
          </>
        ) : (
          <>
            <Camera className="w-8 h-8 text-white mb-2" />
            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Ubah Gambar</span>
          </>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        className="hidden"
      />
    </div>
  );
}
