"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AttendanceRecord, AttendanceStats as IAttendanceStats, GalleryAlbumSummary } from "@/lib/types/member";
import AttendanceStats from "./AttendanceStats";
import AttendanceHistory from "./AttendanceHistory";
import { Loader2 } from "lucide-react";

interface AttendanceTrackerProps {
  memberId: string;
}

function calculateAttendanceStats(
  records: AttendanceRecord[],
  totalEventsCount: number
): IAttendanceStats {
  const totalEvents = totalEventsCount > 0 ? totalEventsCount : records.length;
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
  const [albums, setAlbums] = useState<GalleryAlbumSummary[]>([]);
  const [totalEventsCount, setTotalEventsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const [attendanceRes, eventsRes, albumsRes] = await Promise.all([
          supabase
            .from("attendances")
            .select(`
              id, event_id, member_id, is_present, scan_method, scanned_at, created_at,
              event:events(id, title, description, event_type, event_date, start_time, end_time, location, capacity)
            `)
            .eq("member_id", memberId)
            .order("created_at", { ascending: false }),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("gallery_albums")
            .select("id, title, event_date, album_link, hero_image_url, description")
            .eq("is_published", true),
        ]);

        if (attendanceRes.error) throw attendanceRes.error;
        setRecords((attendanceRes.data as any) || []);
        if (eventsRes.count !== null && eventsRes.count !== undefined) {
          setTotalEventsCount(eventsRes.count);
        }
        if (albumsRes.data) {
          setAlbums(albumsRes.data as GalleryAlbumSummary[]);
        }
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
      <div className="bg-transparent border-0 p-0 space-y-6 w-full animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60" />
          ))}
        </div>
        <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="h-6 w-56 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60" />
            ))}
          </div>
        </div>
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

  const stats = calculateAttendanceStats(records, totalEventsCount);

  return (
    <div className="bg-transparent border-0 p-0 space-y-6 w-full animate-fade-in rounded-none">
      {/* STATISTIK KEHADIRAN RINGKAS */}
      <AttendanceStats stats={stats} />

      {/* SECTION HEADER FOR HISTORY */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-1 sm:gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg md:text-xl text-[#212121] dark:text-white flex items-center gap-2">
            Riwayat Kehadiran <span className="highlight-stabilo">Event Komunitas</span>
          </h3>
        </div>

        {/* HISTORY TABLE */}
        <AttendanceHistory records={records} albums={albums} />
      </div>
    </div>
  );
}
