"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";


import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  FileDown,
  ChevronDown,
  Loader,
  AlertCircle,


  UserCheck,
  QrCode,
  ChevronRight,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ListOrdered
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { hasPermission } from "@/lib/check-permission-client";
import { manualAttendanceAddAction } from "@/lib/actions/attendance-actions";
import { Modal } from "@/components/ui/Modal";
import { ModalConfirmation } from "@/components/ui/Modal-Confirmation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EventDetail {
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
}

interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  is_present: boolean;
  scan_method: string;
  scanned_at: string | null;
  member_name: string;
  member_wa: string;
}

interface MemberItem {
  id: string;
  full_name: string;
  whatsapp_number: string;
}

interface AcaraDetailClientProps {
  event: EventDetail;
  initialAttendances: AttendanceRecord[];
  members: MemberItem[];
  permMap: Record<string, string[]>;
}

const EVENT_TYPE_MAP: Record<string, { label: string; dotColor: string }> = {
  open_mic: { label: "Open Mic", dotColor: "bg-amber-500" },
  speech_practice: { label: "Speech Practice", dotColor: "bg-blue-500" },
  mc_practice: { label: "MC Practice", dotColor: "bg-purple-500" },
  networking: { label: "Networking", dotColor: "bg-emerald-500" },
  content_class: { label: "Content Class", dotColor: "bg-rose-500" },
  lainnya: { label: "Acara Komunitas", dotColor: "bg-cyan-500" },
};

