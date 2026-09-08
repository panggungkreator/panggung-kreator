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
      {/* 1. KEHADIRAN */}
      <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 rounded-none flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ KEHADIRAN ]
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white font-mono">
              <span className="highlight-stabilo">
                {stats.totalAttended}/{stats.totalEvents}
              </span>
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              ({stats.attendanceRate}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-none overflow-hidden mt-3">
          <div
            className="bg-neutral-900 dark:bg-white h-full transition-all duration-500"
            style={{ width: `${Math.min(stats.attendanceRate, 100)}%` }}
          />
        </div>
      </div>

      {/* 2. STREAK */}
      <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 rounded-none flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ STREAK ]
          </span>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white font-mono">
              <span className="highlight-stabilo">{stats.currentStreak}</span>{" "}
              <span className="text-sm font-sans font-normal text-neutral-700 dark:text-neutral-300">
                Event
              </span>
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          Rekor: <span className="font-bold text-neutral-800 dark:text-neutral-200">{stats.longestStreak}</span> Event
        </div>
      </div>

      {/* 3. EVENT TERAKHIR */}
      <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 rounded-none flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ EVENT TERAKHIR ]
          </span>
          <div className="mt-1.5">
            <p
              className="text-sm sm:text-base font-bold font-sans text-neutral-900 dark:text-white line-clamp-1"
              title={stats.lastAttendedEvent?.title || "-"}
            >
              {stats.lastAttendedEvent?.title || "-"}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          {formattedLastDate || "Belum ada riwayat"}
        </div>
      </div>
    </div>
  );
}
