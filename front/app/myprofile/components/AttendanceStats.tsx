"use client";

import React from "react";
import { AttendanceStats as IAttendanceStats } from "@/lib/types/member";

interface AttendanceStatsProps {
  stats: IAttendanceStats;
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  const items = [
    {
      label: "EVENT HADIR",
      value: stats.totalAttended.toString(),
    },
    {
      label: "TOTAL EVENT",
      value: stats.totalEvents.toString(),
    },
    {
      label: "RATE KEHADIRAN",
      value: `${stats.attendanceRate}%`,
    },
    {
      label: "CURRENT STREAK",
      value: stats.currentStreak.toString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 text-center rounded-none"
        >
          <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
            <span className="highlight-stabilo">{item.value}</span>
          </div>
          <div className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mt-1">
            [ {item.label} ]
          </div>
        </div>
      ))}
    </div>
  );
}
