"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import {
  getVouchersAction,
  createVoucherAction,
  deleteVoucherAction,
  toggleVoucherAction,
  updateVoucherAction,
} from "@/lib/actions/voucher-actions";
import {
  Ticket,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Edit,
  SlidersHorizontal,
  Check,
  Percent,
  Coins,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { toast } from "sonner";

type Voucher = {
  id: string;
  code: string;
  discount_type: "nominal" | "percentage";
  discount_value: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
};

interface VoucherManagementProps {
  initialVouchers: Voucher[];
  paginationLimit?: number;
}

export default function VoucherManagement({
  initialVouchers,
  paginationLimit = 10,
}: VoucherManagementProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isPending, startTransition] = useTransition();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"nominal" | "percentage">("nominal");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  // Delete Confirm State
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingVoucherId(null);
    setNewCode("");
    setDiscountType("nominal");
    setDiscountValue("");
    setMaxUses("");
    setIsModalOpen(true);
  };

  const handleEdit = (v: Voucher) => {
    setEditingVoucherId(v.id);
    setNewCode(v.code);
    setDiscountType(v.discount_type);
    setDiscountValue(v.discount_value.toString());
    setMaxUses(v.max_uses === 0 ? "" : v.max_uses.toString());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVoucherId(null);
    setNewCode("");
    setDiscountType("nominal");
    setDiscountValue("");
    setMaxUses("");
  };

  const fetchVouchers = async () => {
    const res = await getVouchersAction();
    if (res.success && res.vouchers) {
      setVouchers(res.vouchers as Voucher[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !discountValue) return;

    startTransition(async () => {
      let res;
      if (editingVoucherId) {
        res = await updateVoucherAction(editingVoucherId, {
          code: newCode,
          discount_type: discountType,
          discount_value: parseInt(discountValue, 10),
          max_uses: maxUses ? parseInt(maxUses, 10) : 0,
        });
      } else {
        res = await createVoucherAction({
          code: newCode,
          discount_type: discountType,
          discount_value: parseInt(discountValue, 10),
          max_uses: maxUses ? parseInt(maxUses, 10) : 0,
        });
      }

      if (res.success) {
        toast.success(
          editingVoucherId
            ? "Voucher berhasil diperbarui!"
            : "Voucher baru berhasil dibuat!"
        );
        handleCloseModal();
        fetchVouchers();
      } else {
        toast.error(
          res.error || (editingVoucherId ? "Gagal memperbarui voucher." : "Gagal membuat voucher.")
        );
      }
    });
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_active: !currentStatus } : v))
    );

    startTransition(async () => {
      const res = await toggleVoucherAction(id, currentStatus);
      if (res.success) {
        toast.success(
          !currentStatus ? "Status voucher: DIAKTIFKAN" : "Status voucher: DINONAKTIFKAN"
        );
        fetchVouchers();
      } else {
        toast.error("Gagal mengubah status voucher.");
        fetchVouchers();
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;
    const { id, code } = voucherToDelete;
    setVoucherToDelete(null);

    startTransition(async () => {
      const res = await deleteVoucherAction(id);
      if (res.success) {
        setVouchers((prev) => prev.filter((v) => v.id !== id));
        toast.success(`Voucher "${code}" berhasil dihapus.`);
      } else {
        toast.error(res.error || "Gagal menghapus voucher.");
      }
    });
  };

  // Filtered dataset
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch = (v.code || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && v.is_active) ||
        (statusFilter === "inactive" && !v.is_active);

      return matchSearch && matchStatus;
    });
  }, [vouchers, search, statusFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = vouchers.length;
    const active = vouchers.filter((v) => v.is_active).length;
    const inactive = vouchers.filter((v) => !v.is_active).length;
    return { total, active, inactive };
  }, [vouchers]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredVouchers.length, startIndex + limit);
  const paginatedVouchers = useMemo(() => {
    return filteredVouchers.slice(startIndex, endIndex);
  }, [filteredVouchers, startIndex, endIndex]);

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Voucher Diskon
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola kode potongan harga untuk pendaftaran akademi dan program kreator.
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
              placeholder="Cari kode voucher..."
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

          {/* Create Button Desktop (h-9 rounded-full) */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Buat Voucher</span>
          </button>
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
          <span>Semua Voucher</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.total}
          </span>
        </button>

        {/* Aktif */}
        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "active"
              ? "bg-[#dcfce7] text-[#15803d] shadow-xs border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Aktif
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {stats.active}
          </span>
        </button>

        {/* Nonaktif */}
        <button
          type="button"
          onClick={() => setStatusFilter("inactive")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "inactive"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-300 dark:border-zinc-700"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Nonaktif</span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.inactive}
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
                  Kode Voucher
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Nilai Diskon
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Penggunaan
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
              {paginatedVouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    Tidak ada data voucher ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-bg-well/30 transition-colors">
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <div className="inline-flex items-center gap-2 bg-[#e0f2fe] dark:bg-sky-950/40 border border-[#bae6fd] dark:border-sky-900/30 px-3 py-1 rounded-xl">
                        <Ticket size={13} className="text-[#0369a1] dark:text-sky-400 shrink-0" />
                        <span className="font-bold font-mono text-[#0369a1] dark:text-sky-400 text-xs">
                          {v.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40 font-bold text-text-primary text-sm">
                      {v.discount_type === "nominal"
                        ? `Rp ${v.discount_value.toLocaleString("id-ID")}`
                        : `${v.discount_value}%`}
                      <span className="block text-[10px] text-text-muted font-normal mt-0.5">
                        {v.discount_type === "nominal" ? "Potongan Nominal" : "Potongan Persentase"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold font-mono text-text-primary">{v.current_uses}</span>
                        <span className="text-text-muted">/</span>
                        <span className="text-text-secondary font-medium">
                          {v.max_uses === 0 ? "Unlimited" : `${v.max_uses} kuota`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <button
                        type="button"
                        onClick={() => handleToggle(v.id, v.is_active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          v.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20"
                        }`}
                        title="Klik untuk mengubah status aktif"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            v.is_active ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                          }`}
                        />
                        {v.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(v)}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Edit Voucher"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoucherToDelete(v)}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus Voucher"
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
        {paginatedVouchers.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data voucher ditemukan.</p>
          </div>
        ) : (
          paginatedVouchers.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99]"
            >
              {/* Card Top: Code badge & Status toggle */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-default/40">
                <div className="inline-flex items-center gap-1.5 bg-[#e0f2fe] dark:bg-sky-950/40 border border-[#bae6fd] dark:border-sky-900/30 px-3 py-1 rounded-xl">
                  <Ticket size={13} className="text-[#0369a1] dark:text-sky-400 shrink-0" />
                  <span className="font-bold font-mono text-[#0369a1] dark:text-sky-400 text-xs">
                    {v.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(v.id, v.is_active)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    v.is_active
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      v.is_active ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                    }`}
                  />
                  {v.is_active ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              {/* Card Middle: Value & Usage */}
              <div className="my-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xl font-black text-text-primary tracking-tight">
                      {v.discount_type === "nominal"
                        ? `Rp ${v.discount_value.toLocaleString("id-ID")}`
                        : `${v.discount_value}%`}
                    </span>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {v.discount_type === "nominal" ? "Potongan Nominal" : "Potongan Persentase"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-text-primary">
                      {v.current_uses}{" "}
                      <span className="text-text-muted font-normal">
                        / {v.max_uses === 0 ? "∞" : v.max_uses}
                      </span>
                    </span>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {v.max_uses === 0 ? "Kuota Tak Terbatas" : "Kuota Terpakai"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Metadata & Actions */}
              <div className="pt-3 border-t border-border-default/40 flex items-center justify-between gap-2">
                <span className="text-[10px] text-text-muted font-mono">
                  Dibuat:{" "}
                  {new Date(v.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(v)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                    title="Edit Voucher"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherToDelete(v)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                    title="Hapus Voucher"
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
        totalItems={filteredVouchers.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="voucher"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Status Filter Popover (Direct Selectable Chips) */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  statusFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Status"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {statusFilter !== "all" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-64 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Status
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
                  { id: "active", label: `Aktif (${stats.active})` },
                  { id: "inactive", label: `Nonaktif (${stats.inactive})` },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id as any)}
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

          {/* Right Action: Buat Voucher */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Buat Voucher Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Voucher</span>
          </button>
        </div>
      </div>

      {/* ═══ MODAL POPUP: BUAT / EDIT VOUCHER (Mobile responsive border-0 rounded-none) ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !isPending && handleCloseModal()}
          />

          <div className="relative bg-bg-card border-0 sm:border border-border-default rounded-none sm:rounded-3xl shadow-2xl w-full max-w-md h-full sm:h-auto overflow-y-auto p-6 sm:p-8 space-y-6 z-10 flex flex-col justify-between sm:justify-start">
            <div>
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-border-default/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-text-primary text-bg-card flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary leading-tight">
                      {editingVoucherId ? "Edit Voucher Diskon" : "Buat Voucher Baru"}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {editingVoucherId
                        ? "Perbarui kode atau nominal diskon."
                        : "Tambahkan kode voucher promosi baru."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-well transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Input */}
              <form id="voucher-form" onSubmit={handleSubmit} className="space-y-4 pt-5">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                    Kode Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full h-10 px-3.5 text-xs font-mono font-bold uppercase rounded-xl bg-bg-well/50 border border-border-default text-text-primary focus:outline-none focus:border-text-primary transition-all placeholder:text-text-muted"
                    placeholder="CONTOH: PROMOAKADEMI"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Tipe Diskon
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "nominal" | "percentage")}
                      className="w-full h-10 px-3 text-xs font-bold rounded-xl bg-bg-well/50 border border-border-default text-text-primary focus:outline-none focus:border-text-primary transition-all cursor-pointer"
                    >
                      <option value="nominal">Nominal (Rp)</option>
                      <option value="percentage">Persentase (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Nilai Diskon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full h-10 px-3.5 text-xs font-bold rounded-xl bg-bg-well/50 border border-border-default text-text-primary focus:outline-none focus:border-text-primary transition-all"
                      placeholder={discountType === "nominal" ? "10000" : "20"}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                    Maksimal Penggunaan
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs font-bold rounded-xl bg-bg-well/50 border border-border-default text-text-primary focus:outline-none focus:border-text-primary transition-all"
                    placeholder="0 = Tanpa Batas (Unlimited)"
                  />
                  <span className="text-[11px] text-text-muted block mt-1">
                    Isi 0 jika kuota voucher tidak dibatasi.
                  </span>
                </div>
              </form>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border-default/60">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="flex-1 h-10 rounded-xl border border-border-default text-xs font-bold text-text-secondary hover:bg-bg-well hover:text-text-primary transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="voucher-form"
                disabled={isPending}
                className="flex-1 h-10 rounded-xl bg-text-primary text-bg-card hover:opacity-90 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isPending
                  ? "Menyimpan..."
                  : editingVoucherId
                  ? "Simpan Perubahan"
                  : "Buat Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRMATION DIALOG (Kustom Tanpa window.confirm) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(voucherToDelete)}
        onOpenChange={(open) => !open && setVoucherToDelete(null)}
        title="Hapus Voucher Diskon"
        description={`Apakah Anda yakin ingin menghapus voucher "${voucherToDelete?.code}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
