"use client";

import React from "react";
import { Server, ShieldCheck, Info, Sliders, Database, Check } from "lucide-react";

interface GeneralPanelProps {
  paginationLimit: number;
  onChangePaginationLimit: (limit: number) => void;
}

const PRESET_LIMITS = [5, 10, 15, 20, 25, 50];

export default function GeneralPanel({
  paginationLimit,
  onChangePaginationLimit,
}: GeneralPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-border-default/60 pb-4">
          <h2 className="text-base font-bold text-text-primary">
            Pengaturan Umum & Sistem
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Konfigurasi preferensi global untuk seluruh modul dashboard CMS admin.
          </p>
        </div>

        {/* ═══ PAGINATION LIMIT SETTING CARD ═══ */}
        <div className="bg-bg-well/50 border border-border-default rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-border-default/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-text-primary text-bg-card">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider">
                  Limit Data per Halaman (Pagination Limit)
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Menentukan jumlah maksimal data yang ditampilkan per halaman pada seluruh modul admin (Members, Packages, dll.).
                </p>
              </div>
            </div>

            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-text-primary text-bg-card shadow-2xs">
              {paginationLimit} / hal
            </span>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold text-text-secondary">
              Pilihan Cepat Limit per Halaman:
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_LIMITS.map((preset) => {
                const isActive = paginationLimit === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChangePaginationLimit(preset)}
                    className={`h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isActive
                        ? "bg-text-primary text-bg-card shadow-xs scale-105"
                        : "bg-bg-card border border-border-default text-text-secondary hover:text-text-primary hover:border-text-primary/40"
                    }`}
                  >
                    {isActive && <Check size={13} className="stroke-[3]" />}
                    <span>{preset} data</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <span className="text-[11px] text-text-muted font-medium">
                Atau masukkan angka manual:
              </span>
              <input
                type="number"
                min={1}
                max={100}
                value={paginationLimit || 10}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    onChangePaginationLimit(val);
                  }
                }}
                className="w-20 h-9 px-3 bg-bg-card border border-border-default rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:border-text-primary transition-all text-center"
              />
              <span className="text-[11px] text-text-muted">data / halaman (1–100)</span>
            </div>
          </div>
        </div>

        {/* ═══ SYSTEM & INTEGRATION SUMMARY ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SMTP STATUS CARD */}
          <div className="bg-bg-well/50 border border-border-default rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border-default/60 pb-2.5">
              <Server size={16} className="text-text-secondary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Server Notifikasi Email (SMTP)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                <span className="text-text-secondary font-sans font-medium">SMTP Host:</span>
                <span className="text-text-primary font-bold">smtp.gmail.com</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                <span className="text-text-secondary font-sans font-medium">Port:</span>
                <span className="text-text-primary font-bold">587 / 465</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary font-sans font-medium">Pengirim:</span>
                <span className="text-text-primary font-bold truncate max-w-[140px]" title="noreply@panggungkreator.id">
                  noreply@...
                </span>
              </div>
            </div>
          </div>

          {/* DUAL DATABASE STATUS CARD */}
          <div className="bg-bg-well/50 border border-border-default rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border-default/60 pb-2.5 text-text-primary">
              <Database size={16} className="text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Sinkronisasi Database Ganda
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                <span className="text-text-secondary font-medium">Development ID:</span>
                <span className="text-text-primary font-bold font-mono text-[11px]">zpcsqidgedvuaqgrklgp</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                <span className="text-text-secondary font-medium">Production ID:</span>
                <span className="text-text-primary font-bold font-mono text-[11px]">wmuzvefmrbgffftkpdnx</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary font-medium">Status Sinkronisasi:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Dual-Sync Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 flex items-start gap-3">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Standar Sinkronisasi & Pagination</p>
            <p className="text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
              Perubahan pada pengaturan ini otomatis disinkronkan ke kedua database Supabase (Development & Production). Nilai limit di atas menjadi rujukan tampilan pagination di halaman Admin Members dan Packages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

