"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
}

export default function MentoringClient({
  initialSessions,
  members,
  mentors,
  packages,
}: MentoringClientProps) {
  const [sessions, setSessions] = useState<MentoringSession[]>(initialSessions);

  // Filtering states
  const [statusFilter, setStatusFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [search, setSearch] = useState("");

  // View Notes modal state
  const [viewingNotesSession, setViewingNotesSession] = useState<MentoringSession | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    // Remove seconds from "HH:MM:SS" format
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  // Filtered Sessions Dataset
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        s.member_name.toLowerCase().includes(search.toLowerCase()) ||
        s.member_email.toLowerCase().includes(search.toLowerCase()) ||
        s.mentor_name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;

      const matchesMentor =
        mentorFilter === "all" || s.mentor_name === mentorFilter;

      return matchesSearch && matchesStatus && matchesMentor;
    });
  }, [sessions, search, statusFilter, mentorFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header (Ecomora Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Mentoring Sessions
          </h1>
        </div>
        <div>
          <Link
            href="/admin/mentoring/addMentoring"
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Plus size={14} />
            Buat Sesi Baru
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl py-5 space-y-4">
        <div className="flex gap-3.5 mb-6">

          {/* Search Box */}
          <div className="relative flex-grow max-w-xs">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari member atau mentor..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mentor Filter */}
          <div className="relative">
            <Select value={mentorFilter} onValueChange={setMentorFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Mentor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mentor</SelectItem>
                {mentors.map((m) => (
                  <SelectItem key={m.id} value={m.full_name}>
                    {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Grid Boxed Table of Mentoring Sessions */}
      {/* Sessions Data Table */}
      <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex-1 flex flex-col">
        {/* <div className="p-5 flex justify-between items-center border-b border-border-default/45">
          <span className="text-xs font-bold text-text-primary">
            DAFTAR SESI MENTORING ({filteredSessions.length})
          </span>
          <span className="text-[10px] text-text-muted font-semibold uppercase">Management</span>
        </div> */}

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-border-default/70 bg-bg-well/50 text-text-secondary">
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Member</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Mentor</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40 text-center">Sesi Ke</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Tanggal</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Waktu (WIB)</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Media/Platform</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Status</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data sesi mentoring ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, index) => {
                  const isLastRow = index === filteredSessions.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default last:border-r-0 py-4 px-6`;
                  return (
                    <tr key={s.id} className="hover:bg-bg-well/20 transition-colors">
                      <td className="p-4 font-bold text-text-primary">
                        {s.member_name}
                        <span className="block text-[10px] font-medium text-text-secondary mt-0.5">
                          {s.member_email}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-text-primary">
                        {s.mentor_name}
                      </td>
                      <td className="p-4 font-bold text-text-primary text-center">
                        #{s.session_number}
                        <span className="block text-[10px] text-text-secondary font-medium mt-0.5 truncate max-w-[120px]">
                          {s.package_name}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {formatDate(s.session_date)}
                      </td>
                      <td className="p-4 font-semibold text-text-primary">
                        {formatTime(s.start_time)} - {formatTime(s.end_time)}
                      </td>
                      <td className="p-4">
                        {s.platform === "offline" ? (
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <MapPin size={13} />
                            <span className="truncate max-w-[120px] font-medium" title={s.location}>
                              {s.location}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[#0369a1] dark:text-sky-400">
                            <Video size={13} />
                            {s.meeting_link ? (
                              <a
                                href={s.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:opacity-85 font-bold truncate max-w-[120px]"
                              >
                                Link Sesi
                              </a>
                            ) : (
                              <span className="font-semibold text-text-secondary">Belum ada Link</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${s.status === "completed"
                          ? "bg-[#EDFFF4] text-[#22C55E]"
                          : s.status === "scheduled"
                            ? "bg-[#EEF0FF] text-[#5B67D8]"
                            : s.status === "rescheduled"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-red-50 text-red-500 border border-red-200/20"
                          }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingNotesSession(s)}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-lg cursor-pointer"
                            title="Lihat Catatan"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/mentoring/addMentoring?id=${s.id}`}
                            className="p-1.5 text-[#15803d] hover:text-emerald-700 bg-green-500/10 hover:bg-green-500/20 border border-emerald-500/20 rounded-lg cursor-pointer flex items-center justify-center"
                            title="Edit / Jadwalkan Ulang"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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

      {/* Modal: View Notes (Admin + Member Notes) */}
      <Dialog open={!!viewingNotesSession} onOpenChange={(open) => !open && setViewingNotesSession(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl text-zinc-800 dark:text-zinc-200">
          {viewingNotesSession && (
            <>
              <DialogHeader className="pb-2 border-b border-zinc-150 dark:border-white/5 mb-4 shrink-0">
                <DialogTitle className="text-xs font-bold text-text-primary">
                  CATATAN SESI MENTORING #{viewingNotesSession.session_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Member & Mentor Header */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/5 rounded-2xl text-xs space-y-1">
                  <p className="font-semibold text-text-primary">Member: {viewingNotesSession.member_name}</p>
                  <p className="font-semibold text-text-primary">Mentor: {viewingNotesSession.mentor_name}</p>
                </div>

                {/* Admin Notes */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Catatan Persiapan Admin/Mentor
                  </span>
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/5 rounded-2xl p-4 text-xs text-text-primary font-medium min-h-[60px] whitespace-pre-wrap">
                    {viewingNotesSession.notes || <span className="text-text-muted italic">Tidak ada catatan admin.</span>}
                  </div>
                </div>

                {/* Member Notes (Read-only) */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Catatan/Umpan Balik Member
                  </span>
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/5 rounded-2xl p-4 text-xs text-text-primary font-medium min-h-[60px] whitespace-pre-wrap">
                    {viewingNotesSession.member_notes || <span className="text-text-muted italic">Member belum mengisi umpan balik untuk sesi ini.</span>}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
