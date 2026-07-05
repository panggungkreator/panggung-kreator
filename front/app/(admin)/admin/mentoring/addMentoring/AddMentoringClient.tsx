"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
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
  packages
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
      setFormError("Mohon lengkapi semua kolom wajib.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const sessionData = {
        member_id: memberId,
        mentor_id: mentorId,
        package_id: packageId,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        platform: platform,
        meeting_link: platform !== "offline" ? meetingLink : "",
        location: platform === "offline" ? location : "",
        session_number: sessionNumber,
        notes: notes,
        status: status
      };

      if (initialSession?.id) {
        // UPDATE
        const { error } = await supabase
          .from("mentoring_sessions")
          .update(sessionData)
          .eq("id", initialSession.id);

        if (error) throw new Error(error.message);
      } else {
        // INSERT
        const { error } = await supabase
          .from("mentoring_sessions")
          .insert([sessionData]);

        if (error) throw new Error(error.message);
      }

      toast.success(
        initialSession?.id
          ? "Sesi mentoring berhasil diperbarui!"
          : "Sesi mentoring baru berhasil ditambahkan!"
      );
      router.push("/admin/mentoring");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setFormError("Gagal menyimpan: " + err.message);
      toast.error("Gagal menyimpan sesi mentoring: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/mentoring"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest font-title">
                {initialSession ? "EDIT JADWAL SESI MENTORING" : "BUAT JADWAL SESI MENTORING"}
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Silakan isi data sesi mentoring secara lengkap di bawah ini.
              </p>
            </div>
          </div>

          {/* Mode Indicator Badge */}
          <div>
            {initialSession ? (
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/10 font-bold">
                MODE: EDIT DATA
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/10 font-bold">
                MODE: TAMBAH BARU
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Member Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Pilih Member *
              </label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className="w-full h-[50px] border-zinc-400" disabled={!!initialSession}>
                  <SelectValue placeholder="-- Cari Member --" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mentor Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Pilih Mentor *
              </label>
              <Select value={mentorId} onValueChange={setMentorId}>
                <SelectTrigger className="w-full h-[50px] border-zinc-400" disabled={!!initialSession}>
                  <SelectValue placeholder="-- Cari Mentor --" />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Pilih Paket Akademi *
              </label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger className="w-full h-[50px] border-zinc-400" disabled={!!initialSession}>
                  <SelectValue placeholder="-- Pilih Paket --" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Selection (only visible when editing) */}
            {initialSession && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                  Status Sesi *
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full h-[50px] border-zinc-400">
                    <SelectValue placeholder="Status Sesi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled (Diterbitkan)</SelectItem>
                    <SelectItem value="completed">Completed (Selesai)</SelectItem>
                    <SelectItem value="cancelled">Cancelled (Dibatalkan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Session Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Tanggal Sesi *
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Jam Mulai *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
              />
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Jam Selesai *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-bold"
              />
            </div>

          </div>

          {/* Platform Choice */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Media / Platform Sesi
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  checked={platform === "zoom"}
                  onChange={() => setPlatform("zoom")}
                  className="w-4 h-4 text-text-primary border-zinc-400 focus:ring-0 cursor-pointer"
                />
                Zoom
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  checked={platform === "gmeet"}
                  onChange={() => setPlatform("gmeet")}
                  className="w-4 h-4 text-text-primary border-zinc-400 focus:ring-0 cursor-pointer"
                />
                Google Meet
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  checked={platform === "offline"}
                  onChange={() => setPlatform("offline")}
                  className="w-4 h-4 text-text-primary border-zinc-400 focus:ring-0 cursor-pointer"
                />
                Offline
              </label>
            </div>
          </div>

          {/* Dynamic Link / Location Area */}
          {platform === "offline" ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Lokasi Pertemuan
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Kafe Panggung, Jakarta"
                className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                Meeting Link / URL Sesi
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="flex h-12 w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
              />
            </div>
          )}

          {/* Catatan Admin */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Catatan Admin (Notes)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruksi atau catatan persiapan untuk mentor/member..."
              rows={4}
              className="flex w-full rounded-xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all font-semibold"
            />
          </div>

          {/* Error Message */}
          {formError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-zinc-400 dark:border-zinc-800">
            <Link href="/admin/mentoring" className="flex-1">
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

      </div >
    </div >
  );
}
