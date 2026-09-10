"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
  FileText,
  Globe,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePartnerAction } from "@/lib/actions/partner-actions";
import { toast } from "sonner";

function InstagramIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface Partner {
  id: string;
  name: string;
  type: string;
  logo_url?: string;
  website_url: string;
  instagram_url: string;
  contact_person: string;
  contact_wa: string;
  description: string;
  is_active: boolean;
}

export interface VenueItem {
  id: string;
  name: string;
  address?: string;
  city?: string;
  use_count?: number;
}

interface AddPartnerClientProps {
  initialPartner: Partner | null;
  venues?: VenueItem[];
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

export default function AddPartnerClient({ initialPartner, venues = [] }: AddPartnerClientProps) {
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

  // Logo upload & compression states
  const [existingLogo, setExistingLogo] = useState<string>(initialPartner?.logo_url || "");
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(initialPartner?.logo_url || "");
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);

  // Collapsible additional details accordion state (default open if any additional field is filled in edit mode)
  const hasInitialDetails = Boolean(
    initialPartner?.description?.trim() ||
    initialPartner?.contact_person?.trim() ||
    initialPartner?.contact_wa?.trim() ||
    initialPartner?.instagram_url?.trim() ||
    initialPartner?.website_url?.trim()
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(hasInitialDetails);

  // Status perhitungan kelengkapan field tambahan di dalam accordion
  const filledCount = [
    Boolean(description.trim()),
    Boolean(contactPerson.trim()),
    Boolean(contactWa.trim()),
    Boolean(instagramUrl.trim()),
    Boolean(websiteUrl.trim()),
  ].filter(Boolean).length;
  const hasActiveDetails = filledCount > 0;

  // Cleanup object URL preview on unmount or change
  React.useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // Handle logo file selection with automatic compression
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("File yang dipilih harus berupa gambar.");
        return;
      }

