"use client";

import React, { useState, useMemo } from "react";
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
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasPermission } from "@/lib/check-permission-client";
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
        setAttendances(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Toggle Checkbox Status Hadir
  const handleToggleAttendance = async (attendanceId: string, currentStatus: boolean, memberName: string) => {
    const confirmation = window.confirm(
      `Ubah status kehadiran "${memberName}" menjadi ${!currentStatus ? "HADIR" : "TIDAK HADIR"}?`
    );
    if (!confirmation) return;

    try {
      const supabase = createClient();
      const nextStatus = !currentStatus;
      const { error: updateError } = await supabase
        .from("attendances")
        .update({
          is_present: nextStatus,
          scan_method: "manual",
          scanned_at: nextStatus ? new Date().toISOString() : null
        })
        .eq("id", attendanceId);

      if (updateError) {
        alert("Gagal mengubah status: " + updateError.message);
      } else {
        setAttendances(prev =>
          prev.map(a =>
            a.id === attendanceId
              ? {
                ...a,
                is_present: nextStatus,
                scan_method: "manual",
                scanned_at: nextStatus ? new Date().toISOString() : null
              }
              : a
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };
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
      const supabase = createClient();

      // 1. Get existing records for the selected member IDs
      const { data, error: checkError } = await supabase
        .from("attendances")
        .select("id, member_id, is_present")
        .eq("event_id", event.id)
        .in("member_id", selectedMemberIds);

      if (checkError) throw new Error(checkError.message);

      const existingRecords = data as { id: string; member_id: string; is_present: boolean }[] | null;

      const existingMap = new Map(existingRecords?.map(r => [r.member_id, r]));

      // 2. Determine which ones to insert and which to update
      const toInsertIds = selectedMemberIds.filter(id => !existingMap.has(id));
      const toUpdateRecords = existingRecords?.filter(r => !r.is_present) || [];

      // 3. Batch Update existing absent records to present
      if (toUpdateRecords.length > 0) {
        const { error: updateError } = await supabase
          .from("attendances")
          .update({
            is_present: true,
            scan_method: "manual",
            scanned_at: new Date().toISOString()
          })
          .in("id", toUpdateRecords.map(r => r.id));

        if (updateError) throw new Error(updateError.message);
      }

      // 4. Batch Insert new attendance records as present
      if (toInsertIds.length > 0) {
        const insertData = toInsertIds.map(id => ({
          event_id: event.id,
          member_id: id,
          is_present: true,
          scan_method: "manual",
          scanned_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from("attendances")
          .insert(insertData);

        if (insertError) throw new Error(insertError.message);
      }

      setSuccess(`Berhasil mendaftarkan ${selectedMemberIds.length} peserta!`);
      setSelectedMemberIds([]);
      await refreshAttendances();

      // Close modal on success
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccess("");
      }, 1500);
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
    const sanitizeTitle = event.title.toLowerCase().replace(/[^a-z0-span0-9]+/g, "-");
    link.setAttribute("download", `absensi-${sanitizeTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered dataset
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

  // Dropdown list filter members not yet in attendance list
  const availableMembers = useMemo(() => {
    return members.filter(m => !attendances.some(a => a.member_id === m.id));
  }, [members, attendances]);

  const filteredComboboxMembers = useMemo(() => {
    return availableMembers.filter(m =>
      m.full_name.toLowerCase().includes(comboboxSearch.toLowerCase()) ||
      (m.whatsapp_number && m.whatsapp_number.includes(comboboxSearch))
    );
  }, [availableMembers, comboboxSearch]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border-default">
        <Link
          href="/admin/acara"
          className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={14} />
        </Link>
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ DETAIL ACARA KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="bg-bg-card  p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* Left Section: Jadwal & Lokasi Group */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-12">

          {/* Info 1: Date & Time */}
          <div className="flex gap-3 items-start">
            <Calendar className="w-5 h-5 text-[#1a1a1a] dark:text-white shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Jadwal Acara</p>
              <p className="text-xs font-bold text-text-primary mt-0.5">{formatDate(event.event_date)}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : " - Selesai"} WIB</p>
            </div>
          </div>

          {/* Thin divider line (dash tipis) */}
          <div className="hidden sm:block h-8 w-px bg-border-default/60" />

          {/* Info 2: Location */}
          <div className="flex gap-3 items-start max-w-md">
            <MapPin className="w-5 h-5 text-[#1a1a1a] dark:text-white shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Lokasi / Venue</p>
              <p className="text-xs font-bold text-text-primary mt-0.5 truncate" title={event.location}>{event.location}</p>
              <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-medium">{event.event_type.replace("_", " ")}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Main Grid: Attendance Table (Full width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">

        {/* Left Section: Attendance List table */}
        <div className="lg:col-span-12 space-y-6">{/* Table toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-border-default/45">
            <div className="relative w-full sm:w-[260px]">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau No. WA..."
                className="bg-bg-well border border-border-default rounded-full py-4 pl-11 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {canCreate && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-6 py-4 text-xs font-bold bg-[#F4F1BB] dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider flex-shrink-0 border-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Peserta
                </button>
              )}
              <button
                onClick={handleExportCSV}
                className="bg-[#107c41] text-white border border-[#107c41] rounded-full px-6 py-4 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0e6c38] transition-colors cursor-pointer flex-shrink-0"
              >
                <FileDown className="w-3.5 h-3.5" />
                Ekspor CSV
              </button>
              {/* Info 3: QR Code Button (Aligned to the far right with a premium design) */}
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex gap-4 items-center justify-between text-left bg-zinc-900 border border-border-default text-xs font-semibold rounded-xl py-2 px-3.5 transition-all duration-300 cursor-pointer group shrink-0 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-text-primary/5 text-white shrink-0 transition-transform duration-300">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white">QR Code</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="bg-bg-card border border-border-default rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama Peserta</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">No. WhatsApp</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Metode Scan</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Waktu Hadir</th>
                    <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted font-semibold">
                        Tidak ada data daftar absensi tercatat.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances.map((att, index) => {
                      const isLastRow = index === filteredAttendances.length - 1;
                      const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                      return (
                        <tr
                          key={att.id}
                          className="hover:bg-bg-well/30 transition-colors group"
                        >
                          <td className={`${cellBorderClass} font-bold text-text-primary`}>
                            {att.member_name}
                          </td>
                          <td className={`${cellBorderClass} text-text-secondary font-medium`}>
                            {att.member_wa || "-"}
                          </td>
                          <td className={`${cellBorderClass} text-text-secondary font-medium uppercase`}>
                            {att.is_present ? att.scan_method : "-"}
                          </td>
                          <td className={`${cellBorderClass} text-text-secondary`}>
                            {att.is_present ? formatDateTime(att.scanned_at) : "-"}
                          </td>
                          <td className={cellBorderClass}>
                            <div className="flex items-center justify-center">
                              {canDelete ? (
                                <button
                                  onClick={() => handleDeleteAttendance(att)}
                                  className="p-1.5 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer flex items-center justify-center"
                                  title="Hapus dari Daftar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-text-muted font-medium">—</span>
                              )}
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
        </div>

      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMemberIds([]);
          setComboboxSearch("");
          setError("");
          setSuccess("");
        }}
        title="Absen Peserta"
      >
        <form onSubmit={handleAddMember} className="space-y-4">

          {/* Select Member Dropdown */}
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
                  className="w-[var(--radix-popover-trigger-width)] p-0 z-50 bg-bg-card border border-border-default/85 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)] animate-in fade-in-50 zoom-in-95 duration-150"
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

          {/* Selected Members List Badge display */}
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

          {/* Status alerts feedback */}
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

          {/* Submit button */}
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

          {availableMembers.length === 0 && (
            <p className="text-[9px] text-text-secondary italic text-center">
              Semua member terdaftar sudah masuk dalam absensi.
            </p>
          )}

        </form>
      </Modal>

      {/* Modal QR Code Acara */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="QR CODE KEHADIRAN ACARA"
        icon={<QrCode size={20} />}
      >
        <div className="space-y-6 py-4 text-center">
          {/* Detail Acara */}
          <div className="space-y-2 border-b border-border-default/50 pb-4">
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

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? `${window.location.origin}/absensi/${event.id}`
                    : `/absensi/${event.id}`
                )}`}
                alt={`QR Code Kehadiran ${event.title}`}
                className="w-48 h-48 object-contain"
              />
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
