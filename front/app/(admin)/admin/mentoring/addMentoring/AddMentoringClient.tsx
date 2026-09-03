"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveMentoringSessionAction } from "@/lib/actions/mentoring-actions";
import { toast } from "sonner";

interface MentoringSession {
  id: string;
  member_id: string;
  mentor_id: string;
  package_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  platform: string;
  meeting_link: string;
  location: string;
  status: string;
  session_number: number;
  notes: string;
  member_notes: string;
  created_at: string;
  member_name?: string;
  mentor_name?: string;
  package_name?: string;
}

interface MemberItem {
  id: string;
  full_name: string;
}

interface MentorItem {
  id: string;
  full_name: string;
}

interface PackageItem {
  id: string;
  name: string;
}

interface AddMentoringClientProps {
  initialSession: MentoringSession | null;
  members: MemberItem[];
  mentors: MentorItem[];
  packages: PackageItem[];
}

export default function AddMentoringClient({
  initialSession,
  members,
  mentors,
  packages,
}: AddMentoringClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states (Pre-populate if editing)
  const [memberId, setMemberId] = useState(initialSession?.member_id || "");
  const [mentorId, setMentorId] = useState(initialSession?.mentor_id || "");
  const [packageId, setPackageId] = useState(initialSession?.package_id || "");
  const [sessionDate, setSessionDate] = useState(initialSession?.session_date || "");
  const [startTime, setStartTime] = useState(initialSession?.start_time || "");
  const [endTime, setEndTime] = useState(initialSession?.end_time || "");
  const [platform, setPlatform] = useState(initialSession?.platform || "zoom");
  const [meetingLink, setMeetingLink] = useState(initialSession?.meeting_link || "");
  const [location, setLocation] = useState(initialSession?.location || "");
  const [sessionNumber, setSessionNumber] = useState(initialSession?.session_number || 1);
  const [notes, setNotes] = useState(initialSession?.notes || "");
  const [status, setStatus] = useState(initialSession?.status || "scheduled");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!memberId || !mentorId || !packageId || !sessionDate || !startTime || !endTime) {
      setFormError("Mohon lengkapi semua kolom wajib bertanda bintang (*).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        member_id: memberId,
        mentor_id: mentorId,
        package_id: packageId,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        platform,
        meeting_link: platform !== "offline" ? meetingLink : "",
        location: platform === "offline" ? location : "",
        session_number: sessionNumber,
        notes,
        status,
      };

      const res = await saveMentoringSessionAction(payload, initialSession?.id);

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan data.");
      }

      toast.success(
        initialSession?.id
          ? "Sesi mentoring berhasil diperbarui!"
          : "Sesi mentoring baru berhasil dijadwalkan!"
      );
      router.push("/admin/mentoring");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Terjadi kesalahan saat menyimpan.");
      toast.error("Gagal menyimpan: " + (err.message || err));
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
            href="/admin/mentoring"
            className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Daftar Mentoring"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
              [ AKADEMI ]
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {initialSession ? "Edit Sesi Mentoring" : "Buat Sesi Mentoring Baru"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Silakan lengkapi jadwal dan informasi sesi bimbingan 1-on-1 di bawah ini.
            </p>
          </div>
        </div>

        <div>
          {initialSession ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Mode: Edit
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Mode: Baru
            </span>
          )}
        </div>
      </div>

      {/* ═══ FORM CONTAINER ═══ */}
      <div className="bg-white dark:bg-[#121212] border-0 sm:border border-border-default/70 rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Member Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Pilih Member <span className="text-red-500">*</span>
              </label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium" disabled={!!initialSession}>
                  <SelectValue placeholder="-- Pilih Member --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mentor Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Pilih Mentor <span className="text-red-500">*</span>
              </label>
              <Select value={mentorId} onValueChange={setMentorId}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium" disabled={!!initialSession}>
                  <SelectValue placeholder="-- Pilih Mentor --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {mentors.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Paket Akademi Terkait <span className="text-red-500">*</span>
              </label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium" disabled={!!initialSession}>
                  <SelectValue placeholder="-- Pilih Paket --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {packages.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Selection (only visible when editing) */}
            {initialSession ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  Status Sesi <span className="text-red-500">*</span>
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full h-10 rounded-xl border-border-default bg-bg-well/50 text-xs font-medium">
                    <SelectValue placeholder="Status Sesi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="scheduled" className="text-xs">Scheduled (Diterbitkan)</SelectItem>
                    <SelectItem value="completed" className="text-xs">Completed (Selesai)</SelectItem>
                    <SelectItem value="rescheduled" className="text-xs">Rescheduled (Dijadwal Ulang)</SelectItem>
                    <SelectItem value="cancelled" className="text-xs">Cancelled (Dibatalkan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  Sesi Ke-
                </label>
                <input
                  type="number"
                  min={1}
                  value={sessionNumber}
                  onChange={(e) => setSessionNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
                />
              </div>
            )}

            {/* Session Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Tanggal Sesi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  Jam Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  Jam Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs font-bold rounded-xl border border-border-default bg-bg-well/50 text-text-primary focus:outline-none focus:border-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Platform Choice */}
          <div className="space-y-2 pt-2 border-t border-border-default/40">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Media / Platform Pertemuan
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  checked={platform === "zoom"}
                  onChange={() => setPlatform("zoom")}
                  className="w-4 h-4 text-text-primary border-border-default focus:ring-0 cursor-pointer"
                />
                Zoom
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  checked={platform === "gmeet"}
                  onChange={() => setPlatform("gmeet")}
                  className="w-4 h-4 text-text-primary border-border-default focus:ring-0 cursor-pointer"
                />
                Google Meet
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  checked={platform === "offline"}
                  onChange={() => setPlatform("offline")}
                  className="w-4 h-4 text-text-primary border-border-default focus:ring-0 cursor-pointer"
                />
                Offline (Tatap Muka)
              </label>
            </div>
          </div>

          {/* Dynamic Link / Location Area */}
          {platform === "offline" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Lokasi Pertemuan Offline
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Kafe Panggung, Jakarta Selatan"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                Meeting Link / URL Video Conference
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary"
              />
            </div>
          )}

          {/* Catatan Admin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Catatan Mentor / Agenda Sesi
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan agenda pembahasan, topik review portofolio, atau persiapan..."
              rows={3}
              className="w-full p-3.5 text-xs rounded-xl border border-border-default bg-bg-well/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary leading-relaxed"
            />
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
            <Link href="/admin/mentoring" className="flex-1 sm:flex-initial">
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
                <span>{initialSession ? "Simpan Perubahan" : "Jadwalkan Sesi"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
