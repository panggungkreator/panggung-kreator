"use client";

import React from "react";
import { Gift, Info, Percent, DollarSign, Sparkles } from "lucide-react";
import { ReferralCommissionSettings } from "@/lib/actions/settings-actions";

interface ReferralPanelProps {
  value: ReferralCommissionSettings;
  onChange: (value: ReferralCommissionSettings) => void;
}

export default function ReferralPanel({ value, onChange }: ReferralPanelProps) {
  const sampleAmount = 49000;

  const calculatedSampleReward = () => {
    if (value.mode === "percentage") {
      const pct = parseFloat(value.percentage) || 0;
      return Math.round((sampleAmount * pct) / 100);
    }
    return parseInt(value.flatAmount.replace(/\D/g, ""), 10) || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 border-b border-border-default/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-bg-well border border-border-default rounded-xl text-text-primary">
              <Gift size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Pengaturan Global Komisi Referral
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Konfigurasi skema reward komisi default yang diberikan ke pemilik kode referral secara sistem.
              </p>
            </div>
          </div>
        </div>

        {/* MODE SELECTION */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
            Mode Kalkulasi Reward Default
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...value, mode: "flat" })}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                value.mode === "flat"
                  ? "bg-bg-card border-text-primary shadow-xs ring-1 ring-text-primary"
                  : "bg-bg-well/50 border-border-default hover:border-text-secondary text-text-secondary"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  value.mode === "flat"
                    ? "bg-text-primary text-bg-card"
                    : "bg-bg-well text-text-secondary"
                }`}
              >
                <DollarSign size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Nominal Tetap (Flat Amount)
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  Reward dihitung dalam jumlah Rupiah pasti per pendaftaran.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...value, mode: "percentage" })}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                value.mode === "percentage"
                  ? "bg-bg-card border-text-primary shadow-xs ring-1 ring-text-primary"
                  : "bg-bg-well/50 border-border-default hover:border-text-secondary text-text-secondary"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  value.mode === "percentage"
                    ? "bg-text-primary text-bg-card"
                    : "bg-bg-well text-text-secondary"
                }`}
              >
                <Percent size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Persentase (%) dari Total Bayar
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  Reward dihitung proporsional dari harga yang dibayar member.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* CONDITIONAL INPUT FIELDS */}
        {value.mode === "flat" ? (
          <div className="space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-text-primary">
              Nominal Reward Default (Rp)
            </label>
            <div className="relative max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-text-muted">
                Rp
              </span>
              <input
                type="number"
                value={value.flatAmount}
                onChange={(e) => onChange({ ...value, flatAmount: e.target.value })}
                placeholder="10000"
                className="w-full bg-bg-well border border-border-default rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-text-primary focus:outline-none focus:border-text-primary"
              />
            </div>
            <p className="text-[11px] text-text-secondary">
              Nominal ini akan otomatis mengisi nilai reward saat admin mengonfirmasi pembayaran lunas di halaman Payment.
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-text-primary">
              Persentase Reward Default (%)
            </label>
            <div className="relative max-w-md">
              <input
                type="number"
                value={value.percentage}
                onChange={(e) => onChange({ ...value, percentage: e.target.value })}
                placeholder="10"
                step="0.1"
                min="0"
                max="100"
                className="w-full bg-bg-well border border-border-default rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-text-primary focus:outline-none focus:border-text-primary"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-text-muted">
                %
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Persentase dihitung dari tagihan akhir yang dibayarkan peserta saat checkout.
            </p>
          </div>
        )}

        {/* LIVE CALCULATION PREVIEW */}
        <div className="p-4 bg-bg-well/40 border border-border-default rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Preview Simulasi Kalkulasi
            </span>
            <span className="text-[10px] font-mono text-text-secondary">
              Sample Transaksi: {formatCurrency(sampleAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border-default/60">
            <span className="text-xs text-text-secondary">
              Est. Reward ke Pemilik Kode:
            </span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">
              {formatCurrency(calculatedSampleReward())}
            </span>
          </div>
        </div>

        {/* HIERARCHY INFORMATION */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Info size={16} />
            <span>Hierarki Prioritas Reward Referral</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-blue-600/90 dark:text-blue-400/90">
            <li>
              <strong>Override Manual Admin (Tertinggi):</strong> Ditentukan admin saat klik &apos;Konfirmasi Lunas&apos; di <code>/admin/payment</code>.
            </li>
            <li>
              <strong>Default Kode Referral:</strong> Ditentukan khusus per kode di halaman <code>/admin/referral</code>.
            </li>
            <li>
              <strong>Pengaturan Global (Terendah):</strong> Pengaturan di halaman ini sebagai acuan bawaan utama sistem.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
