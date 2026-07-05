"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Partner {
  id: string;
  name: string;
  type: string;
  logo_url: string;
  website_url: string;
  instagram_url: string;
  contact_person: string;
  contact_wa: string;
  description: string;
  partnership_since: string | null;
  is_active: boolean;
  is_featured: boolean;
}

interface AddPartnerClientProps {
  initialPartner: Partner | null;
}

const PARTNER_TYPES = [
  { value: "kafe", label: "Kafe / F&B" },
  { value: "media", label: "Media Partner" },
  { value: "komunitas", label: "Komunitas Kreatif" },
  { value: "brand", label: "Brand / Sponsor" },
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

export default function AddPartnerClient({ initialPartner }: AddPartnerClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState(initialPartner?.name || "");
  const [type, setType] = useState(initialPartner?.type || "kafe");
  const [websiteUrl, setWebsiteUrl] = useState(initialPartner?.website_url || "");
  const [instagramUrl, setInstagramUrl] = useState(initialPartner?.instagram_url || "");
  const [contactPerson, setContactPerson] = useState(initialPartner?.contact_person || "");
  const [contactWa, setContactWa] = useState(initialPartner?.contact_wa || "");
  const [description, setDescription] = useState(initialPartner?.description || "");
  const [since, setSince] = useState(initialPartner?.partnership_since || "");
  const [isActive, setIsActive] = useState(initialPartner?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(initialPartner?.is_featured ?? false);

  // Logo file upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(initialPartner?.logo_url || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Nama partner wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      let logoUrl = existingLogoUrl;

      // 1. Upload logo if new one selected
      if (logoFile) {
        const compressedLogo = await compressImage(logoFile);
        const fileExt = compressedLogo.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("partners")
          .upload(filePath, compressedLogo);

        if (uploadError) throw new Error("Upload logo gagal: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from("partners")
          .getPublicUrl(filePath);

        logoUrl = publicUrl;

        // Delete old logo file if it exists
        if (existingLogoUrl) {
          const oldPath = getStoragePathFromUrl(existingLogoUrl, "partners");
          if (oldPath) {
            await supabase.storage.from("partners").remove([oldPath]);
          }
        }
      }

      if (initialPartner) {
        // UPDATE DB
        const { error } = await supabase
          .from("partners")
          .update({
            name: name.trim(),
            type: type,
            logo_url: logoUrl,
            website_url: websiteUrl.trim(),
            instagram_url: instagramUrl.trim(),
            contact_person: contactPerson.trim(),
            contact_wa: contactWa.trim(),
            description: description.trim(),
            partnership_since: since || null,
            is_active: isActive,
            is_featured: isFeatured,
            updated_at: new Date().toISOString()
          })
          .eq("id", initialPartner.id);

        if (error) throw new Error(error.message);
      } else {
        // INSERT DB
        const { count } = await supabase
          .from("partners")
          .select("*", { count: "exact", head: true });

        const { error } = await supabase
          .from("partners")
          .insert({
            name: name.trim(),
            type: type,
            logo_url: logoUrl,
            website_url: websiteUrl.trim(),
            instagram_url: instagramUrl.trim(),
            contact_person: contactPerson.trim(),
            contact_wa: contactWa.trim(),
            description: description.trim(),
            partnership_since: since || null,
            is_active: isActive,
            is_featured: isFeatured,
            order_index: (count || 0) + 1
          });

        if (error) throw new Error(error.message);
      }

      toast.success(
        initialPartner
          ? "Partner berhasil diperbarui!"
          : "Partner baru berhasil ditambahkan!"
      );
      router.push("/admin/partner");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Terjadi kesalahan.";
      setFormError(msg);
      toast.error("Gagal menyimpan partner: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-zinc-800 dark:text-zinc-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/partner"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest font-title">
                {initialPartner ? "EDIT PARTNER" : "TAMBAH PARTNER BARU"}
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Kelola jaringan partner bisnis, komunitas, dan media pendukung.
              </p>
            </div>
          </div>

          <div>
            {initialPartner ? (
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
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Profil Partner */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">1. Profil Partner</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Partner *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kafe Ruang Kolaborasi"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kategori Partner</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TYPES.map(pt => (
                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Deskripsi Kerja Sama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan peran partner atau bentuk kolaborasinya..."
                rows={3}
                className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Partner Sejak */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Bekerja Sama Sejak</label>
                <input
                  type="date"
                  value={since}
                  onChange={(e) => setSince(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                />
              </div>

              {/* Logo Partner */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Logo Partner (PNG / JPG)</label>
                <div className="flex items-center gap-3">
                  {existingLogoUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0">
                      <img src={existingLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#e0f2fe] file:text-[#0369a1] file:cursor-pointer hover:file:opacity-90 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Section 2: Tautan & Sosial Media */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">2. Tautan & Sosial Media</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://partner.com"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/partner_handle"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Section 3: Kontak & Representasi */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">3. Kontak Internal</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CP Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Kontak Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Budi Gunawan"
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>

              {/* CP WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">WhatsApp Kontak Person</label>
                <input
                  type="text"
                  value={contactWa}
                  onChange={(e) => setContactWa(e.target.value)}
                  placeholder="0812..."
                  className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Section 4: Status Publikasi */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">4. Publikasi & Status</h2>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Active */}
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4.5 h-4.5 text-zinc-900 border-zinc-300 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  PARTNER AKTIF (Kerja sama masih berjalan)
                </label>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4.5 h-4.5 text-zinc-900 border-zinc-300 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  TAMPILKAN DI HALAMAN UTAMA (Featured Partner)
                </label>
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
                <span>Simpan Partner</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
