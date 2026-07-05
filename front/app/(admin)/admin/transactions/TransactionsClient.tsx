"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CreditCard,
  TrendingUp,
  Clock,
  XCircle,
  ChevronDown,
  RotateCcw,
  Calendar,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";



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
  created_at: string;
  member_name: string;
  member_email: string;
  package_name: string;
}

interface Package {
  id: string;
  name: string;
}

interface TransactionsClientProps {
  initialTransactions: Transaction[];
  packages: Package[];
}

export default function TransactionsClient({
  initialTransactions,
  packages,
}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPackageFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.order_id.toLowerCase().includes(search.toLowerCase()) ||
        tx.member_name.toLowerCase().includes(search.toLowerCase()) ||
        tx.member_email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;

      const matchesPackage =
        packageFilter === "all" || tx.package_name === packageFilter;

      // Date range check
      let matchesDate = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && new Date(tx.created_at) >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(tx.created_at) <= end;
      }

      return matchesSearch && matchesStatus && matchesPackage && matchesDate;
    });
  }, [transactions, search, statusFilter, packageFilter, startDate, endDate]);

  // Statistics summaries based on current filtered dataset
  const stats = useMemo(() => {
    const paidTxs = filteredTransactions.filter(t => t.status === "paid");
    const totalRevenue = paidTxs.reduce((sum, t) => sum + t.final_amount, 0);
    const pendingCount = filteredTransactions.filter(t => t.status === "pending").length;
    return {
      totalCount: filteredTransactions.length,
      totalRevenue,
      pendingCount
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">

      {/* Page Header (Ecomora Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ DATA CENTER ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Transaksi
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Total Volume */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">
              Total Volume Transaksi
            </span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {stats.totalCount.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Transaksi tercatat di filter aktif</p>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">
              Total Pendapatan Terverifikasi
            </span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(stats.totalRevenue)}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Dari transaksi berstatus &apos;Paid&apos;</p>
        </div>

        {/* Card 3: Pending Confirmation */}
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
          <p className="text-[10px] text-text-secondary">Transaksi menunggu validasi admin</p>
        </div>

      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="py-5 space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">

          {/* Search Box */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Order ID / Nama / Email..."
              className="bg-bg-well border border-border-default rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-[52px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="paid">Complete (Paid)</SelectItem>
                <SelectItem value="pending">In Progress (Pending)</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Package Dropdown */}
          <div className="relative">
            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger className="h-[52px]">
                <SelectValue placeholder="Semua Paket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Paket</SelectItem>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.name}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Tanggal Mulai"
              className="h-[52px] rounded-full border border-border-default bg-bg-well text-xs text-text-primary font-semibold"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Tanggal Selesai"
              className="h-[52px] rounded-full border border-border-default bg-bg-well text-xs text-text-primary font-semibold"
            />
          </div>

        </div>

        {/* Reset Filters Option */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleResetFilters}
            className="bg-transparent border-border-default text-text-secondary hover:text-text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider h-auto w-auto flex gap-1.5 transition-colors duration-150"
          >
            <RotateCcw size={11} />
            <span>Reset Semua Filter</span>
          </Button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="p-5 flex justify-between items-center border-b border-border-default/45">
          <span className="text-xs font-bold text-text-primary">
            DAFTAR REKAMAN TRANSAKSI ({filteredTransactions.length})
          </span>
          <span className="text-[10px] text-text-muted font-semibold uppercase">View Only</span>
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-border-default/70 bg-bg-well/50 text-text-secondary">
                <th className="p-4 uppercase tracking-wider font-bold">Order ID</th>
                <th className="p-4 uppercase tracking-wider font-bold">Nama Member</th>
                <th className="p-4 uppercase tracking-wider font-bold">Paket Akademi</th>
                <th className="p-4 uppercase tracking-wider font-bold">Gross Amount</th>
                <th className="p-4 uppercase tracking-wider font-bold">Diskon</th>
                <th className="p-4 uppercase tracking-wider font-bold">Final Amount</th>
                <th className="p-4 uppercase tracking-wider font-bold">Metode Bayar</th>
                <th className="p-4 uppercase tracking-wider font-bold">Tanggal</th>
                <th className="p-4 uppercase tracking-wider font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-bg-well/20 transition-colors">
                    <td className="p-4 font-bold text-text-primary">
                      {tx.order_id}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-text-primary block">{tx.member_name}</span>
                      <span className="block text-[10px] text-text-secondary mt-0.5">
                        {tx.member_email}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-text-primary">
                      {tx.package_name}
                    </td>
                    <td className="p-4 text-text-secondary font-medium">
                      {formatCurrency(tx.gross_amount)}
                    </td>
                    <td className="p-4 text-[#E05C5C] font-medium">
                      {tx.discount_amount > 0 ? `-${formatCurrency(tx.discount_amount)}` : "-"}
                    </td>
                    <td className="p-4 font-bold text-text-primary">
                      {formatCurrency(tx.final_amount)}
                    </td>
                    <td className="p-4 text-text-secondary font-medium uppercase">
                      {tx.payment_method}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${tx.status === "paid"
                        ? "bg-[#EDFFF4] text-[#22C55E]"
                        : tx.status === "pending"
                          ? "bg-[#EEF0FF] text-[#5B67D8]"
                          : "bg-[#FFF4EE] text-[#F97316]"
                        }`}>
                        {tx.status === "paid" ? "Complete" : tx.status === "pending" ? "In Progress" : tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
