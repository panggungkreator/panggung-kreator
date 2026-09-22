"use client";

import React, { useState } from "react";
import { AttendanceRecord, GalleryAlbumSummary } from "@/lib/types/member";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  FileText,
  QrCode,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  albums?: GalleryAlbumSummary[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  open_mic: "Open Mic",
  speech_practice: "Speech Practice",
  mc_practice: "MC Practice",
  voice_over: "Voice Over Challenge",
  sharing_session: "Sharing Session",
  networking: "Networking Session",
  workshop: "Workshop",
  content_class: "Content Creator Class",
  branding_class: "Personal Branding Class",
  mentoring: "Mentoring",
  lainnya: "Acara Komunitas",
};

export default function AttendanceHistory({
  records,
  albums = [],
}: AttendanceHistoryProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  if (records.length === 0) {
    return (
      <div className="border border-dashed border-[#212121]/20 dark:border-white/20 py-12 text-center text-xs text-neutral-500 font-sans rounded-2xl bg-white/50 dark:bg-[#151B18]/50">
        Belum ada riwayat kehadiran event.
      </div>
    );
  }

  // Cari album galeri yang cocok berdasarkan tanggal atau judul acara
  const getMatchingAlbum = (record: AttendanceRecord | null) => {
    if (!record?.event || !albums || albums.length === 0) return null;

    const event = record.event;

    // 1. Prioritas 1: Cocokkan tanggal
    if (event.event_date) {
      const dateMatches = albums.filter(
        (a) => a.event_date === event.event_date
      );
      if (dateMatches.length === 1) {
        return dateMatches[0];
      }
      if (dateMatches.length > 1) {
        const titleMatch = dateMatches.find(
          (a) =>
            a.title.toLowerCase().includes(event.title.toLowerCase()) ||
            event.title.toLowerCase().includes(a.title.toLowerCase())
        );
        if (titleMatch) return titleMatch;
        return dateMatches[0];
      }
    }

    // 2. Prioritas 2: Cocokkan judul
    const titleMatch = albums.find(
      (a) =>
        a.title.toLowerCase().trim() === event.title.toLowerCase().trim() ||
        a.title.toLowerCase().includes(event.title.toLowerCase()) ||
        event.title.toLowerCase().includes(a.title.toLowerCase())
    );

    return titleMatch || null;
  };

  const selectedAlbum = selectedRecord ? getMatchingAlbum(selectedRecord) : null;

  return (
    <>
      <div className="border border-[#212121]/10 dark:border-white/10 overflow-x-auto rounded-2xl bg-white dark:bg-[#151B18] shadow-2xs">
        <table className="w-full text-left border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="bg-[#F6F5FA] dark:bg-[#1E2622] border-b border-[#212121]/10 dark:border-white/10 text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
              <th className="p-3.5 whitespace-nowrap">Nama Event</th>
              <th className="p-3.5 whitespace-nowrap">Tipe Event</th>
              <th className="p-3.5 whitespace-nowrap">Tanggal</th>
              <th className="p-3.5 whitespace-nowrap">Lokasi</th>
              <th className="p-3.5 whitespace-nowrap">Status Kehadiran</th>
              <th className="p-3.5 whitespace-nowrap text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => {
              const eventTypeLabel =
                EVENT_TYPE_LABELS[rec.event?.event_type || ""] ||
                rec.event?.event_type ||
                "Event";

              const formattedDate = rec.event?.event_date
                ? new Date(rec.event.event_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-";

              return (
                <tr
                  key={rec.id}
                  className="border-b border-[#212121]/5 dark:border-white/5 last:border-b-0 hover:bg-[#F6F5FA]/60 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="p-3.5 font-bold text-[#212121] dark:text-white tracking-tight font-sans min-w-[180px]">
                    {rec.event?.title || "Untitled Event"}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 text-[10px] font-sans font-semibold bg-[#F6F5FA] dark:bg-neutral-800 text-[#212121] dark:text-neutral-200 border border-[#212121]/10 dark:border-white/10 rounded-full shadow-2xs">
                      {eventTypeLabel}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-sans">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar size={12} className="text-neutral-400 shrink-0" />
                      <span className="whitespace-nowrap">{formattedDate}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-neutral-600 dark:text-neutral-400 font-sans">
                    <div className="flex items-center gap-1.5 min-w-[150px] max-w-[220px]">
                      <MapPin size={12} className="text-neutral-400 shrink-0" />
                      <span className="truncate">
                        {rec.event?.location || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {rec.is_present ? (
                      <span className="inline-flex items-center whitespace-nowrap gap-1 px-2.5 py-1 text-[10px] font-sans font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                        <CheckCircle2 size={12} />
                        Hadir
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap gap-1 px-2.5 py-1 text-[10px] font-sans font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 rounded-full">
                        <XCircle size={12} />
                        Tidak Hadir
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(rec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-sans bg-[#212121] text-white dark:bg-white dark:text-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Eye size={13} />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Detail Acara"
        subtitle={selectedRecord?.event?.title || "Informasi Acara"}
        icon={
          <Calendar className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
        }
        maxWidth="max-w-lg"
      >
        {selectedRecord && (
          <div className="space-y-4 pt-1">
            {/* INFORMASI ACARA */}
            <div className="bg-[#F6F5FA] dark:bg-neutral-900/60 p-4 rounded-2xl border border-[#212121]/10 dark:border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#212121] dark:text-white leading-snug">
                    {selectedRecord.event?.title || "Untitled Event"}
                  </h4>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-neutral-800 text-[#212121] dark:text-neutral-200 border border-[#212121]/10 dark:border-white/10 rounded-full">
                      {EVENT_TYPE_LABELS[selectedRecord.event?.event_type || ""] ||
                        selectedRecord.event?.event_type ||
                        "Event"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#212121]/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-neutral-400 shrink-0" />
                  <span>
                    {selectedRecord.event?.event_date
                      ? new Date(
                          selectedRecord.event.event_date
                        ).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-neutral-400 shrink-0" />
                  <span>
                    {selectedRecord.event?.start_time
                      ? `${selectedRecord.event.start_time.slice(0, 5)} WIB`
                      : "-"}{" "}
                    {selectedRecord.event?.end_time
                      ? `- ${selectedRecord.event.end_time.slice(0, 5)} WIB`
                      : ""}
                  </span>
                </div>

                <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                  <MapPin size={14} className="text-neutral-400 shrink-0 mt-0.5" />
                  <span className="break-words">
                    {selectedRecord.event?.location || "-"}
                  </span>
                </div>
              </div>

              {selectedRecord.event?.description && (
                <div className="pt-2 border-t border-[#212121]/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                    <FileText size={12} />
                    <span>Deskripsi Acara</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                    {selectedRecord.event.description}
                  </p>
                </div>
              )}
            </div>

            {/* STATUS KEHADIRAN */}
            <div className="bg-[#F6F5FA] dark:bg-neutral-900/60 p-4 rounded-2xl border border-[#212121]/10 dark:border-white/10 space-y-2.5">
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
                Status Presensi
              </h5>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  {selectedRecord.is_present ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                      <CheckCircle2 size={14} />
                      Hadir
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 rounded-full">
                      <XCircle size={14} />
                      Tidak Hadir
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Metode Scan:
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-[#212121]/10 dark:border-white/10 rounded-full">
                    <QrCode size={11} className="mr-1" />
                    {selectedRecord.scan_method
                      ? selectedRecord.scan_method.toUpperCase()
                      : "AUTOMATIC"}
                  </span>
                </div>
              </div>

              {selectedRecord.scanned_at && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                  Waktu scan:{" "}
                  {new Date(selectedRecord.scanned_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            {/* GOOGLE DRIVE DOKUMENTASI LINK */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold px-0.5">
                Dokumentasi Acara
              </h5>
              {selectedAlbum?.album_link ? (
                <a
                  href={selectedAlbum.album_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 hover:border-sky-500/50 transition-all font-medium text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <LinkIcon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-[#212121] dark:text-white text-xs flex items-center gap-1.5">
                        Google Drive Dokumentasi
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Klik untuk mengakses foto & video dokumentasi acara
                      </p>
                    </div>
                  </div>
                  <ExternalLink
                    size={15}
                    className="text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0"
                  />
                </a>
              ) : (
                <div className="p-3 text-center text-neutral-500 dark:text-neutral-400 text-xs bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  Dokumentasi Google Drive belum tersedia untuk acara ini.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
