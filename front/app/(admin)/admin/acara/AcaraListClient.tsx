"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Trash2,
  Eye,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
  MoreVertical,
  RotateCcw,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AttendeeItem {
  name: string;
  avatar: string | null;
}

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
  attendees?: AttendeeItem[];
}

interface AcaraListClientProps {
  initialEvents: EventItem[];
}

const EVENT_TYPE_MAP: Record<string, { label: string; dotColor: string }> = {
  open_mic: { label: "Open Mic", dotColor: "bg-amber-500" },
  speech_practice: { label: "Speech Practice", dotColor: "bg-blue-500" },
  mc_practice: { label: "MC Practice", dotColor: "bg-purple-500" },
  networking: { label: "Networking", dotColor: "bg-emerald-500" },
  content_class: { label: "Content Class", dotColor: "bg-rose-500" },
  lainnya: { label: "Acara Komunitas", dotColor: "bg-cyan-500" },
};

export default function AcaraListClient({
  initialEvents,
}: AcaraListClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "attendees">("newest");

  // Collapsible Section State
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(true);
  const [isPastOpen, setIsPastOpen] = useState(true);

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

  // Re-fetch events
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
            id,
            is_present,
            members (
              full_name,
              avatar_url
            )
          )
        `)
        .order("event_date", { ascending: false });

      if (rawEvents) {
        const formatted = rawEvents.map((e: any) => {
          const presentList = (e.attendances || []).filter((a: any) => a.is_present);
          const presentCount = presentList.length;
          const totalRegistered = (e.attendances || []).length;
          const attendees = presentList
            .filter((a: any) => a.members)
            .map((a: any) => ({
              name: a.members?.full_name || "Peserta",
              avatar: a.members?.avatar_url || null,
            }))
            .slice(0, 4);

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
            total_registered: totalRegistered,
            attendees,
          };
        });
        setEvents(formatted);
      }
    } catch (err) {
      console.error("Gagal menyegarkan acara:", err);
    }
  };

  // Toggle Is Published
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

  // Handle Confirm Delete Event
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    const evt = eventToDelete;
    setEventToDelete(null);

    try {
      const supabase = createClient();

      // Delete attendances first
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

  // Filtered & Sorted dataset
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
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
      })
      .sort((a, b) => {
        if (sortBy === "attendees") {
          return b.present_count - a.present_count;
        }
        const timeA = new Date(a.event_date).getTime();
        const timeB = new Date(b.event_date).getTime();
        if (sortBy === "oldest") {
          return timeA - timeB;
        }
        return timeB - timeA;
      });
  }, [events, search, typeFilter, statusFilter, sortBy]);

  // Group events into Upcoming and Past
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const upcomingEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.event_date >= todayStr);
  }, [filteredEvents, todayStr]);

  const pastEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.event_date < todayStr);
  }, [filteredEvents, todayStr]);

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default/60">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Kelola Acara & Event
          </h1>
        </div>

        {/* Desktop Quick Search & Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari acara atau venue..."
              className="bg-bg-well/70 border border-border-default rounded-full h-9 pl-9 pr-3 text-xs w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <Link
            href="/admin/acara/create"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-xs cursor-pointer tracking-wider shrink-0"
          >
            <Plus size={14} />
            <span>Buat Acara</span>
          </Link>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {(typeFilter !== "all" || statusFilter !== "all" || search) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-text-muted font-medium mr-1">Filter Aktif:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-well border border-border-default text-text-primary">
              Cari: "{search}"
              <button onClick={() => setSearch("")} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-well border border-border-default text-text-primary">
              Tipe: {EVENT_TYPE_MAP[typeFilter]?.label || typeFilter}
              <button onClick={() => setTypeFilter("all")} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-well border border-border-default text-text-primary">
              Status: {statusFilter.toUpperCase()}
              <button onClick={() => setStatusFilter("all")} className="hover:text-red-500 ml-1">×</button>
            </span>
          )}
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            className="text-[11px] text-text-muted hover:text-text-primary underline ml-1 cursor-pointer"
          >
            Reset Semua
          </button>
        </div>
      )}

      {/* List Sections */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-bg-card border border-border-default/70 rounded-3xl space-y-3">
          <Calendar className="w-10 h-10 text-text-muted mx-auto stroke-1" />
          <p className="text-sm font-semibold text-text-primary">Tidak ada acara ditemukan</p>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter untuk menemukan acara yang Anda cari.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Acara Mendatang / Top Priority */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              {/* Section Header */}
              <button
                type="button"
                onClick={() => setIsUpcomingOpen(!isUpcomingOpen)}
                className="w-full flex items-center justify-between group cursor-pointer text-left select-none"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                    Acara Mendatang
                  </h2>
                  <span className="text-[11px] font-mono text-text-muted px-2 py-0.5 rounded-full bg-bg-well border border-border-default/50 font-medium">
                    {upcomingEvents.length} Acara
                  </span>
                </div>
                <div className="p-1 rounded-full text-text-muted group-hover:text-text-primary transition-colors">
                  {isUpcomingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Cards Grid */}
              {isUpcomingOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {upcomingEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      onTogglePublish={handleTogglePublish}
                      onDelete={setEventToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Riwayat Acara / Due Today or Past */}
          {pastEvents.length > 0 && (
            <div className="space-y-3">
              {/* Section Header */}
              <button
                type="button"
                onClick={() => setIsPastOpen(!isPastOpen)}
                className="w-full flex items-center justify-between group cursor-pointer text-left select-none"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                    Riwayat Acara Selesai
                  </h2>
                  <span className="text-[11px] font-mono text-text-muted px-2 py-0.5 rounded-full bg-bg-well border border-border-default/50 font-medium">
                    {pastEvents.length} Acara
                  </span>
                </div>
                <div className="p-1 rounded-full text-text-muted group-hover:text-text-primary transition-colors">
                  {isPastOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Cards Grid */}
              {isPastOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {pastEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      onTogglePublish={handleTogglePublish}
                      onDelete={setEventToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Action Bar (Sesuai Referensi Gambar) */}
      <div className="fixed bottom-6 inset-x-0 z-40 pointer-events-none px-5 sm:px-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Bottom Left: Sort and Filter Circular Buttons */}
          <div className="flex items-center gap-3">
            {/* 1. Sort Button */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-border-default/40"
                  title="Urutkan Acara"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-2 rounded-2xl shadow-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted px-2.5 py-1 block">
                  Urutkan Berdasarkan
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    sortBy === "newest" ? "bg-bg-well font-bold text-text-primary" : "text-text-secondary hover:bg-bg-well/60"
                  }`}
                >
                  <span>Tanggal Terbaru</span>
                  {sortBy === "newest" && <Check className="w-3.5 h-3.5 text-text-primary" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("oldest")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    sortBy === "oldest" ? "bg-bg-well font-bold text-text-primary" : "text-text-secondary hover:bg-bg-well/60"
                  }`}
                >
                  <span>Tanggal Terlama</span>
                  {sortBy === "oldest" && <Check className="w-3.5 h-3.5 text-text-primary" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("attendees")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    sortBy === "attendees" ? "bg-bg-well font-bold text-text-primary" : "text-text-secondary hover:bg-bg-well/60"
                  }`}
                >
                  <span>Peserta Terbanyak</span>
                  {sortBy === "attendees" && <Check className="w-3.5 h-3.5 text-text-primary" />}
                </button>
              </PopoverContent>
            </Popover>

            {/* 2. Filter Button */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-border-default/40"
                  title="Filter Acara"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-3 rounded-2xl shadow-xl space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
                  Filter Acara
                </span>

                {/* Filter Tipe */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary block">
                    Tipe Acara
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full text-xs bg-bg-well border border-border-default rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="open_mic">Open Mic</option>
                    <option value="speech_practice">Speech Practice</option>
                    <option value="mc_practice">MC Practice</option>
                    <option value="networking">Networking</option>
                    <option value="content_class">Content Class</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Filter Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary block">
                    Status Publish
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs bg-bg-well border border-border-default rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("all");
                      setStatusFilter("all");
                    }}
                    className="w-full text-center text-xs text-red-500 hover:underline pt-1"
                  >
                    Reset Filter
                  </button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Bottom Right: Cyan Floating Action Button (FAB) matching reference */}
          <Link
            href="/admin/acara/create"
            className="w-14 h-14 rounded-full bg-[#67e8f9] hover:bg-[#22d3ee] active:scale-95 text-zinc-950 flex items-center justify-center shadow-xl hover:scale-105 transition-all cursor-pointer border border-[#a5f3fc]"
            title="Tambah Acara Baru"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Acara"
        description={`Apakah Anda yakin ingin menghapus acara "${eventToDelete?.title}"? Seluruh data absensi peserta untuk acara ini juga akan dihapus secara permanen.`}
      />

    </div>
  );
}

