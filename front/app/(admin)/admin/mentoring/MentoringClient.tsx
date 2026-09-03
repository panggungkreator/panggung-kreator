"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Clock,
  Edit,
  Plus,
  ChevronDown,
  XCircle,
  FileText,
  Search,
  CheckCircle,
  RotateCcw,
  Loader,
  AlertCircle,
  X,
  SlidersHorizontal,
  ExternalLink,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { deleteMentoringSessionAction } from "@/lib/actions/mentoring-actions";
import { toast } from "sonner";

interface MentoringSession {
  id: string;
  member_id: string;
  mentor_id: string;
  package_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  platform: string;
  meeting_link: string;
  location: string;
  status: string;
  session_number: number;
  notes: string;
  member_notes: string;
  created_at: string;
  member_name: string;
  member_email: string;
  mentor_name: string;
  package_name: string;
}

interface MemberItem {
  id: string;
  full_name: string;
}

interface MentorItem {
  id: string;
  full_name: string;
}

interface PackageItem {
  id: string;
  name: string;
}

interface MentoringClientProps {
  initialSessions: MentoringSession[];
  members: MemberItem[];
  mentors: MentorItem[];
  packages: PackageItem[];
  paginationLimit?: number;
}

export default function MentoringClient({
  initialSessions,
  members,
  mentors,
  packages,
  paginationLimit = 10,
}: MentoringClientProps) {
  const [sessions, setSessions] = useState<MentoringSession[]>(initialSessions);
  const [isPending, startTransition] = useTransition();

  // Filtering states
  const [statusFilter, setStatusFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [viewingNotesSession, setViewingNotesSession] = useState<MentoringSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<MentoringSession | null>(null);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, mentorFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    const { id, member_name, session_number } = sessionToDelete;
    setSessionToDelete(null);

    startTransition(async () => {
      const res = await deleteMentoringSessionAction(id);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.success(`Sesi #${session_number} (${member_name}) berhasil dihapus.`);
      } else {
        toast.error(res.error || "Gagal menghapus sesi mentoring.");
      }
    });
  };

  // Filtered Sessions Dataset
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const query = search.toLowerCase();
      const matchSearch =
        (s.member_name || "").toLowerCase().includes(query) ||
        (s.mentor_name || "").toLowerCase().includes(query) ||
        (s.package_name || "").toLowerCase().includes(query);

      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchMentor = mentorFilter === "all" || s.mentor_name === mentorFilter;

      return matchSearch && matchStatus && matchMentor;
    });
  }, [sessions, search, statusFilter, mentorFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = sessions.length;
    const scheduled = sessions.filter((s) => s.status === "scheduled").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const rescheduled = sessions.filter((s) => s.status === "rescheduled").length;
    const cancelled = sessions.filter((s) => s.status === "cancelled").length;
    return { total, scheduled, completed, rescheduled, cancelled };
  }, [sessions]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredSessions.length, startIndex + limit);
  const paginatedSessions = useMemo(() => {
    return filteredSessions.slice(startIndex, endIndex);
  }, [filteredSessions, startIndex, endIndex]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "rescheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <RotateCcw className="w-3 h-3" />
            Rescheduled
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Sesi Mentoring Akademi
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Jadwalkan dan pantau sesi bimbingan 1-on-1 member dengan mentor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Header Quick Search (h-9 rounded-full) */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari member/mentor..."
              className="w-full h-9 pl-9 pr-8 text-xs rounded-full bg-bg-well/70 border border-border-default focus:border-text-primary focus:outline-none transition-all placeholder:text-text-muted"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Action Button Header Desktop (h-9 px-4 rounded-full) */}
          <Link
            href="/admin/mentoring/addMentoring"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Buat Sesi Baru</span>
          </Link>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Sesi</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.total}
          </span>
        </button>

        {/* Scheduled */}
        <button
          type="button"
          onClick={() => setStatusFilter("scheduled")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "scheduled"
              ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 shadow-xs border border-sky-300 dark:border-sky-800"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-sky-500" />
            Scheduled
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono text-sky-700 dark:text-sky-300">
            {stats.scheduled}
          </span>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => setStatusFilter("completed")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "completed"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-300 dark:border-emerald-800"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
            {stats.completed}
          </span>
        </button>

        {/* Rescheduled */}
        <button
          type="button"
          onClick={() => setStatusFilter("rescheduled")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "rescheduled"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-300 dark:border-amber-800"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Rescheduled</span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.rescheduled}
          </span>
        </button>

        {/* Cancelled */}
        <button
          type="button"
          onClick={() => setStatusFilter("cancelled")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "cancelled"
              ? "bg-red-500/10 text-red-700 dark:text-red-300 shadow-xs border border-red-300 dark:border-red-800"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Cancelled</span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.cancelled}
          </span>
        </button>
      </div>

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default/70 bg-bg-well/50">
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Member
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Mentor
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold text-center">
                  Sesi
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Tanggal & Waktu
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Platform
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Status
                </th>
                <th className="py-3.5 px-5 text-center uppercase tracking-wider font-bold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    Tidak ada data sesi mentoring ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-well/30 transition-colors">
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <div className="font-bold text-text-primary text-sm">{s.member_name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{s.member_email}</div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40 font-semibold text-text-primary">
                      {s.mentor_name}
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-bg-well text-xs font-bold font-mono text-text-secondary">
                        #{s.session_number}
                      </span>
                      <div className="text-[10px] text-text-muted font-medium mt-1 truncate max-w-[120px]">
                        {s.package_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <div className="font-semibold text-text-primary">{formatDate(s.session_date)}</div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {formatTime(s.start_time)} – {formatTime(s.end_time)} WIB
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      {s.platform === "offline" ? (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <MapPin size={13} className="text-zinc-400 shrink-0" />
                          <span className="truncate max-w-[130px]" title={s.location}>
                            {s.location || "Lokasi Offline"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Video size={13} className="text-sky-500 shrink-0" />
                          <span className="capitalize font-semibold text-text-primary">
                            {s.platform}
                          </span>
                          {s.meeting_link && (
                            <a
                              href={s.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0369a1] dark:text-sky-400 hover:underline p-0.5"
                              title="Buka Link Meeting"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      {renderStatusBadge(s.status)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {s.notes && (
                          <button
                            type="button"
                            onClick={() => setViewingNotesSession(s)}
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Lihat Catatan"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                        <Link
                          href={`/admin/mentoring/addMentoring?id=${s.id}`}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Edit Sesi"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(s)}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus Sesi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-3.5">
        {paginatedSessions.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data sesi mentoring ditemukan.</p>
          </div>
        ) : (
          paginatedSessions.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99]"
            >
              {/* Card Top: Status & Session Badge */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-default/40">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-bg-well text-[10px] font-bold font-mono text-text-secondary">
                    #{s.session_number}
                  </span>
                  <span className="text-xs font-bold text-text-primary truncate max-w-[150px]">
                    {s.package_name}
                  </span>
                </div>
                <div>{renderStatusBadge(s.status)}</div>
              </div>

              {/* Card Middle: Member & Mentor & Schedule */}
              <div className="my-3 space-y-2.5">
                <div>
                  <div className="text-sm font-black tracking-tight text-text-primary">
                    {s.member_name}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">{s.member_email}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-bg-well/60 border border-border-default/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-text-muted text-[11px]">Mentor:</span>
                    <span className="font-semibold text-text-primary">{s.mentor_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-text-muted text-[11px]">Jadwal:</span>
                    <span className="font-medium text-text-primary">
                      {formatDate(s.session_date)} ({formatTime(s.start_time)}–{formatTime(s.end_time)} WIB)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-text-muted text-[11px]">Platform:</span>
                    {s.platform === "offline" ? (
                      <span className="inline-flex items-center gap-1 text-text-primary truncate max-w-[160px]">
                        <MapPin size={11} className="text-zinc-400 shrink-0" />
                        {s.location || "Offline"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-text-primary capitalize">
                        <Video size={11} className="text-sky-500 shrink-0" />
                        {s.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Bottom: Actions */}
              <div className="pt-3 border-t border-border-default/40 flex items-center justify-between gap-2">
                <div>
                  {s.meeting_link && s.platform !== "offline" && (
                    <a
                      href={s.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0369a1] dark:text-sky-400 hover:underline"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {s.notes && (
                    <button
                      type="button"
                      onClick={() => setViewingNotesSession(s)}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                      title="Lihat Catatan"
                    >
                      <FileText size={13} />
                    </button>
                  )}
                  <Link
                    href={`/admin/mentoring/addMentoring?id=${s.id}`}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                    title="Edit Sesi"
                  >
                    <Edit size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSessionToDelete(s)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                    title="Hapus Sesi"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredSessions.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="sesi mentoring"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Status Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  statusFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Status"
              >
                <Clock className="w-4 h-4" />
                {statusFilter !== "all" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-72 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Status Sesi
                </span>
                {statusFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: `Semua (${stats.total})` },
                  { id: "scheduled", label: `Scheduled (${stats.scheduled})` },
                  { id: "completed", label: `Completed (${stats.completed})` },
                  { id: "rescheduled", label: `Rescheduled (${stats.rescheduled})` },
                  { id: "cancelled", label: `Cancelled (${stats.cancelled})` },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      statusFilter === s.id
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Mentor Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  mentorFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Mentor"
              >
                <Users className="w-4 h-4" />
                {mentorFilter !== "all" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-64 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50 max-h-72 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Mentor
                </span>
                {mentorFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setMentorFilter("all")}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setMentorFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    mentorFilter === "all"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-text-secondary hover:bg-bg-well"
                  }`}
                >
                  Semua Mentor
                </button>
                {mentors.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMentorFilter(m.full_name)}
                    className={`px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer truncate ${
                      mentorFilter === m.full_name
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-text-secondary hover:bg-bg-well"
                    }`}
                  >
                    {m.full_name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Buat Sesi Baru */}
          <Link
            href="/admin/mentoring/addMentoring"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Buat Sesi Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Sesi</span>
          </Link>
        </div>
      </div>

      {/* ═══ VIEW NOTES MODAL (Mobile Responsive: border-0 rounded-none on mobile) ═══ */}
      {viewingNotesSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setViewingNotesSession(null)}
          />

          <div className="relative bg-bg-card border-0 sm:border border-border-default rounded-none sm:rounded-3xl shadow-2xl w-full max-w-md h-full sm:h-auto overflow-y-auto p-6 sm:p-8 space-y-6 z-10 flex flex-col justify-between sm:justify-start">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border-default/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-text-primary text-bg-card flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary leading-tight">
                      Catatan Sesi Mentoring
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {viewingNotesSession.member_name} • Sesi #{viewingNotesSession.session_number}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingNotesSession(null)}
                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4 pt-5">
                {viewingNotesSession.notes && (
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                      Catatan Mentor / Agenda
                    </span>
                    <div className="p-3.5 rounded-2xl bg-bg-well/50 border border-border-default/50 text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                      {viewingNotesSession.notes}
                    </div>
                  </div>
                )}

                {viewingNotesSession.member_notes && (
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                      Catatan Tambahan Member
                    </span>
                    <div className="p-3.5 rounded-2xl bg-bg-well/50 border border-border-default/50 text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                      {viewingNotesSession.member_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border-default/60 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingNotesSession(null)}
                className="w-full sm:w-auto h-10 px-5 rounded-xl bg-text-primary text-bg-card text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM DIALOG (Tanpa window.confirm) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(sessionToDelete)}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        title="Hapus Sesi Mentoring"
        description={`Apakah Anda yakin ingin menghapus Sesi #${sessionToDelete?.session_number} untuk member "${sessionToDelete?.member_name}"? Data ini tidak dapat dikembalikan.`}
        onConfirm={handleDeleteSession}
      />
    </div>
  );
}
