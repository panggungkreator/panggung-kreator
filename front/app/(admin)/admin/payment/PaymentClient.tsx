"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  RotateCcw,
  Image as ImageIcon,
  Gift,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { confirmPaymentWithRewardAction } from "@/lib/actions/referral-actions";

interface Transaction {
  id: string;
  member_id: string;
  package_id: string;
  voucher_id: string;
  referral_code: string | null;
  referred_by_id: string | null;
  commission_earned: number;
  referral_credit_used: number;
  referrer_name: string | null;
  referrer_email: string | null;
  order_id: string;
  status: string;
  gross_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  paid_at: string | null;
  expired_at: string | null;
  metadata: any | null;
  created_at: string;
  member_name: string;
  member_email: string;
  member_tier: string;
  package_name: string;
  package_tier: string;
}

interface PaymentClientProps {
  initialTransactions: Transaction[];
}

export default function PaymentClient({
  initialTransactions,
}: PaymentClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [search, setSearch] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);

  // Modal Konfirmasi Pembayaran + Reward Dinamis
  const [confirmModalTx, setConfirmModalTx] = useState<Transaction | null>(null);
  const [rewardInput, setRewardInput] = useState<string>("0");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isLoadingRewardDefault, setIsLoadingRewardDefault] = useState<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Re-fetch transactions to refresh state
  const refreshTransactions = async () => {
    try {
      const supabase = createClient();
      const { data: rawTx } = await supabase
        .from("transactions")
        .select(`
          id,
          member_id,
          package_id,
          voucher_id,
          referral_code,
          referred_by_id,
          affiliate_code_used,
          commission_earned,
          referral_credit_used,
          order_id,
          status,
          gross_amount,
          discount_amount,
          final_amount,
          payment_method,
          paid_at,
          expired_at,
          metadata,
          created_at,
          members:member_id (
            full_name,
            email,
            membership_tier
          ),
          referrer:referred_by_id (
            id,
            full_name,
            stage_name,
            email
          ),
          packages (
            name,
            tier
          )
        `)
        .order("created_at", { ascending: false });

      if (rawTx) {
        const formatted = rawTx.map((tx: any) => ({
          id: tx.id,
          member_id: tx.member_id,
          package_id: tx.package_id,
          voucher_id: tx.voucher_id,
          referral_code: tx.referral_code || tx.affiliate_code_used || null,
          referred_by_id: tx.referred_by_id || null,
          commission_earned: tx.commission_earned || 0,
          referral_credit_used: tx.referral_credit_used || 0,
          referrer_name: tx.referrer?.stage_name || tx.referrer?.full_name || null,
          referrer_email: tx.referrer?.email || null,
          order_id: tx.order_id,
          status: tx.status,
          gross_amount: tx.gross_amount || 0,
          discount_amount: tx.discount_amount || 0,
          final_amount: tx.final_amount || 0,
          payment_method: tx.payment_method || "Transfer Bank",
          paid_at: tx.paid_at,
          expired_at: tx.expired_at,
          created_at: tx.created_at,
          metadata: tx.metadata || null,
          member_name: tx.members?.full_name || "MEMBER TERHAPUS",
          member_email: tx.members?.email || "",
          member_tier: tx.members?.membership_tier || "free",
          package_name: tx.packages?.name || "TIDAK ADA PAKET",
          package_tier: tx.packages?.tier || "free",
        }));
        setTransactions(formatted);
      }
    } catch (err) {
      console.error("Gagal menyegarkan transaksi:", err);
    }
  };

  // Buka Modal Konfirmasi Pembayaran & Ambil Default Reward
  const openConfirmModal = async (tx: Transaction) => {
    setConfirmModalTx(tx);
    setAdminNotes("");
    setIsLoadingRewardDefault(true);

    if (tx.referral_code) {
      try {
        const supabase = createClient();
        const { data: refCode } = await supabase
          .from("referral_codes")
          .select("default_reward")
          .eq("code", tx.referral_code)
          .maybeSingle();

        const defaultRewardVal = refCode?.default_reward ? Number(refCode.default_reward) : 10000;
        setRewardInput(String(defaultRewardVal));
      } catch (e) {
        setRewardInput("10000");
      }
    } else {
      setRewardInput("0");
    }
    setIsLoadingRewardDefault(false);
  };

  // Eksekusi Konfirmasi Pembayaran dengan Reward
  const handleExecuteConfirmation = async () => {
    if (!confirmModalTx) return;

    const tx = confirmModalTx;
    setIsSubmittingId(tx.id);

    try {
      const rewardNum = Math.max(0, parseInt(rewardInput.replace(/\D/g, ""), 10) || 0);

      const result = await confirmPaymentWithRewardAction({
        transactionId: tx.id,
        rewardAmount: tx.referral_code || tx.referred_by_id ? rewardNum : 0,
        notes: adminNotes.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || "Gagal mengonfirmasi pembayaran.");
      }

      let successMsg = `Pembayaran ${tx.member_name} (${formatCurrency(tx.final_amount)}) berhasil dikonfirmasi lunas!`;
      if (result.rewardRecorded && result.rewardAmount) {
        successMsg += `\nKomisi sebesar ${formatCurrency(result.rewardAmount)} berhasil diberikan ke ${result.referrerName || "pemilik kode referral"} dan email notifikasi telah dikirim.`;
      }

      alert(successMsg);
      setConfirmModalTx(null);
      await refreshTransactions();
    } catch (err: any) {
      console.error(err);
      alert("Gagal melakukan konfirmasi: " + err.message);
    } finally {
      setIsSubmittingId(null);
    }
  };

  // Header Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const paidTxs = transactions.filter((t) => t.status === "paid");
    const pendingTxs = transactions.filter((t) => t.status === "pending");

    const todayRevenue = paidTxs
      .filter((t) => t.paid_at && new Date(t.paid_at) >= today)
      .reduce((sum, t) => sum + t.final_amount, 0);

    const monthRevenue = paidTxs
      .filter((t) => t.paid_at && new Date(t.paid_at) >= startOfMonth)
      .reduce((sum, t) => sum + t.final_amount, 0);

    return {
      todayRevenue,
      monthRevenue,
      pendingCount: pendingTxs.length,
    };
  }, [transactions]);

  // Filtered transactions for the current view
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesTab = activeTab === "pending" ? tx.status === "pending" : true;
      const matchesSearch =
        tx.order_id.toLowerCase().includes(search.toLowerCase()) ||
        tx.member_name.toLowerCase().includes(search.toLowerCase()) ||
        tx.member_email.toLowerCase().includes(search.toLowerCase()) ||
        tx.package_name.toLowerCase().includes(search.toLowerCase()) ||
        (tx.referral_code && tx.referral_code.toLowerCase().includes(search.toLowerCase())) ||
        (tx.referrer_name && tx.referrer_name.toLowerCase().includes(search.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, search]);

  const pendingTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => t.status === "pending");
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Monitor Pembayaran & Referral Reward
          </h1>
        </div>
      </div>

      {/* Summary Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Masuk Hari Ini */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">
              Total Masuk Hari Ini
            </span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(stats.todayRevenue)}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Akumulasi pembayaran terverifikasi hari ini</p>
        </div>

        {/* Card 2: Masuk Bulan Ini */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">
              Total Masuk Bulan Ini
            </span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(stats.monthRevenue)}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Akumulasi pembayaran terverifikasi bulan ini</p>
        </div>

        {/* Card 3: Pending Approval */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">
              Menunggu Konfirmasi
            </span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {stats.pendingCount.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Transaksi butuh validasi manual admin</p>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-border-default">
        {/* Navigation Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === "pending"
                ? "text-text-primary border-b-2 border-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Pending ({stats.pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === "all"
                ? "text-text-primary border-b-2 border-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Semua Transaksi ({transactions.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-[280px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari order, member, atau referral..."
            className="bg-bg-well border border-border-default rounded-full py-2 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
          />
        </div>
      </div>

      {/* Main Grid View */}
      {activeTab === "pending" ? (
        pendingTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingTransactions.map((tx) => {
              const receiptUrl = tx.metadata?.receipt_url || tx.metadata?.proof_url || null;

              return (
                <div
                  key={tx.id}
                  className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[250px] hover:border-text-primary/30 transition-colors shadow-xs"
                >
                  <div className="space-y-3.5">
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider font-mono">
                        {tx.order_id}
                      </span>
                      <span className="text-[9px] font-bold text-[#5B67D8] bg-[#EEF0FF] dark:bg-[#5B67D8]/20 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>

                    {/* Member & Package Details */}
                    <div>
                      <h3 className="text-sm font-extrabold text-text-primary leading-tight">
                        {tx.member_name}
                      </h3>
                      <p className="text-[10px] text-text-secondary mt-0.5">{tx.member_email}</p>
                      <div className="mt-2.5 py-2 px-3 bg-bg-well border border-border-default rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-secondary">{tx.package_name}</span>
                        <span className="font-black text-text-primary">{formatCurrency(tx.final_amount)}</span>
                      </div>
                    </div>

                    {/* Referral Attribution Info */}
                    {tx.referral_code && (
                      <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                          <Gift size={12} />
                          <span>REFERRAL: {tx.referral_code}</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                          Pemilik: <strong className="text-zinc-900 dark:text-zinc-200">{tx.referrer_name || "Admin/Member"}</strong>
                        </p>
                      </div>
                    )}

                    {/* Transaction metadata */}
                    <div className="text-[10px] text-text-secondary space-y-1">
                      <p>• Metode: <span className="font-semibold text-text-primary uppercase">{tx.payment_method}</span></p>
                      <p>• Tanggal: <span className="font-semibold text-text-primary">{formatDate(tx.created_at)}</span></p>
                    </div>
                  </div>

                  {/* Actions area inside card */}
                  <div className="border-t border-border-default/50 pt-4 mt-4 flex gap-2">
                    {receiptUrl && (
                      <button
                        onClick={() => setSelectedProofUrl(receiptUrl)}
                        className="flex-1 border border-border-default hover:bg-bg-well rounded-full py-2 text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <ImageIcon size={12} />
                        Bukti Bayar
                      </button>
                    )}
                    <button
                      onClick={() => openConfirmModal(tx)}
                      disabled={isSubmittingId === tx.id}
                      className="flex-1 bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-opacity disabled:opacity-50"
                    >
                      <CheckCircle size={12} />
                      Konfirmasi Lunas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-bg-card border border-border-default rounded-2xl p-10 text-center">
            <CheckCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Tidak ada pembayaran pending yang perlu konfirmasi
            </p>
          </div>
        )
      ) : (
        /* All Transactions Grid-Style Table */
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
            <span className="text-xs font-bold text-text-primary">
              RIWAYAT KESELURUHAN TRANSAKSI ({filteredTransactions.length})
            </span>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Order ID</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama Member</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Paket Akademi</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Final Amount</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Referral & Komisi</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Metode Bayar</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Tanggal</th>
                    <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Bukti</th>
                    <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, index) => {
                    const isLastRow = index === filteredTransactions.length - 1;
                    const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;
                    const receiptUrl = tx.metadata?.receipt_url || tx.metadata?.proof_url || null;

                    return (
                      <tr key={tx.id} className="hover:bg-bg-well/30 transition-colors group">
                        <td className={`${cellBorderClass} font-bold text-text-primary font-mono text-[11px]`}>
                          {tx.order_id}
                        </td>
                        <td className={cellBorderClass}>
                          <span className="font-semibold text-text-primary block">{tx.member_name}</span>
                          <span className="block text-[10px] text-text-secondary mt-0.5">
                            {tx.member_email}
                          </span>
                        </td>
                        <td className={`${cellBorderClass} font-semibold text-text-primary`}>
                          {tx.package_name}
                        </td>
                        <td className={`${cellBorderClass} font-bold text-text-primary`}>
                          {formatCurrency(tx.final_amount)}
                        </td>
                        <td className={cellBorderClass}>
                          {tx.referral_code ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200/50">
                                <Gift size={10} />
                                {tx.referral_code}
                              </span>
                              <span className="block text-[10px] text-zinc-500">
                                {tx.referrer_name || "Pemilik"}
                              </span>
                              {tx.commission_earned > 0 && (
                                <span className="block text-[10px] text-emerald-600 font-bold">
                                  Komisi: +{formatCurrency(tx.commission_earned)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-muted text-[11px]">-</span>
                          )}
                        </td>
                        <td className={`${cellBorderClass} text-text-secondary font-medium uppercase`}>
                          {tx.payment_method}
                        </td>
                        <td className={`${cellBorderClass} text-text-secondary`}>
                          {formatDate(tx.created_at)}
                        </td>
                        <td className={cellBorderClass}>
                          {receiptUrl ? (
                            <button
                              onClick={() => setSelectedProofUrl(receiptUrl)}
                              className="text-[#0369a1] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            >
                              <ImageIcon size={13} />
                              <span>Lihat</span>
                            </button>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className={cellBorderClass}>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                              tx.status === "paid"
                                ? "bg-[#EDFFF4] text-[#22C55E]"
                                : tx.status === "pending"
                                ? "bg-[#EEF0FF] text-[#5B67D8]"
                                : "bg-[#FFF4EE] text-[#F97316]"
                            }`}
                          >
                            {tx.status === "paid" ? "Complete" : tx.status === "pending" ? "In Progress" : tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2.5" />
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Tidak ada data transaksi yang ditemukan
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog: Konfirmasi Pembayaran & Pengaturan Reward Dinamis */}
      {confirmModalTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-border-default">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Konfirmasi Pembayaran Lunas
                </h3>
              </div>
              <button
                onClick={() => setConfirmModalTx(null)}
                className="text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Rincian Member & Transaksi */}
            <div className="bg-bg-well border border-border-default rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Nama Member:</span>
                <strong className="text-text-primary font-semibold">{confirmModalTx.member_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Paket Akademi:</span>
                <span className="text-text-primary">{confirmModalTx.package_name}</span>
              </div>
              <div className="flex justify-between border-t border-border-default/40 pt-2 font-bold">
                <span className="text-text-primary">Total Bayar:</span>
                <span className="text-[#bc151b]">{formatCurrency(confirmModalTx.final_amount)}</span>
              </div>
            </div>

            {/* Rincian & Input Reward Dinamis jika ada referral */}
            {confirmModalTx.referral_code ? (
              <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                  <Gift className="w-4 h-4" />
                  <span>Referral Terdeteksi</span>
                </div>
                <div className="text-xs space-y-1 text-zinc-700 dark:text-zinc-300">
                  <p>• Kode: <strong className="font-mono">{confirmModalTx.referral_code}</strong></p>
                  <p>• Pemilik: <strong>{confirmModalTx.referrer_name || "Pemilik Kode"}</strong></p>
                </div>

                <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Nominal Reward Komisi (Rp):
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-zinc-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={rewardInput}
                      onChange={(e) => setRewardInput(e.target.value)}
                      placeholder="Contoh: 10000"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#bc151b]"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    * Nominal ini akan langsung ditambahkan ke saldo komisi <strong>{confirmModalTx.referrer_name || "pemilik kode"}</strong> dan sistem akan mengirimkan email notifikasi otomatis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-500">
                ℹ️ Transaksi ini tidak menggunakan kode referral.
              </div>
            )}

            {/* Catatan Admin */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Catatan Verifikasi (Opsional):
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Contoh: Pembayaran valid via transfer BCA"
                className="w-full bg-bg-well border border-border-default rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-text-primary resize-none h-16"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalTx(null)}
                className="flex-1 border border-border-default hover:bg-bg-well rounded-full py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmation}
                disabled={isSubmittingId === confirmModalTx.id || isLoadingRewardDefault}
                className="flex-1 bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-opacity disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {isSubmittingId === confirmModalTx.id ? "Memproses..." : "Konfirmasi Lunas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing Bank Transfer Proof */}
      {selectedProofUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-border-default/45">
              <span className="text-xs font-bold text-text-primary">BUKTI TRANSFER PEMBAYARAN</span>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-bg-well border border-border-default rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[300px] max-h-[500px]">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="max-w-full max-h-[480px] object-contain rounded-lg"
              />
            </div>

            <div className="flex justify-end pt-1">
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-border-default hover:bg-bg-well rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink size={12} />
                Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
