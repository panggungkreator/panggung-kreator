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
  UserCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasPermission } from "@/lib/check-permission-client";

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
  const [formMemberId, setFormMemberId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    if (!formMemberId) {
      setError("Pilih member terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // 1. Check if member is already in the list
      const { data: existing, error: checkError } = await supabase
        .from("attendances")
        .select("id, is_present")
        .eq("event_id", event.id)
        .eq("member_id", formMemberId)
        .maybeSingle();

      if (checkError) throw new Error(checkError.message);

      if (existing) {
        if (existing.is_present) {
          setError("Member sudah tercatat HADIR.");
          setIsSubmitting(false);
          return;
        }

        // Update
        const { error: updateError } = await supabase
          .from("attendances")
          .update({
            is_present: true,
            scan_method: "manual",
            scanned_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from("attendances")
          .insert({
            event_id: event.id,
            member_id: formMemberId,
            is_present: true,
            scan_method: "manual",
            scanned_at: new Date().toISOString()
          });

        if (insertError) throw new Error(insertError.message);
      }

      setSuccess("Peserta berhasil ditambahkan!");
      setFormMemberId("");
      await refreshAttendances();
    } catch (err: any) {
      console.error(err);
      setError("Gagal menambahkan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Deleting attendance record
  const handleDeleteAttendance = async (att: AttendanceRecord) => {
    const confirmation = window.confirm(
      `Hapus rekaman kehadiran ${att.member_name} dari acara ini?`
    );
    if (!confirmation) return;

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("attendances")
        .delete()
        .eq("id", att.id);

      if (deleteError) throw new Error(deleteError.message);

      alert("Rekaman kehadiran dihapus.");
      await refreshAttendances();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menghapus: " + err.message);
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
      <div className="bg-bg-card border border-border-default rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Info 1: Date & Time */}
        <div className="flex gap-3">
          <div className="p-2.5 rounded-lg bg-bg-well border border-border-default text-text-secondary shrink-0 self-start">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Jadwal Acara</p>
            <p className="text-xs font-bold text-text-primary mt-0.5">{formatDate(event.event_date)}</p>
            <p className="text-[10px] text-text-secondary mt-0.5">{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : " - Selesai"} WIB</p>
          </div>
        </div>

        {/* Info 2: Location */}
        <div className="flex gap-3">
          <div className="p-2.5 rounded-lg bg-bg-well border border-border-default text-text-secondary shrink-0 self-start">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Lokasi / Venue</p>
            <p className="text-xs font-bold text-text-primary mt-0.5 truncate" title={event.location}>{event.location}</p>
            <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-medium">{event.event_type.replace("_", " ")}</p>
          </div>
        </div>

        {/* Info 3: Capacity Ratio */}
        <div className="flex gap-3">
          <div className="p-2.5 rounded-lg bg-bg-well border border-border-default text-text-secondary shrink-0 self-start">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Kapasitas</p>
            <p className="text-xs font-bold text-text-primary mt-0.5">
              {event.capacity === 0 ? "Unlimited" : `${event.capacity} Kursi`}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5">{stats.total} pendaftar tercatat</p>
          </div>
        </div>

        {/* Info 4: Present Attendance Stats */}
        <div className="bg-bg-well border border-border-default rounded-xl p-3.5 flex flex-col justify-center">
          <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider leading-none">Rasio Kehadiran</p>
          <p className="text-base font-black text-text-primary mt-1.5 leading-none">
            {stats.present} / {stats.total} <span className="text-[10px] text-text-secondary font-medium">Hadir</span>
          </p>
          <div className="w-full bg-border-default h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-text-primary h-full" style={{ width: `${stats.percentage}%` }} />
          </div>
        </div>

      </div>

      {/* Main Grid: Attendance Table (8 cols) and Add Participant form (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Section: Attendance List table */}
        <div className={canCreate ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          <div className="bg-bg-card border border-border-default rounded-2xl p-5">

            {/* Table toolbar */}
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
                  className="bg-bg-well border border-border-default rounded-full py-2 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="border border-border-default rounded-full px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-bg-well text-text-primary transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Ekspor CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama Peserta</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">No. WhatsApp</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Status Hadir</th>
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
                          <td className={cellBorderClass}>
                            {/* Toggle Attendance status */}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={att.is_present}
                                disabled={!canEdit}
                                onChange={() => handleToggleAttendance(att.id, att.is_present, att.member_name)}
                                className="w-4.5 h-4.5 text-text-primary bg-bg-well border-border-default rounded focus:ring-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                title={canEdit ? "Klik untuk mengubah kehadiran" : "Anda tidak memiliki akses edit"}
                              />
                              <span className={`text-[10px] font-bold ml-2 px-2 py-0.5 rounded-full inline-block ${att.is_present
                                ? "bg-[#EDFFF4] text-[#22C55E]"
                                : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                                }`}>
                                {att.is_present ? "Hadir" : "Absen"}
                              </span>
                            </div>
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

        {/* Right Section: Add member to attendance list */}
        {canCreate && (
          <div className="lg:col-span-4">
            <div className="bg-bg-card border border-border-default rounded-2xl p-5 sticky top-6">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary pb-3 border-b border-border-default/45 mb-4">
                <Plus size={14} />
                <span>DAFTARKAN PESERTA ACARA</span>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">

                {/* Select Member */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Pilih Member
                  </label>
                  <div className="relative">
                    <select
                      value={formMemberId}
                      onChange={(e) => setFormMemberId(e.target.value)}
                      className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none appearance-none cursor-pointer pr-10 font-bold"
                    >
                      <option value="">-- Pilih dari Member --</option>
                      {availableMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name} {member.whatsapp_number ? `(${member.whatsapp_number})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
                  </div>
                </div>

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
                  disabled={isSubmitting || availableMembers.length === 0}
                  className="w-full bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4.5 h-4.5 animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4.5 h-4.5" />
                      <span>Daftarkan Hadir</span>
                    </>
                  )}
                </button>

                {availableMembers.length === 0 && (
                  <p className="text-[9px] text-text-secondary italic text-center">
                    Semua member terdaftar sudah masuk dalam absensi.
                  </p>
                )}

              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
