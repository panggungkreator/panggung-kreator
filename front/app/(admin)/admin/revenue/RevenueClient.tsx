"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileSpreadsheet,
  SlidersHorizontal,
  RefreshCw,
  Users,
  Download,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AdminPagination from "@/components/admin/AdminPagination";
import { toast } from "sonner";

export interface MonthlyRevenue {
  month: string;
  total: number;
  jumlah: number;
}

export interface PackageRevenue {
  name: string;
  total: number;
  jumlah: number;
}

export interface MembershipTransaction {
  id: string;
  orderId: string;
  memberName: string;
  stageName?: string;
  username: string;
  email?: string;
  whatsapp?: string;
  registeredDate: string;
  paidDate?: string;
  packageName: string;
  amount: number; // Besaran (bruto)
  referrerName?: string;
  referrerUsername?: string;
  referralCode?: string;
  commissionAmount: number; // Komisi affiliate
  netAmount: number; // Total bersih
  status: string;
}

interface RevenueClientProps {
  dbMonthly?: MonthlyRevenue[];
  dbPackages?: PackageRevenue[];
  dbTransactions?: MembershipTransaction[];
  paginationLimit?: number;
}

export default function RevenueClient({
  dbTransactions = [],
  paginationLimit = 10,
}: RevenueClientProps) {
  const router = useRouter();

  // Data transaksi langsung diambil dari database
  const transactionsData = dbTransactions;

  // Search, Filter & Pagination states
  const [search, setSearch] = useState("");
  const [affiliateFilter, setAffiliateFilter] = useState<"all" | "with_affiliate" | "no_affiliate">("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const limit = paginationLimit > 0 ? paginationLimit : 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Ekstrak daftar bulan yang tersedia dari data transaksi
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactionsData.forEach((tx) => {
      const dateStr = tx.registeredDate || tx.paidDate;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthSet.add(monthKey);
        }
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactionsData]);

  const formatMonthLabel = (monthKey: string) => {
    if (!monthKey || monthKey === "all") return "Semua Waktu";
    const [year, month] = monthKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  // Metrics summary
  const stats = useMemo(() => {
    const total = transactionsData.length;
    const withAffiliate = transactionsData.filter((t) => t.commissionAmount > 0).length;
    const noAffiliate = transactionsData.filter((t) => t.commissionAmount === 0).length;
    const totalGross = transactionsData.reduce((sum, item) => sum + item.amount, 0);
    const totalCommission = transactionsData.reduce((sum, item) => sum + item.commissionAmount, 0);
    const totalNet = transactionsData.reduce((sum, item) => sum + item.netAmount, 0);

    return { total, withAffiliate, noAffiliate, totalGross, totalCommission, totalNet };
  }, [transactionsData]);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    const list = transactionsData.filter((item) => {
      const matchSearch =
        (item.memberName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.stageName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.whatsapp || "").includes(search) ||
        (item.referrerName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.referralCode || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.orderId || "").toLowerCase().includes(search.toLowerCase());

      const matchAffiliate =
        affiliateFilter === "all" ||
        (affiliateFilter === "with_affiliate" && item.commissionAmount > 0) ||
        (affiliateFilter === "no_affiliate" && item.commissionAmount === 0);

      let matchMonth = true;
      if (monthFilter !== "all") {
        const dateStr = item.registeredDate || item.paidDate;
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const itemMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            matchMonth = itemMonthKey === monthFilter;
          }
        }
      }

      return matchSearch && matchAffiliate && matchMonth;
    });

    return list.sort((a, b) => {
      return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime();
    });
  }, [transactionsData, search, affiliateFilter, monthFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, filteredTransactions.length);
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, affiliateFilter, monthFilter]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      router.refresh();
      toast.success("Data revenue berhasil diperbarui!");
    } catch {
      toast.info("Memperbarui data...");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      "Order ID",
      "Nama Member",
      "Stage Name",
      "Username",
      "Email",
      "WhatsApp",
      "Tanggal Daftar",
      "Paket",
      "Besaran (Bruto)",
      "Affiliate (Dari Siapa)",
      "Kode Referral",
      "Komisi Affiliate",
      "Total Bersih (Net)",
      "Status",
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.orderId,
      tx.memberName,
      tx.stageName || "-",
      tx.username,
      tx.email || "-",
      `="${tx.whatsapp || ''}"`,
      new Date(tx.registeredDate).toLocaleDateString("id-ID"),
      tx.packageName,
      tx.amount,
      tx.referrerName || "Tanpa Affiliate",
      tx.referralCode || "-",
      tx.commissionAmount,
      tx.netAmount,
      tx.status === "paid" ? "Lunas" : tx.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Revenue_Membership_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200 animate-fade-in">

      {/* ═══ TOP HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-default/60">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted block">
            [ ANALYTICS & REVENUE ]
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Revenue & Penjualan Membership
          </h1>
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Per 7 Sep 2026
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Segarkan data revenue"
            className="inline-flex items-center justify-center h-9 w-9 text-text-muted hover:text-text-primary bg-bg-well/60 hover:bg-bg-well border border-border-default rounded-full transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-text-primary" : ""} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all shadow-xs cursor-pointer tracking-wider shrink-0"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* ═══ COMPACT CAPSULE SUMMARY PILLS BAR (Diposisikan di Kiri) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-start gap-2 shadow-2xs">
        {/* Omset */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bg-well/80 border border-border-default/60 text-xs font-mono text-text-secondary shrink-0">
          <span className="text-[10px] uppercase font-bold text-text-muted">OMSET:</span>
          <span className="font-bold text-text-primary">{formatCurrency(stats.totalGross)}</span>
        </div>

        {/* Total Affiliate */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-700 dark:text-amber-300 shrink-0">
          <span className="text-[10px] uppercase font-bold text-amber-600/80 dark:text-amber-400/80">TOTAL AFFILIATE:</span>
          <span className="font-extrabold">- {formatCurrency(stats.totalCommission)}</span>
        </div>

        {/* Total Bersih */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#dcfce7]/80 dark:bg-emerald-950/40 border border-emerald-300/30 text-xs font-mono text-[#15803d] dark:text-emerald-300 shrink-0">
          <span className="text-[10px] uppercase font-bold opacity-80">TOTAL BERSIH:</span>
          <span className="font-black">{formatCurrency(stats.totalNet)}</span>
        </div>
      </div>

      {/* ═══ SEARCH & FILTER TOOLBAR (Affiliate & Waktu di Sebelah Search) ═══ */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Input Full-Width Left */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, username, nomor WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 bg-bg-well/70 border border-border-default rounded-full pl-10 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary font-medium transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns on the Right */}
        <div className="hidden sm:flex sm:w-auto gap-2">
          {/* Filter 1: Status Affiliate (Menggantikan tab atas) */}
          <div className="w-48">
            <Select
              value={affiliateFilter}
              onValueChange={(val) => setAffiliateFilter(val as any)}
            >
              <SelectTrigger className="w-full h-10 rounded-full px-4 text-xs font-medium bg-bg-well/70 border-border-default cursor-pointer">
                <SelectValue placeholder="Semua Affiliate" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-default">
                <SelectItem value="all">{`Semua Affiliate (${transactionsData.length})`}</SelectItem>
                <SelectItem value="with_affiliate">{`Dengan Affiliate (${transactionsData.filter((t) => t.commissionAmount > 0).length})`}</SelectItem>
                <SelectItem value="no_affiliate">{`Tanpa Affiliate (${transactionsData.filter((t) => t.commissionAmount === 0).length})`}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter 2: Periode Waktu / Bulan */}
          <div className="w-48">
            <Select
              value={monthFilter}
              onValueChange={setMonthFilter}
            >
              <SelectTrigger className="w-full h-10 rounded-full px-4 text-xs font-medium bg-bg-well/70 border-border-default cursor-pointer">
                <SelectValue placeholder="Semua Waktu" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-default">
                <SelectItem value="all">Semua Waktu</SelectItem>
                {availableMonths.map((m) => (
                  <SelectItem key={m} value={m}>
                    {formatMonthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ═══ 1. DESKTOP VIEW: TABLE ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-bold border-b border-border-default/70 bg-bg-well/50 text-[10px] tracking-wider uppercase">
                <th className="py-4 px-6">NAMA & USERNAME</th>
                <th className="py-4 px-5">EMAIL</th>
                <th className="py-4 px-5">WHATSAPP</th>
                <th className="py-4 px-5">BESARAN</th>
                <th className="py-4 px-5">AFFILIATE (DARI SIAPA)</th>
                <th className="py-4 px-5 text-right">TOTAL BERSIH</th>
                <th className="py-4 px-5 text-center">TGL DAFTAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data transaksi membership ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-bg-well/30 transition-colors group">
                    {/* Nama & Username */}
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs leading-tight">
                        {tx.memberName}
                      </div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                        @{tx.username}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-300 font-medium">
                      {tx.email || "-"}
                    </td>

                    {/* WhatsApp */}
                    <td className="py-3.5 px-5 font-mono text-zinc-700 dark:text-zinc-300">
                      {tx.whatsapp || "-"}
                    </td>

                    {/* Besaran (Bruto) */}
                    <td className="py-3.5 px-5 font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      {formatCurrency(tx.amount)}
                    </td>

                    {/* Affiliate (Dari Siapa) */}
                    <td className="py-3.5 px-5">
                      {tx.referrerName ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{tx.referrerName}</span>
                          <span className="opacity-75 font-mono">(-{formatCurrency(tx.commissionAmount)})</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Tanpa Affiliate
                        </span>
                      )}
                    </td>

                    {/* Total Bersih */}
                    <td className="py-3.5 px-5 text-right font-mono font-black text-emerald-600 dark:text-[#BAFF6A] text-xs whitespace-nowrap">
                      {formatCurrency(tx.netAmount)}
                    </td>

                    {/* Tgl Daftar */}
                    <td className="py-3.5 px-5 text-center text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                      {new Date(tx.registeredDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ 2. MOBILE VIEW: CARDS (Sesuai Standar admin-mobile.md) ═══ */}
      <div className="md:hidden space-y-3">
        {paginatedTransactions.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data membership ditemukan.</p>
          </div>
        ) : (
          paginatedTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 transition-all shadow-xs flex flex-col justify-between"
            >
              {/* Top: Nama & Status */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-border-default/40">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-text-primary leading-tight">
                    {tx.memberName}
                  </h3>
                  <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                    @{tx.username}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-text-muted block">
                    {new Date(tx.registeredDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Middle: Details */}
              <div className="py-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-text-secondary">WhatsApp:</span>
                  <span className="font-mono font-medium text-text-primary">{tx.whatsapp || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-text-secondary">Besaran (Bruto):</span>
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(tx.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-text-secondary">Affiliate:</span>
                  {tx.referrerName ? (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      🎁 {tx.referrerName} (-{formatCurrency(tx.commissionAmount)})
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted italic">Tanpa Affiliate</span>
                  )}
                </div>
              </div>

              {/* Bottom: Total Bersih */}
              <div className="pt-2 border-t border-border-default/40 flex justify-between items-center">
                <span className="text-xs font-bold text-text-primary">Total Bersih:</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-[#BAFF6A]">
                  {formatCurrency(tx.netAmount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTransactions.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="member"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS DOCK (Mobile md:hidden Sesuai admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">

          {/* 1. Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-white" : ""}`} />
          </button>

          {/* 2. Filter Popover (Bulan & Status Affiliate) */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  affiliateFilter !== "all" || monthFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Data"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(affiliateFilter !== "all" || monthFilter !== "all") && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-64 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-border-default/50">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Data
                </span>
                {(affiliateFilter !== "all" || monthFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setAffiliateFilter("all");
                      setMonthFilter("all");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Status Affiliate Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-secondary">Affiliate:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "all", label: "Semua", count: transactionsData.length },
                    { value: "with_affiliate", label: "Ada Affiliate", count: transactionsData.filter((t) => t.commissionAmount > 0).length },
                    { value: "no_affiliate", label: "Tanpa Affiliate", count: transactionsData.filter((t) => t.commissionAmount === 0).length },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setAffiliateFilter(item.value as any)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        affiliateFilter === item.value
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-xs"
                          : "bg-bg-well hover:bg-bg-well/80 text-text-secondary"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[9px] opacity-70">({item.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Chips */}
              {availableMonths.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border-default/40">
                  <span className="text-[10px] font-bold text-text-secondary">Periode Waktu:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMonthFilter("all")}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                        monthFilter === "all"
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                          : "bg-bg-well text-text-secondary"
                      }`}
                    >
                      Semua Waktu
                    </button>
                    {availableMonths.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMonthFilter(m)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                          monthFilter === m
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                            : "bg-bg-well text-text-secondary"
                        }`}
                      >
                        {formatMonthLabel(m)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* 3. Export Excel Action Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredTransactions.length === 0}
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export</span>
          </button>
        </div>
      </div>

    </div>
  );
}
