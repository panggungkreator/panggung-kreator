"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  capacity: number;
  contact_wa: string;
  contact_name: string;
  latitude: number;
  longitude: number;
  photo_urls: string[];
}

interface AddVenueClientProps {
  initialVenue: Venue | null;
}

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

const formatPhone = (val: string): string => {
  let digits = val.replace(/\D/g, "");
  if (digits.length > 0 && !digits.startsWith("0")) {
    digits = "0" + digits;
  }
  if (digits.length > 13) {
    digits = digits.substring(0, 13);
  }
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join("-");
};

export default function AddVenueClient({ initialVenue }: AddVenueClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<{ name?: string; address?: string; city?: string }>({});

  // Form states
  const [name, setName] = useState(initialVenue?.name || "");
  const [address, setAddress] = useState(initialVenue?.address || "");
  const [city, setCity] = useState(initialVenue?.city || "");
  const [description, setDescription] = useState(initialVenue?.description || "");
  const [capacity, setCapacity] = useState(initialVenue?.capacity?.toString() || "0");
  const [contactWa, setContactWa] = useState(initialVenue?.contact_wa ? formatPhone(initialVenue.contact_wa) : "");
  const [contactName, setContactName] = useState(initialVenue?.contact_name || "");

  // Photos upload
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialVenue?.photo_urls || []);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const handleRemoveExistingPhoto = (index: number) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
  };

  const handleRemoveNewPhoto = (index: number) => {
    if (photoPreviews[index]) {
      URL.revokeObjectURL(photoPreviews[index]);
    }
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Revoke any existing object URLs to avoid memory leaks
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));

      setNewPhotos([file]);
      setPhotoPreviews([URL.createObjectURL(file)]);
    }
  };

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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        // Revoke any existing object URLs to avoid memory leaks
        photoPreviews.forEach((url) => URL.revokeObjectURL(url));

        setNewPhotos([file]);
        setPhotoPreviews([URL.createObjectURL(file)]);
      } else {
        toast.error("File yang diunggah harus berupa gambar.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const newErrors: { name?: string; address?: string; city?: string } = {};
    if (!name.trim()) newErrors.name = "Nama venue wajib diisi.";
    if (!address.trim()) newErrors.address = "Alamat venue wajib diisi.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      // 1. Upload new photos if any
      if (newPhotos.length > 0) {
        for (let i = 0; i < newPhotos.length; i++) {
          const file = newPhotos[i];
          const compressedFile = await compressImage(file);
          const fileExt = compressedFile.name.split(".").pop();
          const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("venues")
            .upload(filePath, compressedFile);

          if (uploadError) throw new Error("Upload foto gagal: " + uploadError.message);

          const { data: { publicUrl } } = supabase.storage
            .from("venues")
            .getPublicUrl(filePath);

          uploadedUrls.push(publicUrl);
        }
      }

      const finalPhotoUrls = [...existingPhotos, ...uploadedUrls];

      // 2. Delete removed photos from storage
      const removedPhotos = (initialVenue?.photo_urls || []).filter(
        (url) => !existingPhotos.includes(url)
      );
      if (removedPhotos.length > 0) {
        const pathsToDelete = removedPhotos
          .map((url) => getStoragePathFromUrl(url, "venues"))
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          await supabase.storage.from("venues").remove(pathsToDelete);
        }
      }

      if (initialVenue) {
        // UPDATE DB
        const { error } = await supabase
          .from("venues")
          .update({
            name: name.trim(),
            address: address.trim(),
            description: description.trim(),
            capacity: Number(capacity),
            contact_wa: contactWa.trim(),
            contact_name: contactName.trim(),
            photo_urls: finalPhotoUrls,
            updated_at: new Date().toISOString()
          })
          .eq("id", initialVenue.id);

        if (error) throw new Error(error.message);
      } else {
        // INSERT DB
        const { count } = await supabase
          .from("venues")
          .select("*", { count: "exact", head: true });

        const { error } = await supabase
          .from("venues")
          .insert({
            name: name.trim(),
            address: address.trim(),
            description: description.trim(),
            capacity: Number(capacity),
            contact_wa: contactWa.trim(),
            contact_name: contactName.trim(),
            photo_urls: finalPhotoUrls,
            order_index: (count || 0) + 1
          });

        if (error) throw new Error(error.message);
      }

      toast.success(
        initialVenue
          ? "Venue berhasil diperbarui!"
          : "Venue baru berhasil ditambahkan!"
      );
      router.push("/admin/venue");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Terjadi kesalahan.";
      setFormError(msg);
      toast.error("Gagal menyimpan venue: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-card dark:bg-zinc-750 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/venue"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest font-title">
                {initialVenue ? "EDIT VENUE PERTEMUAN" : "TAMBAH VENUE BARU"}
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Kelola informasi lokasi pertemuan mentoring atau acara komunitas.
              </p>
            </div>
          </div>

          <div>
            {initialVenue ? (
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/10 font-bold font-mono">
                EDIT DATA
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/10 font-bold font-mono">
                BARU
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 text-zinc-800 dark:text-zinc-200">

          {/* Photos upload & management */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Foto Venue</label>

            {/* Existing photos preview with delete */}
            {existingPhotos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-zinc-400">Foto Terunggah:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingPhotos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 aspect-video">
                      <img src={url} alt="Venue" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new photo input */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 transition-colors ${isDragging
                ? "border-zinc-950 dark:border-amber-400 bg-zinc-100/70 dark:bg-zinc-800/40"
                : "border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30"
                }`}
            >
              {photoPreviews.length > 0 ? (
                <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-w-sm w-full aspect-video shadow-md bg-white dark:bg-zinc-900">
                  <img src={photoPreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewPhoto(0)}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                    title="Hapus foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-550 py-4">
                  <ImageIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                    {isDragging ? "Lepaskan gambar di sini" : "Belum ada foto terpilih"}
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center justify-center w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs font-semibold text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#e0f2fe] file:text-[#0369a1] file:cursor-pointer hover:file:opacity-90 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Detail Utama */}
          <div className="space-y-4 mt-12">

            {/* Nama Venue */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Venue *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Contoh: Coworking Space Panggung Kreatif"
                className={`flex h-12 w-full rounded-xl border bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 transition-all ${errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  }`}
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Alamat & Kota */}
            <div className="space-y-1.5 mt-6">
              {/* Alamat Lengkap */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder="Jl. Raya Kebon Jeruk No. 12"
                  className={`flex h-12 w-full rounded-xl border bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 transition-all ${errors.address
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    }`}
                />
                {errors.address && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5 mt-6">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Deskripsi Singkat</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fasilitas utama, nuansa tempat, atau kecocokan acara..."
                rows={3}
                className="flex w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
              />
            </div>
          </div>

          {/* Section 2: Kapasitas & Kontak */}
          <div className="space-y-4 mt-8">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {/* Kapasitas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kapasitas (Orang)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={capacity}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      if (val.length > 1 && val.startsWith("0")) {
                        val = val.replace(/^0+/, "");
                      }
                      setCapacity(val);
                    }
                  }}
                  onBlur={() => {
                    if (!capacity.trim()) {
                      setCapacity("0");
                    }
                  }}
                  className="flex h-12 w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                />
              </div>
              {/* Nama Kontak */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Kontak Person</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Budi Setiawan"
                  className="flex h-12 w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                />
              </div>
              {/* WA Kontak */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={contactWa}
                  onChange={(e) => setContactWa(formatPhone(e.target.value))}
                  placeholder="0812-3456-7890"
                  className="flex h-12 w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-mono"
                />
              </div>
            </div>

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
            <Link href="/admin/venue" className="flex-1">
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
              className="flex-1 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-gray-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-widest cursor-pointer disabled:opacity-50 h-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>Simpan</span>
                </>
              )}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}
