"use client";

import React from "react";
import { Server, ShieldCheck, Info, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function GeneralPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-border-default/60 pb-4">
          <h2 className="text-base font-bold text-text-primary">
            Ringkasan Sistem & Integrasi
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Informasi umum mengenai konfigurasi server dan lingkungan aplikasi Panggung Kreator.
          </p>
        </div>

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

          {/* SECURITY STATUS CARD */}
          <div className="bg-bg-well/50 border border-border-default rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border-default/60 pb-2.5 text-text-primary">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Keamanan & Database
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                <span className="text-text-secondary font-medium">Database:</span>
                <span className="text-text-primary font-bold font-mono">Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                <span className="text-text-secondary font-medium">Autentikasi:</span>
                <span className="text-text-primary font-bold font-mono">Supabase Auth (RLS)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary font-medium">Versi Platform:</span>
                <span className="text-text-primary font-bold font-mono">v2.4.0-release</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 flex items-start gap-3">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Informasi Pengaturan Admin</p>
            <p className="text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
              Gunakan menu tab di sebelah kiri untuk mengatur fitur khusus seperti pengiriman notifikasi email absensi QR Code atau skema komisi referral global.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
