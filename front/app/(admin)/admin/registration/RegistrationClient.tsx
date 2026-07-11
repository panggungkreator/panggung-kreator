"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { verifyMemberPaymentAction, deleteMembersAction } from "@/lib/actions/checkout-actions";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  FileSpreadsheet,
  ExternalLink,
  Users,
  Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Member = {
  id: string;
  full_name: string;
  stage_name: string;
  whatsapp_number: string;
  email: string;
  instagram_username: string;
  tiktok_username: string;
  occupation: string;
  username: string;
  temporary_password?: string;
  payment_status: string;
  created_at: string;
  final_price?: number;
  used_voucher_code?: string;
  unique_code?: number;
  role?: string;
  package_id?: string | null;
};

interface AdminClientProps {
  initialMembers: Member[];
  packages?: any[];
}

const formatOccupation = (occupation: string | undefined) => {
  if (!occupation) return "-";

  const mapping: Record<string, string> = {
    "content_creator": "Content Creator",
    "kreator konten": "Kreator Konten",
    "student": "Mahasiswa / Pelajar",
    "employee": "Karyawan / Profesional",
    "founder": "Pengusaha / Founder",
    "executive": "Direktur / C-Level",
    "designer": "Desainer / Seniman",
    "writer": "Penulis / Jurnalis",
    "influencer": "Influencer",
    "other": "Lainnya"
  };

  const key = occupation.toLowerCase().trim();
  if (mapping[key]) return mapping[key];

  return occupation
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AdminClient({ initialMembers, packages = [] }: AdminClientProps) {
  const router = useRouter();
  const packageMap = useMemo(() => {
    return new Map(packages.map((p) => [p.id, p.name]));
  }, [packages]);

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [isPending, startTransition] = useTransition();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  // Sync initialMembers props to local state when Server Component re-fetches
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Real-time Supabase subscription for admin dashboard updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin_members_realtime_dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newMember = payload.new as Member;
            // Only display non-admin members
            if (newMember.role !== "admin") {
              setMembers((prev) => {
                // Prevent duplicate inserts
                if (prev.some((m) => m.id === newMember.id)) return prev;
                return [newMember, ...prev];
              });
              router.refresh();
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMember = payload.new as Member;
            setMembers((prev) =>
              prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
            );
            router.refresh();
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setMembers((prev) => prev.filter((m) => m.id !== deletedId));
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "verify" | "delete";
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    type: "verify",
    title: "",
    description: "",
    onConfirm: () => { },
  });

  // Formatting WhatsApp Link
  const formatWhatsappLink = (phone: string, stageName: string, fullName: string) => {
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    const name = stageName || fullName;
    const text = encodeURIComponent(
      `Halo Kak ${name}, pendaftaran Panggung Kreator Akademi Anda sudah kami verifikasi dan akun Anda telah aktif! Silakan bergabung dengan Grup WhatsApp Akademi di https://chat.whatsapp.com/JrJ9oXeYmdG4zC40HXMXjt`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  // Format IDR Currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle Verify Payment Action
  const handleVerify = (memberId: string, memberName: string) => {
    if (verifyingId) return;

    setModal({
      isOpen: true,
      type: "verify",
      title: "Konfirmasi Pelunasan",
      description: `Apakah anda yakin ingin mengkonfirmasi pelunasan untuk pendaftar atas nama ${memberName}?`,
      onConfirm: () => executeVerify(memberId, memberName),
      isLoading: false,
    });
  };

  const executeVerify = async (memberId: string, memberName: string) => {
    setModal(prev => ({ ...prev, isLoading: true }));
    setVerifyingId(memberId);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await verifyMemberPaymentAction(memberId);
        if (result.success) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === memberId ? { ...m, payment_status: "paid" } : m
            )
          );
          const msg = `Berhasil memverifikasi pembayaran atas nama ${memberName}`;
          setSuccessMessage(msg);
          toast.success(msg);
          router.refresh();
        } else {
          const errMsg = result.error || "Gagal memverifikasi pembayaran.";
          setErrorMessage(errMsg);
          toast.error(errMsg);
        }
      } catch (err: any) {
        setErrorMessage("Terjadi kesalahan koneksi server.");
        toast.error("Terjadi kesalahan koneksi server.");
      } finally {
        setVerifyingId(null);
        setModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Handle Delete
  const handleDelete = (ids: string[]) => {
    if (ids.length === 0) return;

    let description: React.ReactNode = `Apakah anda yakin ingin menghapus ${ids.length} data pendaftar secara permanen? Aksi ini tidak dapat dibatalkan.`;

    if (ids.length === 1) {
      const member = members.find(m => m.id === ids[0]);
      if (member) {
        const name = member.full_name || member.username || "Kreator";
        description = (
          <span>
            Apakah anda yakin ingin menghapus data pendaftar atas nama <span className="font-bold text-[#b91c1c]">{name}</span> secara permanen? Aksi ini tidak dapat dibatalkan.
          </span>
        );
      }
    }

    setModal({
      isOpen: true,
      type: "delete",
      title: "Hapus Data Pendaftar",
      description,
      onConfirm: () => executeDelete(ids),
      isLoading: false,
    });
  };

  const executeDelete = async (ids: string[]) => {
    setModal(prev => ({ ...prev, isLoading: true }));
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await deleteMembersAction(ids);
        if (result.success) {
          setMembers(prev => prev.filter(m => !ids.includes(m.id)));
          setSelectedIds(new Set());
          const msg = `Berhasil menghapus ${ids.length} data pendaftar`;
          setSuccessMessage(msg);
          toast.success(msg);
          router.refresh();
        } else {
          const errMsg = result.error || "Gagal menghapus data.";
          setErrorMessage(errMsg);
          toast.error(errMsg);
        }
      } catch (err: any) {
        setErrorMessage("Terjadi kesalahan saat menghapus.");
        toast.error("Terjadi kesalahan saat menghapus.");
      } finally {
        setIsDeleting(false);
        setModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        (m.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.stage_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.whatsapp_number || "").includes(search);

      const matchStatus =
        statusFilter === "all" || m.payment_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [members, search, statusFilter]);

  // Statistics calculation based on members state
  const stats = useMemo(() => {
    const total = members.length;
    const pending = members.filter((m) => m.payment_status === "pending").length;
    const paid = members.filter((m) => m.payment_status === "paid").length;
    const revenue = members
      .filter((m) => m.payment_status === "paid")
      .reduce((sum, m) => sum + (m.final_price || 49000), 0);

    return { total, pending, paid, revenue };
  }, [members]);

  // Export to Excel (CSV compatible format)
  const handleExportExcel = () => {
    if (filteredMembers.length === 0) return;

    // Header definition
    const headers = [
      "ID",
      "Nama Lengkap",
      "Nama Panggung",
      "Username",
      "Email",
      "No. WhatsApp",
      "Pekerjaan",
      "Status Pembayaran",
      "Tagihan",
      "Kode Voucher",
      "Tanggal Terdaftar"
    ];

    // Data row definition (prefix phone with ="..." to avoid stripping leading zero in Excel)
    const rows = filteredMembers.map(m => [
      m.id,
      m.full_name || "-",
      m.stage_name || "-",
      m.username || "-",
      m.email || "-",
      `="${m.whatsapp_number || ''}"`,
      formatOccupation(m.occupation),
      m.payment_status === "paid" ? "Lunas" : "Pending",
      m.final_price || 49000,
      m.used_voucher_code || "-",
      new Date(m.created_at).toLocaleDateString("id-ID")
    ]);

    // CSV compile
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(value => {
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ].join("\n");

    // Add UTF-8 BOM so Excel decodes it correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `Pendaftar_PanggungKreator_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in text-zinc-800 dark:text-zinc-200">

      {/* Alert Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-[#dcfce7] border border-emerald-200/50 rounded-2xl text-xs text-[#15803d] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803d] dark:text-emerald-400" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="hover:opacity-80 p-1">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-[#fee2e2] border border-red-200/50 rounded-2xl text-xs text-[#b91c1c] dark:bg-red-950/20 dark:text-red-400 dark:border-red-500/20 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#b91c1c] dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-80 p-1">✕</button>
        </div>
      )}


      {/* Stats Cards Grid - Soft Colors Accent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-1">
        {/* Card 1: Total Pendaftar (Soft Blue) */}
        <div className="bg-[#e0f2fe]/50 border border-[#bae6fd]/50 dark:bg-sky-950/20 dark:border-sky-900/30 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sky-800/80 dark:text-sky-400 uppercase tracking-widest">Total Pendaftar</span>
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 text-[#0369a1] dark:text-sky-300 flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-[#0369a1] dark:text-sky-300">{stats.total}</span>
          </div>
          <p className="text-[10px] text-sky-700/60 dark:text-sky-400/60 mt-1 font-medium">Total pendaftar terdaftar</p>
        </div>

        {/* Card 2: Pending Verifikasi (Soft Yellow) */}
        <div className="bg-[#fef9c3]/50 border border-[#fef08a]/50 dark:bg-yellow-950/20 dark:border-yellow-900/30 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-yellow-800/80 dark:text-yellow-400 uppercase tracking-widest">Pending Verifikasi</span>
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 text-[#713f12] dark:text-yellow-300 flex items-center justify-center shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-[#713f12] dark:text-yellow-300">{stats.pending}</span>
          </div>
          <p className="text-[10px] text-yellow-700/60 dark:text-yellow-400/60 mt-1 font-medium">Menunggu verifikasi admin</p>
        </div>

        {/* Card 3: Total Lunas (Soft Green) */}
        <div className="bg-[#dcfce7]/50 border border-[#bbf7d0]/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-800/80 dark:text-emerald-400 uppercase tracking-widest">Total Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 text-[#15803d] dark:text-emerald-300 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-[#15803d] dark:text-emerald-300">{stats.paid}</span>
          </div>
          <p className="text-[10px] text-emerald-700/60 dark:text-emerald-400/60 mt-1 font-medium">Pembayaran terverifikasi</p>
        </div>

        {/* Card 4: Total Omset (Soft Red/Pink) */}
        <div className="bg-[#fee2e2]/50 border border-[#fecaca]/50 dark:bg-red-950/20 dark:border-red-900/30 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-red-800/80 dark:text-red-400 uppercase tracking-widest">Total Omset</span>
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 text-[#b91c1c] dark:text-red-300 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-[#b91c1c] dark:text-red-300">{formatIDR(stats.revenue)}</span>
          </div>
          <p className="text-[10px] text-red-700/60 dark:text-red-400/60 mt-1 font-medium">Total pendapatan kotor</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Controls Toolbar (Search, Soft Filter pills, Export) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5 dark:bg-zinc-900/40 px-5 py-3.5 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, username, no. wa..."
              className="bg-bg-well border border-zinc-400 dark:border-white/10 rounded-full py-4 pl-11 pr-10 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors font-bold"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter pills and Export menu */}
          <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto md:justify-end">
            <div className="w-[185px]">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as "all" | "pending" | "paid")}
              >
                <SelectTrigger className="h-[52px] w-full bg-bg-well border border-zinc-400 dark:border-white/10 rounded-full px-5 text-xs font-bold text-text-primary focus:ring-0 focus:outline-none cursor-pointer">
                  <SelectValue placeholder="Status Pembayaran" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                  <SelectItem value="all">
                    {`Semua (${members.length})`}
                  </SelectItem>
                  <SelectItem value="pending">
                    {`Pending (${members.filter(m => m.payment_status === "pending").length})`}
                  </SelectItem>
                  <SelectItem value="paid">
                    {`Lunas (${members.filter(m => m.payment_status === "paid").length})`}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Excel Button with Soft Green */}
            <button
              onClick={handleExportExcel}
              disabled={filteredMembers.length === 0}
              className="flex items-center gap-2 px-6 h-[52px] text-xs font-bold text-[#15803d] bg-[#dcfce7] hover:bg-[#bbf7d0] dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Ekspor ke Excel (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Table Container - Spacious & Soft Styled with Thin borders */}
        <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex-1">

          {/* Selected Rows Mass Action Bar */}
          {selectedIds.size > 0 && (
            <div className="p-4 border-b border-border-default bg-bg-well/50 flex items-center justify-between animate-fade-in">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-2">
                {selectedIds.size} pendaftar terpilih
              </span>
              <button
                onClick={() => handleDelete(Array.from(selectedIds))}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? "Menghapus..." : "Hapus Terpilih"}
              </button>
            </div>
          )}
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                  <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 dark:border-white/10 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-900 cursor-pointer"
                      checked={selectedIds.size === filteredMembers.length && filteredMembers.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40"></th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Member</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">No. WhatsApp</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Paket</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Nominal</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Tgl Terdaftar</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40 text-center">Status</th>
                  <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/30">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-text-muted font-semibold">
                      Tidak ada data pendaftar ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => {
                    const isLastRow = index === filteredMembers.length - 1;
                    const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-5`;

                    return (
                      <tr key={member.id} className="hover:bg-bg-well/30 transition-colors group">
                        <td className={`${cellBorderClass} text-center`}>
                          <input
                            type="checkbox"
                            className="rounded border-zinc-300 dark:border-white/10 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-900 cursor-pointer"
                            checked={selectedIds.has(member.id)}
                            onChange={() => toggleSelect(member.id)}
                          />
                        </td>
                        <td className={`${cellBorderClass} text-center`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setDetailMember(member)}
                              className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-lg cursor-pointer flex items-center justify-center"
                              title="Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Member Info */}
                        <td className={cellBorderClass}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-sm">
                              {(member.full_name || "M")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{member.full_name}</div>
                              <div className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] mt-0.5 flex items-center gap-1.5">
                                <span>@{member.username || "username"}</span>
                                {member.stage_name && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold">{member.stage_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp Details */}
                        <td className={cellBorderClass}>
                          <div className="font-semibold text-zinc-700 dark:text-zinc-300">{member.whatsapp_number || "-"}</div>
                          <a
                            href={formatWhatsappLink(member.whatsapp_number, member.stage_name, member.full_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#bc151b] hover:underline mt-1 inline-flex items-center gap-0.5"
                          >
                            <span>Kirim Pesan</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>

                        {/* Paket */}
                        <td className={cellBorderClass}>
                          <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {packageMap.get(member.package_id || "") || "-"}
                          </div>
                        </td>

                        {/* Nominal */}
                        <td className={`${cellBorderClass} font-bold text-zinc-800 dark:text-zinc-200`}>
                          {member.final_price ? formatIDR(member.final_price) : "-"}
                        </td>

                        {/* Created date */}
                        <td className={`${cellBorderClass} font-medium text-zinc-500 dark:text-zinc-400`}>
                          {new Date(member.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>

                        {/* Payment Status Badges (Soft Palette) */}
                        <td className={`${cellBorderClass} text-center`}>
                          {member.payment_status === "pending" ? (
                            <button
                              onClick={() => handleVerify(member.id, member.full_name || member.username || "Kreator")}
                              disabled={verifyingId !== null}
                              className="px-4 py-2 bg-[#d4f6ac] text-zinc-900 hover:opacity-90 rounded-full text-xs font-bold transition-all disabled:opacity-50 shadow-sm cursor-pointer border border-emerald-500/10"
                            >
                              {verifyingId === member.id ? "Memproses..." : "Konfirmasi Lunas"}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#dcfce7] text-[#15803d] dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200/20">
                              Lunas
                            </span>
                          )}
                        </td>

                        {/* Individual actions */}
                        <td className={`${cellBorderClass} text-center`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDelete([member.id])}
                              disabled={isDeleting}
                              className="p-1.5 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
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
        </div>
      </div>

      {/* Confirmation Modal - Styled with Soft Accents */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={() => !modal.isLoading && setModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-150 dark:border-white/5 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in p-8 text-center">

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${modal.type === 'delete'
              ? 'bg-[#fee2e2] text-[#b91c1c]'
              : 'bg-[#fef9c3] text-[#713f12]'
              }`}>
              {modal.type === 'delete' ? (
                <Trash2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 font-title">{modal.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 px-4 leading-relaxed">{modal.description}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                disabled={modal.isLoading}
                className="px-6 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all w-full cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={modal.onConfirm}
                disabled={modal.isLoading}
                className={`px-6 py-3 text-sm font-bold text-white rounded-full transition-all flex justify-center items-center gap-2 w-full cursor-pointer ${modal.type === "delete"
                  ? "bg-[#b91c1c] hover:bg-[#991b1b]"
                  : "bg-[#15803d] hover:bg-[#166534]"
                  }`}
              >
                {modal.isLoading ? "Memproses..." : (modal.type === "delete" ? "Hapus" : "Konfirmasi")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Member Modal */}
      <Dialog open={!!detailMember} onOpenChange={(open) => !open && setDetailMember(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-white/5 rounded-[2rem] shadow-2xl p-8 text-zinc-800 dark:text-zinc-200">
          {detailMember && (
            <>
              {/* Header */}
              <DialogHeader className="flex flex-row items-center gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] text-[#0369a1] dark:bg-sky-950/30 dark:text-sky-400 flex items-center justify-center font-bold text-lg shrink-0">
                  {(detailMember.full_name || "M")[0].toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-title">{detailMember.full_name}</DialogTitle>
                  <p className="text-xs text-zinc-500 mt-0.5">@{detailMember.username || "username"}</p>
                </div>
              </DialogHeader>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs">

                {/* Personal Section */}
                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-100 dark:border-white/5">
                  <h4 className="font-bold text-[#15803d] dark:text-emerald-400 mb-3 uppercase tracking-wider text-[10px]">Informasi Personal</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Nama Panggung:</span>
                      <span className="font-semibold text-zinc-750 dark:text-zinc-200">{detailMember.stage_name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Username:</span>
                      <span className="font-semibold text-zinc-750 dark:text-zinc-200">{detailMember.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Pekerjaan:</span>
                      <span className="font-semibold text-zinc-750 dark:text-zinc-200">{formatOccupation(detailMember.occupation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Tgl Terdaftar:</span>
                      <span className="font-semibold text-zinc-750 dark:text-zinc-200">
                        {new Date(detailMember.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Social Section */}
                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-100 dark:border-white/5">
                  <h4 className="font-bold text-[#b91c1c] dark:text-red-400 mb-3 uppercase tracking-wider text-[10px]">Kontak & Sosial Media</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">No. WhatsApp:</span>
                      <span className="font-semibold text-zinc-750 dark:text-zinc-200">{detailMember.whatsapp_number || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Instagram:</span>
                      {detailMember.instagram_username &&
                        detailMember.instagram_username.trim() !== "" &&
                        detailMember.instagram_username.trim() !== "-" ? (
                        <a
                          href={`https://instagram.com/${detailMember.instagram_username.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#bc151b] hover:underline"
                        >
                          @{detailMember.instagram_username.replace("@", "")}
                        </a>
                      ) : (
                        <span className="font-semibold text-zinc-750 dark:text-zinc-200">-</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">TikTok:</span>
                      {detailMember.tiktok_username &&
                        detailMember.tiktok_username.trim() !== "" &&
                        detailMember.tiktok_username.trim() !== "-" ? (
                        <a
                          href={`https://tiktok.com/@${detailMember.tiktok_username.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#bc151b] hover:underline"
                        >
                          @{detailMember.tiktok_username.replace("@", "")}
                        </a>
                      ) : (
                        <span className="font-semibold text-zinc-750 dark:text-zinc-200">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-100 dark:border-white/5 md:col-span-2">
                  <h4 className="font-bold text-[#713f12] dark:text-amber-400 mb-3 uppercase tracking-wider text-[10px]">Informasi Paket & Pembayaran</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Paket Pilihan:</span>
                      <span className="font-bold text-zinc-750 dark:text-zinc-200">
                        {packageMap.get(detailMember.package_id || "") || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-medium">Status Pembayaran:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${detailMember.payment_status === "paid"
                        ? "bg-[#dcfce7] text-[#15803d] border-emerald-200/20"
                        : "bg-[#fef9c3] text-[#713f12] border-yellow-200/20"
                        }`}>
                        {detailMember.payment_status === "paid" ? "Lunas" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Voucher Terpakai:</span>
                      <span className="font-bold text-[#bc151b] dark:text-[#ef4444]">{detailMember.used_voucher_code || "Tidak ada"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-medium">Kode Unik:</span>
                      <span className="font-bold text-zinc-750 dark:text-zinc-200">{detailMember.unique_code ?? "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t border-zinc-200/40 dark:border-white/5">
                    <span className="text-zinc-400 font-bold">Total Pembayaran:</span>
                    <span className="font-extrabold text-zinc-900 dark:text-white text-sm">
                      Rp {(detailMember.final_price ?? (49000 + (detailMember.unique_code ?? 0))).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-2 shrink-0">
                <button
                  onClick={() => setDetailMember(null)}
                  className="px-6 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all w-full cursor-pointer text-center"
                >
                  Tutup
                </button>
                <a
                  href={formatWhatsappLink(detailMember.whatsapp_number, detailMember.stage_name, detailMember.full_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 text-sm font-bold text-white bg-[#15803d] hover:bg-[#166534] rounded-full transition-all w-full flex justify-center items-center gap-2 cursor-pointer shadow-md text-center"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

