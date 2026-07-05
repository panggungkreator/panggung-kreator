"use client";

import React, { useState } from "react";
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
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
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
  maps_url: string;
  photo_urls: string[];
  amenities: string[];
  pros: string[];
  cons: string[];
  internal_notes: string;
  is_recommended: boolean;
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

export default function AddVenueClient({ initialVenue }: AddVenueClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState(initialVenue?.name || "");
  const [address, setAddress] = useState(initialVenue?.address || "");
  const [city, setCity] = useState(initialVenue?.city || "");
  const [description, setDescription] = useState(initialVenue?.description || "");
  const [capacity, setCapacity] = useState(initialVenue?.capacity || 100);
  const [contactWa, setContactWa] = useState(initialVenue?.contact_wa || "");
  const [contactName, setContactName] = useState(initialVenue?.contact_name || "");
  const [mapsUrl, setMapsUrl] = useState(initialVenue?.maps_url || "");
  const [notes, setNotes] = useState(initialVenue?.internal_notes || "");
  const [isRecommended, setIsRecommended] = useState(initialVenue?.is_recommended || false);

  // Array states (Amenities, Pros, Cons)
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>(initialVenue?.amenities || []);

  const [proInput, setProInput] = useState("");
  const [pros, setPros] = useState<string[]>(initialVenue?.pros || []);

  const [conInput, setConInput] = useState("");
  const [cons, setCons] = useState<string[]>(initialVenue?.cons || []);

  // Photos upload
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialVenue?.photo_urls || []);

  const handleAddAmenity = () => {
    if (!amenityInput.trim()) return;
    setAmenities([...amenities, amenityInput.trim()]);
    setAmenityInput("");
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleAddPro = () => {
    if (!proInput.trim()) return;
    setPros([...pros, proInput.trim()]);
    setProInput("");
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddCon = () => {
    if (!conInput.trim()) return;
    setCons([...cons, conInput.trim()]);
    setConInput("");
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPhoto = (index: number) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewPhotos([...newPhotos, ...filesArray]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !address.trim() || !city.trim()) {
      setFormError("Nama venue, Alamat, dan Kota wajib diisi.");
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
            city: city.trim(),
            description: description.trim(),
            capacity: Number(capacity),
            contact_wa: contactWa.trim(),
            contact_name: contactName.trim(),
            maps_url: mapsUrl.trim(),
            photo_urls: finalPhotoUrls,
            amenities: amenities,
            pros: pros,
            cons: cons,
            internal_notes: notes.trim(),
            is_recommended: isRecommended,
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
            city: city.trim(),
            description: description.trim(),
            capacity: Number(capacity),
            contact_wa: contactWa.trim(),
            contact_name: contactName.trim(),
            maps_url: mapsUrl.trim(),
            photo_urls: finalPhotoUrls,
            amenities: amenities,
            pros: pros,
            cons: cons,
            internal_notes: notes.trim(),
            is_recommended: isRecommended,
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
    <div className="min-h-screen bg-white dark:bg-zinc-750 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">

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

          {/* Section 1: Detail Utama */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">1. Detail Utama</h2>

            {/* Nama Venue */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Venue *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Coworking Space Panggung Kreatif"
                className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-bold"
              />
            </div>

            {/* Alamat & Kota */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Raya Kebon Jeruk No. 12"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kota *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Jakarta Barat"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Deskripsi Singkat</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fasilitas utama, nuansa tempat, atau kecocokan acara..."
                rows={3}
                className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              />
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Section 2: Kapasitas & Kontak */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">2. Kapasitas & Kontak</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Kapasitas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kapasitas (Orang)</label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
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
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>
              {/* WA Kontak */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={contactWa}
                  onChange={(e) => setContactWa(e.target.value)}
                  placeholder="08123456789"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Google Maps URL</label>
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://goo.gl/maps/..."
                className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
              />
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Section 3: Fitur & Fasilitas */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">3. Fitur & Tagging</h2>

            {/* Amenities (Fasilitas) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Fasilitas (Amenities)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="AC, WiFi, Proyektor, Parkir Luas..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
                  className="flex-grow h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-xs text-text-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {amenities.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-50 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                    {item}
                    <button type="button" onClick={() => handleRemoveAmenity(idx)} className="text-red-500 hover:text-red-750">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Pros & Cons (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {/* Pros */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block text-emerald-600">Kelebihan (Pros)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    placeholder="Estetis, Murah, Dekat Stasiun..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPro())}
                    className="flex-grow h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-xs text-text-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPro}
                    className="px-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pros.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50/50 border border-emerald-200/20 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      {item}
                      <button type="button" onClick={() => handleRemovePro(idx)} className="text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block text-rose-600">Kekurangan (Cons)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={conInput}
                    onChange={(e) => setConInput(e.target.value)}
                    placeholder="Susah Parkir, Agak Bising..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCon())}
                    className="flex-grow h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-xs text-text-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCon}
                    className="px-3 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {cons.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50/50 border border-rose-200/20 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                      {item}
                      <button type="button" onClick={() => handleRemoveCon(idx)} className="text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Section 4: Foto & Rekomendasi */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">4. Media & Rekomendasi</h2>

            {/* Recommended Flag */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommend"
                checked={isRecommended}
                onChange={(e) => setIsRecommended(e.target.checked)}
                className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-0 cursor-pointer"
              />
              <label htmlFor="recommend" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                Rekomendasikan Venue Ini (Akan mendapat lencana Rekomendasi di member portal)
              </label>
            </div>

            {/* Internal Notes */}
            <div className="space-y-1.5 mt-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Catatan Internal Admin</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hanya dapat dilihat oleh admin (catatan khusus sewa, kontak darurat tambahan, dll)..."
                rows={2}
                className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
              />
            </div>

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
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3">
                <Upload className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Unggah Foto Tambahan</p>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium mt-1">Dukungan format JPG, PNG, WEBP (Maks. 5MB per file)</p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="text-xs font-semibold text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#e0f2fe] file:text-[#0369a1] file:cursor-pointer hover:file:opacity-90 cursor-pointer"
                />

                {newPhotos.length > 0 && (
                  <div className="space-y-1.5 w-full max-w-md">
                    <p className="text-[10px] font-bold text-zinc-400 text-center">Foto baru siap diunggah ({newPhotos.length}):</p>
                    <div className="flex flex-col gap-1">
                      {newPhotos.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                          <span className="truncate max-w-[250px]">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <button type="button" onClick={() => handleRemoveNewPhoto(idx)} className="text-red-500 hover:text-red-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4.5 h-4.5 animate-spin" />
                <span>Menyimpan & Mengunggah...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4.5 h-4.5" />
                <span>Simpan Venue</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