/**
 * Komponen Card Acara (Diselaraskan persis dengan estetika referensi)
 */
function EventCard({
  event,
  formatDate,
  formatTime,
  onTogglePublish,
  onDelete,
}: {
  event: EventItem;
  formatDate: (str: string) => string;
  formatTime: (str: string) => string;
  onTogglePublish: (id: string, current: boolean, title: string) => void;
  onDelete: (evt: EventItem) => void;
}) {
  const typeInfo = EVENT_TYPE_MAP[event.event_type] || EVENT_TYPE_MAP.lainnya;

  return (
    <div className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative">
      {/* 1. Baris Atas: Badge Status & Tipe Acara */}
      <div className="flex items-center justify-between gap-2">
        {/* Status Badge (Pill) */}
        <div>
          {event.is_published ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-[#d9f99d] text-[#365314] dark:bg-lime-950/60 dark:text-lime-300 border border-[#bef264]/60">
              Published
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              Draft
            </span>
          )}
        </div>

        {/* Event Type Dot Indicator (Persis seperti • Google Meet pada referensi) */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${typeInfo.dotColor} shrink-0`}></span>
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* 2. Bagian Tengah: Judul Acara & Jam Pelaksanaan */}
      <div className="my-3">
        <Link
          href={`/admin/acara/${event.id}`}
          className="group-hover:text-amber-600 dark:group-hover:text-yellow-400 transition-colors inline-block"
        >
          <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight leading-snug">
            {event.title}
          </h3>
        </Link>
        <p className="text-xs text-text-muted mt-1 font-mono font-medium">
          {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : " - Selesai"} WIB
        </p>
      </div>

      {/* 3. Baris Bawah: Tanggal, Lokasi, dan Avatar Stack Kehadiran */}
      <div className="pt-3 border-t border-border-default/40 flex items-end justify-between gap-3">
        {/* Sisi Kiri: Tanggal & Lokasi Venue */}
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-semibold text-text-secondary">
            Tanggal: {formatDate(event.event_date)}
          </p>
          <p className="text-[11px] text-text-muted flex items-center gap-1 truncate max-w-[180px] sm:max-w-[220px]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>

        {/* Sisi Kanan: Overlapping Avatars & Menu Aksi Cepat */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Stack Avatar Peserta (Sesuai Referensi Gambar) */}
          <div className="flex -space-x-2 overflow-hidden items-center">
            {event.attendees && event.attendees.length > 0 ? (
              event.attendees.slice(0, 3).map((att, idx) =>
                att.avatar ? (
                  <img
                    key={idx}
                    src={att.avatar}
                    alt={att.name}
                    title={att.name}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#121212] object-cover"
                  />
                ) : (
                  <div
                    key={idx}
                    title={att.name}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-text-secondary ring-2 ring-white dark:ring-[#121212]"
                  >
                    {att.name ? att.name.charAt(0).toUpperCase() : "P"}
                  </div>
                )
              )
            ) : null}
          </div>

          {/* Quick Actions Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-bg-well text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Aksi Lainnya"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1.5 rounded-xl shadow-lg space-y-0.5">
              <Link
                href={`/admin/acara/${event.id}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Detail</span>
              </Link>
              <button
                type="button"
                onClick={() => onTogglePublish(event.id, event.is_published, event.title)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors text-left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{event.is_published ? "Set ke Draft" : "Publikasikan"}</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(event)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-500/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Acara</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
