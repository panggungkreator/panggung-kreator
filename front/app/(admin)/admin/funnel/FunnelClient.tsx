"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Eye,
  Sliders,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BarChart2,
  Info
} from "lucide-react";

interface FunnelClientProps {
  dbCounts: {
    free: number;
    regular: number;
    mvp: number;
  };
}

export default function FunnelClient({ dbCounts }: FunnelClientProps) {
  // Check if database has no records to automatically turn on demo mode
  const dbIsEmpty = dbCounts.free === 0 && dbCounts.regular === 0 && dbCounts.mvp === 0;
  const [demoMode, setDemoMode] = useState(dbIsEmpty);

  // Estimasi visitor manual input
  const [visitors, setVisitors] = useState(2500);

  // Demo counts dataset
  const demoCounts = {
    free: 920,
    regular: 280,
    mvp: 68
  };

  // Active counts based on toggle
  const activeCounts = useMemo(() => {
    return demoMode ? demoCounts : dbCounts;
  }, [demoMode, dbCounts]);

  // Calculations for funnel
  const funnelStages = useMemo(() => {
    const freeVal = activeCounts.free;
    const regularVal = activeCounts.regular;
    const mvpVal = activeCounts.mvp;

    const stages = [
      {
        name: "Website Visitors (Estimasi)",
        count: visitors,
        convTotal: 100,
        convStep: 100,
        colorClass: "bg-[#71717a] dark:bg-[#52525b]"
      },
      {
        name: "Free Members (Terdaftar)",
        count: freeVal,
        convTotal: visitors > 0 ? Math.round((freeVal / visitors) * 100) : 0,
        convStep: visitors > 0 ? Math.round((freeVal / visitors) * 100) : 0,
        colorClass: "bg-[#5B67D8]"
      },
      {
        name: "Regular Members (Berlangganan)",
        count: regularVal,
        convTotal: visitors > 0 ? Math.round((regularVal / visitors) * 100) : 0,
        convStep: freeVal > 0 ? Math.round((regularVal / freeVal) * 100) : 0,
        colorClass: "bg-amber-500"
      },
      {
        name: "MVP Members (VIP Tier)",
        count: mvpVal,
        convTotal: visitors > 0 ? Math.round((mvpVal / visitors) * 100) : 0,
        convStep: regularVal > 0 ? Math.round((mvpVal / regularVal) * 100) : 0,
        colorClass: "bg-[#22C55E]"
      }
    ];

    return stages;
  }, [activeCounts, visitors]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ ANALYTICS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Marketing Funnel & Konversi
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

      {/* Control panel for visitors */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
          <Sliders className="w-4 h-4 text-text-secondary" />
          <span>PARAMETER FUNNEL</span>
        </div>

        <div className="max-w-md space-y-2">
          <div className="flex justify-between text-xs font-semibold text-text-secondary">
            <span>Estimasi Pengunjung Web (Visitors)</span>
            <span className="font-bold text-text-primary">{visitors.toLocaleString("id-ID")}</span>
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={visitors}
            onChange={(e) => setVisitors(Number(e.target.value))}
            className="w-full h-1.5 bg-border-default rounded-lg appearance-none cursor-pointer accent-text-primary"
          />
          <p className="text-[10px] text-text-secondary font-medium">
            * Geser slider untuk menyesuaikan estimasi traffic pengunjung website guna menghitung persentase rasio konversi.
          </p>
        </div>
      </div>

      {/* Funnel Visualisation Charts (CSS Bar Chart style) */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-border-default/45">
          <BarChart2 className="w-4 h-4 text-text-secondary" />
          <span className="text-xs font-bold text-text-primary">VISUALISASI FUNNEL KONVERSI</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto py-4">
          {funnelStages.map((stage, idx) => {
            // Width proportion based on the count ratio to first stage (visitors)
            const widthPct = visitors > 0 ? Math.min(100, Math.round((stage.count / visitors) * 100)) : 0;
            // Visitors is always 100% width
            const barWidth = idx === 0 ? "100%" : `${widthPct}%`;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-text-primary">
                  <span className="font-extrabold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block bg-current" style={{ color: stage.colorClass.includes("bg-") ? "" : "inherit" }} />
                    {stage.name}
                  </span>
                  <span>
                    {stage.count.toLocaleString("id-ID")} <span className="text-[10px] text-text-secondary font-medium">({stage.convTotal}% dari total)</span>
                  </span>
                </div>

                <div className="w-full bg-bg-well h-8 rounded-full overflow-hidden flex items-center relative border border-border-default/40">
                  <div
                    className={`h-full ${stage.colorClass} rounded-full transition-all duration-500`}
                    style={{ width: barWidth, minWidth: stage.count > 0 ? "12%" : "0%" }}
                  />
                  {/* Overlay text inside bar */}
                  <span className="absolute left-4 text-[10px] font-black text-white mix-blend-difference">
                    {stage.count.toLocaleString("id-ID")}
                  </span>

                  {idx > 0 && (
                    <span className="absolute right-4 text-[10px] font-bold text-text-secondary bg-bg-card px-2.5 py-0.5 rounded-full border border-border-default">
                      {stage.convStep}% Konversi Step
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Boxed Table of breakdown per tier */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
          <span className="text-xs font-bold text-text-primary">
            TABEL DETAIL METRIK FUNNEL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Tahap Funnel</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Jumlah Member</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Persentase Konversi (Total)</th>
                <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Persentase Konversi (Tahap Sebelumnya)</th>
              </tr>
            </thead>
            <tbody>
              {funnelStages.map((stage, idx) => {
                const isLastRow = idx === funnelStages.length - 1;
                const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-bg-well/30 transition-colors group"
                  >
                    <td className={`${cellBorderClass} font-bold text-text-primary`}>
                      {stage.name}
                    </td>
                    <td className={`${cellBorderClass} font-bold text-text-primary`}>
                      {stage.count.toLocaleString("id-ID")}
                    </td>
                    <td className={`${cellBorderClass} font-semibold text-text-secondary`}>
                      {stage.convTotal}%
                      <span className="text-[10px] text-text-secondary block font-medium mt-0.5">dari total Visitors</span>
                    </td>
                    <td className={`${cellBorderClass} font-semibold text-text-secondary`}>
                      {stage.convStep}%
                      <span className="text-[10px] text-text-secondary block font-medium mt-0.5">
                        {idx === 0 ? "Tahap dasar" : `dari ${funnelStages[idx - 1].name.split(" (")[0]}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
