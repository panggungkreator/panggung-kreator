"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  X,
  RotateCcw,
  User,
  Clock,
  Code2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AdminPagination from "@/components/admin/AdminPagination";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  module: string;
  target_id: string | null;
  description: string;
  old_data: any | null;
  new_data: any | null;
  ip_address: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

interface AdminItem {
  id: string;
  full_name: string;
}

interface LogsClientProps {
  initialLogs: AdminLog[];
  adminsList: AdminItem[];
  paginationLimit?: number;
}

export default function LogsClient({
  initialLogs,
  adminsList,
  paginationLimit = 10,
}: LogsClientProps) {
  const router = useRouter();
  const [logs] = useState<AdminLog[]>(initialLogs);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Expanded row ID for JSON details
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, adminFilter, moduleFilter, actionFilter]);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " WIB"
    );
  };

  const toggleExpandLog = (logId: string) => {
    setExpandedLogId((prev) => (prev === logId ? null : logId));
  };

  // Extract unique modules
  const modulesList = useMemo(() => {
    const set = new Set(logs.map((l) => l.module));
    return Array.from(set).filter(Boolean);
  }, [logs]);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const query = search.toLowerCase();
      const matchesSearch =
        l.description.toLowerCase().includes(query) ||
        l.action.toLowerCase().includes(query) ||
        l.admin_name.toLowerCase().includes(query) ||
        l.module.toLowerCase().includes(query);

      const matchesAdmin = adminFilter === "all" || l.admin_id === adminFilter;
      const matchesModule = moduleFilter === "all" || l.module === moduleFilter;

      const act = l.action.toUpperCase();
      let matchesAction = true;
      if (actionFilter === "create") matchesAction = act.includes("CREATE") || act.includes("INSERT");
      else if (actionFilter === "update") matchesAction = act.includes("UPDATE") || act.includes("EDIT");
      else if (actionFilter === "delete") matchesAction = act.includes("DELETE") || act.includes("REVOKE");

      return matchesSearch && matchesAdmin && matchesModule && matchesAction;
    });
  }, [logs, search, adminFilter, moduleFilter, actionFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredLogs.length, startIndex + limit);
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, startIndex, endIndex]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("INSERT")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {action}
        </span>
      );
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          {action}
        </span>
      );
    }
    if (act.includes("DELETE") || act.includes("REVOKE")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 font-mono">
        {action}
      </span>
    );
  };

  const createCount = useMemo(
    () => logs.filter((l) => l.action.toUpperCase().includes("CREATE") || l.action.toUpperCase().includes("INSERT")).length,
    [logs]
  );
  const updateCount = useMemo(
    () => logs.filter((l) => l.action.toUpperCase().includes("UPDATE") || l.action.toUpperCase().includes("EDIT")).length,
    [logs]
  );
  const deleteCount = useMemo(
    () => logs.filter((l) => l.action.toUpperCase().includes("DELETE") || l.action.toUpperCase().includes("REVOKE")).length,
    [logs]
  );

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ SYSTEM ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Logs Aktivitas Administrator
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit trail pencatatan aktivitas, mutasi data, dan riwayat operasional CMS.
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
              placeholder="Cari aksi, deskripsi, admin..."
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
          <button
            type="button"
            onClick={() => router.refresh()}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
            title="Muat Ulang Log"
          >
            <RotateCcw size={13} className="stroke-[2.5]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ═══ INFO BANNER (Auditing Explanation) ═══ */}
      <div className="bg-bg-well/50 border border-border-default/70 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
        <div className="text-text-secondary">
          <p className="font-bold text-text-primary">Audit Log Pelacakan Aktivitas Sistem</p>
          <p className="text-[11px] mt-0.5 text-text-muted">
            Setiap aksi create, update, dan delete oleh administrator tersimpan secara permanen untuk menjamin integritas data dan transparansi operasional.
          </p>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua Log */}
        <button
          type="button"
          onClick={() => {
            setActionFilter("all");
            setModuleFilter("all");
            setAdminFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            actionFilter === "all" && moduleFilter === "all" && adminFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Log</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {logs.length}
          </span>
        </button>

        {/* Create */}
        <button
          type="button"
          onClick={() => {
            setActionFilter("create");
            setModuleFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            actionFilter === "create"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CREATE</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {createCount}
          </span>
        </button>

        {/* Update */}
        <button
          type="button"
          onClick={() => {
            setActionFilter("update");
            setModuleFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            actionFilter === "update"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
          <span>UPDATE</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {updateCount}
          </span>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => {
            setActionFilter("delete");
            setModuleFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            actionFilter === "delete"
              ? "bg-rose-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-white" />
          <span>DELETE</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {deleteCount}
          </span>
        </button>

        {/* Module filter pills */}
        {modulesList.map((m) => {
          const count = logs.filter((l) => l.module === m).length;
          const isSelected = moduleFilter === m && actionFilter === "all";
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setModuleFilter(m);
                setActionFilter("all");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span className="uppercase">{m}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold bg-bg-well/50">
                <th className="py-3.5 px-4 border-b border-border-default/70 w-44">Waktu Kegiatan</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 w-40">Admin</th>
                <th className="py-3.5 px-3 border-b border-border-default/70 w-28">Modul</th>
                <th className="py-3.5 px-3 border-b border-border-default/70 w-28">Aksi</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Deskripsi Kegiatan</th>
                <th className="py-3.5 px-3 border-b border-border-default/70 w-20 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada rekaman log kegiatan ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpandLog(log.id)}
                        className="border-b border-border-default/40 last:border-b-0 hover:bg-bg-well/30 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-text-primary block truncate">
                            {log.admin_name}
                          </span>
                          <span className="text-[10px] text-text-muted truncate block">
                            {log.admin_email}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-well text-text-secondary border border-border-default/50">
                            {log.module}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">{getActionBadge(log.action)}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-text-primary text-xs leading-relaxed">
                            {log.description}
                          </p>
                          <span className="text-[10px] text-text-muted font-mono block mt-0.5">
                            IP: {log.ip_address}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            className="p-1 rounded text-text-secondary hover:text-text-primary"
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-bg-well/40 p-4 border-b border-border-default/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                  Data Lama (Old Data)
                                </span>
                                <pre className="bg-bg-card border border-border-default rounded-xl p-3 text-[10px] font-mono text-text-primary overflow-x-auto max-h-56 whitespace-pre-wrap">
                                  {log.old_data
                                    ? JSON.stringify(log.old_data, null, 2)
                                    : "Tidak ada data awal."}
                                </pre>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                  Data Baru (New Data)
                                </span>
                                <pre className="bg-bg-card border border-border-default rounded-xl p-3 text-[10px] font-mono text-text-primary overflow-x-auto max-h-56 whitespace-pre-wrap">
                                  {log.new_data
                                    ? JSON.stringify(log.new_data, null, 2)
                                    : "Tidak ada perubahan data baru."}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-3.5">
        {paginatedLogs.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada rekaman log kegiatan.</p>
          </div>
        ) : (
          paginatedLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99] space-y-3"
              >
                {/* Top Row: Action Badge + Module + Date */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-default/40">
                  <div className="flex items-center gap-1.5">
                    {getActionBadge(log.action)}
                    <span className="px-2 py-0.5 rounded-full bg-bg-well text-[10px] font-bold uppercase tracking-wider text-text-secondary border border-border-default/50">
                      {log.module}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>

                {/* Middle Row: Admin & Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-bg-well border border-border-default flex items-center justify-center shrink-0 text-text-secondary">
                      <User size={11} />
                    </div>
                    <span className="text-xs font-bold text-text-primary truncate">
                      {log.admin_name}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono truncate">
                      ({log.ip_address})
                    </span>
                  </div>

                  <p className="text-xs text-text-primary leading-relaxed pt-1">
                    {log.description}
                  </p>
                </div>

                {/* Bottom Row: Accordion Toggle for JSON Details */}
                {(log.old_data || log.new_data) && (
                  <div className="pt-2 border-t border-border-default/40">
                    <button
                      type="button"
                      onClick={() => toggleExpandLog(log.id)}
                      className="w-full h-8 rounded-xl bg-bg-well/60 hover:bg-bg-well text-text-secondary hover:text-text-primary text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Code2 size={13} />
                      <span>{isExpanded ? "Tutup Detail JSON" : "Lihat Detail Data / JSON"}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {/* Expanded JSON in mobile card */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2.5 pt-2 border-t border-border-default/30 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            Data Lama:
                          </span>
                          <pre className="bg-bg-well border border-border-default rounded-xl p-2.5 text-[10px] font-mono text-text-primary overflow-x-auto max-h-44 whitespace-pre-wrap">
                            {log.old_data
                              ? JSON.stringify(log.old_data, null, 2)
                              : "Tidak ada data awal."}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            Data Baru:
                          </span>
                          <pre className="bg-bg-well border border-border-default rounded-xl p-2.5 text-[10px] font-mono text-text-primary overflow-x-auto max-h-44 whitespace-pre-wrap">
                            {log.new_data
                              ? JSON.stringify(log.new_data, null, 2)
                              : "Tidak ada perubahan."}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLogs.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="log aktivitas"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Module & Admin Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  moduleFilter !== "all" || adminFilter !== "all" || actionFilter !== "all"
                    ? "text-white bg-zinc-800"
                    : ""
                }`}
                title="Filter Log"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(moduleFilter !== "all" || adminFilter !== "all" || actionFilter !== "all") && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-68 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50 max-h-80 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Audit Log
                </span>
                {(moduleFilter !== "all" || adminFilter !== "all" || actionFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setModuleFilter("all");
                      setAdminFilter("all");
                      setActionFilter("all");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Action Filter Chips */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aksi</p>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "create", label: "Create" },
                    { id: "update", label: "Update" },
                    { id: "delete", label: "Delete" },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActionFilter(act.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        actionFilter === act.id
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Filter Chips */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Modul</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setModuleFilter("all")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      moduleFilter === "all"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                    }`}
                  >
                    Semua
                  </button>
                  {modulesList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModuleFilter(m)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer uppercase ${
                        moduleFilter === m
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Refresh button */}
          <button
            type="button"
            onClick={() => router.refresh()}
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Muat Ulang Data"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
