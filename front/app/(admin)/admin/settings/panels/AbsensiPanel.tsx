"use client";

import React from "react";
import { Mail, Calendar, Clock, MapPin, Info, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AbsensiPanelProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function AbsensiPanel({ value, onChange }: AbsensiPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 border-b border-border-default/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-bg-well border border-border-default rounded-xl text-text-primary">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Email Konfirmasi Absensi QR Code
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Kirim email bukti kehadiran secara otomatis saat peserta melakukan scan QR acara.
              </p>
            </div>
          </div>

          {/* STATUS BADGE */}
          <div className="shrink-0">
            {value ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Non-Aktif
              </span>
            )}
          </div>
        </div>

        {/* CHECKBOX & SWITCH TOGGLE CONTROL */}
        <div
          onClick={() => onChange(!value)}
          className="p-4 bg-bg-well/60 border border-border-default rounded-xl flex items-center justify-between gap-4 hover:border-text-primary/40 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center gap-3 flex-1">
            <div>
              <span className="text-xs font-bold text-text-primary block">
                Aktifkan Pengiriman Email Absensi
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Centang atau geser sakelar untuk mengaktifkan notifikasi email otomatis kepada peserta acara.
              </span>
            </div>
          </div>

          <Switch
            checked={value}
            onCheckedChange={onChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* DYNAMIC PREVIEW & INFORMATION */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-text-primary uppercase flex items-center gap-2">
              Informasi & Preview Notifikasi Email
            </span>
            <span className="text-[10px] font-mono text-text-muted uppercase">
              {value ? "Status: Preview Real-time" : "Status: Non-aktif"}
            </span>
          </div>

          {value ? (
            <div className="bg-bg-well/40 border border-border-default rounded-xl p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border-default/80 pb-3 text-xs font-mono">
                <div className="space-y-1">
                  <p className="text-text-secondary">
                    <strong className="text-text-primary">Pengirim:</strong> Panggung Kreator &lt;noreply@panggungkreator.id&gt;
                  </p>
                  <p className="text-text-secondary">
                    <strong className="text-text-primary">Subjek:</strong> Konfirmasi Kehadiran: Workshop Kreator 2026
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold rounded">
                  PREVIEW REAL-TIME
                </span>
              </div>

              <div className="text-text-primary p-5 rounded-lg border border-neutral-200 space-y-4 text-xs font-sans shadow-inner">
                <div className="border-b-2 border-[#ffe78a] pb-2">
                  <h3 className="text-sm font-bold text-text-primary">
                    Konfirmasi Kehadiran Acara 🎟️
                  </h3>
                </div>

                <p className="leading-relaxed">
                  Halo <strong>Peserta Panggung Kreator</strong>,
                </p>
                <p className="leading-relaxed text-text-primary">
                  Terima kasih telah hadir di acara komunitas Panggung Kreator. Presensi Anda telah berhasil dicatat oleh sistem.
                </p>

                <div className="p-3 space-y-1 text-xs">
                  <p className="font-bold text-text-primary">Workshop Kreator Bandung 2026</p>
                  <p className="text-text-primary flex items-center gap-1.5 pt-1">
                    <Calendar size={12} /> Minggu, 16 Agustus 2026
                  </p>
                  <p className="text-text-primary flex items-center gap-1.5">
                    <Clock size={12} /> 10:00 - 13:00 WIB
                  </p>
                  <p className="text-text-primary flex items-center gap-1.5">
                    <MapPin size={12} /> Kafe Komunitas Bandung
                  </p>
                </div>

                <p className="text-[10px] text-text-secondary text-center font-mono pt-2 border-t border-neutral-100">
                  PANGGUNG KREATOR · BANDUNG
                </p>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2.5">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  Setiap peserta yang melakukan klaim presensi via QR Code akan langsung menerima email konfirmasi di atas.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-3 animate-fade-in text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} />
                <span>Pengiriman Email Absensi Non-Aktif</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Dengan menonaktifkan pengaturan ini, sistem <strong>TIDAK AKAN</strong> mengirimkan email konfirmasi presensi kepada peserta setelah scan QR Code. Data kehadiran peserta tetap akan tercatat di database, namun notifikasi email akan dilewati.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
