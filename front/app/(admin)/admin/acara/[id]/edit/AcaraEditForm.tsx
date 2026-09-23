"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ChevronDown,
  Check,
  Plus,
  X,
  Building2,
  Sparkles,
  Pencil,
  Tag,
  VectorSquare,
  Bookmark,
  ImageIcon,
  Upload,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { updateEventAction, EventTypeItem } from "@/lib/actions/event-actions";
import { saveGalleryAlbumAction } from "@/lib/actions/gallery-actions";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";

interface VenueItem {
  id: string;
  name: string;
  address: string;
  city?: string;
  use_count?: number;
  last_used_at?: string;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  capacity?: number;
  is_published: boolean;
}

interface GalleryAlbumData {
  id: string;
  hero_image_url?: string | null;
  album_link?: string | null;
  description?: string | null;
  is_published?: boolean;
}

interface AcaraEditFormProps {
  event: EventData;
  venues: VenueItem[];
  initialEventTypes?: EventTypeItem[];
  initialGalleryAlbum?: GalleryAlbumData | null;
}

export default function AcaraEditForm({
  event,
  venues,
  initialEventTypes = [],
  initialGalleryAlbum,
}: AcaraEditFormProps) {
  const router = useRouter();

  // Helper to format default event type name
  const defaultTypeName = useMemo(() => {
    const found = initialEventTypes.find(
      (t) => t.value === event.event_type || t.name.toLowerCase() === event.event_type.toLowerCase()
    );
    if (found) return found.name;
    return event.event_type
      ? event.event_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Open Mic";
  }, [event.event_type, initialEventTypes]);

  // Form states initialized with existing event data
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [eventType, setEventType] = useState(defaultTypeName);
  const [eventDate, setEventDate] = useState(event.event_date || "");
  const [startTime, setStartTime] = useState(
    event.start_time ? event.start_time.slice(0, 5) : ""
  );
  const [endTime, setEndTime] = useState(
    event.end_time ? event.end_time.slice(0, 5) : "selesai"
  );
  const [location, setLocation] = useState(event.location || "");
  const [capacity, setCapacity] = useState(event.capacity || 50);
  const [isPublished, setIsPublished] = useState(event.is_published ?? true);

  // Gallery Form States
  const [initialHeroImageUrl] = useState(initialGalleryAlbum?.hero_image_url || "");
  const [galleryHeroImageFile, setGalleryHeroImageFile] = useState<File | null>(null);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState(initialGalleryAlbum?.hero_image_url || "");
  const [galleryDriveLink, setGalleryDriveLink] = useState(initialGalleryAlbum?.album_link || "");
  const [isGalleryPublished, setIsGalleryPublished] = useState(
    initialGalleryAlbum ? (initialGalleryAlbum.is_published ?? false) : false
  );

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diizinkan!");
        return;
      }
      setGalleryHeroImageFile(file);
      setGalleryPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveGalleryImage = () => {
    setGalleryHeroImageFile(null);
    setGalleryPreviewUrl("");
  };

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

  // Dynamic Venue Combobox states
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const [venueList, setVenueList] = useState<VenueItem[]>(venues || []);
  const venueContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Event Type Combobox states
  const [typeList, setTypeList] = useState<EventTypeItem[]>(initialEventTypes);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeContainerRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle clicking outside both dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        venueContainerRef.current &&
        !venueContainerRef.current.contains(e.target as Node)
      ) {
        setIsVenueDropdownOpen(false);
      }
      if (
        typeContainerRef.current &&
        !typeContainerRef.current.contains(e.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered event types matching query
  const filteredEventTypes = useMemo(() => {
    if (!eventType.trim()) return typeList;
    const q = eventType.toLowerCase().trim();
    return typeList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.value.toLowerCase().includes(q)
    );
  }, [eventType, typeList]);

  // Check if current eventType matches a known tag
  const matchedType = useMemo(() => {
    if (!eventType.trim()) return null;
    const q = eventType.toLowerCase().trim();
    return typeList.find(
      (t) =>
        t.value.toLowerCase() === q ||
        t.name.toLowerCase() === q
    );
  }, [eventType, typeList]);

  const handleSelectType = (item: EventTypeItem) => {
    setEventType(item.name);
    setIsTypeDropdownOpen(false);
  };

  // Filtered venues matching typed query
  const filteredVenues = useMemo(() => {
    if (!location.trim()) return venueList;
    const query = location.toLowerCase().trim();
    return venueList.filter((v) => {
      const vName = v.name.toLowerCase();
      const vAddress = (v.address || "").toLowerCase();
      return vName.includes(query) || (vAddress && vAddress !== vName && vAddress.includes(query));
    });
  }, [location, venueList]);

  // Check if current location exactly matches a known venue
  const matchedVenue = useMemo(() => {
    if (!location.trim()) return null;
    const query = location.toLowerCase().trim();
    return venueList.find((v) => {
      const vName = v.name.toLowerCase().trim();
      const vAddress = (v.address || "").toLowerCase().trim();
      const hasDistinctAddress = vAddress && vAddress !== vName;

      return (
        vName === query ||
        (hasDistinctAddress && `${vName} - ${vAddress}` === query) ||
        (hasDistinctAddress && `${vName}, ${vAddress}` === query) ||
        (hasDistinctAddress && vAddress === query)
      );
    });
  }, [location, venueList]);

  // Select an existing venue from dropdown
  const handleSelectVenue = (venue: VenueItem) => {
    const hasDistinctAddress =
      venue.address &&
      venue.address.trim().toLowerCase() !== venue.name.trim().toLowerCase();

    const formatted = hasDistinctAddress
      ? `${venue.name} - ${venue.address.trim()}`
      : venue.name;

    setLocation(formatted);
    setIsVenueDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !eventType.trim() || !eventDate || !startTime || !location.trim()) {
      setError("Mohon lengkapi semua kolom yang ditandai bintang (*).");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update Event
      const res = await updateEventAction(event.id, {
        title: title.trim(),
        description: description.trim(),
        event_type: eventType.trim(),
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime === "selesai" || !endTime ? null : endTime,
        location: location.trim(),
        capacity,
        is_published: isPublished,
      });

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan perubahan acara.");
      }

      // 2. Upload new gallery thumbnail if selected
      let finalHeroImageUrl = galleryPreviewUrl;
      const supabase = createClient();

      if (galleryHeroImageFile) {
        try {
          let compressedFile = await compressImage(galleryHeroImageFile);
          if (compressedFile.size > 2 * 1024 * 1024) {
            compressedFile = await compressImage(compressedFile, 1200, 1200, 0.6);
          }

          const fileExt = compressedFile.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("gallery")
            .upload(filePath, compressedFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: compressedFile.type || "image/jpeg",
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("gallery").getPublicUrl(filePath);

          finalHeroImageUrl = publicUrl;
        } catch (uploadErr: any) {
          console.error("Gallery image upload error:", uploadErr);
          throw new Error("Gagal mengunggah foto sampul galeri: " + (uploadErr.message || uploadErr));
        }
      } else if (!galleryPreviewUrl) {
        finalHeroImageUrl = "";
      }

      // 3. Save / update gallery album
      const cleanCategory =
        eventType
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "") || "lainnya";

      const galRes = await saveGalleryAlbumAction(
        {
          event_id: event.id,
          title: title.trim(),
          category: cleanCategory,
          event_date: eventDate,
          hero_image_url: finalHeroImageUrl.trim() || null,
          album_link: galleryDriveLink.trim() || null,
          description: description.trim() || null,
          is_published: isGalleryPublished,
        },
        initialGalleryAlbum?.id
      );

      if (!galRes.success) {
        console.warn("Notice: Gagal memperbarui galeri album:", galRes.error);
      }

      // 4. Clean up old image if replaced
      if (initialHeroImageUrl && initialHeroImageUrl !== finalHeroImageUrl) {
        const oldPath = getStoragePathFromUrl(initialHeroImageUrl, "gallery");
        if (oldPath) {
          await supabase.storage.from("gallery").remove([oldPath]);
        }
      }

      toast.success("Perubahan acara dan galeri berhasil disimpan!");
      router.push(`/admin/acara/${event.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Gagal update acara:", err);
      const msg = err.message || "Terjadi kesalahan saat menyimpan acara.";
      setError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER ═══ */}
      <div className="flex items-center justify-between border-b border-border-default/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/acara/${event.id}`}
            className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Detail Acara"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
              [ KOMUNITAS ]
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              Edit Acara Komunitas
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Perbarui jadwal panggung, kuota peserta, dan detail pertemuan.
            </p>
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono flex items-center gap-1">
            <Pencil className="w-2.5 h-2.5" />
            Mode: Edit
          </span>
        </div>
      </div>

      {/* ═══ FORM CONTAINER ═══ */}
      <div className="bg-transparent sm:bg-card border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-1 sm:p-8 shadow-none sm:shadow-xs">

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-secondary block">
              Nama / Judul Acara *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Open Mic Night Volume 10"
              className="flex h-10 w-full rounded-xl border border-border-default bg-bg-well/50 px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-secondary block">
              Deskripsi Acara
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail kegiatan, syarat peserta, dsb..."
              rows={3}
              className="flex w-full rounded-xl border border-border-default bg-bg-well/50 px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors font-medium leading-relaxed"
            />
          </div>

          {/* Event Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Dynamic Event Type Combobox */}
            <div className="space-y-1.5" ref={typeContainerRef}>
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-semibold text-text-secondary block">
                  Tipe Acara *
                </label>
                {matchedType ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold select-none animate-fade-in">
                    <Tag className="w-3 h-3 shrink-0" />
                    <span>Tag Terdaftar: {matchedType.name}</span>
                  </span>
                ) : eventType.trim() ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold select-none animate-fade-in">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>Tag Baru (Auto-Save)</span>
                  </span>
                ) : null}
              </div>

              <div className="relative">
                <div className="relative flex items-center">
                  <Tag className="absolute left-3.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={eventType}
                    onFocus={() => setIsTypeDropdownOpen(true)}
                    onChange={(e) => {
                      setEventType(e.target.value);
                      setIsTypeDropdownOpen(true);
                    }}
                    placeholder="Pilih atau ketik tag baru..."
                    className="flex h-10 w-full rounded-xl border border-border-default bg-bg-well/50 pl-9 pr-16 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors font-medium"
                    required
                  />
                  <div className="absolute right-2.5 flex items-center gap-1">
                    {eventType && (
                      <button
                        type="button"
                        onClick={() => {
                          setEventType("");
                          setIsTypeDropdownOpen(true);
                        }}
                        className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                        title="Bersihkan input"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                      title="Buka daftar tipe acara"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isTypeDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Suggestions / Options Dropdown */}
                {isTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-12 z-50 bg-bg-card border border-border-default/85 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-border-default/50 bg-bg-well/40 flex items-center justify-between text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      <span>Pilihan Tag Tipe Acara</span>
                      <span>{filteredEventTypes.length} Tag</span>
                    </div>

                    <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                      {filteredEventTypes.map((t) => {
                        const isSelected =
                          eventType.trim().toLowerCase() === t.name.toLowerCase() ||
                          eventType.trim().toLowerCase() === t.value.toLowerCase();

                        return (
                          <button
                            key={t.id || t.value}
                            type="button"
                            onClick={() => handleSelectType(t)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${isSelected
                              ? "bg-bg-well font-bold text-text-primary"
                              : "text-text-secondary hover:bg-bg-well hover:text-text-primary"
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${t.color || "bg-cyan-500"
                                  } shrink-0`}
                              />
                              <span>{t.name}</span>
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}

                      {/* Prompt to save new tag */}
                      {eventType.trim() && !matchedType && (
                        <button
                          type="button"
                          onClick={() => setIsTypeDropdownOpen(false)}
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-text-primary transition-colors cursor-pointer mt-1"
                        >
                          <Plus className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-amber-700 dark:text-amber-300">
                              Gunakan & Simpan sebagai Tag Baru
                            </p>
                            <p className="text-[11px] text-text-secondary mt-0.5 break-words">
                              &quot;{eventType}&quot;
                            </p>
                            <p className="text-[10px] text-text-muted font-mono mt-1">
                              ✓ Otomatis tersimpan ke daftar tag saat acara disimpan
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Tag Pills */}
              {typeList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-text-muted mr-1">
                    Pilihan cepat:
                  </span>
                  {typeList.slice(0, 5).map((t) => (
                    <button
                      key={t.id || t.value}
                      type="button"
                      onClick={() => handleSelectType(t)}
                      className="text-[11px] font-medium px-2.5 py-0.5 bg-bg-well/70 hover:bg-bg-well border border-border-default/70 hover:border-text-primary rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Tanggal Acara *
              </label>
              <DatePicker
                value={eventDate}
                onChange={setEventDate}
                placeholder="Pilih Tanggal"
                className="h-10 rounded-xl px-3.5 text-xs font-medium bg-bg-well/50 border-border-default"
              />
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Waktu Mulai *
              </label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                placeholder="Pilih Waktu Mulai"
                className="h-10 rounded-xl px-3.5 text-xs font-medium bg-bg-well/50 border-border-default"
              />
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Waktu Selesai *
              </label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                placeholder="Pilih Waktu Selesai"
                allowEmpty={true}
                emptyLabel="Sampai Selesai"
                className="h-10 rounded-xl px-3.5 text-xs font-medium bg-bg-well/50 border-border-default"
              />
            </div>
          </div>

          {/* Dynamic Location Area (Combobox) */}
          <div className="space-y-2" ref={venueContainerRef}>
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Lokasi / Alamat Lengkap *
              </label>

              {/* Status Badge */}
              {matchedVenue ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold select-none animate-fade-in">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span>Venue Terdaftar: {matchedVenue.name}</span>
                </span>
              ) : location.trim() ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold select-none animate-fade-in">
                  <Bookmark className="w-3 h-3 shrink-0" />
                  <span>Venue Baru (Auto-Save)</span>
                </span>
              ) : null}
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onFocus={() => setIsVenueDropdownOpen(true)}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setIsVenueDropdownOpen(true);
                  }}
                  placeholder="Ketik atau pilih nama venue/cafe/alamat..."
                  className="flex h-10 w-full rounded-xl border border-border-default bg-bg-well/50 pl-9 pr-16 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors font-medium"
                  required
                />
                <div className="absolute right-2.5 flex items-center gap-1">
                  {location && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocation("");
                        setIsVenueDropdownOpen(true);
                      }}
                      className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                      title="Bersihkan input"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsVenueDropdownOpen(!isVenueDropdownOpen)}
                    className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                    title="Buka daftar pilihan venue"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isVenueDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Suggestions / Options Dropdown */}
              {isVenueDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 z-50 bg-bg-card border border-border-default/85 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-border-default/50 bg-bg-well/40 flex items-center justify-between text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    <span>Opsi Pilihan Venue (Urutan Terbanyak Dipakai)</span>
                    <span>{filteredVenues.length} Terdaftar</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                    {filteredVenues.map((v) => {
                      const vName = v.name.trim();
                      const vAddress = (v.address || "").trim();
                      const hasDistinctAddress = vAddress && vAddress.toLowerCase() !== vName.toLowerCase();
                      const locLower = location.trim().toLowerCase();

                      const isSelected =
                        locLower === vName.toLowerCase() ||
                        (hasDistinctAddress && locLower === `${vName.toLowerCase()} - ${vAddress.toLowerCase()}`);

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
                                Terdaftar
                              </span>
                              {v.use_count && v.use_count > 0 ? (
                                <span className="text-[9px] font-mono text-text-muted">
                                  ({v.use_count}x dipakai)
                                </span>
                              ) : null}
                            </div>
                            {hasDistinctAddress && (
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

                    {/* New Venue Option Prompt */}
                    {location.trim() && !matchedVenue && (
                      <button
                        type="button"
                        onClick={() => setIsVenueDropdownOpen(false)}
                        className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-text-primary transition-colors cursor-pointer mt-1"
                      >
                        <Plus className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-amber-700 dark:text-amber-300">
                            Gunakan & Simpan sebagai Venue Baru
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5 break-words">
                            &quot;{location}&quot;
                          </p>
                          <p className="text-[10px] text-text-muted font-mono mt-1">
                            ✓ Otomatis tersimpan ke daftar venue saat formulir disimpan
                          </p>
                        </div>
                      </button>
                    )}

                    {filteredVenues.length === 0 && !location.trim() && (
                      <p className="text-center py-4 text-xs text-text-muted font-medium">
                        Belum ada venue terdaftar. Ketik nama tempat untuk membuat venue baru.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Venue Pill Chips - Limited to Maximum 6 Items */}
            {venueList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-text-muted mr-1">
                  Pilihan cepat:
                </span>
                {venueList.slice(0, 6).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVenue(v)}
                    className="text-[11px] font-medium px-2.5 py-0.5 bg-bg-well/70 hover:bg-bg-well border border-border-default/70 hover:border-text-primary rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Publish Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-text-secondary font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border-default bg-bg-well text-zinc-900 focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
              />
              <span>Publish acara langsung (Terlihat di web publik)</span>
            </label>
          </div>

          {/* ═══ SEKSI DOKUMENTASI & GALERI KEGIATAN ═══ */}
          <div id="galeri" className="pt-6 border-t border-border-default/60 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-bg-well text-text-primary border border-border-default/60 shrink-0">
                <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Dokumentasi & Galeri Kegiatan
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Foto sampul, tautan Google Drive, dan publikasi ke halaman galeri komunitas.
                </p>
              </div>
            </div>

            {/* Upload Foto Sampul */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-text-secondary">
                Foto Sampul / Banner Galeri
              </label>

              {galleryPreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-border-default aspect-video max-w-md bg-bg-well">
                  <img src={galleryPreviewUrl} alt="Preview Sampul" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveGalleryImage}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    title="Hapus Foto"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border-default bg-bg-well/40 hover:bg-bg-well/70 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all max-w-md">
                  <ImageIcon className="w-8 h-8 text-text-muted" />
                  <p className="text-xs font-bold text-text-primary">
                    Pilih Foto Sampul Dokumentasi
                  </p>
                  <p className="text-[10px] text-text-muted">Maksimal 5MB (JPG, PNG, WEBP)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Link Google Drive */}
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Tautan Google Drive (Folder Dokumentasi Lengkap)
              </label>
              <input
                type="url"
                value={galleryDriveLink}
                onChange={(e) => setGalleryDriveLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-all"
              />
            </div>

            {/* Checklist Publikasi Galeri (Sesuai Permintaan Gambar User) */}
            <div className="pt-2 border-t border-border-default/40">
              <label className="flex items-center gap-2.5 text-xs text-text-primary font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGalleryPublished}
                  onChange={(e) => setIsGalleryPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-border-default bg-bg-well text-blue-600 focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span>Publikasikan album ini langsung ke halaman Galeri Komunitas</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border-default/60">
            <Link href={`/admin/acara/${event.id}`} className="flex-1 sm:flex-initial">
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
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
