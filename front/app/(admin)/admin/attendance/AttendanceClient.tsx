"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  CheckSquare, 
  UserCheck, 
  Plus, 
  ChevronDown,
  RotateCcw,
  Loader,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  is_present: boolean;
  scan_method: string;
  scanned_at: string | null;
  member_name: string;
  member_stage_name: string;
  member_wa: string;
  event_title: string;
  event_type: string;
  event_date: string;
}

interface EventItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
}

interface MemberItem {
  id: string;
  full_name: string;
  stage_name: string;
  whatsapp_number: string;
}

interface AttendanceClientProps {
  initialAttendances: AttendanceRecord[];
  events: EventItem[];
  members: MemberItem[];
}

export default function AttendanceClient({
  initialAttendances,
  events,
  members,
}: AttendanceClientProps) {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances);
  
  // Active Filter Event - Default to the most recent event if available
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events.length > 0 ? events[0].id : "all"
  );
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state for manual registration
  const [formMemberId, setFormMemberId] = useState("");
  const [formEventId, setFormEventId] = useState(events.length > 0 ? events[0].id : "");
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Sync formEventId with selectedEventId when it changes (excluding 'all')
  useEffect(() => {
    if (selectedEventId !== "all") {
      setFormEventId(selectedEventId);
    }
  }, [selectedEventId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    const d = new Date(timeStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }) + " WIB";
  };

  // Helper to re-fetch attendances and update client state
  const refreshAttendances = async () => {
    try {
      const supabase = createClient();
      const { data: rawAttendances, error } = await supabase
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
            stage_name,
            whatsapp_number
          ),
          events (
            title,
            event_type,
            event_date
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && rawAttendances) {
        const formatted = rawAttendances.map((att: any) => ({
          id: att.id,
          event_id: att.event_id,
          member_id: att.member_id,
          is_present: att.is_present ?? false,
          scan_method: att.scan_method || "manual",
          scanned_at: att.scanned_at || att.created_at,
          member_name: att.members?.full_name || "MEMBER TERHAPUS",
          member_stage_name: att.members?.stage_name || "",
          member_wa: att.members?.whatsapp_number || "",
          event_title: att.events?.title || "EVENT TERHAPUS",
          event_type: att.events?.event_type || "",
          event_date: att.events?.event_date || "",
        }));
        setAttendances(formatted);
      }
    } catch (err) {
      console.error("Gagal menyegarkan data kehadiran:", err);
    }
  };

  // Toggle is_present handler
  const handleToggleAttendance = async (attendanceId: string, currentStatus: boolean, memberName: string) => {
    const confirmation = window.confirm(
      `Ubah status kehadiran untuk ${memberName} menjadi ${!currentStatus ? "HADIR" : "TIDAK HADIR"}?`
    );
    if (!confirmation) return;

    try {
      const supabase = createClient();
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from("attendances")
        .update({
          is_present: nextStatus,
          scan_method: "manual",
          scanned_at: nextStatus ? new Date().toISOString() : null
        })
        .eq("id", attendanceId);

      if (error) {
        alert("Gagal mengubah status: " + error.message);
      } else {
        // Update local state instantly for smooth performance
        setAttendances((prev) =>
          prev.map((att) =>
            att.id === attendanceId
              ? {
                  ...att,
                  is_present: nextStatus,
                  scan_method: "manual",
                  scanned_at: nextStatus ? new Date().toISOString() : null
                }
              : att
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  // Handle Manual Attendance Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formMemberId) {
      setFormError("Pilih member terlebih dahulu.");
      return;
    }
    if (!formEventId) {
      setFormError("Pilih acara terlebih dahulu.");
      return;
    }

    setFormIsSubmitting(true);

    try {
      const supabase = createClient();

      // Check if attendance record already exists for this member and event
      const { data: existing, error: checkError } = await supabase
        .from("attendances")
        .select("id, is_present")
        .eq("event_id", formEventId)
        .eq("member_id", formMemberId)
        .maybeSingle();

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existing) {
        if (existing.is_present) {
          setFormError("Member ini sudah tercatat HADIR pada acara tersebut.");
          setFormIsSubmitting(false);
          return;
        }

        // Update existing record
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
        // Insert new record
        const { error: insertError } = await supabase
          .from("attendances")
          .insert({
            event_id: formEventId,
            member_id: formMemberId,
            is_present: true,
            scan_method: "manual",
            scanned_at: new Date().toISOString()
          });

        if (insertError) throw new Error(insertError.message);
      }

      // Success
      setFormSuccess("Kehadiran member berhasil dicatat!");
      setFormMemberId("");
      
      // Refresh the dataset
      await refreshAttendances();
    } catch (err: any) {
      console.error(err);
      setFormError("Gagal mencatat: " + (err.message || "Kesalahan tidak diketahui"));
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // Filtered dataset
  const filteredAttendances = useMemo(() => {
    return attendances.filter((att) => {
      const matchesEvent = 
        selectedEventId === "all" || att.event_id === selectedEventId;

      const matchesSearch = 
        att.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.member_wa.includes(searchQuery) ||
        att.member_stage_name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesEvent && matchesSearch;
    });
  }, [attendances, selectedEventId, searchQuery]);

  // Attendance stats for selected event
  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const present = filteredAttendances.filter(a => a.is_present).length;
    return {
      total,
      present,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [filteredAttendances]);

  return (
    <div className="space-y-6">
      
      {/* Page Header (Ecomora Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ DATA CENTER ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Kehadiran (Attendance)
          </h1>
        </div>
      </div>

      {/* Grid Layout: Main Table area (Left/8 cols) and Manual Form area (Right/4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Attendance List and Filters */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Summary & Filters Bar */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-default/45">
              <span className="text-xs font-bold text-text-primary">
                FILTER ACARA & STATISTIK HADIR
              </span>
              
              {/* Event selector dropdown */}
              <div className="relative min-w-[200px] w-full sm:w-auto">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2 px-4 text-xs text-text-primary focus:outline-none appearance-none cursor-pointer pr-10 font-bold"
                >
                  <option value="all">Semua Acara</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({formatDate(evt.event_date)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Attendance Summary Panel */}
            <div className="flex items-center gap-4 py-1.5 px-3 bg-bg-well border border-border-default rounded-xl">
              <div className="p-2 rounded-lg bg-text-primary text-bg-card shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider leading-none">Rasio Kehadiran</p>
                <p className="text-lg font-black text-text-primary mt-1">
                  {stats.present} <span className="text-xs font-medium text-text-secondary">dari {stats.total} peserta hadir</span>
                  <span className="text-xs font-bold text-[#2D5A00] px-2 py-0.5 rounded-full bg-accent-green ml-2">
                    {stats.percentage}% Hadir
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Table Card */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border-default/45">
              <div className="relative w-full sm:w-[260px]">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / panggung / WA..."
                  className="bg-bg-well border border-border-default rounded-full py-2 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
                />
              </div>
              <button 
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-1 text-[10px] font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider cursor-pointer self-end sm:self-center"
              >
                <RotateCcw size={11} />
                <span>Reset Pencarian</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama Member</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">No. WhatsApp</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Tipe & Acara</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Status Hadir</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Metode Scan</th>
                    <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted font-semibold">
                        Tidak ada data rekaman kehadiran ditemukan.
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
                            {att.member_stage_name && (
                              <span className="block text-[10px] font-medium text-text-secondary mt-0.5">
                                Nama Panggung: &quot;{att.member_stage_name}&quot;
                              </span>
                            )}
                          </td>
                          <td className={`${cellBorderClass} text-text-secondary font-medium`}>
                            {att.member_wa || "-"}
                          </td>
                          <td className={cellBorderClass}>
                            <span className="font-semibold text-text-primary block truncate max-w-[200px]">
                              {att.event_title}
                            </span>
                            <span className="block text-[10px] text-text-secondary font-medium mt-0.5 uppercase tracking-wide">
                              {att.event_type} • {formatDate(att.event_date)}
                            </span>
                          </td>
                          <td className={cellBorderClass}>
                            {/* Toggle Status Hadir Checkbox */}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={att.is_present}
                                onChange={() => handleToggleAttendance(att.id, att.is_present, att.member_name)}
                                className="w-4.5 h-4.5 text-text-primary bg-bg-well border-border-default rounded focus:ring-0 cursor-pointer"
                                title="Klik untuk mengubah status kehadiran"
                              />
                              <span className={`text-[10px] font-bold ml-2 px-2 py-0.5 rounded-full inline-block ${
                                att.is_present 
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
                            {att.is_present ? formatTime(att.scanned_at) : "-"}
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

        {/* Right Section: Form Manual Attendance */}
        <div className="lg:col-span-4">
          
          <div className="bg-bg-card border border-border-default rounded-2xl p-5 sticky top-6">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary pb-3 border-b border-border-default/45 mb-4">
              <Plus size={14} />
              <span>CATAT KEHADIRAN MANUAL</span>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              
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
                    <option value="">-- Cari & Pilih Member --</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name} {member.whatsapp_number ? `(${member.whatsapp_number})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
                </div>
              </div>

              {/* Select Event */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Pilih Acara
                </label>
                <div className="relative">
                  <select
                    value={formEventId}
                    onChange={(e) => setFormEventId(e.target.value)}
                    className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none appearance-none cursor-pointer pr-10 font-bold"
                  >
                    <option value="">-- Pilih Acara --</option>
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({formatDate(evt.event_date)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
                </div>
              </div>

              {/* Alert Status Feedback */}
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-[#2D5A00] rounded-xl text-xs font-semibold flex items-start gap-2 animate-pulse">
                  <UserCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formIsSubmitting}
                className="w-full bg-text-primary text-bg-card border border-text-primary rounded-full py-3 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {formIsSubmitting ? (
                  <>
                    <Loader className="w-4.5 h-4.5 animate-spin" />
                    <span>Mencatat...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4.5 h-4.5" />
                    <span>Catat Kehadiran</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
