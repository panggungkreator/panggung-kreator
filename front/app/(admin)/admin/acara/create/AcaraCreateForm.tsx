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
    <div className="min-h-screen bg-card py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card border border-border-primary rounded-3xl p-6 sm:p-8 text-text-primary">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-primary pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/acara"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest font-title">
                BUAT ACARA BARU
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Silakan isi data acara komunitas di bawah ini secara lengkap.
              </p>
            </div>
          </div>

          <div>
            <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/10 font-bold">
              BARU
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Nama / Judul Acara *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Open Mic Night Volume 10"
              className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Deskripsi Acara
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail kegiatan, syarat peserta, dsb..."
              rows={4}
              className="flex w-full rounded-md border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
            />
          </div>

          {/* Event Type & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Event Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Tipe Acara *
              </label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-full h-[50px] border-zinc-400 dark:border-zinc-800">
                  <SelectValue placeholder="Pilih Tipe Acara" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Tanggal Acara *
              </label>
              <DatePicker
                value={eventDate}
                onChange={setEventDate}
                placeholder="Pilih Tanggal"
              />
            </div>

            {/* Capacity */}
            {/* <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Kapasitas Peserta (Orang)
              </label>
              <input
                type="number"
                min={0}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
              />
              <p className="text-[9px] text-text-muted mt-0.5">Isi 0 jika kapasitas tidak terbatas (unlimited)</p>
            </div> */}

          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Waktu Mulai *
              </label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                placeholder="Pilih Waktu Mulai"
              />
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Waktu Selesai *
              </label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                placeholder="Pilih Waktu Selesai"
                allowEmpty={true}
                emptyLabel="Sampai Selesai"
              />
            </div>

          </div>

          {/* Location Area */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Lokasi / Alamat Lengkap *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tulis nama cafe, jalan, gedung..."
                className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-medium"
                required
              />
            </div>

            {/* Auto Populate Location helper from Venue options */}
            {venues.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest block">
                  Atau pilih dari Venue terdaftar:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {venues.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVenue(v.name, v.address)}
                      className="text-[10px] font-bold px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-650 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-colors cursor-pointer"
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-2 py-1 select-none">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4.5 h-4.5 text-zinc-900 border-zinc-300 rounded focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="is_published"
              className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest cursor-pointer"
            >
              Publish Acara langsung (Terlihat di web publik)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-zinc-400 dark:border-zinc-800">
            <Link href="/admin/acara" className="flex-1">
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
