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
  Image as ImageIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  member_id: string;
  package_id: string;
  voucher_id: string;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
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
          members (
            full_name,
            email,
            membership_tier
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

  // Confirm payment handler
  const handleConfirmPayment = async (tx: Transaction) => {
    const confirmation = window.confirm(
      `Konfirmasi pembayaran LUNAS untuk ${tx.member_name} (${formatCurrency(tx.final_amount)})?`
    );
    if (!confirmation) return;

    setIsSubmittingId(tx.id);

    try {
      const supabase = createClient();
      const nowStr = new Date().toISOString();

      // 1. Update transaction status
      const { error: txError } = await supabase
        .from("transactions")
        .update({
          status: "paid",
          paid_at: nowStr,
        })
        .eq("id", tx.id);

      if (txError) throw new Error(txError.message);

      // 2. Update member membership_tier
      const { error: memberError } = await supabase
        .from("members")
        .update({
          membership_tier: tx.package_tier,
        })
        .eq("id", tx.member_id);

      if (memberError) throw new Error(memberError.message);

      // Success
      alert("Pembayaran berhasil dikonfirmasi Lunas! Membership member telah ditingkatkan.");
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
    today.setHours(0,0,0,0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const paidTxs = transactions.filter(t => t.status === "paid");
    const pendingTxs = transactions.filter(t => t.status === "pending");

    const todayRevenue = paidTxs
      .filter(t => t.paid_at && new Date(t.paid_at) >= today)
      .reduce((sum, t) => sum + t.final_amount, 0);

    const monthRevenue = paidTxs
      .filter(t => t.paid_at && new Date(t.paid_at) >= startOfMonth)
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
        tx.package_name.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, search]);

  const pendingTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.status === "pending");
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      
      {/* Page Header (Ecomora Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Monitor Pembayaran Masuk
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
        <div className="relative w-full sm:w-[260px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari order, member, atau paket..."
            className="bg-bg-well border border-border-default rounded-full py-2 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
          />
        </div>
      </div>

      {/* Main Grid View */}
      {activeTab === "pending" ? (
        // Pending Cards Grid (Ecomora Style card list for quick attention)
        pendingTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingTransactions.map((tx) => {
              // Extract payment proof image if exists in metadata
              const receiptUrl = tx.metadata?.receipt_url || tx.metadata?.proof_url || null;

              return (
                <div 
                  key={tx.id} 
                  className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[220px] hover:border-text-primary/30 transition-colors"
                >
                  <div className="space-y-3.5">
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        ORDER ID: {tx.order_id}
                      </span>
                      <span className="text-[9px] font-bold text-[#5B67D8] bg-[#EEF0FF] px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>

                    {/* Member & Package Details */}
                    <div>
                      <h3 className="text-sm font-extrabold text-text-primary leading-tight">
                        {tx.member_name}
                      </h3>
                      <p className="text-[10px] text-text-secondary mt-0.5">{tx.member_email}</p>
                      <div className="mt-2.5 py-1.5 px-3 bg-bg-well border border-border-default rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-secondary">{tx.package_name}</span>
                        <span className="font-black text-text-primary">{formatCurrency(tx.final_amount)}</span>
                      </div>
                    </div>

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
                      onClick={() => handleConfirmPayment(tx)}
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
        // All Transactions Grid-Style Table
        <div className="bg-bg-card border border-border-default rounded-2xl p-5">
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
                      <tr 
                        key={tx.id} 
                        className="hover:bg-bg-well/30 transition-colors group"
                      >
                        <td className={`${cellBorderClass} font-bold text-text-primary`}>
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
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                            tx.status === "paid" 
                              ? "bg-[#EDFFF4] text-[#22C55E]"
                              : tx.status === "pending"
                              ? "bg-[#EEF0FF] text-[#5B67D8]"
                              : "bg-[#FFF4EE] text-[#F97316]"
                          }`}>
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