      setIsCompressingLogo(true);
      try {
        // Compress image using canvas pipeline (max 1000x1000 for logo/avatar with quality 0.8)
        const compressed = await compressImage(file, 1000, 1000, 0.82);
        setNewLogoFile(compressed);
        const previewUrl = URL.createObjectURL(compressed);
        setLogoPreview(previewUrl);
        toast.success(`Logo siap diunggah (${Math.round(compressed.size / 1024)} KB)`);
      } catch (err) {
        console.error("Gagal mengompresi logo:", err);
        setNewLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } finally {
        setIsCompressingLogo(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setNewLogoFile(null);
    setLogoPreview("");
    setExistingLogo("");
  };

  // Dynamic Venue selection states (when category is Kafe / Venue)
  const [venueList, setVenueList] = useState<VenueItem[]>(venues);
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const venueContainerRef = React.useRef<HTMLDivElement>(null);

  // Sync props venues jika berubah atau lakukan client-side fetch jika kosong
  React.useEffect(() => {
    if (venues && venues.length > 0) {
      setVenueList(venues);
    } else {
      // Fallback: ambil data langsung dari supabase client jika server component belum terkirim
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        supabase
          .from("venues")
          .select("*")
          .order("name", { ascending: true })
          .then((res: { data: any; error: any }) => {
            if (res.data && !res.error) {
              setVenueList(
                res.data.map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  address: v.address || "",
                  city: v.city || "",
                  use_count: v.use_count || 0,
                }))
              );
            }
          });
      });
    }
  }, [venues]);

  // Close venue dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        venueContainerRef.current &&
        !venueContainerRef.current.contains(e.target as Node)
      ) {
        setIsVenueDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered venues based on typed name
  const filteredVenues = React.useMemo(() => {
    if (!name.trim()) return venueList;
    const q = name.toLowerCase().trim();
    return venueList.filter((v) => {
      const vName = v.name.toLowerCase();
      const vAddress = (v.address || "").toLowerCase();
      return vName.includes(q) || vAddress.includes(q);
    });
  }, [name, venueList]);

  // Check if current name matches an existing venue
  const matchedVenue = React.useMemo(() => {
    if (!name.trim()) return null;
    const q = name.toLowerCase().trim();
    return venueList.find((v) => v.name.toLowerCase().trim() === q);
  }, [name, venueList]);

  const handleSelectVenue = (v: VenueItem) => {
    setName(v.name);
    setIsVenueDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Nama partner wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalLogoUrl = existingLogo;

      // 1. Upload new logo to Supabase Storage 'partners' bucket with compression
      if (newLogoFile) {
        const supabase = createClient();
        const ext = newLogoFile.name.split(".").pop() || "webp";
        const fileName = `partner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("partners")
          .upload(filePath, newLogoFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: newLogoFile.type || "image/webp",
          });

        if (uploadError) {
          console.error("Gagal mengunggah logo partner:", uploadError);
          throw new Error("Gagal mengunggah logo: " + uploadError.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("partners").getPublicUrl(filePath);

        finalLogoUrl = publicUrl;

        // Clean up old logo if editing and replaced
        if (initialPartner?.logo_url && initialPartner.logo_url !== finalLogoUrl) {
          try {
            const oldPath = initialPartner.logo_url.split("/public/partners/")[1];
            if (oldPath) {
              await supabase.storage.from("partners").remove([decodeURIComponent(oldPath)]);
            }
          } catch (e) {
            console.warn("Gagal membersihkan logo lama:", e);
          }
        }
      } else if (!existingLogo && initialPartner?.logo_url) {
        // If logo was removed
        try {
          const supabase = createClient();
          const oldPath = initialPartner.logo_url.split("/public/partners/")[1];
          if (oldPath) {
            await supabase.storage.from("partners").remove([decodeURIComponent(oldPath)]);
          }
        } catch (e) {
          console.warn("Gagal menghapus logo lama:", e);
        }
        finalLogoUrl = "";
      }

      // 2. Simpan data partner via server action
      const res = await savePartnerAction(
        {
          name: name.trim(),
          type: type,
          logo_url: finalLogoUrl,
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
      <div className="bg-transparent sm:bg-card border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-1 sm:p-8 shadow-none sm:shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo / Avatar Partner Upload (Sesuai Gaya AddGalleryClient & Dicompress) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-[11px] font-semibold text-text-secondary">
                Logo / Avatar Partner
              </label>
              <span className="text-[10px] text-text-muted">(Opsional)</span>
            </div>

            {logoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-border-default aspect-video max-w-md bg-bg-card flex items-center justify-center p-4">
                <img
                  src={logoPreview}
                  alt="Preview Logo"
                  className="w-full h-full object-contain"
                />
                {isCompressingLogo && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                  title="Hapus logo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border-default bg-bg-well/40 hover:bg-bg-well/70 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all max-w-md relative">
                {isCompressingLogo ? (
                  <div className="flex flex-col items-center justify-center py-2 text-text-muted">
                    <Loader2 className="w-8 h-8 animate-spin text-text-primary mb-1" />
                    <p className="text-xs font-bold text-text-primary">Mengompresi Logo...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-text-muted" />
                    <p className="text-xs font-bold text-text-primary text-center">
                      Pilih Logo / Gambar Partner
                    </p>
                    <p className="text-[10px] text-text-muted text-center">
                      Mendukung PNG, JPG, WEBP (Otomatis Dicompress High Quality)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={isCompressingLogo}
                />
              </label>
            )}
          </div>

          {/* Detail Profil Partner: Kategori & Nama Utama (Block ke Bawah) */}
          <div className="space-y-4">
            {/* Kategori / Tipe (Urutan Pertama) */}
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Kategori Partner <span className="text-red-500">*</span>
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full sm:w-72 h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium">
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

            {/* Nama Partner (Urutan Kedua - Dinamis dengan Opsi Venue jika kategori Kafe / Venue) */}
            <div
              className={type === "kafe" ? "relative" : ""}
              ref={venueContainerRef}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="block text-[11px] font-semibold text-text-secondary">
                  Nama Partner {type === "kafe" ? "/ Tempat / Venue" : ""} <span className="text-red-500">*</span>
                </label>

                {/* Status Badge Saat Kategori Kafe */}
                {type === "kafe" && (
                  <>
                    {matchedVenue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold select-none">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>Dari Tabel Venue</span>
                      </span>
                    ) : name.trim() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold select-none">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Input Baru (Auto-Save ke Venue)</span>
                      </span>
                    ) : null}
                  </>
                )}
              </div>

              <div className="relative flex items-center">
                {type === "kafe" && (
                  <Building2 className="absolute left-3.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                )}
                <input
                  type="text"
                  required
                  value={name}
                  onFocus={() => {
                    if (type === "kafe") setIsVenueDropdownOpen(true);
                  }}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (type === "kafe") setIsVenueDropdownOpen(true);
                  }}
                  placeholder={
                    type === "kafe"
                      ? "Ketik nama tempat/kafe baru atau pilih dari daftar venue..."
                      : "Contoh: Nama Perusahaan / Komunitas / Kampus"
                  }
                  className={`w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors ${type === "kafe" ? "pl-9 pr-14" : ""
                    }`}
                />
                {type === "kafe" && (
                  <div className="absolute right-2.5 flex items-center gap-1">
                    {name && (
                      <button
                        type="button"
                        onClick={() => {
                          setName("");
                          setIsVenueDropdownOpen(true);
                        }}
                        className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                        title="Bersihkan"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsVenueDropdownOpen(!isVenueDropdownOpen)}
                      className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                      title="Lihat pilihan venue"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isVenueDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Suggestions / Options Dropdown untuk Venue */}
              {type === "kafe" && isVenueDropdownOpen && (
                <div className="absolute left-0 right-0 top-[62px] z-50 bg-white dark:bg-[#18181b] border border-border-default rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-border-default/50 bg-bg-well/50 flex items-center justify-between text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    <span>Pilihan dari Tabel Venue ({filteredVenues.length} Tersedia)</span>
                    <span className="text-[9px] text-text-secondary">Pilih atau Ketik Manual</span>
                  </div>

                  <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                    {filteredVenues.map((v) => {
                      const isSelected = name.trim().toLowerCase() === v.name.trim().toLowerCase();
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVenue(v)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer group ${isSelected
                            ? "bg-bg-well font-bold text-text-primary"
                            : "text-text-secondary hover:bg-bg-well hover:text-text-primary"
                            }`}
                        >
                          <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-text-muted group-hover:text-text-primary transition-colors" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary truncate">
                                {v.name}
                              </span>
                              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                Venue
                              </span>
                              {v.city && (
                                <span className="text-[10px] text-text-muted">
                                  • {v.city}
                                </span>
                              )}
                            </div>
                            {v.address && (
                              <p className="text-[11px] text-text-muted truncate mt-0.5">
                                {v.address}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}

                    {filteredVenues.length === 0 && !name.trim() && (
                      <div className="px-3 py-4 text-center text-xs text-text-muted">
                        Belum ada venue terdaftar di tabel venue.
                      </div>
                    )}

                    {/* Custom input prompt jika tidak ditemukan atau mengetik baru */}
                    {name.trim() && !matchedVenue && (
                      <button
                        type="button"
                        onClick={() => setIsVenueDropdownOpen(false)}
                        className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-text-primary transition-colors cursor-pointer mt-1"
                      >
                        <Plus className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-amber-700 dark:text-amber-300">
                            Gunakan input manual: &quot;{name}&quot;
                          </p>
                          <p className="text-[10px] text-text-muted font-mono mt-0.5">
                            ✓ Otomatis tersimpan ke tabel venue saat partner disimpan
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ COLLAPSIBLE / ACCORDION: DETAIL & INFORMASI TAMBAHAN (OPSIONAL) ═══ */}
          <div className="rounded-2xl border border-border-default/80 overflow-hidden bg-bg-well/20 transition-colors">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-bg-well/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-bg-well border border-border-default/60 flex items-center justify-center text-text-muted group-hover:text-text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Informasi Tambahan & Kontak
                    </span>
                    {hasActiveDetails ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {filledCount} Terisi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-text-muted bg-bg-well border border-border-default/60">
                        Opsional
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Deskripsi kemitraan, nomor WhatsApp, Instagram & website
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-default/60 bg-bg-card text-[11px] text-text-secondary font-medium group-hover:text-text-primary group-hover:border-border-default transition-all">
                <span>{isDetailsOpen ? "Sembunyikan" : "Lengkapi Detail"}</span>
                {isDetailsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
                )}
              </div>
            </button>

            {isDetailsOpen && (
              <div className="p-4 sm:p-5 pt-3 border-t border-border-default/60 space-y-5 animate-in fade-in-50 duration-150">
                {/* 1. Deskripsi & Catatan */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-text-muted" />
                      <span>Deskripsi & Catatan Kemitraan</span>
                    </label>
                    <span className="text-[10px] text-text-muted">Opsional</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bidang usaha, bentuk kolaborasi, benefit sponsor, fasilitas venue..."
                    rows={3}
                    className="w-full p-3.5 text-xs rounded-xl border border-border-default bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary leading-relaxed"
                  />
                  <p className="text-[10px] text-text-muted">
                    Ditampilkan pada ringkasan detail partner dan arsip profil kolaborasi.
                  </p>
                </div>

                {/* 3. Kontak & Kanal Sosial */}
                <div className="space-y-3 pt-2 border-t border-border-default/50">
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                    Kontak & Tautan Sosial
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact Person */}
                    <div>
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                        <span>Nama Contact Person</span>
                      </label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Contoh: Rian Pratama"
                        className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
                      />
                    </div>

                    {/* WA */}
                    <div>
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-text-muted" />
                        <span>Nomor WhatsApp</span>
                      </label>
                      <input
                        type="text"
                        value={contactWa}
                        onChange={(e) => setContactWa(formatPhone(e.target.value))}
                        placeholder="0812-3456-7890"
                        className="w-full h-10 px-3.5 text-xs font-medium font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                        <InstagramIcon size={14} className="text-text-muted" />
                        <span>Akun Instagram</span>
                      </label>
                      <input
                        type="text"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        onBlur={() => setInstagramUrl(formatInstagram(instagramUrl))}
                        placeholder="@partner.official"
                        className="w-full h-10 px-3.5 text-xs font-medium font-mono rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-text-muted" />
                        <span>Tautan Website</span>
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://partner.co.id"
                        className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
