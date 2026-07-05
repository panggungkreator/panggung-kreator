"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Search,
  Upload,
  Download,
  MoreHorizontal,
  ChevronDown,
  Calendar
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardClientProps {
  stats: {
    totalMembers: number;
    paidMembers: number;
    monthTxCount: number;
    monthRevenue: number;
  };
  chartData: Array<{ name: string; value: number }>;
  recentEvents: Array<{
    title: string;
    event_date: string;
    event_type: string;
  }>;
  recentTx: Array<{
    final_amount: number;
    status: string;
    created_at: string;
    members: { full_name: string } | null;
    packages: { name: string } | null;
  }>;
  newMembers: Array<{
    full_name: string;
    email: string;
    membership_tier: string;
    created_at: string;
  }>;
}

export default function DashboardClient({
  stats,
  chartData,
  recentEvents,
  recentTx,
  newMembers
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Generate double bar data with mock profits (45% of revenue) for Ecomora double bar style
  const barChartData = chartData.map(item => ({
    ...item,
    profit: Math.round(item.value * 0.45)
  }));

  // Pie chart data for member distribution
  const pieData = [
    { name: "Premium", value: stats.paidMembers },
    { name: "Free", value: Math.max(0, stats.totalMembers - stats.paidMembers) }
  ];

  return (
    <div className="space-y-8">

      {/* Top Header Row (Dashboard Title, Search, Action Buttons - ENLARGED) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 pb-5 border-b border-border-default">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Dashboard
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search Bar (Enlarged) */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search product..."
              className="bg-bg-well border border-grey-100 rounded-full py-4 pl-10 pr-4 text-sm w-full sm:w-[280px] text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>
          {/* Action Buttons (Enlarged) */}
          <div className="flex gap-3">
            <button className="border border-border-default bg-[#d4f6ac] rounded-full px-6 py-4 text-xs font-bold flex items-center justify-center gap-2 text-black transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Export CSV
            </button>
            <button className="border border-border-default rounded-full bg-[#bc151b] px-6 py-4 text-xs font-bold flex items-center justify-center gap-2 text-white transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Top Grid Area (Stats cards, Bar Chart, Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Stat Cards stacked (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Card 1: Total Members (Enlarged) */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-6 flex flex-col justify-between min-h-[170px] relative">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                Total Products Sales
              </span>
              <div className="p-2 rounded-lg bg-bg-well text-text-secondary">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3 flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary leading-none">
                {stats.totalMembers.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-bold text-[#2D5A00] px-2 py-0.5 rounded-full bg-accent-green">
                +10%
              </span>
            </div>
            <div className="border-t border-border-default pt-4 mt-2 flex justify-between items-center">
              <Link
                href="/admin/members"
                className="text-sm font-bold text-text-primary hover:underline flex items-center gap-1.5"
              >
                View Sales Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Volume of Products / Month Transactions (Enlarged) */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-6 flex flex-col justify-between min-h-[170px] relative">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                Total Volume Of Products
              </span>
              <div className="p-2 rounded-lg bg-bg-well text-text-secondary">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3 flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary leading-none">
                {stats.monthTxCount.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-bold text-[#E05C5C] px-2 py-0.5 rounded-full bg-accent-red/15">
                -12%
              </span>
            </div>
            <div className="border-t border-border-default pt-4 mt-2 flex justify-between items-center">
              <Link
                href="/admin/transactions"
                className="text-sm font-bold text-text-primary hover:underline flex items-center gap-1.5"
              >
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Middle: Double Bar Chart Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-bg-card border border-border-default rounded-[20px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                  Total Products Sales
                </span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="text-3xl font-black text-text-primary leading-none">
                    {formatCurrency(stats.monthRevenue)}
                  </span>
                  <span className="text-xs font-bold text-[#2D5A00] px-2 py-0.5 rounded-full bg-accent-green">
                    +45%
                  </span>
                </div>
              </div>
              <button className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Legends */}
            <div className="flex items-center gap-5 mb-5 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-text-primary" />
                <span className="text-text-secondary">Total Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-text-muted border border-text-muted/30" />
                <span className="text-text-secondary">Total Profit</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="w-full h-48">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="2.5" className="text-text-muted/40" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: "var(--text-secondary)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: "var(--text-secondary)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 10
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), "Nilai"]}
                  />
                  <Bar dataKey="value" fill="var(--text-primary)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                  <Bar dataKey="profit" fill="url(#diagonalHatch)" stroke="var(--text-muted)" strokeWidth={0.5} radius={[4, 4, 0, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-bg-well rounded-md animate-pulse flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">MEMUAT GRAFIK...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Donut Chart Card (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-bg-card border border-border-default rounded-[20px] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Total Sales Statistics
            </span>
            <button className="border border-border-default rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1 hover:bg-bg-well text-text-primary transition-colors cursor-pointer">
              Monthly <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-5 my-3">
            {/* Donut Chart with Center Text */}
            <div className="w-36 h-36 relative shrink-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="var(--text-primary)" />
                      <Cell fill="var(--border-default)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-8 border-border-default animate-pulse" />
              )}
              {/* Absolute Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-text-primary">
                  {stats.totalMembers}
                </span>
                <span className="text-[9px] font-bold text-[#2D5A00] px-2 py-0.5 rounded-full bg-accent-green leading-none mt-0.5">
                  +45%
                </span>
              </div>
            </div>

            {/* Side Legends */}
            <div className="flex-1 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border-default/45 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-text-primary" />
                  <span className="text-text-secondary font-medium">Premium</span>
                </div>
                <span className="font-bold text-text-primary">{stats.paidMembers.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border-default/45 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-border-default" />
                  <span className="text-text-secondary font-medium">Free</span>
                </div>
                <span className="font-bold text-text-primary">{Math.max(0, stats.totalMembers - stats.paidMembers).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border-default pt-4 mt-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Total Number of Sales
            </span>
            <span className="text-2xl font-black text-text-primary mt-1 block leading-none">
              {stats.totalMembers.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Grid Area (Recent Orders Table, Top Selling Products Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Recent Orders Table (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-bg-card border border-border-default rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Recant Orders
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Keep track of recent order data and others information.
                </p>
              </div>
              <Link
                href="/admin/transactions"
                className="border border-border-default rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1 hover:bg-bg-well text-text-primary transition-colors cursor-pointer"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentTx.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-default bg-[#F9FAFB]/30">
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary">Order Id</th>
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary">Product Name</th>
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary">Date</th>
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary">Payment</th>
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary">Amount</th>
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary">Status</th>
                      <th className="text-xs font-bold uppercase tracking-wider pb-3.5 pt-2 text-text-secondary text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.map((tx, idx) => (
                      <tr key={idx} className="border-b border-border-default/20 last:border-0 hover:bg-[#F8F9FA]/40 transition-colors">
                        <td className="py-4 text-sm font-bold text-text-primary">
                          #{idx + 202520}
                        </td>
                        <td className="py-4 text-sm font-bold text-text-primary">
                          {tx.members?.full_name || "MEMBER TERHAPUS"}
                          <span className="block text-[11px] font-semibold text-text-secondary mt-1 uppercase tracking-wider">
                            {tx.packages?.name || "TIDAK DIKETAHUI"}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-text-secondary font-medium">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="py-4 text-sm text-text-secondary font-medium">
                          Mastercard
                        </td>
                        <td className="py-4 text-sm font-bold text-text-primary">
                          {formatCurrency(tx.final_amount)}
                        </td>
                        <td className="py-4">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${tx.status === "paid"
                            ? "bg-[#EDFFF4] text-[#22C55E]"
                            : tx.status === "pending"
                              ? "bg-[#EEF0FF] text-[#5B67D8]"
                              : "bg-[#FFF4EE] text-[#F97316]"
                            }`}>
                            {tx.status === "paid" ? "Complete" : tx.status === "pending" ? "In Progress" : "Waiting"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                            <MoreHorizontal className="w-5 h-5 inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm font-bold text-text-muted py-10 text-center uppercase tracking-wide">
                Belum ada transaksi tercatat
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Top Selling Products / Upcoming Events (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-bg-card border border-border-default rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Top Selling Products
              </span>
              <button className="border border-border-default rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1 hover:bg-bg-well text-text-primary transition-colors cursor-pointer">
                Monthly <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.slice(0, 2).map((evt, idx) => (
                  <div key={idx} className="flex gap-3 border border-border-default/45 p-4 rounded-xl hover:bg-[#F8F9FA]/40 transition-colors">
                    <div className="w-11 h-11 rounded-lg bg-bg-well text-text-secondary flex items-center justify-center shrink-0">
                      <Calendar className="w-5.5 h-5.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text-primary truncate uppercase tracking-wider">{evt.title}</p>
                      <p className="text-xs text-text-secondary truncate mt-1 font-semibold">{evt.event_type} • {formatDate(evt.event_date)}</p>
                    </div>
                  </div>
                ))}

                {/* Mini Bar Chart underneath to simulate Ecomora dashboard stats */}
                <div className="border-t border-border-default pt-5 mt-3">
                  <div className="flex items-end justify-between gap-3 h-16 px-2">
                    <div className="flex flex-col items-center flex-1 gap-1.5">
                      <div className="w-full bg-bg-well h-12 rounded-sm relative">
                        <div className="absolute bottom-0 left-0 right-0 bg-text-primary h-[35%] rounded-sm" />
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Tue</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 gap-1.5">
                      <div className="w-full bg-bg-well h-12 rounded-sm relative">
                        <div className="absolute bottom-0 left-0 right-0 bg-text-primary h-[65%] rounded-sm" />
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Wed</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 gap-1.5">
                      <div className="w-full bg-bg-well h-12 rounded-sm relative">
                        <div className="absolute bottom-0 left-0 right-0 bg-text-primary h-[85%] rounded-sm" />
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Thu</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 gap-1.5">
                      <div className="w-full bg-bg-well h-12 rounded-sm relative">
                        <div className="absolute bottom-0 left-0 right-0 bg-text-primary h-[45%] rounded-sm" />
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Fri</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-sm font-bold text-text-muted py-10 text-center uppercase tracking-wide">
                Belum ada jadwal acara
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
