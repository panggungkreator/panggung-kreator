"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  checkAttendanceStatusAction,
  recordAttendanceAction,
} from "@/lib/actions/attendance-actions";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import Header from "@/components/community/Header";
import Footer from "@/components/community/Footer";

interface AbsensiPageProps {
  params: Promise<{ eventId: string }>;
}

export default function AbsensiPage({ params }: AbsensiPageProps) {
  const router = useRouter();
  const { eventId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyAttended, setIsAlreadyAttended] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function initCheck() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await checkAttendanceStatusAction(eventId);

        if (!result.authenticated) {
          // Redirect ke halaman login dengan param redirectTo
          const redirectTarget = `/absensi/${eventId}`;
          router.push(`/login?redirectTo=${encodeURIComponent(redirectTarget)}`);
          return;
        }

        if (result.error) {
          setErrorMessage(result.error);
          setIsLoading(false);
          return;
        }

        setEventData(result.event);
        setMemberData(result.member);
        setIsAlreadyAttended(result.isAttended);
      } catch (err: any) {
        console.error("Error checking attendance:", err);
        setErrorMessage("Gagal memuat informasi presensi acara.");
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      initCheck();
    }
  }, [eventId, router]);

  const handleClaimAttendance = async () => {
    if (isSubmitting || isAlreadyAttended) return;

    setIsSubmitting(true);
    try {
      const res = await recordAttendanceAction(eventId);

      if (res.success) {
        setIsSuccess(true);
        if (res.alreadyAttended) {
          setIsAlreadyAttended(true);
          toast.info(res.message);
        } else {
          toast.success(res.message || "Presensi berhasil dicatat! Email konfirmasi telah dikirim.");
        }

        // Redirect otomatis ke /myprofile setelah 2 detik
        setTimeout(() => {
          router.push("/myprofile");
        }, 2200);
      } else {
        toast.error(res.error || "Gagal mencatat presensi.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Submit attendance error:", err);
      toast.error("Terjadi kesalahan jaringan.");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3 pt-28">
          <Loader2 className="animate-spin h-8 w-8 text-neutral-900 dark:text-white" />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            Memverifikasi Sesi Presensi...
          </span>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMessage || !eventData) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans">
        <Header />
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center items-center p-6 text-center pt-28">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-none space-y-4 w-full">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />
            <h2 className="text-base font-bold font-sans">Presensi Tidak Tersedia</h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans">
              {errorMessage || "Acara tidak ditemukan atau presensi sudah tidak aktif."}
            </p>
            <Link
              href="/myprofile"
              className="inline-block py-2.5 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Kembali ke Profil
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between">
      <Header />

      <main className="max-w-xl w-full mx-auto pt-28 pb-16 px-4 sm:px-6 flex-1 flex flex-col justify-center">
        {/* HASIL / STATUS VERIFIKASI PRESENSI GANDA */}
        {isAlreadyAttended || isSuccess ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6 animate-fade-in rounded-none shadow-sm text-center">
            {/* ICON CHECK BADGE */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-bold">
                [ PRESENSI SELESAI ]
              </span>
              <h1 className="font-serif text-xl sm:text-2xl text-neutral-900 dark:text-white font-normal leading-snug">
                Anda sudah absen pada acara{" "}
                <span className="highlight-stabilo font-semibold">{eventData.title}</span>
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans max-w-md mx-auto pt-1">
                {isSuccess
                  ? "Presensi Anda telah berhasil dikonfirmasi dan email bukti kehadiran telah dikirimkan."
                  : "Catatan kehadiran Anda untuk acara ini sudah tersimpan dengan aman di database."}
              </p>
            </div>

            {/* EVENT DETAIL SUMMARY CARD */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>{formatDate(eventData.event_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>
                  {eventData.start_time || "-"} - {eventData.end_time || "Selesai"} WIB
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>{eventData.location || "Venue Komunitas"}</span>
              </div>
            </div>

            {/* ACTION BUTTON TO MYPROFILE */}
            <div className="pt-2">
              <Link
                href="/myprofile"
                className="w-full py-3 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold border border-neutral-900 dark:border-white"
              >
                <span>Kembali ke myprofile</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* TAMPILAN BELUM ABSEN (DETAIL ACARA + TOMBOL ABSEN) */
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6 animate-fade-in rounded-none shadow-sm">
            {/* HEADER BADGE */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                [ PRESENSI EVENT KOMUNITAS ]
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
                <Sparkles size={12} /> SCAN VALID
              </span>
            </div>

            {/* EVENT TITLE & DESCRIPTION */}
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-white font-normal leading-snug">
                <span className="highlight-stabilo font-semibold">{eventData.title}</span>
              </h1>
              {eventData.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans pt-1">
                  {eventData.description}
                </p>
              )}
            </div>

            {/* EVENT METADATA LIST */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800 space-y-2.5 text-xs font-sans">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block">
                    TANGGAL ACARA
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {formatDate(eventData.event_date)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block">
                    WAKTU PELAKSANAAN
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {eventData.start_time || "-"} - {eventData.end_time || "Selesai"} WIB
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block">
                    LOKASI VENUE
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {eventData.location || "Venue Komunitas"}
                  </span>
                </div>
              </div>
            </div>

            {/* MEMBER IDENTITY INFO */}
            {memberData && (
              <div className="p-3 bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <UserCheck size={14} className="text-neutral-500" />
                  <span>
                    AKUN: <strong>{memberData.stage_name || memberData.full_name}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {memberData.email}
                </span>
              </div>
            )}

            {/* MAIN ACTION BUTTON */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleClaimAttendance}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold border border-neutral-900 dark:border-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Mencatat Presensi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Absen Sekarang</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono text-center">
                *Mengklik tombol di atas akan mengonfirmasi kehadiran Anda & mengirimkan email bukti absensi.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
