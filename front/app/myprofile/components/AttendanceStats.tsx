"use client";

import React from "react";
import { AttendanceStats as IAttendanceStats } from "@/lib/types/member";

interface AttendanceStatsProps {
  stats: IAttendanceStats;
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  const formattedLastDate = stats.lastAttendedEvent?.event_date
    ? new Date(stats.lastAttendedEvent.event_date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* 1. KEHADIRAN - HONEYDEW TINT */}
      <div className="bg-[#CFDECA]/25 dark:bg-[#CFDECA]/10 border border-[#CFDECA]/50 dark:border-[#CFDECA]/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xs space-y-4">
        <div>
          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md mb-2">
            KEHADIRAN
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#212121] dark:text-white">
              {stats.totalAttended}/{stats.totalEvents}
            </span>
            <span className="text-xs font-sans text-neutral-700 dark:text-neutral-300 font-semibold uppercase tracking-wider">
              ({stats.attendanceRate}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/70 dark:bg-neutral-800 h-2 rounded-full overflow-hidden border border-black/5">
          <div
            className="bg-[#212121] dark:bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.attendanceRate, 100)}%` }}
          />
        </div>
      </div>

      {/* 2. STREAK - VANILLA TINT */}
      <div className="bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-2xs space-y-4">
        <div>
          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFF0A3] text-[#302F1A] dark:bg-[#38371F] dark:text-[#EFF0A3] px-2.5 py-0.5 rounded-md mb-2">
            STREAK KEHADIRAN
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#212121] dark:text-white">
              {stats.currentStreak}
            </span>
            <span className="text-xs font-sans text-neutral-700 dark:text-neutral-300 font-semibold uppercase tracking-wider">
              Event Beruntun
            </span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-3 border-t border-[#212121]/10 dark:border-white/10 tracking-wider">
          Rekor Tertinggi: <span className="font-bold text-[#212121] dark:text-white">{stats.longestStreak}</span> Event
        </div>
      </div>

      {/* 3. EVENT TERAKHIR - SOFT SLATE TINT */}
      <div className="bg-[#D8DFE9]/25 dark:bg-[#D8DFE9]/10 border border-[#D8DFE9]/50 dark:border-[#D8DFE9]/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xs space-y-4">
        <div>
          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md mb-2">
            EVENT TERAKHIR
          </span>
          <div className="mt-1">
            <p
              className="text-sm sm:text-base font-bold font-sans tracking-tight text-[#212121] dark:text-white line-clamp-2"
              title={stats.lastAttendedEvent?.title || "-"}
            >
              {stats.lastAttendedEvent?.title || "Belum ada acara dihadiri"}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-neutral-600 dark:text-neutral-400 pt-3 border-t border-[#212121]/10 dark:border-white/10">
          {formattedLastDate || "Belum ada catatan"}
        </div>
      </div>
    </div>
  );
}
