"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Loader,
  AlertCircle,
  ChevronDown,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { Button } from "@/components/ui/Button";

interface VenueItem {
  id: string;
  name: string;
  address: string;
}

interface AcaraCreateFormProps {
  venues: VenueItem[];
}

export default function AcaraCreateForm({ venues }: AcaraCreateFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("open_mic");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [isPublished, setIsPublished] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Helper to handle auto-populating location when selecting a venue
  const handleSelectVenue = (venueName: string, venueAddress: string) => {
    if (venueName) {
      setLocation(`${venueName} - ${venueAddress}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !eventType || !eventDate || !startTime || !location) {
      setError("Mohon lengkapi semua kolom yang ditandai bintang (*).");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi pengguna tidak ditemukan.");

      const { error: insertError } = await supabase
        .from("events")
        .insert({
          title,
          description,
          event_type: eventType,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime === "selesai" || !endTime ? null : endTime,
          location,
          is_published: isPublished,
          created_by: user.id
        });

      if (insertError) throw new Error(insertError.message);

      toast.success("Acara baru berhasil dibuat!");
      router.push("/admin/acara");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Terjadi kesalahan.";
      setError("Gagal menyimpan acara: " + msg);
      toast.error("Gagal membuat acara: " + msg);
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
              href="/admin/acara"
              className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
                [ ACARA KOMUNITAS ]
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mt-0.5">
                Buat Acara Baru
              </h1>
            </div>
          </div>

          <div>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              BARU
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">

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

          {/* Location Area */}
          <div className="space-y-2.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary block">
                Lokasi / Alamat Lengkap *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tulis nama cafe, jalan, gedung..."
                className="flex h-10 w-full rounded-xl border border-border-default bg-bg-well/50 px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors font-medium"
                required
              />
            </div>

            {/* Auto Populate Location helper from Venue options */}
            {venues.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-text-muted block">
                  Atau pilih dari venue terdaftar:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {venues.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVenue(v.name, v.address)}
                      className="text-[11px] font-medium px-3 py-1 bg-bg-well/70 border border-border-default/70 hover:border-text-primary rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-2.5 py-1 select-none">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-zinc-900 rounded border-border-default cursor-pointer accent-zinc-900 dark:accent-yellow-400"
            />
            <label
              htmlFor="is_published"
              className="text-xs font-medium text-text-primary cursor-pointer"
            >
              Publish acara langsung (Terlihat di web publik)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border-default/60">
            <Link href="/admin/acara" className="flex-1">
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full h-10 text-xs font-semibold rounded-xl border border-border-default bg-bg-well/50 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>

  );
}
