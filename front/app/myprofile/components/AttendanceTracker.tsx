"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AttendanceRecord, AttendanceStats as IAttendanceStats } from "@/lib/types/member";
import AttendanceStats from "./AttendanceStats";
import AttendanceHistory from "./AttendanceHistory";
import { Loader2 } from "lucide-react";

interface AttendanceTrackerProps {
  memberId: string;
}

function calculateAttendanceStats(records: AttendanceRecord[]): IAttendanceStats {
  const totalEvents = records.length;
  const attended = records.filter((r) => r.is_present);
  const totalAttended = attended.length;
  const attendanceRate =
    totalEvents > 0 ? Math.round((totalAttended / totalEvents) * 100) : 0;

  const sorted = [...records].sort((a, b) => {
    const dateA = new Date(a.event?.event_date || a.created_at).getTime();
    const dateB = new Date(b.event?.event_date || b.created_at).getTime();
    return dateB - dateA;
  });

  let currentStreak = 0;
  for (const r of sorted) {
    if (r.is_present) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  for (const r of sorted) {
    if (r.is_present) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const lastAttendedEvent = attended.length > 0 ? attended[0].event : null;

  return {
    totalAttended,
    totalEvents,
    attendanceRate,
    currentStreak,
    longestStreak,
    lastAttendedEvent,
  };
}

export default function AttendanceTracker({ memberId }: AttendanceTrackerProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from("attendances")
          .select(`
            id, event_id, member_id, is_present, scan_method, scanned_at, created_at,
            event:events(title, event_type, event_date, start_time, end_time, location)
          `)
          .eq("member_id", memberId)
          .order("created_at", { ascending: false });

        if (err) throw err;
        setRecords((data as any) || []);
      } catch (err: any) {
        console.error("Error loading attendance records:", err);
        setError("Gagal memuat data kehadiran event.");
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchAttendanceData();
    }
  }, [memberId]);

  if (isLoading) {
    return (
      <div className="bg-transparent border-0 p-12 flex flex-col items-center justify-center gap-3 text-neutral-500 w-full rounded-none">
        <Loader2 className="animate-spin h-6 w-6 text-neutral-900 dark:text-white" />
        <span className="text-xs font-mono uppercase tracking-widest">
          Memuat data absensi...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-transparent border border-neutral-300 dark:border-neutral-700 p-8 text-neutral-800 dark:text-neutral-200 text-xs font-mono w-full rounded-none">
        [ {error} ]
      </div>
    );
  }

  const stats = calculateAttendanceStats(records);

  return (
    <div className="bg-transparent border-0 p-0 space-y-6 w-full animate-fade-in rounded-none">
      {/* STATISTIK KEHADIRAN RINGKAS */}
      <AttendanceStats stats={stats} />

      {/* SECTION HEADER FOR HISTORY */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h3 className="text-base font-bold font-sans text-neutral-900 dark:text-white">
            Riwayat Kehadiran <span className="highlight-stabilo">Event Komunitas</span>
          </h3>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ {records.length} EVENT RECORDED ]
          </span>
        </div>

        {/* HISTORY TABLE */}
        <AttendanceHistory records={records} />
      </div>
    </div>
  );
}
