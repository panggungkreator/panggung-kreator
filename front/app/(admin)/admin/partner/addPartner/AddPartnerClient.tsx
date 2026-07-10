"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";

interface Partner {
  id: string;
  name: string;
  type: string;
  website_url: string;
  instagram_url: string;
  contact_person: string;
  contact_wa: string;
  description: string;
  is_active: boolean;
}

interface AddPartnerClientProps {
  initialPartner: Partner | null;
}

const PARTNER_TYPES = [
  { value: "none", label: "Pilih Kategori" },
  { value: "kafe", label: "Kafe / F&B" },
  { value: "kampus", label: "Kampus / Sekolah" },
  { value: "brand", label: "Brand / Bisnis" },
  { value: "media", label: "Media Partner" },
  { value: "sponsor", label: "Sponsor" },
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

const formatInstagram = (val: string): string => {
  let cleaned = val.trim();
  if (!cleaned) return "";

  // Extract from full URL if pasted
  if (cleaned.includes("instagram.com/")) {
    const parts = cleaned.split("instagram.com/");
    if (parts.length > 1) {
      cleaned = parts[1].split(/[?#\/]/)[0];
    }
  }

  // Remove any leading @ symbol to prevent duplicates
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.substring(1);
  }

  // Filter valid characters (letters, numbers, periods, underscores)
  cleaned = cleaned.replace(/[^a-zA-Z0-9._]/g, "");

  if (cleaned.length > 0) {
    return "@" + cleaned;
  }

  if (val.startsWith("@") || val === "@") {
    return "@";
  }

  return "";
};

export default function AddPartnerClient({ initialPartner }: AddPartnerClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState(initialPartner?.name || "");
  const [type, setType] = useState(initialPartner?.type || "none");
  const [websiteUrl, setWebsiteUrl] = useState(initialPartner?.website_url || "");
  const [instagramUrl, setInstagramUrl] = useState(initialPartner?.instagram_url ? formatInstagram(initialPartner.instagram_url) : "");
  const [contactPerson, setContactPerson] = useState(initialPartner?.contact_person || "");
  const [contactWa, setContactWa] = useState(initialPartner?.contact_wa ? formatPhone(initialPartner.contact_wa) : "");
  const [description, setDescription] = useState(initialPartner?.description || "");
  const [isActive, setIsActive] = useState(initialPartner?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Nama partner wajib diisi.");
      return;
    }

    if (!type || type === "none") {
      setFormError("Kategori partner wajib dipilih.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (initialPartner) {
        // UPDATE DB
        const { error } = await supabase
          .from("partners")
          .update({
            name: name.trim(),
            type: type,
            website_url: websiteUrl.trim(),
            instagram_url: instagramUrl.trim().replace(/^@/, ""),
            contact_person: contactPerson.trim(),
            contact_wa: contactWa.trim(),
            description: description.trim(),
            is_active: isActive
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
            website_url: websiteUrl.trim(),
            instagram_url: instagramUrl.trim().replace(/^@/, ""),
            contact_person: contactPerson.trim(),
            contact_wa: contactWa.trim(),
            description: description.trim(),
            is_active: isActive,
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
    <div className="min-h-screen bg-card py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-zinc-800 dark:text-zinc-200">

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Partner *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kafe Ruang Kolaborasi"
                  className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kategori Partner</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full h-12 border-zinc-400">
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
            <div className="space-y-1.5 mt-6">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Deskripsi Kerja Sama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan peran partner atau bentuk kolaborasinya..."
                rows={3}
                className="flex w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          {/* Section 2: Tautan & Sosial Media */}
          <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://partner.com"
                  className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Instagram Username</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(formatInstagram(e.target.value))}
                  placeholder="Contoh: @kafe_kolaborasi"
                  className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Kontak & Representasi */}
          <div className="space-y-4 mt-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CP Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nama Kontak Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Budi Gunawan"
                  className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>

              {/* CP WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">WhatsApp Kontak Person</label>
                <input
                  type="text"
                  value={contactWa}
                  onChange={(e) => setContactWa(formatPhone(e.target.value))}
                  placeholder="0812-3456-7890"
                  className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Active */}
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4.5 h-4.5 text-zinc-900 border-zinc-400 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  PARTNER AKTIF (Kerja sama masih berjalan)
                </label>
              </div>

            </div>
          </div>

          {/* Error Message */}
          {
            formError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )
          }

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-zinc-400 dark:border-zinc-800">
            <Link href="/admin/partner" className="flex-1">
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

        </form >

      </div >
    </div >
  );
}
