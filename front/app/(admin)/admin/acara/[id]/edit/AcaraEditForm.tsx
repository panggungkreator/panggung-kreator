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
  Pencil
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { Button } from "@/components/ui/Button";
import { updateEventAction } from "@/lib/actions/event-actions";

interface VenueItem {
  id: string;
  name: string;
  address: string;
  city?: string;
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

interface AcaraEditFormProps {
  event: EventData;
  venues: VenueItem[];
}

export default function AcaraEditForm({ event, venues }: AcaraEditFormProps) {
  const router = useRouter();

  // Form states initialized with existing event data
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [eventType, setEventType] = useState(event.event_type || "open_mic");
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

  // Dynamic Venue Combobox states
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const [venueList, setVenueList] = useState<VenueItem[]>(venues || []);
  const venueContainerRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle clicking outside the venue dropdown
  useEffect(() => {
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

    if (!title.trim() || !eventType || !eventDate || !startTime || !location.trim()) {
      setError("Mohon lengkapi semua kolom yang ditandai bintang (*).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateEventAction(event.id, {
        title: title.trim(),
        description: description.trim(),
        event_type: eventType,
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

      toast.success("Perubahan acara berhasil disimpan!");
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
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-1 sm:p-8 text-text-primary bg-transparent sm:bg-card">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/acara/${event.id}`}
              className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
                [ EDIT ACARA KOMUNITAS ]
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mt-0.5">
                Ubah Data Acara
              </h1>
            </div>
          </div>

          <div>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Pencil className="w-2.5 h-2.5" />
              EDIT
            </span>
          </div>
        </div>

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
            {/* Event Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Tipe Acara *
              </label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-full h-10 rounded-xl px-3.5 text-xs font-medium bg-bg-well/50 border-border-default">
                  <SelectValue placeholder="Pilih Tipe Acara" />
                </SelectTrigger>
                <SelectContent className="bg-bg-card border-border-default">
                  <SelectItem value="open_mic">Open Mic</SelectItem>
                  <SelectItem value="speech_practice">Speech Practice</SelectItem>
                  <SelectItem value="mc_practice">MC Practice</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="content_class">Content Class</SelectItem>
                  <SelectItem value="mentoring">Mentoring</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
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
                  <Sparkles className="w-3 h-3 shrink-0" />
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
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isVenueDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Suggestions / Options Dropdown */}
              {isVenueDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 z-50 bg-bg-card border border-border-default/85 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-border-default/50 bg-bg-well/40 flex items-center justify-between text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    <span>Opsi Pilihan Venue</span>
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
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                            isSelected
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

            {/* Quick Venue Pill Chips */}
            {venueList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-text-muted mr-1">
                  Pilihan cepat:
                </span>
                {venueList.slice(0, 5).map((v) => (
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

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-default/60">
            <Link
              href={`/admin/acara/${event.id}`}
              className="px-5 py-2.5 rounded-full border border-border-default text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
