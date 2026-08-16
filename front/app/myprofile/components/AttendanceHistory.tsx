"use client";

import React from "react";
import { AttendanceRecord } from "@/lib/types/member";
import { CheckCircle2, XCircle, Calendar, MapPin } from "lucide-react";

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  open_mic: "Open Mic",
  mc_practice: "MC Practice",
  voice_over: "Voice Over Challenge",
  sharing_session: "Sharing Session",
  networking: "Networking Session",
  workshop: "Workshop",
  content_class: "Content Creator Class",
  branding_class: "Personal Branding Class",
};

export default function AttendanceHistory({ records }: AttendanceHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="border border-dashed border-[#2c2c2c]/30 dark:border-white/20 py-12 text-center text-xs text-neutral-500 font-mono rounded-none">
        [ BELUM ADA RIWAYAT KEHADIRAN EVENT ]
      </div>
    );
  }

  return (
    <div className="border border-[#2c2c2c]/20 dark:border-white/20 overflow-x-auto rounded-none bg-white dark:bg-[#121212]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[#2c2c2c]/20 dark:border-white/20 text-[10px] font-mono uppercase text-neutral-500 tracking-[0.15em]">
            <th className="p-3.5">Nama Event</th>
            <th className="p-3.5">Tipe Event</th>
            <th className="p-3.5">Tanggal</th>
            <th className="p-3.5">Lokasi</th>
            <th className="p-3.5">Status Kehadiran</th>
            <th className="p-3.5">Metode Scan</th>
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
                className="border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <td className="p-3.5 font-bold text-black dark:text-white">
                  {rec.event?.title || "Untitled Event"}
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    {eventTypeLabel}
                  </span>
                </td>
                <td className="p-3.5 text-neutral-600 dark:text-neutral-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-neutral-400" />
                    <span>{formattedDate}</span>
                  </div>
                </td>
                <td className="p-3.5 text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                    <MapPin size={12} className="text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{rec.event?.location || "-"}</span>
                  </div>
                </td>
                <td className="p-3.5">
                  {rec.is_present ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 size={12} />
                      Hadir
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      <XCircle size={12} />
                      Tidak Hadir
                    </span>
                  )}
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-neutral-50 dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                    {rec.scan_method ? rec.scan_method.toUpperCase() : "AUTOMATIC"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
