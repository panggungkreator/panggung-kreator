"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COLOR_RANGERS, ColorRangerSlug, colorRangerStyle } from "@/lib/constants";
import { deleteAdminAction } from "@/lib/actions/admin-actions";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
  User,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Shield,
  Loader2,
  SlidersHorizontal,
  X,
  Mail,
  Phone,
} from "lucide-react";

interface AdminUser {
  id: string;
  memberId: string;
  name: string;
  email: string;
  whatsappNumber: string;
  label: string;
  color: string;
  status: "pending" | "active" | "revoked";
  created_at: string;
}

interface AdminsClientProps {
  initialAdmins: AdminUser[];
  paginationLimit?: number;
}

export default function AdminsClient({
  initialAdmins,
  paginationLimit = 10,
}: AdminsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, colorFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    const { id, name } = adminToDelete;
    setAdminToDelete(null);

    setDeletingId(id);
    setIsLoading(true);
    try {
      const res = await deleteAdminAction(id);
      if (!res.success) throw new Error(res.error);

      toast.success(`Admin "${name}" berhasil dihapus.`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus admin: " + err.message);
    } finally {
      setIsLoading(false);
      setDeletingId(null);
    }
  };

  // Filtered dataset
  const filteredAdmins = useMemo(() => {
    return initialAdmins.filter((a) => {
      const query = search.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.whatsappNumber.includes(search) ||
        a.label.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesColor = colorFilter === "all" || a.color === colorFilter;

      return matchesSearch && matchesStatus && matchesColor;
    });
  }, [initialAdmins, search, statusFilter, colorFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredAdmins.length, startIndex + limit);
  const paginatedAdmins = useMemo(() => {
    return filteredAdmins.slice(startIndex, endIndex);
  }, [filteredAdmins, startIndex, endIndex]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
            <CheckCircle2 size={10} /> Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/20">
            <Clock size={10} /> Pending
          </span>
        );
      case "revoked":
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-500/20">
            <XCircle size={10} /> Revoked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ SYSTEM ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Kelola Admin & Hak Akses
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola peran Color Ranger, hak akses modul CMS, dan akun administrator.
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
              placeholder="Cari admin, email, WA..."
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
            href="/admin/roles"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Shield size={14} className="stroke-[2.5]" />
            <span>Atur Peran Admin</span>
          </Link>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua Admin */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setColorFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "all" && colorFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Admin</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {initialAdmins.length}
          </span>
        </button>

        {/* Active */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("active");
            setColorFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "active"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {initialAdmins.filter((a) => a.status === "active").length}
          </span>
        </button>

        {/* Pending */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("pending");
            setColorFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <Clock size={12} />
          <span>Pending Review</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {initialAdmins.filter((a) => a.status === "pending").length}
          </span>
        </button>

        {/* Revoked */}
        {initialAdmins.some((a) => a.status === "revoked") && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("revoked");
              setColorFilter("all");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
              statusFilter === "revoked"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <XCircle size={12} />
            <span>Revoked</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
              {initialAdmins.filter((a) => a.status === "revoked").length}
            </span>
          </button>
        )}
      </div>

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold bg-bg-well/50">
                <th className="py-3.5 px-5 border-b border-border-default/70">Nama Admin</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Label Jabatan</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Email & Kontak</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Color Ranger</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Status</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Terdaftar</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data admin ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((adm) => {
                  const style = colorRangerStyle(adm.color as ColorRangerSlug);
                  const colorLabel =
                    COLOR_RANGERS[adm.color as ColorRangerSlug]?.label || adm.color;

                  return (
                    <tr
                      key={adm.id}
                      className="border-b border-border-default/40 last:border-b-0 hover:bg-bg-well/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-text-primary">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-bg-well border border-border-default/60 flex items-center justify-center shrink-0 text-text-secondary">
                            <User size={14} />
                          </div>
                          <span className="font-bold text-xs">{adm.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-semibold">
                        {adm.label}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <p className="font-medium text-text-primary">{adm.email}</p>
                          <p className="text-text-muted font-mono">{adm.whatsappNumber}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
                          style={style}
                        >
                          {colorLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(adm.status)}</td>
                      <td className="py-3.5 px-4 text-text-muted font-mono text-[11px]">
                        {formatDate(adm.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/admins/${adm.id}`)}
                            className="px-2.5 py-1.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Atur Hak Akses"
                          >
                            <Eye size={12} />
                            <span>{adm.status === "pending" ? "Review" : "Detail"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminToDelete({ id: adm.id, name: adm.name })}
                            disabled={isLoading || deletingId === adm.id}
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus Admin"
                          >
                            {deletingId === adm.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
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

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-3.5">
        {paginatedAdmins.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data admin ditemukan.</p>
          </div>
        ) : (
          paginatedAdmins.map((adm) => {
            const style = colorRangerStyle(adm.color as ColorRangerSlug);
            const colorLabel =
              COLOR_RANGERS[adm.color as ColorRangerSlug]?.label || adm.color;

            return (
              <div
                key={adm.id}
                className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99] space-y-3"
              >
                {/* Top Row: Color Ranger + Status Badge */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-default/40">
                  <span
                    className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
                    style={style}
                  >
                    {colorLabel}
                  </span>
                  {getStatusBadge(adm.status)}
                </div>

                {/* Middle Row: Admin Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-bg-well border border-border-default/60 flex items-center justify-center shrink-0 text-text-secondary">
                      <User size={14} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-text-primary tracking-tight">
                        {adm.name}
                      </h3>
                      <p className="text-xs text-text-secondary font-semibold">
                        {adm.label}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-text-muted space-y-1 pt-1.5 border-t border-border-default/30">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="shrink-0" />
                      <span>{adm.email}</span>
                    </p>
                    {adm.whatsappNumber && (
                      <p className="flex items-center gap-1.5 font-mono">
                        <Phone size={12} className="shrink-0" />
                        <span>{adm.whatsappNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="pt-2.5 border-t border-border-default/40 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-text-muted font-mono">
                    {formatDate(adm.created_at)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/admins/${adm.id}`)}
                      className="h-8 px-3.5 rounded-xl border border-border-default bg-bg-well/50 text-text-primary text-xs font-bold flex items-center gap-1 hover:bg-bg-well transition-all cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>{adm.status === "pending" ? "Review" : "Detail"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminToDelete({ id: adm.id, name: adm.name })}
                      disabled={isLoading || deletingId === adm.id}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      title="Hapus Admin"
                    >
                      {deletingId === adm.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredAdmins.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="admin"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Status & Color Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  statusFilter !== "all" || colorFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Admin"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(statusFilter !== "all" || colorFilter !== "all") && (
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
                  Filter Admin
                </span>
                {(statusFilter !== "all" || colorFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setColorFilter("all");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "active", "pending", "revoked"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer uppercase ${
                        statusFilter === st
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                      }`}
                    >
                      {st === "all" ? "Semua" : st}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Atur Roles */}
          <Link
            href="/admin/roles"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Kelola Peran Color Ranger"
          >
            <Shield className="w-4 h-4 stroke-[2.5]" />
            <span>Peran</span>
          </Link>
        </div>
      </div>

      {/* ═══ DELETE CONFIRM DIALOG (Kustom Tanpa window.confirm) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(adminToDelete)}
        onOpenChange={(open) => !open && setAdminToDelete(null)}
        title="Hapus Admin"
        description={
          <>
            Apakah Anda yakin ingin menghapus data admin &ldquo;
            <span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">
              {adminToDelete?.name}
            </span>
            &rdquo; secara permanen?
            <p className="mt-2 text-xs text-text-muted font-bold">
              Seluruh hak akses privilege dan akun administrator akan dibersihkan secara otomatis.
            </p>
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
