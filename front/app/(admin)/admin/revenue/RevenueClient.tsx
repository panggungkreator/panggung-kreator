"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BarChart3,
  List
} from "lucide-react";

interface MonthlyRevenue {
  month: string;
  total: number;
  jumlah: number;
}

interface PackageRevenue {
  name: string;
  total: number;
  jumlah: number;
}

interface RevenueClientProps {
  dbMonthly: MonthlyRevenue[];
  dbPackages: PackageRevenue[];
}

export default function RevenueClient({
  dbMonthly,
  dbPackages,
}: RevenueClientProps) {
  const dbIsEmpty = dbMonthly.length === 0 && dbPackages.length === 0;
  const [demoMode, setDemoMode] = useState(dbIsEmpty);

  // Demo datasets
  const demoMonthly: MonthlyRevenue[] = [
    { month: "2026-06", total: 32500000, jumlah: 45 },
    { month: "2026-05", total: 28200000, jumlah: 38 },
    { month: "2026-04", total: 24000000, jumlah: 32 },
    { month: "2026-03", total: 19500000, jumlah: 26 },
    { month: "2026-02", total: 15000000, jumlah: 20 },
    { month: "2026-01", total: 12500000, jumlah: 16 }
  ];

  const demoPackages: PackageRevenue[] = [
    { name: "Akademi Regular Monthly", total: 64500000, jumlah: 129 },
    { name: "Akademi MVP Premium", total: 48000000, jumlah: 32 },
    { name: "Masterclass Public Speaking", total: 19200000, jumlah: 16 }
  ];

  const monthlyData = useMemo(() => {
    return demoMode ? demoMonthly : dbMonthly;
  }, [demoMode, dbMonthly]);

  const packagesData = useMemo(() => {
    return demoMode ? demoPackages : dbPackages;
  }, [demoMode, dbPackages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthKey: string) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  // Metrics
  const summary = useMemo(() => {
    const totalRev = monthlyData.reduce((sum, item) => sum + item.total, 0);
    const totalTxs = monthlyData.reduce((sum, item) => sum + item.jumlah, 0);
    return {
      totalRev,
      totalTxs
    };
  }, [monthlyData]);

  // Max value for chart sizing
  const maxMonthlyRevenue = useMemo(() => {
    if (monthlyData.length === 0) return 1;
    return Math.max(...monthlyData.map(item => item.total));
  }, [monthlyData]);

  const maxPackageRevenue = useMemo(() => {
    if (packagesData.length === 0) return 1;
    return Math.max(...packagesData.map(item => item.total));
  }, [packagesData]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ ANALYTICS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Revenue & Penjualan Paket
          </h1>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-3 bg-bg-card border border-border-default rounded-full px-6 py-4 self-start xl:self-center shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            {demoMode ? "🔴 Demo Data Aktif" : "🟢 Database Ril Aktif"}
          </span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="text-[10px] font-black text-text-primary hover:underline uppercase tracking-wider cursor-pointer"
          >
            {demoMode ? "Ganti ke Ril" : "Ganti ke Demo"}
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Total Omset Pendapatan</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {formatCurrency(summary.totalRev)}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Akumulasi pendapatan dari seluruh pembayaran sukses</p>
        </div>

        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Total Transaksi Lunas</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {summary.totalTxs} <span className="text-xs font-semibold text-text-secondary">kali</span>
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Total volume transaksi berstatus PAID</p>
        </div>
      </div>

      {/* Grid: Charts (Monthly and Package breakdowns) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Monthly Revenue Chart */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/45">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <span className="text-xs font-bold text-text-primary">OMSET BULANAN (LAST 12 MONTHS)</span>
          </div>

          {monthlyData.length > 0 ? (
            <div className="space-y-3.5 py-2">
              {monthlyData.map((item, idx) => {
                const widthPct = maxMonthlyRevenue > 0 ? Math.round((item.total / maxMonthlyRevenue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-text-primary">
                      <span>{formatMonth(item.month)}</span>
                      <span>{formatCurrency(item.total)} <span className="text-[9px] text-text-secondary font-medium">({item.jumlah} order)</span></span>
                    </div>
                    <div className="w-full bg-bg-well h-6 rounded-full overflow-hidden flex items-center relative border border-border-default/30">
                      <div
                        className="h-full bg-[#5B67D8] rounded-full transition-all"
                        style={{ width: `${widthPct}%`, minWidth: "12%" }}
                      />
                      <span className="absolute left-3 text-[9px] font-black text-white mix-blend-difference">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-text-muted text-xs font-semibold">
              Belum ada data bulanan.
            </div>
          )}
        </div>

        {/* Package Revenue Chart */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-default/45">
            <Package className="w-4 h-4 text-text-secondary" />
            <span className="text-xs font-bold text-text-primary">KONTRIBUSI PER PAKET AKADEMI</span>
          </div>

          {packagesData.length > 0 ? (
            <div className="space-y-3.5 py-2">
              {packagesData.map((item, idx) => {
                const widthPct = maxPackageRevenue > 0 ? Math.round((item.total / maxPackageRevenue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-text-primary">
                      <span className="truncate max-w-[200px]" title={item.name}>{item.name}</span>
                      <span>{formatCurrency(item.total)} <span className="text-[9px] text-text-secondary font-medium">({item.jumlah} order)</span></span>
                    </div>
                    <div className="w-full bg-bg-well h-6 rounded-full overflow-hidden flex items-center relative border border-border-default/30">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${widthPct}%`, minWidth: "12%" }}
                      />
                      <span className="absolute left-3 text-[9px] font-black text-white mix-blend-difference">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-text-muted text-xs font-semibold">
              Belum ada data paket.
            </div>
          )}
        </div>

      </div>

      {/* Grid: Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Monthly Table */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1">
              <List size={13} /> RINCIAN TRANS-BULANAN
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                  <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Bulan</th>
                  <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Jumlah Pembayaran</th>
                  <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Total Nominal</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, index) => {
                  const isLastRow = index === monthlyData.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                  return (
                    <tr key={index} className="hover:bg-bg-well/30 transition-colors">
                      <td className={`${cellBorderClass} font-bold text-text-primary`}>
                        {formatMonth(item.month)}
                      </td>
                      <td className={`${cellBorderClass} font-semibold text-text-secondary`}>
                        {item.jumlah} Transaksi
                      </td>
                      <td className={`${cellBorderClass} font-bold text-text-primary`}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Table */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1">
              <List size={13} /> RINCIAN PER KELAS/PAKET
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                  <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama Paket</th>
                  <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Jumlah Terjual</th>
                  <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Total Nominal</th>
                </tr>
              </thead>
              <tbody>
                {packagesData.map((item, index) => {
                  const isLastRow = index === packagesData.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                  return (
                    <tr key={index} className="hover:bg-bg-well/30 transition-colors">
                      <td className={`${cellBorderClass} font-bold text-text-primary`}>
                        {item.name}
                      </td>
                      <td className={`${cellBorderClass} font-semibold text-text-secondary`}>
                        {item.jumlah} Transaksi
                      </td>
                      <td className={`${cellBorderClass} font-bold text-text-primary`}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
