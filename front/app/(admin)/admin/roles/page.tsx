import React from "react";
import { Shield, Info } from "lucide-react";

export default function RolesPermissionsPage() {
  const permissions = [
    { module: "Dashboard", super: "✅", akademi: "✅", komunitas: "✅" },
    { module: "Members (Database Member)", super: "✅ Akses Penuh", akademi: "👁 Hanya Lihat", komunitas: "👁 Hanya Lihat" },
    { module: "Transactions (Data Center)", super: "✅", akademi: "✅", komunitas: "❌" },
    { module: "Attendance (Data Center)", super: "✅", akademi: "❌", komunitas: "✅" },
    { module: "Packages (Manajemen Paket)", super: "✅", akademi: "✅", komunitas: "❌" },
    { module: "Voucher (Manajemen Voucher)", super: "✅", akademi: "✅", komunitas: "❌" },
    { module: "Payment (Validasi Pembayaran)", super: "✅", akademi: "✅", komunitas: "❌" },
    { module: "Mentoring (Jadwal Pendampingan)", super: "✅", akademi: "✅", komunitas: "❌" },
    { module: "Resources (Materi Akademi)", super: "✅", akademi: "✅", komunitas: "❌" },
    { module: "Acara & Absensi (Komunitas)", super: "✅", akademi: "❌", komunitas: "✅" },
    { module: "Venue & Partner (Komunitas)", super: "✅", akademi: "❌", komunitas: "✅" },
    { module: "CMS Landing Page", super: "✅ Akses Penuh", akademi: "📝 Akademi saja", komunitas: "📝 Komunitas saja" },
    { module: "Analytics Reports", super: "✅", akademi: "👁 Analisis Akademi", komunitas: "👁 Analisis Komunitas" },
    { module: "System Settings & Logs", super: "✅", akademi: "❌", komunitas: "❌" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ SYSTEM ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Matriks Peran & Hak Akses (Permissions)
          </h1>
        </div>
      </div>

      {/* Info Warning Alert */}
      <div className="bg-bg-well border border-border-default rounded-2xl p-5 flex gap-3 text-xs font-medium text-text-secondary leading-relaxed">
        <Info className="w-5 h-5 text-text-secondary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-text-primary">Dokumentasi Matriks Referensi Sistem</p>
          <p className="mt-1">
            Halaman ini menampilkan dokumentasi acuan hak akses untuk masing-masing peran admin di lingkungan Panggung Kreator. Pembagian hak akses diklasifikasikan secara statis sesuai kebijakan keamanan sistem yang berlaku saat ini.
          </p>
        </div>
      </div>

      {/* Grid Boxed Table of Permissions */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
          <span className="text-xs font-bold text-text-primary">
            TABEL ACUAN PERMISSION HAK AKSES PERAN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Modul Fitur</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Super Admin</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Admin Akademi</th>
                <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50">Admin Komunitas</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, index) => {
                const isLastRow = index === permissions.length - 1;
                const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                return (
                  <tr 
                    key={index} 
                    className="hover:bg-bg-well/30 transition-colors group"
                  >
                    <td className={`${cellBorderClass} font-bold text-text-primary`}>
                      {p.module}
                    </td>
                    <td className={`${cellBorderClass} font-semibold text-text-primary`}>
                      <span className={p.super.includes("❌") ? "text-text-muted" : ""}>
                        {p.super}
                      </span>
                    </td>
                    <td className={`${cellBorderClass} font-semibold text-text-primary`}>
                      <span className={p.akademi.includes("❌") ? "text-text-muted font-normal" : ""}>
                        {p.akademi}
                      </span>
                    </td>
                    <td className={`${cellBorderClass} font-semibold text-text-primary`}>
                      <span className={p.komunitas.includes("❌") ? "text-text-muted font-normal" : ""}>
                        {p.komunitas}
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