export default function AcaraDetailClient({
  event,
  initialAttendances,
  members,
  permMap,
}: AcaraDetailClientProps) {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances);

  // ═══ LAYER 2: BUTTON/UI VISIBILITY ═══
  const canCreate = hasPermission(permMap, "acara", "create");
  const canEdit = hasPermission(permMap, "acara", "edit");
  const canDelete = hasPermission(permMap, "acara", "delete");

  // Search & Form States
  const [search, setSearch] = useState("");
  const [comboboxSearch, setComboboxSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAttendanceListOpen, setIsAttendanceListOpen] = useState(false);
  const [selectedAttendeeDetail, setSelectedAttendeeDetail] = useState<AttendanceRecord | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    isLoading?: boolean;
    type?: "delete" | "verify" | "default";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
    isLoading: false,
    type: "default",
  });
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string>(
    `https://panggungkreator.web.id/absensi/${event.id}`
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const protocol = window.location.protocol;
      const cleanHost = host.split(":")[0].toLowerCase();

      const isLocalhost =
        cleanHost === "localhost" ||
        cleanHost === "127.0.0.1" ||
        cleanHost.endsWith(".localhost") ||
        cleanHost.endsWith(".local") ||
        /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost);

      if (isLocalhost) {
        setPublicUrl(`${protocol}//${host}/absensi/${event.id}`);
      } else {
        const publicHost = host.replace(/^(admin\.|akademi\.)/i, "");
        setPublicUrl(`${protocol}//${publicHost}/absensi/${event.id}`);
      }
    }
  }, [event.id]);


  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

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

  const formatDateTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    const d = new Date(timeStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  };

  // Re-fetch attendances
  const refreshAttendances = async () => {
    try {
      const supabase = createClient();
      const { data: raw } = await supabase
        .from("attendances")
        .select(`
          id,
          event_id,
          member_id,
          is_present,
          scan_method,
          scanned_at,
          created_at,
          members (
            full_name,
            whatsapp_number
          )
        `)
        .eq("event_id", event.id);

      if (raw) {
        const formatted = raw.map((att: any) => ({
          id: att.id,
          event_id: att.event_id,
          member_id: att.member_id,
          is_present: att.is_present ?? false,
          scan_method: att.scan_method || "manual",
          scanned_at: att.scanned_at || att.created_at,
          member_name: att.members?.full_name || "MEMBER TERHAPUS",
          member_wa: att.members?.whatsapp_number || "",
        }));

        // Urutkan berdasarkan waktu hadir terbaru di atas
        formatted.sort((a: any, b: any) => {
          const timeA = new Date(a.scanned_at || 0).getTime();
          const timeB = new Date(b.scanned_at || 0).getTime();
          return timeB - timeA;
        });

        setAttendances(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ═══ LIVE AUTO-RELOAD (REALTIME & POLLING) ═══
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`attendances_realtime_${event.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendances",
          filter: `event_id=eq.${event.id}`,
        },
        () => {
          refreshAttendances();
        }
      )
      .subscribe();

    const intervalId = setInterval(() => {
      refreshAttendances();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [event.id]);

  // Handle Adding Member to attendance list
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (selectedMemberIds.length === 0) {
      setError("Pilih setidaknya satu member.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await manualAttendanceAddAction(event.id, selectedMemberIds);

      if (res.success) {
        setSuccess(res.message || "Berhasil mendaftarkan peserta!");
        setSelectedMemberIds([]);
        await refreshAttendances();

        setTimeout(() => {
          setIsAddModalOpen(false);
          setSuccess("");
        }, 1500);
      } else {
        setError(res.error || "Gagal menambahkan peserta.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal menambahkan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Deleting attendance record
  const handleDeleteAttendance = (att: AttendanceRecord) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      title: "Hapus Rekaman Kehadiran",
      description: (
        <span>
          Apakah Anda yakin ingin menghapus rekaman kehadiran <span className="font-bold text-[#b91c1c]">{att.member_name}</span> dari acara ini? Aksi ini tidak dapat dibatalkan.
        </span>
      ),
      onConfirm: () => executeDeleteAttendance(att),
      isLoading: false,
    });
  };

  const executeDeleteAttendance = async (att: AttendanceRecord) => {
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("attendances")
        .delete()
        .eq("id", att.id);

      if (deleteError) throw new Error(deleteError.message);

      await refreshAttendances();
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error(err);
      alert("Gagal menghapus: " + err.message);
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (attendances.length === 0) {
      alert("Tidak ada data absensi untuk diekspor.");
      return;
    }

    const headers = ["Nama Member", "WhatsApp", "Status Kehadiran", "Metode Scan", "Waktu Hadir"];
    const rows = attendances.map(a => [
      a.member_name,
      a.member_wa,
      a.is_present ? "Hadir" : "Absen",
      a.is_present ? a.scan_method : "-",
      a.is_present && a.scanned_at ? new Date(a.scanned_at).toLocaleString("id-ID") : "-"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizeTitle = event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.setAttribute("download", `absensi-${sanitizeTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered dataset for popup
  const filteredAttendances = useMemo(() => {
    return attendances.filter(a =>
      a.member_name.toLowerCase().includes(search.toLowerCase()) ||
      a.member_wa.includes(search)
    );
  }, [attendances, search]);

  // Stats
  const stats = useMemo(() => {
    const total = attendances.length;
    const present = attendances.filter(a => a.is_present).length;
    return {
      total,
      present,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [attendances]);

  // Available members for adding
  const availableMembers = useMemo(() => {
    return members.filter(m => !attendances.some(a => a.member_id === m.id));
  }, [members, attendances]);

  const filteredComboboxMembers = useMemo(() => {
    return availableMembers.filter(m =>
      m.full_name.toLowerCase().includes(comboboxSearch.toLowerCase()) ||
      (m.whatsapp_number && m.whatsapp_number.includes(comboboxSearch))
    );
  }, [availableMembers, comboboxSearch]);

  const typeInfo = EVENT_TYPE_MAP[event.event_type] || EVENT_TYPE_MAP.lainnya;

  return (

    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-default/60">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/acara"
            className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} />
          </Link>



          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
              [ DETAIL ACARA KOMUNITAS ]
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {event.title}
            </h1>
          </div>
        </div>
      </div>


      {/* ═══ 1. DESKTOP VIEW (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block space-y-6">

        {/* Desktop Event Details Card */}
        <div className="bg-bg-card border border-border-default/70 rounded-xl p-5 shadow-xs">
          <div className="grid grid-cols-3 gap-6 divide-x divide-border-default/40">
            {/* Info 1: Date & Time */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-bg-well text-text-primary border border-border-default/50 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Jadwal Acara</p>
                <p className="text-xs font-bold text-text-primary mt-0.5">{formatDate(event.event_date)}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 font-mono">{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : " - Selesai"} WIB</p>
              </div>
            </div>

            {/* Info 2: Location */}
            <div className="flex items-start gap-3 pl-6">
              <div className="p-2 rounded-lg bg-bg-well text-text-primary border border-border-default/50 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Lokasi / Venue</p>
                <p className="text-xs font-bold text-text-primary mt-0.5 truncate" title={event.location}>{event.location}</p>
                <p className="text-[10px] text-text-muted uppercase font-medium mt-0.5">{event.event_type.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Attendance Table Section */}
        <div className="space-y-4">
          {/* Table Toolbar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-default/45">
            {/* Search Bar */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau No. WA..."
                className="bg-bg-well/70 border border-border-default rounded-lg h-9 pl-9 pr-3 text-xs w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            {/* Action Buttons Group */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Auto-Reload
              </span>

              {canCreate && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold bg-[#f4f1bb] hover:bg-[#eae6a5] dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 text-zinc-900 rounded-lg transition-colors cursor-pointer shrink-0 border border-[#e5e19e] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Peserta</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium bg-bg-card hover:bg-bg-well text-text-primary rounded-lg border border-border-default transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-text-muted" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default bg-bg-well/50">
                  <th className="py-3.5 px-5 border-r border-border-default/60">Nama Peserta</th>
                  <th className="py-3.5 px-5 border-r border-border-default/60">No. WhatsApp</th>
                  <th className="py-3.5 px-5 border-r border-border-default/60">Metode Scan</th>
                  <th className="py-3.5 px-5 border-r border-border-default/60">Waktu Hadir</th>
                  <th className="py-3.5 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-muted font-medium">
                      Tidak ada data absensi tercatat.
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((att) => (
                    <tr key={att.id} className="hover:bg-bg-well/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-text-primary border-r border-border-default/40">
                        {att.member_name}
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary border-r border-border-default/40 font-medium">
                        {att.member_wa || "-"}
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary border-r border-border-default/40 font-medium uppercase">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-bg-well border border-border-default/60">
                          {att.is_present ? att.scan_method : "-"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary border-r border-border-default/40 font-mono">
                        {att.is_present ? formatDateTime(att.scanned_at) : "-"}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {canDelete ? (
                          <button
                            onClick={() => handleDeleteAttendance(att)}
                            className="p-1.5 text-red-600 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer inline-flex items-center justify-center transition-colors"
                            title="Hapus dari Daftar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-text-muted font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ 2. MOBILE VIEW (visible on mobile, hidden on md/lg) ═══ */}
      <div className="block md:hidden max-w-3xl mx-auto space-y-5">
        {/* KARTU 1: DETAIL UTAMA EVENT (Persis Estetika Referensi) */}
        <div className="bg-white dark:bg-[#121212] border border-border-default/80 rounded-3xl p-5 shadow-xs relative">
          {/* Baris Atas: Status Badge & Tipe Acara */}
          <div className="flex items-center justify-between gap-2">
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

            {/* Dot Indicator (• Tipe Acara) */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${typeInfo.dotColor} shrink-0`}></span>
              <span className="text-xs font-semibold text-text-primary tracking-tight">
                {typeInfo.label}
              </span>
            </div>
          </div>

          {/* Bagian Tengah: Judul & Jam Pelaksanaan */}
          <div className="my-4">
            <h2 className="text-xl font-bold text-text-primary tracking-tight leading-snug">
              {event.title}
            </h2>
            <p className="text-xs text-text-muted mt-1 font-mono font-medium">
              {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : " - Selesai"} WIB
            </p>
            {event.description && (
              <p className="text-xs text-text-secondary mt-3 leading-relaxed border-t border-border-default/40 pt-3">
                {event.description}
              </p>
            )}
          </div>

          {/* Baris Bawah: Tanggal, Lokasi, dan Info Kapasitas */}
          <div className="pt-3 border-t border-border-default/40 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary">
                Tanggal: {formatDate(event.event_date)}
              </p>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                <span>{event.location}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-text-primary bg-bg-well border border-border-default/60 px-3 py-1 rounded-full">
                {stats.present} peserta
              </span>
            </div>
          </div>
        </div>

        {/* KARTU 2: RINGKASAN PRESENSI & TRIGGER POPUP */}
        <div className="bg-white dark:bg-[#121212] border border-border-default/80 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                Presensi Peserta
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>

          {/* List Peserta Hadir (Clickable for Detail Modal Popup) */}
          {attendances.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="space-y-1.5">
                {attendances.slice(0, 5).map((att) => (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => setSelectedAttendeeDetail(att)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-bg-well/50 hover:bg-bg-well border border-border-default/50 hover:border-border-default rounded-xl text-xs transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/20">
                        {att.member_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-text-primary block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {att.member_name}
                        </span>
                        <span className="text-[10px] text-text-muted block truncate">
                          {att.member_wa || "Tanpa No. WhatsApp"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-text-muted">
                        {formatDateTime(att.scanned_at)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* KARTU 3: TAUTAN & QR CODE PRESENSI PESERTA */}
        <div className="bg-white dark:bg-[#121212] border border-border-default/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary tracking-tight">
              Tautan Presensi Peserta
            </span>
            <button
              type="button"
              onClick={() => handleCopyUrl(publicUrl)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-bg-well border border-border-default/60 rounded-xl px-3 py-2">
            <p suppressHydrationWarning className="text-[11px] font-mono text-text-secondary truncate flex-1 select-all">
              {publicUrl}
            </p>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary p-1 transition-colors shrink-0"
              title="Buka Link di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-bg-well hover:bg-bg-well/80 border border-border-default/70 rounded-xl text-xs font-semibold text-text-primary transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Tampilkan QR Code Layar Penuh</span>
          </button>
        </div>
      </div>


      {/* ═══ POPUP / MODAL: DAFTAR ABSENSI LENGKAP ═══ */}
      <Modal
        isOpen={isAttendanceListOpen}
        onClose={() => setIsAttendanceListOpen(false)}
        maxWidth="max-w-3xl"
        title="Daftar Presensi Peserta"
        icon={<Users size={20} />}
        headerRight={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        }
      >
        <div className="space-y-4 py-1">
          {/* Toolbar Dalam Popup: Search & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-default/50">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau No. WA..."
                className="bg-bg-well/70 border border-border-default rounded-lg h-9 pl-9 pr-3 text-xs w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              {canCreate && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold bg-[#f4f1bb] hover:bg-[#eae6a5] dark:bg-yellow-100 dark:text-zinc-900 text-zinc-900 rounded-lg transition-colors cursor-pointer shrink-0 border border-[#e5e19e] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Peserta</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium bg-bg-card hover:bg-bg-well text-text-primary rounded-lg border border-border-default transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-text-muted" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Tabel Absensi Di Dalam Popup */}
          <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[50vh] scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-bg-well/90 backdrop-blur-sm">
                  <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default">
                    <th className="py-3 px-4">Nama Peserta</th>
                    <th className="py-3 px-4">No. WhatsApp</th>
                    <th className="py-3 px-4">Metode Scan</th>
                    <th className="py-3 px-4">Waktu Hadir</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/40">
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-muted font-medium">
                        Tidak ada data daftar absensi tercatat.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances.map((att) => (
                      <tr
                        key={att.id}
                        onClick={() => setSelectedAttendeeDetail(att)}
                        className="hover:bg-bg-well/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-bold text-text-primary">
                          {att.member_name}
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium">
                          {att.member_wa || "-"}
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium uppercase">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-bg-well border border-border-default/60">
                            {att.is_present ? att.scan_method : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-mono">
                          {att.is_present ? formatDateTime(att.scanned_at) : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            {canDelete ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAttendance(att);
                                }}
                                className="p-1.5 text-red-600 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer flex items-center justify-center transition-colors"
                                title="Hapus dari Daftar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-text-muted font-medium">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* ═══ MODAL: DETAIL KEHADIRAN PESERTA ═══ */}
      <Modal
        isOpen={!!selectedAttendeeDetail}
        onClose={() => setSelectedAttendeeDetail(null)}
        maxWidth="max-w-md"
        title="Detail Peserta"
        icon={<UserCheck size={20} />}
      >
        {selectedAttendeeDetail && (
          <div className="space-y-4 py-2">
            {/* Member Profile Header */}
            <div className="flex items-center gap-3.5 p-4 bg-bg-well/70 rounded-2xl border border-border-default/60">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-base flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                {selectedAttendeeDetail.member_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-text-primary truncate">
                  {selectedAttendeeDetail.member_name}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {selectedAttendeeDetail.member_wa || "Nomor WhatsApp belum terdata"}
                </p>
              </div>
            </div>

            {/* Detail Attributes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-bg-well/40 rounded-xl border border-border-default/40 text-xs">
                <span className="text-text-muted font-medium">Status Kehadiran</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hadir
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-bg-well/40 rounded-xl border border-border-default/40 text-xs">
                <span className="text-text-muted font-medium">Metode Presensi</span>
                <span className="font-mono font-bold uppercase text-text-primary px-2.5 py-0.5 bg-bg-card rounded-md border border-border-default/50 text-[10px]">
                  {selectedAttendeeDetail.scan_method === "qr_code" ? "Scan QR Code" : "Input Manual"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-bg-well/40 rounded-xl border border-border-default/40 text-xs">
                <span className="text-text-muted font-medium">Waktu Presensi</span>
                <span className="font-mono text-text-primary font-medium">
                  {selectedAttendeeDetail.scanned_at ? new Date(selectedAttendeeDetail.scanned_at).toLocaleString("id-ID") : "-"}
                </span>
              </div>

              {selectedAttendeeDetail.member_wa && (
                <a
                  href={`https://wa.me/${selectedAttendeeDetail.member_wa.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  <span>Hubungi via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Delete Button */}
            {canDelete && (
              <div className="pt-2 border-t border-border-default/50">
                <button
                  type="button"
                  onClick={() => {
                    const att = selectedAttendeeDetail;
                    setSelectedAttendeeDetail(null);
                    handleDeleteAttendance(att);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus dari Daftar Absensi</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ═══ FLOATING ACTION CONTROLS (Compact Proportional Dock) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Tombol QR Code */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Tampilkan QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Tombol Buka Popup Absensi */}
          <button
            type="button"
            onClick={() => setIsAttendanceListOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative"
            title="Buka Daftar Absensi"
          >
            <Users className="w-4 h-4" />
            {stats.present > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full min-w-[16px] h-4 flex items-center justify-center border-2 border-zinc-900 leading-none">
                {stats.present > 99 ? "99+" : stats.present}
              </span>
            )}
          </button>

          {/* Tombol Ekspor CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Ekspor CSV"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Tombol Tambah Peserta Absen */}
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Tambah Peserta Absen"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ MODAL: TAMBAH PESERTA MANUAL ═══ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMemberIds([]);
          setComboboxSearch("");
          setError("");
          setSuccess("");
        }}
        title="Tambah Peserta Absen"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {selectedMemberIds.length > 0 && (
            <div className="space-y-2 bg-bg-well border border-border-default/60 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Peserta Terpilih ({selectedMemberIds.length})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="text-[9px] font-bold text-[#b91c1c] hover:underline cursor-pointer uppercase"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-thin py-1">
                {selectedMemberIds.map(id => {
                  const m = members.find(member => member.id === id);
                  if (!m) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 bg-bg-card border border-border-default/80 rounded-full py-1 pl-3 pr-2 text-xs font-semibold text-text-primary shadow-sm hover:border-red-500/30 group transition-all"
                    >
                      <span>{m.full_name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberIds(prev => prev.filter(mid => mid !== id))}
                        className="w-4 h-4 rounded-full bg-bg-well hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer text-text-secondary"
                        title="Hapus dari pilihan"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block">
              Pilih Peserta (Bisa memilih beberapa)
            </label>
            <div className="relative mt-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between bg-bg-well border border-border-default rounded-full py-3 px-6 text-xs text-text-primary focus:outline-none cursor-pointer pr-10 font-bold text-left min-h-10"
                  >
                    <span className="truncate">
                      {selectedMemberIds.length > 0
                        ? `${selectedMemberIds.length} Peserta Terpilih`
                        : availableMembers.length === 0
                          ? "Semua member sudah terdaftar"
                          : "Cari & Pilih Member..."}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 z-50 bg-bg-card border border-border-default/85 rounded-2xl shadow-xl animate-in fade-in-50 zoom-in-95 duration-150"
                  align="start"
                  sideOffset={6}
                >
                  <div className="flex items-center border-b border-border-default/50 px-6 py-4">
                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-55 text-text-secondary" />
                    <input
                      placeholder="Cari nama atau No. WA..."
                      value={comboboxSearch}
                      onChange={(e) => setComboboxSearch(e.target.value)}
                      className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-text-muted text-text-primary border-none p-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                    {filteredComboboxMembers.length === 0 ? (
                      <p className="text-[11px] text-text-muted text-center py-4">
                        Tidak ada member ditemukan.
                      </p>
                    ) : (
                      filteredComboboxMembers.map((member) => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              setSelectedMemberIds(prev =>
                                isSelected
                                  ? prev.filter(id => id !== member.id)
                                  : [...prev, member.id]
                              );
                            }}
                            className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-xs hover:bg-bg-well transition-colors text-text-primary font-medium cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-4 h-4 border border-border-default rounded bg-bg-well shrink-0">
                              {isSelected && <Check className="h-3 w-3 text-text-primary" />}
                            </div>
                            <div className="flex-1 truncate">
                              {member.full_name}{" "}
                              {member.whatsapp_number && (
                                <span className="text-text-muted font-normal text-[10px]">
                                  ({member.whatsapp_number})
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 text-[#2D5A00] rounded-xl text-xs font-semibold flex items-start gap-2 animate-pulse">
              <UserCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || selectedMemberIds.length === 0}
            className="w-full bg-text-primary text-bg-card border border-text-primary rounded-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4.5 h-4.5 animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <Plus className="w-4.5 h-4.5" />
                <span>Daftarkan {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ""} Hadir</span>
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* ═══ MODAL: QR CODE KEHADIRAN ACARA ═══ */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="QR CODE KEHADIRAN ACARA"
        icon={<QrCode size={20} />}
      >
        <div className="space-y-6 py-4 text-center">
          <div className="space-y-2 border-b border-border-default/50 pb-3">
            <h3 className="text-lg font-bold text-text-primary">
              {event.title}
            </h3>
            <p className="text-xs text-text-secondary">
              {formatDate(event.event_date)} • {event.start_time} - {event.end_time || "Selesai"}
            </p>
            <p className="text-xs text-text-muted font-medium">
              📍 {event.location}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  publicUrl
                )}`}
                alt={`QR Code Kehadiran ${event.title}`}
                className="w-52 h-52 object-contain"
              />
            </div>

            <div className="w-full max-w-sm bg-bg-well border border-border-default/70 rounded-xl p-3 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Link Presensi Peserta
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(publicUrl)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 bg-bg-card border border-border-default/50 rounded-lg px-2.5 py-1.5 overflow-hidden">
                <p suppressHydrationWarning className="text-[11px] font-mono text-text-secondary truncate flex-1 select-all">
                  {publicUrl}
                </p>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text-primary p-0.5 transition-colors"
                  title="Buka Link di Tab Baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Pindai untuk Hadir
              </p>
              <p className="text-[9px] text-text-muted max-w-xs mx-auto">
                Scan kode QR ini untuk mencatat kehadiran peserta secara langsung ke sistem.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ModalConfirmation
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        isLoading={confirmModal.isLoading}
        type={confirmModal.type}
      />
    </div>
  );
}

