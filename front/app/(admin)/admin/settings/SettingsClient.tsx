"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Server,
  ShieldCheck,
  Bell,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft
} from "lucide-react";
import {
  getAttendanceEmailSettingAction,
  saveAttendanceEmailSettingAction,
} from "@/lib/actions/settings-actions";
import { Switch } from "@/components/ui/switch";

export default function SettingsClient() {
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const enabled = await getAttendanceEmailSettingAction();
        setIsEmailEnabled(enabled);
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await saveAttendanceEmailSettingAction(isEmailEnabled);
      if (res.success) {
        // Re-verify latest value from DB
        const latestVal = await getAttendanceEmailSettingAction();
        setIsEmailEnabled(latestVal);

        toast.success(
          latestVal
            ? "Pengaturan tersimpan ke Supabase: Pengiriman email absensi telah DIAKTIFKAN."
            : "Pengaturan tersimpan ke Supabase: Pengiriman email absensi telah DINONAKTIFKAN."
        );
      } else {
        toast.error(res.error || "Gagal menyimpan pengaturan ke Supabase.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Terjadi kesalahan sistem saat menghubungi database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans text-text-primary">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Dashboard Admin"
          >
            <ArrowLeft size={14} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">
                [ SYSTEM CONFIGURATION ]
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase mt-1">
              Pengaturan Sistem & Notifikasi
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Pengaturan Sistem
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving || isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-text-primary text-bg-card hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-text-primary" />
          <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">
            Memuat Pengaturan Sistem...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN SETTINGS CARD */}
          <div className="lg:col-span-8 space-y-6">
            {/* EMAIL ATTENDANCE TOGGLE CARD */}
            <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border-default/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-bg-page border border-border-default rounded-xl text-text-primary">
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
                  {isEmailEnabled ? (
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
                onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                className="p-4 bg-bg-page border border-border-default rounded-xl flex items-center justify-between gap-4 hover:border-text-primary/40 transition-all cursor-pointer select-none"
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

                {/* SWITCH VISUAL TOGGLE */}
                <Switch
                  checked={isEmailEnabled}
                  onCheckedChange={setIsEmailEnabled}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* DYNAMIC PREVIEW & NOTIFICATION INFORMATION SECTION */}
              {/* <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-text-primary uppercase flex items-center gap-2">
                    Informasi & Preview Notifikasi Email
                  </span>
                  <span className="text-[10px] font-mono text-text-muted uppercase">
                    {isEmailEnabled ? "Status: Dynamic Preview Tampil" : "Status: Disabled Warning"}
                  </span>
                </div>

                {isEmailEnabled ? (
                  <div className="bg-bg-page border border-border-default rounded-xl p-5 space-y-4 animate-fade-in">
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

                    <div className="bg-white text-neutral-900 p-5 rounded-lg border border-neutral-200 space-y-4 text-xs font-sans shadow-inner">
                      <div className="border-b-2 border-[#ffe78a] pb-2">
                        <h3 className="text-sm font-bold text-neutral-900">
                          Konfirmasi Kehadiran Acara 🎟️
                        </h3>
                      </div>

                      <p className="leading-relaxed">
                        Halo <strong>Bagas Teguh</strong>,
                      </p>
                      <p className="leading-relaxed text-neutral-600">
                        Terima kasih telah hadir di acara komunitas Panggung Kreator. Presensi Anda telah berhasil dicatat oleh sistem.
                      </p>

                      <div className="bg-neutral-50 border-l-4 border-neutral-900 p-3 space-y-1 text-xs">
                        <p className="font-bold text-neutral-900">Workshop Kreator Bandung 2026</p>
                        <p className="text-neutral-600 flex items-center gap-1.5 pt-1">
                          <Calendar size={12} /> Minggu, 16 Agustus 2026
                        </p>
                        <p className="text-neutral-600 flex items-center gap-1.5">
                          <Clock size={12} /> 10:00 - 13:00 WIB
                        </p>
                        <p className="text-neutral-600 flex items-center gap-1.5">
                          <MapPin size={12} /> Kafe Komunitas Bandung
                        </p>
                      </div>

                      <p className="text-[10px] text-neutral-400 text-center font-mono pt-2 border-t border-neutral-100">
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
              </div> */}
            </div>
          </div>

          {/* SIDEBAR SYSTEM INFO & ACTIONS */}
          <div className="lg:col-span-4 space-y-6">
            {/* SMTP STATUS CARD */}
            <div className="bg-bg-card border border-border-default rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border-default/60 pb-3">
                <Server size={16} className="text-text-secondary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Status Server SMTP
                </h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                  <span className="text-text-secondary">SMTP Host:</span>
                  <span className="text-text-primary font-bold">smtp.gmail.com</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                  <span className="text-text-secondary">Port SSL:</span>
                  <span className="text-text-primary font-bold">465 / 587</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-secondary">Email Pengirim:</span>
                  <span className="text-text-primary font-bold truncate max-w-[130px]" title="noreply@panggungkreator.id">
                    noreply@...
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK INFORMATION CARD */}
            <div className="bg-bg-card border border-border-default rounded-2xl p-6 space-y-3 shadow-sm text-xs">
              <div className="flex items-center gap-2 text-text-primary font-bold uppercase tracking-wider">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Keamanan System</span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                Perubahan pada halaman ini disimpan secara global dan langsung berdampak pada alur absensi QR Code di seluruh acara aktif.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
