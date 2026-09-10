import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6 shadow-lg shadow-red-500/5">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-red-500/80 mb-2">
        [ AKSES DITOLAK ]
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mb-3">
        Anda Tidak Memiliki Izin
      </h1>

      <p className="text-xs sm:text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
        Akun admin Anda belum diberikan izin hak akses (permission) untuk membuka halaman atau fitur ini.
        Silakan hubungi Super Admin jika Anda memerlukan akses ke halaman ini.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-text-primary text-bg-card font-semibold text-xs hover:opacity-90 transition-opacity"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <Link
          href="/myprofile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-well border border-border-default text-text-primary font-semibold text-xs hover:bg-bg-card transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ke Halaman Member</span>
        </Link>
      </div>
    </div>
  );
}
