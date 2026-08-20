"use client";

import React, { useState, useMemo } from "react";
import {
  Gift,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  TrendingUp,
  Users,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  upsertReferralCodeAction,
  toggleReferralCodeStatusAction,
} from "@/lib/actions/referral-actions";

interface ReferralCodeItem {
  id: string;
  code: string;
  owner_member_id: string;
  description: string;
  is_active: boolean;
  usage_count: number;
  max_usage: number;
  total_revenue: number;
  default_reward: number;
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_email: string;
}

interface MemberOption {
  id: string;
  full_name: string;
  stage_name: string | null;
  email: string | null;
  role: string;
}

interface Props {
  initialCodes: ReferralCodeItem[];
  memberOptions: MemberOption[];
}

export default function ReferralManagement({
  initialCodes,
  memberOptions,
}: Props) {
  const [codes, setCodes] = useState<ReferralCodeItem[]>(initialCodes);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ReferralCodeItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    ownerMemberId: "",
    description: "",
    defaultReward: "10000",
    maxUsage: "0",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopyCode = (id: string, codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      ownerMemberId: memberOptions[0]?.id || "",
      description: "",
      defaultReward: "10000",
      maxUsage: "0",
      isActive: true,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rc: ReferralCodeItem) => {
    setEditingCode(rc);
    setFormData({
      code: rc.code,
      ownerMemberId: rc.owner_member_id,
      description: rc.description || "",
      defaultReward: String(rc.default_reward || 0),
      maxUsage: String(rc.max_usage || 0),
      isActive: rc.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (rc: ReferralCodeItem) => {
    try {
      const result = await toggleReferralCodeStatusAction(rc.id, rc.is_active);
      if (result.success) {
        setCodes((prev) =>
          prev.map((item) =>
            item.id === rc.id ? { ...item, is_active: !item.is_active } : item
          )
        );
      } else {
        alert("Gagal mengubah status kode referral: " + result.error);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setFormError("Kode referral wajib diisi.");
      return;
    }
    if (!formData.ownerMemberId) {
      setFormError("Pilih pemilik kode referral.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const cleanCode = formData.code.trim().toUpperCase();
      const defaultRewardNum = Math.max(0, parseInt(formData.defaultReward.replace(/\D/g, ""), 10) || 0);
      const maxUsageNum = Math.max(0, parseInt(formData.maxUsage, 10) || 0);

      const result = await upsertReferralCodeAction({
        id: editingCode?.id,
        code: cleanCode,
        ownerMemberId: formData.ownerMemberId,
        description: formData.description.trim(),
        isActive: formData.isActive,
        maxUsage: maxUsageNum,
        defaultReward: defaultRewardNum,
      });

      if (!result.success) {
        setFormError(result.error || "Gagal menyimpan kode referral.");
        return;
      }

      // Update local state
      const selectedOwner = memberOptions.find((m) => m.id === formData.ownerMemberId);
      const ownerName = selectedOwner?.stage_name || selectedOwner?.full_name || "Member";
      const ownerEmail = selectedOwner?.email || "-";

      if (editingCode) {
        setCodes((prev) =>
          prev.map((item) =>
            item.id === editingCode.id
              ? {
                  ...item,
                  code: cleanCode,
                  owner_member_id: formData.ownerMemberId,
                  description: formData.description.trim(),
                  default_reward: defaultRewardNum,
                  max_usage: maxUsageNum,
                  is_active: formData.isActive,
                  owner_name: ownerName,
                  owner_email: ownerEmail,
                }
              : item
          )
        );
      } else {
        const newItem: ReferralCodeItem = {
          id: Math.random().toString(),
          code: cleanCode,
          owner_member_id: formData.ownerMemberId,
          description: formData.description.trim(),
          is_active: formData.isActive,
          usage_count: 0,
          max_usage: maxUsageNum,
          total_revenue: 0,
          default_reward: defaultRewardNum,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_name: ownerName,
          owner_email: ownerEmail,
        };
        setCodes((prev) => [newItem, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError("Terjadi kesalahan sistem: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const totalCodes = codes.length;
    const totalUses = codes.reduce((acc, c) => acc + (c.usage_count || 0), 0);
    const totalRev = codes.reduce((acc, c) => acc + (c.total_revenue || 0), 0);
    return { totalCodes, totalUses, totalRev };
  }, [codes]);

  // Filtered Codes
  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const matchesFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
          ? c.is_active
          : !c.is_active;

      const matchesSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [codes, filterStatus, search]);

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Total Kode Referral</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {stats.totalCodes}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Kode terdaftar dalam sistem</p>
        </div>

        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Total Penggunaan</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {stats.totalUses.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Pendaftaran via kode referral</p>
        </div>

        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Total Revenue Dihasilkan</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(stats.totalRev)}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Akumulasi omzet dari referral</p>
        </div>
      </div>

      {/* Action Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === "all"
                  ? "bg-text-primary text-bg-card"
                  : "bg-bg-well text-text-secondary hover:text-text-primary"
              }`}
            >
              Semua ({codes.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-bg-well text-text-secondary hover:text-text-primary"
              }`}
            >
              Aktif ({codes.filter((c) => c.is_active).length})
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === "inactive"
                  ? "bg-zinc-700 text-white"
                  : "bg-bg-well text-text-secondary hover:text-text-primary"
              }`}
            >
              Non-Aktif ({codes.filter((c) => !c.is_active).length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-[240px]">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau pemilik..."
              className="bg-bg-well border border-border-default rounded-full py-2 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-text-primary text-bg-card px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus size={14} />
            <span>Buat Kode Baru</span>
          </button>
        </div>
      </div>

      {/* Referral Codes Table */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs">
        {filteredCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                  <th className="py-3.5 px-5 border-b border-r border-border-default/70 bg-bg-well/50">Kode Referral</th>
                  <th className="py-3.5 px-5 border-b border-r border-border-default/70 bg-bg-well/50">Pemilik (Referrer)</th>
                  <th className="py-3.5 px-5 border-b border-r border-border-default/70 bg-bg-well/50">Default Reward</th>
                  <th className="py-3.5 px-5 border-b border-r border-border-default/70 bg-bg-well/50">Penggunaan & Limit</th>
                  <th className="py-3.5 px-5 border-b border-r border-border-default/70 bg-bg-well/50">Total Omzet</th>
                  <th className="py-3.5 px-5 border-b border-r border-border-default/70 bg-bg-well/50">Status</th>
                  <th className="py-3.5 px-5 border-b border-border-default/70 bg-bg-well/50 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((rc, idx) => {
                  const isLastRow = idx === filteredCodes.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 py-3.5 px-5`;

                  return (
                    <tr key={rc.id} className="hover:bg-bg-well/30 transition-colors">
                      <td className={`${cellBorderClass} font-mono font-bold text-text-primary`}>
                        <div className="flex items-center gap-2">
                          <span>{rc.code}</span>
                          <button
                            onClick={() => handleCopyCode(rc.id, rc.code)}
                            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            title="Salin kode"
                          >
                            {copiedId === rc.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        {rc.description && (
                          <span className="block text-[10px] font-sans font-normal text-text-secondary mt-0.5">
                            {rc.description}
                          </span>
                        )}
                      </td>

                      <td className={cellBorderClass}>
                        <span className="font-semibold text-text-primary block">{rc.owner_name}</span>
                        <span className="text-[10px] text-text-secondary block font-mono">{rc.owner_email}</span>
                      </td>

                      <td className={`${cellBorderClass} font-bold text-emerald-600 font-mono`}>
                        {formatCurrency(rc.default_reward)}
                      </td>

                      <td className={cellBorderClass}>
                        <div className="font-mono text-text-primary font-semibold">
                          {rc.usage_count} {rc.max_usage > 0 ? `/ ${rc.max_usage}` : "kali"}
                        </div>
                        <span className="text-[9px] text-text-secondary">
                          {rc.max_usage === 0 ? "Unlimited" : `Maksimal ${rc.max_usage}x`}
                        </span>
                      </td>

                      <td className={`${cellBorderClass} font-bold text-text-primary font-mono`}>
                        {formatCurrency(rc.total_revenue)}
                      </td>

                      <td className={cellBorderClass}>
                        <button
                          onClick={() => handleToggleStatus(rc)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            rc.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 hover:bg-zinc-500/20"
                          }`}
                        >
                          {rc.is_active ? "● Aktif" : "○ Non-Aktif"}
                        </button>
                      </td>

                      <td className={`${isLastRow ? "" : "border-b"} py-3.5 px-5 text-right`}>
                        <button
                          onClick={() => handleOpenEditModal(rc)}
                          className="p-1.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Tidak ada kode referral yang ditemukan
            </p>
          </div>
        )}
      </div>

      {/* Modal Create / Edit Referral Code */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-border-default">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#bc151b]" />
                {editingCode ? "Edit Kode Referral" : "Buat Kode Referral Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-[#bc151b] font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Kode Referral */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Kode Referral *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="Contoh: RIZAL2026"
                  className="w-full bg-bg-well border border-border-default rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-[#bc151b] uppercase"
                  required
                />
              </div>

              {/* Pemilik Kode (Member/Admin) */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Pemilik Kode (Referrer) *
                </label>
                <select
                  value={formData.ownerMemberId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerMemberId: e.target.value }))}
                  className="w-full bg-bg-well border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#bc151b]"
                  required
                >
                  <option value="">-- Pilih Member / Admin --</option>
                  {memberOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.stage_name || m.full_name} ({m.email || "-"}) [{m.role}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Reward */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Default Reward per Pendaftaran (Rp)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-text-muted">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formData.defaultReward}
                    onChange={(e) => setFormData((prev) => ({ ...prev, defaultReward: e.target.value }))}
                    placeholder="10000"
                    className="w-full bg-bg-well border border-border-default rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-text-primary focus:outline-none focus:border-[#bc151b]"
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Nilai pre-filled saat admin konfirmasi pembayaran lunas.
                </span>
              </div>

              {/* Limit Penggunaan */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Limit Maksimal Penggunaan
                </label>
                <input
                  type="number"
                  value={formData.maxUsage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxUsage: e.target.value }))}
                  placeholder="0 untuk unlimited"
                  className="w-full bg-bg-well border border-border-default rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-[#bc151b]"
                />
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Isi 0 untuk tanpa batas (unlimited).
                </span>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Deskripsi / Catatan (Opsional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Contoh: Kode referral promo komunitas Bandung"
                  className="w-full bg-bg-well border border-border-default rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#bc151b] resize-none h-14"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded accent-[#bc151b] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="is_active_toggle" className="text-xs text-text-primary font-medium cursor-pointer">
                  Kode Aktif & Dapat Digunakan saat Checkout
                </label>
              </div>

              {/* Tombol Simpan */}
              <div className="flex gap-3 pt-3 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-border-default hover:bg-bg-well rounded-full py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Kode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
