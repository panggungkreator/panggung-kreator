"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  Search,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  is_published: boolean;
  created_at: string;
  present_count: number;
  total_registered: number;
}

interface AcaraListClientProps {
  initialEvents: EventItem[];
}

export default function AcaraListClient({
  initialEvents,
}: AcaraListClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  // Re-fetch events to update local state
  const refreshEvents = async () => {
    try {
      const supabase = createClient();
      const { data: rawEvents } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          event_type,
          event_date,
          start_time,
          end_time,
          location,
          capacity,
          is_published,
          created_at,
          attendances (
            is_present
          )
        `)
        .order("event_date", { ascending: false });

      if (rawEvents) {
        const formatted = rawEvents.map((e: any) => {
          const presentCount = (e.attendances || []).filter((a: any) => a.is_present).length;
          const totalRegistered = (e.attendances || []).length;
          return {
            id: e.id,
            title: e.title,
            description: e.description || "",
            event_type: e.event_type || "lainnya",
            event_date: e.event_date,
            start_time: e.start_time || "",
            end_time: e.end_time || "",
            location: e.location || "",
            capacity: e.capacity || 0,
            is_published: e.is_published ?? false,
            created_at: e.created_at,
            present_count: presentCount,
            total_registered: totalRegistered
          };
        });
        setEvents(formatted);
      }
    } catch (err) {
      console.error("Gagal menyegarkan acara:", err);
    }
  };

  // Toggle Is Published Inline
  const handleTogglePublish = async (eventId: string, currentStatus: boolean, title: string) => {
    const nextStatus = !currentStatus;
    const confirmation = window.confirm(
      `Ubah status publish untuk "${title}" menjadi ${nextStatus ? "PUBLISHED" : "DRAFT"}?`
    );
    if (!confirmation) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .update({ is_published: nextStatus })
        .eq("id", eventId);

      if (error) {
        toast.error("Gagal mengubah status: " + error.message);
      } else {
        toast.success(`Status publish "${title}" berhasil diperbarui!`);
        setEvents(prev =>
          prev.map(e => (e.id === eventId ? { ...e, is_published: nextStatus } : e))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan: " + (err.message || err));
    }
  };

  // Trigger Delete Event Modal
  const handleDeleteEvent = (evt: EventItem) => {
    setEventToDelete(evt);
  };

  // Handle Confirm Delete Event
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    const evt = eventToDelete;
    setEventToDelete(null);

    try {
      const supabase = createClient();

      // Delete attendances first for safety
      await supabase
        .from("attendances")
        .delete()
        .eq("event_id", evt.id);

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", evt.id);

      if (error) throw new Error(error.message);

      toast.success("Acara berhasil dihapus secara permanen!");
      await refreshEvents();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus acara: " + err.message);
    }
  };

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || e.event_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && e.is_published) ||
        (statusFilter === "draft" && !e.is_published);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Kelola Acara & Event
          </h1>
        </div>
        <div>
          <Link
            href="/admin/acara/create"
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Plus size={14} />
            Buat Acara Baru
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="py-5 space-y-4">
        <div className="flex gap-4">

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau lokasi..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Tipe Acara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe Acara</SelectItem>
                <SelectItem value="open_mic">Open Mic</SelectItem>
                <SelectItem value="speech_practice">Speech Practice</SelectItem>
                <SelectItem value="mc_practice">MC Practice</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="content_class">Content Class</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* Status Filter */}
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Grid Boxed Table of Events */}
      <div className="bg-bg-card border border-border-default rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Judul Acara</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Tipe</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Tanggal</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Waktu</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Lokasi / Venue</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Kapasitas & Absen</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Status Publish</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data jadwal acara ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, index) => {
                  const isLastRow = index === filteredEvents.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-bg-well/30 transition-colors group"
                    >
                      <td className={`${cellBorderClass} font-bold text-text-primary`}>
                        <Link
                          href={`/admin/acara/${evt.id}`}
                          className="hover:underline text-[#0369a1] dark:text-sky-400 font-extrabold"
                        >
                          {evt.title}
                        </Link>
                        {evt.description && (
                          <span className="block text-[10px] font-medium text-text-secondary mt-0.5 max-w-[200px] truncate">
                            {evt.description}
                          </span>
                        )}
                      </td>
                      <td className={cellBorderClass}>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block uppercase bg-bg-well border border-border-default">
                          {evt.event_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className={`${cellBorderClass} text-text-secondary font-medium`}>
                        {formatDate(evt.event_date)}
                      </td>
                      <td className={`${cellBorderClass} text-text-secondary`}>
                        {formatTime(evt.start_time)}{evt.end_time ? ` - ${formatTime(evt.end_time)}` : " - Selesai"}
                      </td>
                      <td className={cellBorderClass}>
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <MapPin size={13} />
                          <span className="font-semibold truncate max-w-[150px]" title={evt.location}>
                            {evt.location}
                          </span>
                        </div>
                      </td>
                      <td className={cellBorderClass}>
                        <div className="space-y-1">
                          <p className="font-semibold text-text-primary">
                            {evt.present_count} <span className="text-text-secondary font-medium">Hadir</span>
                          </p>
                          <p className="text-[10px] text-text-secondary font-medium">
                            Kapasitas: {evt.capacity === 0 ? "Unlimited" : `${evt.capacity} orang`}
                          </p>
                        </div>
                      </td>
                      <td className={cellBorderClass}>
                        <button
                          onClick={() => handleTogglePublish(evt.id, evt.is_published, evt.title)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${evt.is_published
                            ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] border-emerald-200/20"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-zinc-400/30"
                            }`}
                        >
                          {evt.is_published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className={cellBorderClass}>
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/acara/${evt.id}`}
                            className="p-1.5 text-[#0369a1] hover:text-sky-700 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg cursor-pointer flex items-center justify-center"
                            title="Detail & Absensi Kehadiran"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(evt)}
                            className="p-1.5 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer"
                            title="Hapus Acara"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        title="Hapus Acara"
        description={
          <>
            Apakah Anda yakin ingin menghapus acara &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">{eventToDelete?.title}</span>&rdquo; secara permanen?
            <p className="mt-2 text-xs text-zinc-455 dark:text-zinc-500 font-bold">
              Seluruh data absensi kehadiran yang terkait dengan acara ini juga akan dihapus.
            </p>
          </>
        }
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
