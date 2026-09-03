"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePartnerAction } from "@/lib/actions/partner-actions";
import { toast } from "sonner";

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
  { value: "kafe", label: "Kafe / Venue" },
  { value: "kampus", label: "Kampus / Sekolah" },
  { value: "brand", label: "Brand / Bisnis" },
  { value: "media", label: "Media Partner" },
  { value: "sponsor", label: "Sponsor" },
  { value: "lainnya", label: "Lainnya" },
];

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

  if (cleaned.includes("instagram.com/")) {
    const parts = cleaned.split("instagram.com/");
    if (parts.length > 1) {
      cleaned = parts[1].split(/[?#\/]/)[0];
    }
  }

  if (cleaned.startsWith("@")) {
    cleaned = cleaned.substring(1);
  }

  cleaned = cleaned.replace(/[^a-zA-Z0-9._]/g, "");
  return cleaned ? "@" + cleaned : "";
};

export default function AddPartnerClient({ initialPartner }: AddPartnerClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState(initialPartner?.name || "");
  const [type, setType] = useState(initialPartner?.type || "kafe");
  const [websiteUrl, setWebsiteUrl] = useState(initialPartner?.website_url || "");
  const [instagramUrl, setInstagramUrl] = useState(
    initialPartner?.instagram_url ? formatInstagram(initialPartner.instagram_url) : ""
  );
  const [contactPerson, setContactPerson] = useState(initialPartner?.contact_person || "");
  const [contactWa, setContactWa] = useState(
    initialPartner?.contact_wa ? formatPhone(initialPartner.contact_wa) : ""
  );
  const [description, setDescription] = useState(initialPartner?.description || "");
  const [isActive, setIsActive] = useState(initialPartner?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Nama partner wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await savePartnerAction(
        {
          name: name.trim(),
          type: type,
          website_url: websiteUrl.trim(),
          instagram_url: instagramUrl.trim().replace(/^@/, ""),
          contact_person: contactPerson.trim(),
          contact_wa: contactWa.trim(),
          description: description.trim(),
          is_active: isActive,
        },
        initialPartner?.id
      );

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan data partner.");
      }

      toast.success(
        initialPartner ? "Partner berhasil diperbarui!" : "Partner baru berhasil ditambahkan!"
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
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER ═══ */}
      <div className="flex items-center justify-between border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/partner"
            className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Daftar Partner"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
              [ KOMUNITAS ]
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {initialPartner ? "Edit Partner & Kolaborator" : "Tambah Partner Baru"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Kelola informasi profil kemitraan, kontak perwakilan, dan kanal promosi.
            </p>
          </div>
        </div>

        <div>
          {initialPartner ? (
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
          {/* Detail Profil Partner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nama Partner */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Nama Partner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kafe Ruang Kolaborasi"
                className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* Kategori / Tipe */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Kategori Partner <span className="text-red-500">*</span>
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {PARTNER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Deskripsi Singkat
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bidang usaha, bentuk kolaborasi atau fasilitas sponsor..."
                rows={3}
                className="w-full p-3.5 text-xs rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary leading-relaxed"
              />
            </div>
          </div>

          {/* Section: Kontak & Kanal Sosial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-default/40">
            {/* Contact Person */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Nama Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contoh: Rian Pratama"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* WA */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={contactWa}
                onChange={(e) => setContactWa(formatPhone(e.target.value))}
                placeholder="0812-3456-7890"
                className="w-full h-10 px-3.5 text-xs font-bold font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Akun Instagram
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                onBlur={() => setInstagramUrl(formatInstagram(instagramUrl))}
                placeholder="@partner.official"
                className="w-full h-10 px-3.5 text-xs font-bold font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Tautan Website
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://partner.co.id"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-3 pt-2 border-t border-border-default/40">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="text-xs font-bold text-text-primary cursor-pointer select-none"
            >
              Aktifkan partner ini (Dapat ditampilkan di landing page & arsip)
            </label>
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
            <Link href="/admin/partner" className="flex-1 sm:flex-initial">
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
                <span>{initialPartner ? "Simpan Perubahan" : "Tambah Partner"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
