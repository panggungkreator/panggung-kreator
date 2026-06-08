"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { verifyMemberPaymentAction, deleteMembersAction } from "@/lib/actions/checkout-actions";

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
};

interface AdminClientProps {
  initialMembers: Member[];
}

export default function AdminClient({ initialMembers }: AdminClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [isPending, startTransition] = useTransition();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
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
      `Halo Kak ${name}, pendaftaran Panggung Kreator Akademi Anda sudah kami verifikasi dan akun Anda telah aktif! Silakan login di https://panggungkreator.com/login`
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
          // Update local state instantly
          setMembers((prev) =>
            prev.map((m) =>
              m.id === memberId ? { ...m, payment_status: "paid" } : m
            )
          );
          setSuccessMessage(`Berhasil memverifikasi pembayaran atas nama ${memberName}`);
          router.refresh();
        } else {
          setErrorMessage(result.error || "Gagal memverifikasi pembayaran.");
        }
      } catch (err: any) {
        setErrorMessage("Terjadi kesalahan koneksi server.");
      } finally {
        setVerifyingId(null);
        setModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    });
  };

  // Toggle reveal credentials
  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
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
            Apakah anda yakin ingin menghapus data pendaftar atas nama <span className="font-bold text-[#bc151b] dark:text-red-500">{name}</span> secara permanen? Aksi ini tidak dapat dibatalkan.
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
          setSuccessMessage(`Berhasil menghapus ${ids.length} data pendaftar`);
          router.refresh();
        } else {
          setErrorMessage(result.error || "Gagal menghapus data.");
        }
      } catch (err: any) {
        setErrorMessage("Terjadi kesalahan saat menghapus.");
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
        (m.email || "").toLowerCase().includes(search.toLowerCase());

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
    const revenue = paid * 49000;

    return { total, pending, paid, revenue };
  }, [members]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Dashboard CMS
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Kelola data pendaftaran dan verifikasi pembayaran manual QRIS.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-medium">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="hover:opacity-80">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center justify-between font-medium">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-80">✕</button>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Pendaftar */}
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xs transition-colors duration-300 shadow-xs dark:shadow-none">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Pendaftar</div>
          <div className="text-3xl font-title font-bold mt-2 text-zinc-900 dark:text-white">{stats.total}</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">Total seluruh formulir masuk</div>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xs transition-colors duration-300 relative overflow-hidden shadow-xs dark:shadow-none">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Menunggu Verifikasi</div>
          <div className="text-3xl font-title font-bold mt-2 text-yellow-600 dark:text-yellow-500">{stats.pending}</div>
          <div className="text-[10px] text-yellow-600/80 dark:text-yellow-500/70 mt-2 font-medium">Perlu verifikasi transfer manual</div>
          {stats.pending > 0 && (
            <span className="absolute top-4 right-4 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          )}
        </div>

        {/* Card 3: Total Lunas */}
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xs transition-colors duration-300 shadow-xs dark:shadow-none">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Lunas</div>
          <div className="text-3xl font-title font-bold mt-2 text-emerald-600 dark:text-emerald-500">{stats.paid}</div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-500/70 mt-2 font-medium">Akun aktif & siap belajar</div>
        </div>

        {/* Card 4: Omset */}
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xs transition-colors duration-300 shadow-xs dark:shadow-none">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Omset</div>
          <div className="text-2xl font-title font-bold mt-3 text-zinc-900 dark:text-white tracking-wide">{formatIDR(stats.revenue)}</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2.5 font-medium">Hasil omset paket advanced</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-xs transition-colors duration-300 shadow-xs dark:shadow-none">
        {/* Filters Panel */}
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-[#bc151b] focus-within:ring-1 focus-within:ring-[#bc151b] transition-all">
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, email, username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-0 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0 p-0 w-full"
              />
            </div>

            <div className="flex gap-2 text-xs font-semibold w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${statusFilter === "all"
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white"
                  : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
              >
                Semua ({members.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${statusFilter === "pending"
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20 dark:border-yellow-500/20"
                  : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
              >
                Pending ({members.filter((m) => m.payment_status === "pending").length})
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-4 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${statusFilter === "paid"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/20"
                  : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
              >
                Lunas ({members.filter((m) => m.payment_status === "paid").length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {selectedIds.size > 0 && (
              <span className="text-xs font-medium text-zinc-500">{selectedIds.size} dipilih</span>
            )}
            <button
              onClick={() => handleDelete(Array.from(selectedIds))}
              disabled={isDeleting || selectedIds.size === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${selectedIds.size > 0
                ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                }`}
            >
              {isDeleting ? "Menghapus..." : "Hapus Data"}
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <svg className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tidak ada data pendaftar</h3>
              <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan kata pencarian atau filter status Anda.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 bg-zinc-50/70 dark:bg-zinc-950/40 uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 dark:border-zinc-700 text-[#bc151b] focus:ring-[#bc151b]"
                      checked={selectedIds.size === filteredMembers.length && filteredMembers.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">No. WhatsApp</th>
                  <th className="py-4 px-6">Sosmed</th>
                  <th className="py-4 px-6">Profesi</th>
                  <th className="py-4 px-6">Tgl Terdaftar</th>
                  <th className="py-4 px-6 text-center">Chat WA</th>
                  <th className="py-4 px-6 text-center">Konfirmasi Pembayaran</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="odd:bg-white even:bg-zinc-50/50 dark:odd:bg-transparent dark:even:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        className="rounded border-zinc-300 dark:border-zinc-700 text-[#bc151b] focus:ring-[#bc151b]"
                        checked={selectedIds.has(member.id)}
                        onChange={() => toggleSelect(member.id)}
                      />
                    </td>
                    {/* Member Name */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-zinc-900 dark:text-white text-sm">{member.full_name}</div>
                      {member.stage_name && (
                        <div className="text-zinc-500 font-medium text-[10px] mt-0.5">
                          Stage Name: <span className="text-zinc-700 dark:text-zinc-400">{member.stage_name}</span>
                        </div>
                      )}
                    </td>

                    {/* Credentials Column has been removed, but Email is added back as separate column */}
                    <td className="py-4 px-6 text-zinc-700 dark:text-zinc-300 font-medium">
                      {member.email || "-"}
                    </td>

                    {/* WhatsApp */}
                    <td className="py-4 px-6 text-zinc-700 dark:text-zinc-300 font-medium">
                      {member.whatsapp_number || "-"}
                    </td>

                    {/* Sosmed */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex flex-col gap-1 text-[10px] text-zinc-500 font-medium">
                        {member.instagram_username ? (
                          <span className="flex items-center gap-1">
                            ig: <span className="text-zinc-700 dark:text-zinc-300">@{member.instagram_username}</span>
                          </span>
                        ) : null}
                        {member.tiktok_username ? (
                          <span className="flex items-center gap-1">
                            tt: <span className="text-zinc-700 dark:text-zinc-300">@{member.tiktok_username}</span>
                          </span>
                        ) : null}
                        {!member.instagram_username && !member.tiktok_username && (
                          <span className="text-zinc-400 dark:text-zinc-600">-</span>
                        )}
                      </div>
                    </td>

                    {/* Occupation */}
                    <td className="py-4 px-6 capitalize text-zinc-700 dark:text-zinc-300 font-medium">
                      {member.occupation || "-"}
                    </td>

                    {/* Date Registered */}
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400 font-medium">
                      {new Date(member.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Chat WA */}
                    <td className="py-4 px-6 text-center">
                      <a
                        href={formatWhatsappLink(member.whatsapp_number, member.stage_name, member.full_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-auto w-max px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.472.945 6.037.945 1.611 5.316 1.607 10.744c-.002 1.716.446 3.39 1.298 4.872L1.876 21.09l5.771-1.936z" />
                        </svg>
                        Chat WA
                      </a>
                    </td>

                    {/* Konfirmasi Pembayaran */}
                    <td className="py-4 px-6 text-center">
                      {member.payment_status === "pending" ? (
                        <button
                          onClick={() => handleVerify(member.id, member.full_name || member.username || "Kreator")}
                          disabled={verifyingId !== null}
                          className="mx-auto w-max px-2.5 py-1.5 bg-[#bc151b] hover:bg-[#bc151b]/90 text-white rounded-md font-semibold border border-red-600/30 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                        >
                          {verifyingId === member.id ? (
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            "Konfirmasi Lunas"
                          )}
                        </button>
                      ) : (
                        <span className="mx-auto flex w-max items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-bold uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Lunas
                        </span>
                      )}
                    </td>

                    {/* Aksi (Trash) */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete([member.id])}
                        disabled={isDeleting}
                        className="mx-auto w-max p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !modal.isLoading && setModal(prev => ({ ...prev, isOpen: false }))}
          ></div>
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{modal.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{modal.description}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950/50 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                disabled={modal.isLoading}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={modal.onConfirm}
                disabled={modal.isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 ${modal.type === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-[#bc151b] hover:bg-[#bc151b]/90"
                  }`}
              >
                {modal.isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {modal.type === "delete" ? "Ya, Hapus Data" : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
