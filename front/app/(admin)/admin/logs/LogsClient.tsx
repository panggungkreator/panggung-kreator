"use client";

import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  AlertCircle,
  FolderSync,
  Info
} from "lucide-react";

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
}

export default function LogsClient({
  initialLogs,
  adminsList,
}: LogsClientProps) {
  const [logs, setLogs] = useState<AdminLog[]>(initialLogs);

  // Filters
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  // Expanded row ID
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }) + " WIB";
  };

  const toggleExpandLog = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };

  // Extract unique modules for dropdown filter
  const modulesList = useMemo(() => {
    const set = new Set(logs.map(l => l.module));
    return Array.from(set).filter(Boolean);
  }, [logs]);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.description.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.admin_name.toLowerCase().includes(search.toLowerCase());

      const matchesAdmin =
        adminFilter === "all" || l.admin_id === adminFilter;

      const matchesModule =
        moduleFilter === "all" || l.module === moduleFilter;

      return matchesSearch && matchesAdmin && matchesModule;
    });
  }, [logs, search, adminFilter, moduleFilter]);

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("INSERT")) return "bg-emerald-50 text-emerald-700 border-emerald-200/20";
    if (act.includes("UPDATE") || act.includes("EDIT")) return "bg-blue-50 text-blue-700 border-blue-200/20";
    if (act.includes("DELETE") || act.includes("REVOKE")) return "bg-red-50 text-red-700 border-red-200/20";
    return "bg-zinc-100 text-zinc-650 border-zinc-200/30";
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ SYSTEM ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Logs Aktivitas Administrator
          </h1>
        </div>
      </div>

      {/* Info warning */}
      <div className="bg-bg-well border border-border-default rounded-2xl p-5 flex gap-3 text-xs font-medium text-text-secondary leading-relaxed">
        <Info className="w-5 h-5 text-text-secondary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-text-primary">Audit Log Pelacakan Aktivitas Admin</p>
          <p className="mt-1">
            Halaman ini mencatat semua perubahan data yang dilakukan oleh administrator (mencakup log edit, create, delete, audit absensi, dll) sebagai penunjang transparansi internal sistem. Klik baris tabel untuk meninjau detail perbandingan data lama vs data baru.
          </p>
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
              placeholder="Cari deskripsi, aksi, admin..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Admin Filter */}

          <div className="relative">
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Administrator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Administrator</SelectItem>
                {adminsList.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Filter */}
          <div className="relative">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Modul</SelectItem>
                {modulesList.map((m, i) => (
                  <SelectItem key={i} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Grid Boxed Table of Logs */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
          <span className="text-xs font-bold text-text-primary">
            REKAMAN AUDIT LOG SYSTEM ({filteredLogs.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 w-52">Waktu Kegiatan</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 w-44">Admin</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 w-32">Modul</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 w-28">Aksi</th>
                <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Deskripsi Kegiatan</th>
                <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50 w-28 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data rekaman log kegiatan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const isLastRow = index === filteredLogs.length - 1;
                  const isExpanded = expandedLogId === log.id;

                  // Use normal borders unless the row is expanded to keep it neat
                  const cellBorderClass = `${isLastRow && !isExpanded ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                  return (
                    <React.Fragment key={log.id}>
                      {/* Main Table Row */}
                      <tr
                        onClick={() => toggleExpandLog(log.id)}
                        className="hover:bg-bg-well/30 transition-colors group cursor-pointer"
                      >
                        <td className={`${cellBorderClass} text-text-secondary font-medium`}>
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className={`${cellBorderClass} font-bold text-text-primary`}>
                          {log.admin_name}
                          <span className="block text-[9px] font-medium text-text-secondary mt-0.5">
                            {log.admin_email}
                          </span>
                        </td>
                        <td className={`${cellBorderClass} font-bold text-text-primary uppercase`}>
                          {log.module}
                        </td>
                        <td className={cellBorderClass}>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className={`${cellBorderClass} text-text-primary font-medium`}>
                          {log.description}
                          <span className="block text-[9px] font-semibold text-text-secondary mt-0.5">IP Address: {log.ip_address}</span>
                        </td>
                        <td className={`${cellBorderClass} text-center`}>
                          <button className="text-text-secondary hover:text-text-primary font-semibold">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Details Area (old vs new data JSON Comparison) */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={6}
                            className="bg-bg-well/40 p-5 border-b border-border-default/40"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Old Data */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">
                                  Data Lama (Old Data)
                                </span>
                                <pre className="bg-bg-well border border-border-default rounded-xl p-3.5 text-[10px] text-text-primary font-mono overflow-x-auto max-h-[220px] whitespace-pre-wrap">
                                  {log.old_data
                                    ? JSON.stringify(log.old_data, null, 2)
                                    : <span className="italic text-text-secondary">Tidak ada data awal.</span>
                                  }
                                </pre>
                              </div>

                              {/* New Data */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">
                                  Data Baru (New Data)
                                </span>
                                <pre className="bg-bg-well border border-border-default rounded-xl p-3.5 text-[10px] text-text-primary font-mono overflow-x-auto max-h-[220px] whitespace-pre-wrap">
                                  {log.new_data
                                    ? JSON.stringify(log.new_data, null, 2)
                                    : <span className="italic text-text-secondary">Tidak ada perubahan data terekam.</span>
                                  }
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

    </div>
  );
}
