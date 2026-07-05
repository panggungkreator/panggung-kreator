"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Users,
  Award,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BarChart3,
  UserCheck
} from "lucide-react";

interface MonthlyAttendance {
  month: string;
  total: number;
}

interface MemberAttendance {
  name: string;
  hadir: number;
}

interface AktivitasClientProps {
  dbMonthly: MonthlyAttendance[];
  dbMembers: MemberAttendance[];
}

export default function AktivitasClient({
  dbMonthly,
  dbMembers,
}: AktivitasClientProps) {
  const dbIsEmpty = dbMonthly.length === 0 && dbMembers.length === 0;
  const [demoMode, setDemoMode] = useState(dbIsEmpty);

  // Demo datasets
  const demoMonthly: MonthlyAttendance[] = [
    { month: "2026-01", total: 85 },
    { month: "2026-02", total: 98 },
    { month: "2026-03", total: 110 },
    { month: "2026-04", total: 125 },
    { month: "2026-05", total: 145 },
    { month: "2026-06", total: 180 }
  ];

  const demoMembers: MemberAttendance[] = [
    { name: "Bagas Adi", hadir: 12 },
    { name: "Rian Hidayat", hadir: 10 },
    { name: "Sarah Amalia", hadir: 9 },
    { name: "Dewa Putu", hadir: 8 },
    { name: "Anita Wijaya", hadir: 8 },
    { name: "Farhan Ramadhan", hadir: 7 },
    { name: "Eko Prasetyo", hadir: 6 },
    { name: "Dina Lestari", hadir: 5 },
    { name: "Yusuf Mahendra", hadir: 5 },
    { name: "Rina Melati", hadir: 4 }
  ];

  const monthlyData = useMemo(() => {
    return demoMode ? demoMonthly : dbMonthly;
  }, [demoMode, dbMonthly]);

  const membersData = useMemo(() => {
    return demoMode ? demoMembers : dbMembers;
  }, [demoMode, dbMembers]);

  const formatMonth = (monthKey: string) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  // Metrics
  const stats = useMemo(() => {
    const totalAttendances = monthlyData.reduce((sum, item) => sum + item.total, 0);
    const average = monthlyData.length > 0 ? Math.round(totalAttendances / monthlyData.length) : 0;
    return {
      totalAttendances,
      average
    };
  }, [monthlyData]);

  // Max for chart scaling
  const maxAttendance = useMemo(() => {
    if (monthlyData.length === 0) return 1;
    return Math.max(...monthlyData.map(item => item.total));
  }, [monthlyData]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ ANALYTICS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Aktivitas Kehadiran Member
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Total Absen */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Total Kehadiran Member (Absensi)</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {stats.totalAttendances.toLocaleString("id-ID")} <span className="text-xs font-semibold text-text-secondary">hadir</span>
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Rerata kehadiran member di seluruh acara terverifikasi</p>
        </div>

        {/* Card 2: Rerata Bulanan */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Rerata Kehadiran Per Bulan</span>
            <div className="p-1.5 rounded-lg bg-bg-well text-text-secondary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {stats.average.toLocaleString("id-ID")} <span className="text-xs font-semibold text-text-secondary">absen/bulan</span>
            </span>
          </div>
          <p className="text-[10px] text-text-secondary">Rasio tingkat keaktifan rata-rata per bulan</p>
        </div>

      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Column (7 cols): Monthly Attendance bar chart */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-default/45">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <span className="text-xs font-bold text-text-primary">GRAFIK TINGKAT KEHADIRAN BULANAN</span>
            </div>

            {monthlyData.length > 0 ? (
              <div className="space-y-4 py-2">
                {monthlyData.map((item, idx) => {
                  const widthPct = maxAttendance > 0 ? Math.round((item.total / maxAttendance) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-text-primary">
                        <span>{formatMonth(item.month)}</span>
                        <span className="font-bold">{item.total} Kehadiran</span>
                      </div>
                      <div className="w-full bg-bg-well h-6 rounded-full overflow-hidden flex items-center relative border border-border-default/30">
                        <div
                          className="h-full bg-[#5B67D8] rounded-full transition-all"
                          style={{ width: `${widthPct}%`, minWidth: "12%" }}
                        />
                        <span className="absolute left-3 text-[9px] font-black text-white mix-blend-difference">
                          {item.total} Hadir
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-text-muted text-xs font-semibold">
                Belum ada data kehadiran bulanan.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Top 10 Active Members table */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-bg-card border border-border-default rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                <span>TOP 10 MEMBER PALING AKTIF</span>
              </span>
            </div>

            {membersData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                      <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 text-center w-12">Peringkat</th>
                      <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama Lengkap</th>
                      <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50 text-center w-24">Jumlah Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersData.map((item, index) => {
                      const isLastRow = index === membersData.length - 1;
                      const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                      const rankBadges = [
                        "bg-amber-100 text-amber-600 border border-amber-300/30", // #1 Gold
                        "bg-zinc-100 text-zinc-500 border border-zinc-300/30",    // #2 Silver
                        "bg-amber-50 text-amber-700 border border-amber-700/10", // #3 Bronze
                      ];

                      return (
                        <tr key={index} className="hover:bg-bg-well/30 transition-colors">
                          <td className={`${cellBorderClass} text-center`}>
                            {index < 3 ? (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${rankBadges[index]}`}>
                                #{index + 1}
                              </span>
                            ) : (
                              <span className="font-bold text-text-secondary text-[11px]">#{index + 1}</span>
                            )}
                          </td>
                          <td className={`${cellBorderClass} font-bold text-text-primary`}>
                            {item.name}
                          </td>
                          <td className={`${cellBorderClass} font-bold text-[#22C55E] text-center`}>
                            {item.hadir} Sesi
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-text-muted text-xs font-semibold">
                Belum ada data member aktif.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
