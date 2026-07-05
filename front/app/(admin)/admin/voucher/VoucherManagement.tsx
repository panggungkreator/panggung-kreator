"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { getVouchersAction, createVoucherAction, deleteVoucherAction, toggleVoucherAction, updateVoucherAction } from "@/lib/actions/voucher-actions";
import { Ticket, Plus, X, Trash2, CheckCircle2, Clock, Search, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

export default function VoucherManagement({ initialVouchers }: VoucherManagementProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"nominal" | "percentage">("nominal");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setEditingVoucherId(null);
    setNewCode("");
    setDiscountType("nominal");
    setDiscountValue("");
    setMaxUses("");
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const voucher = vouchers.find(v => v.id === id);
    if (!voucher) return;
    setEditingVoucherId(voucher.id);
    setNewCode(voucher.code);
    setDiscountType(voucher.discount_type);
    setDiscountValue(voucher.discount_value.toString());
    setMaxUses(voucher.max_uses === 0 ? "" : voucher.max_uses.toString());
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const fetchVouchers = async () => {
    const res = await getVouchersAction();
    if (res.success && res.vouchers) {
      setVouchers(res.vouchers as Voucher[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !discountValue) return;

    setMessage(null);
    startTransition(async () => {
      let res;
      if (editingVoucherId) {
        res = await updateVoucherAction(editingVoucherId, {
          code: newCode,
          discount_type: discountType,
          discount_value: parseInt(discountValue),
          max_uses: maxUses ? parseInt(maxUses) : 0
        });
      } else {
        res = await createVoucherAction({
          code: newCode,
          discount_type: discountType,
          discount_value: parseInt(discountValue),
          max_uses: maxUses ? parseInt(maxUses) : 0
        });
      }

      if (res.success) {
        setMessage({
          type: 'success',
          text: editingVoucherId ? "Voucher berhasil diperbarui!" : "Voucher berhasil ditambahkan!"
        });
        handleCloseModal();
        fetchVouchers();
      } else {
        setMessage({
          type: 'error',
          text: res.error || (editingVoucherId ? "Gagal memperbarui voucher" : "Gagal menambah voucher")
        });
      }
    });
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleVoucherAction(id, currentStatus);
      if (res.success) {
        fetchVouchers();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus voucher ini?")) return;
    startTransition(async () => {
      const res = await deleteVoucherAction(id);
      if (res.success) {
        fetchVouchers();
      }
    });
  };

  // Filtered vouchers list based on search query and statusFilter
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

  return (
    <div className="flex-1 flex flex-col space-y-6 text-zinc-800 dark:text-zinc-200">
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${message.type === 'success'
          ? 'bg-[#dcfce7] text-[#15803d] border border-emerald-200/50'
          : 'bg-[#fee2e2] text-[#b91c1c] border border-red-200/50'
          }`}>
          <span className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
            ) : (
              <X className="w-4 h-4 text-[#b91c1c]" />
            )}
            {message.text}
          </span>
          <button onClick={() => setMessage(null)} className="hover:opacity-80 p-1">✕</button>
        </div>
      )}

      {/* Controls Toolbar (Search, Soft Filter pills, Create Action) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5 dark:bg-zinc-900/40 py-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode voucher..."
            className="w-full pl-10 pr-9 py-4 text-xs rounded-full  dark:bg-zinc-900/80 border border-gray-400 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:outline-none focus:border-text-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
          {/* Status Filter (Select Shadcn UI) */}
          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as "all" | "active" | "inactive")}>
              <SelectTrigger className="h-[52px] rounded-full border-gray-400 bg-bg-well text-xs text-text-primary font-semibold">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{`Semua (${vouchers.length})`}</SelectItem>
                <SelectItem value="active">{`Aktif (${vouchers.filter(v => v.is_active).length})`}</SelectItem>
                <SelectItem value="inactive">{`Nonaktif (${vouchers.filter(v => !v.is_active).length})`}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Voucher</span>
          </button>
        </div>
      </div>

      {/* Daftar Voucher (Clean Table Container with thin grid borders) */}
      <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="p-24 text-center text-sm font-bold text-zinc-400 dark:text-zinc-600 animate-pulse">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-default bg-bg-well/50 text-text-secondary">
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Kode Voucher</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/50">Diskon</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/50">Terpakai</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/50">Status</th>
                  <th className="py-4 px-6 border-b bg-bg-well/50 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/30">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-muted font-semibold">
                      Tidak ada data voucher ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v, index) => {
                    const isLastRow = index === filteredVouchers.length - 1;
                    const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default last:border-r-0 py-4 px-6`;
                    return (
                      <tr key={v.id} className="hover:bg-bg-well/20 transition-colors">
                        <td className={cellBorderClass}>
                          <div className="inline-flex items-center gap-2 bg-[#e0f2fe] dark:bg-sky-950/30 border border-[#bae6fd] dark:border-sky-900/20 px-3 py-1 rounded-lg">
                            <span className="font-bold text-[#0369a1] dark:text-sky-400 text-xs">{v.code}</span>
                          </div>
                        </td>
                        <td className={`${cellBorderClass} font-bold text-text-primary text-sm`}>
                          {v.discount_type === 'nominal' ? `Rp ${v.discount_value.toLocaleString('id-ID')}` : `${v.discount_value}%`}
                        </td>
                        <td className={cellBorderClass}>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-text-primary">{v.current_uses}</span>
                            <span className="text-zinc-400">/</span>
                            <span className="text-text-secondary font-medium">{v.max_uses === 0 ? 'Unlimited' : v.max_uses}</span>
                          </div>
                        </td>
                        <td className={cellBorderClass}>
                          <button
                            onClick={() => handleToggle(v.id, v.is_active)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${v.is_active ? 'bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] border-emerald-200/20' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-zinc-200/30'}`}
                          >
                            {v.is_active ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td className={`${cellBorderClass} text-center`}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(v.id)}
                              className="p-1.5 text-[#15803d] hover:text-emerald-700 bg-green-500/10 hover:bg-green-500/20 border border-emerald-500/20 rounded-lg cursor-pointer flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-1.5 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer flex items-center justify-center"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}
      </div>

      {/* Modal Popup: Buat Voucher Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => !isPending && handleCloseModal()}
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-150 dark:border-white/5 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in p-8">
            <button
              onClick={handleCloseModal}
              disabled={isPending}
              className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] text-[#0369a1] dark:bg-sky-950/30 dark:text-sky-400 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-title">
                  {editingVoucherId ? "Edit Voucher" : "Buat Voucher Baru"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {editingVoucherId
                    ? "Ubah data voucher diskon akademi."
                    : "Tambahkan voucher diskon baru untuk pendaftar akademi."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Kode Voucher</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#bc151b]/20 focus:border-[#bc151b] transition-all placeholder:text-zinc-300"
                  placeholder="PROMO2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as "nominal" | "percentage")}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-350 focus:outline-none focus:ring-2 focus:ring-[#bc151b]/20 focus:border-[#bc151b] transition-all"
                  >
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="percentage">Persentase (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nilai Diskon</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#bc151b]/20 focus:border-[#bc151b] transition-all placeholder:text-zinc-300"
                    placeholder={discountType === 'nominal' ? "10000" : "20"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Maks. Penggunaan</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#bc151b]/20 focus:border-[#bc151b] transition-all placeholder:text-zinc-300"
                  placeholder="0 (Unlimited)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="px-6 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all w-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full transition-all w-full flex justify-center items-center gap-2 cursor-pointer shadow-md"
                >
                  {isPending ? "Menyimpan..." : (editingVoucherId ? "Simpan Perubahan" : "Buat Voucher")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
