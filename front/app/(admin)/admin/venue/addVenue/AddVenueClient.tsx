"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { saveVenueAction } from "@/lib/actions/venue-actions";
import { toast } from "sonner";

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
  const [contactWa, setContactWa] = useState(
    initialVenue?.contact_wa ? formatPhone(initialVenue.contact_wa) : ""
  );
  const [contactName, setContactName] = useState(initialVenue?.contact_name || "");

  // Photos upload
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    initialVenue?.photo_urls || []
  );
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
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setNewPhotos((prev) => [...prev, ...selected]);
      const newUrls = selected.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newUrls]);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setNewPhotos((prev) => [...prev, ...dropped]);
      const newUrls = dropped.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const newErrors: { name?: string; address?: string; city?: string } = {};
    if (!name.trim()) newErrors.name = "Nama venue wajib diisi.";
    if (!address.trim()) newErrors.address = "Alamat venue wajib diisi.";
    if (!city.trim()) newErrors.city = "Kota wajib diisi.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError("Mohon lengkapi semua kolom wajib bertanda bintang (*).");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      // 1. Upload new photos
      if (newPhotos.length > 0) {
        for (const file of newPhotos) {
          const compressed = await compressImage(file);
          const ext = compressed.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("venues")
            .upload(filePath, compressed, {
              cacheControl: "3600",
              upsert: false,
              contentType: compressed.type || "image/jpeg",
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error("Gagal mengunggah foto: " + uploadError.message);
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("venues").getPublicUrl(filePath);

          uploadedUrls.push(publicUrl);
        }
      }

      const finalPhotoUrls = [...existingPhotos, ...uploadedUrls];

      // Clean deleted photos from storage
      if (initialVenue?.photo_urls) {
        const removedUrls = initialVenue.photo_urls.filter(
          (oldUrl) => !existingPhotos.includes(oldUrl)
        );
        const pathsToDelete = removedUrls
          .map((url) => getStoragePathFromUrl(url, "venues"))
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          await supabase.storage.from("venues").remove(pathsToDelete);
        }
      }

      // 2. Save venue with dual-sync
      const res = await saveVenueAction(
        {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          description: description.trim(),
          capacity: Number(capacity) || 0,
          contact_wa: contactWa.trim(),
          contact_name: contactName.trim(),
          photo_urls: finalPhotoUrls,
        },
        initialVenue?.id
      );

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan data venue.");
      }

      toast.success(
        initialVenue ? "Venue berhasil diperbarui!" : "Venue baru berhasil ditambahkan!"
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
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER ═══ */}
      <div className="flex items-center justify-between border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/venue"
            className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Daftar Venue"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
              [ KOMUNITAS ]
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {initialVenue ? "Edit Venue Pertemuan" : "Tambah Venue Baru"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Kelola informasi lokasi pertemuan mentoring atau kegiatan komunitas.
            </p>
          </div>
        </div>

        <div>
          {initialVenue ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
              Mode: Edit
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              Mode: Baru
            </span>
          )}
        </div>
      </div>

      {/* ═══ FORM CONTAINER ═══ */}
      <div className="bg-white dark:bg-[#121212] border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Upload & Management */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Foto Venue / Lokasi
            </label>

            {/* Existing photos preview */}
            {existingPhotos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-text-muted">Foto Terunggah:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingPhotos.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-2xl overflow-hidden border border-border-default aspect-video"
                    >
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

            {/* Upload new photo area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 transition-all ${
                isDragging
                  ? "border-[#0369a1] bg-sky-500/10 scale-[1.01]"
                  : "border-border-default bg-bg-well/40 hover:bg-bg-well/70"
              }`}
            >
              {photoPreviews.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  {photoPreviews.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-2xl overflow-hidden border border-border-default aspect-video"
                    >
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                        title="Hapus foto baru"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-text-muted py-2">
                  <ImageIcon className="w-8 h-8 text-text-muted mb-1" />
                  <p className="text-xs font-bold text-text-primary text-center">
                    {isDragging ? "Lepaskan gambar di sini" : "Tarik & Lepas Foto atau Pilih Berkas"}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">Mendukung JPG, PNG, WEBP</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="text-xs font-semibold text-text-primary file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-text-primary file:text-bg-card file:cursor-pointer hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Detail Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-default/40">
            {/* Nama Venue */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Nama Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Contoh: Coworking Space Panggung Kreatif"
                className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Kota */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Kota <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                }}
                placeholder="Contoh: Jakarta, Bandung, Surabaya"
                className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
              {errors.city && (
                <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.city}</span>
                </p>
              )}
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="Jl. Sudirman No. 12, Senayan, Jakarta Selatan"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
              {errors.address && (
                <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Deskripsi & Fasilitas
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fasilitas utama: proyektor, AC, sound system, kapasitas parkir..."
                rows={3}
                className="w-full p-3.5 text-xs rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary leading-relaxed"
              />
            </div>
          </div>

          {/* Section: Kapasitas & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-default/40">
            {/* Kapasitas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Kapasitas (Kursi)
              </label>
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
                  if (!capacity.trim()) setCapacity("0");
                }}
                className="w-full h-10 px-3.5 text-xs font-bold font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* Nama Kontak */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Contact Person (CP)
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Budi Setiawan"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* WA Kontak */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Nomor WhatsApp CP
              </label>
              <input
                type="text"
                value={contactWa}
                onChange={(e) => setContactWa(formatPhone(e.target.value))}
                placeholder="0812-3456-7890"
                className="w-full h-10 px-3.5 text-xs font-bold font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
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
            <Link href="/admin/venue" className="flex-1 sm:flex-initial">
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
                <span>{initialVenue ? "Simpan Perubahan" : "Tambah Venue"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
