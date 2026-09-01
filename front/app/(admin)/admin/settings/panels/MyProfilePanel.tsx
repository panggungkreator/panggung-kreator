"use client";

import React from "react";
import { LayoutDashboard, CalendarCheck, FolderKanban, Share2, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TabVisibilitySettings } from "@/lib/actions/settings-actions";

interface MyProfilePanelProps {
  value: TabVisibilitySettings;
  onChange: (value: TabVisibilitySettings) => void;
}

export default function MyProfilePanel({ value, onChange }: MyProfilePanelProps) {
  const toggleTab = (key: keyof TabVisibilitySettings) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  const tabsConfig: {
    key: keyof TabVisibilitySettings;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      key: "tab_attendance_enabled",
      title: "Tab Absensi Event",
      description: "Menampilkan riwayat kehadiran event kreator di halaman profil.",
      icon: CalendarCheck,
    },
    {
      key: "tab_portfolio_enabled",
      title: "Tab Portofolio Karya",
      description: "Menampilkan manajemen karya & portofolio kreator.",
      icon: FolderKanban,
    },
    {
      key: "tab_affiliate_enabled",
      title: "Tab Program Affiliate",
      description: "Menampilkan panel komisi & link referral bagi member aktif.",
      icon: Share2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* PANEL HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-border-default/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-bg-well border border-border-default rounded-xl text-text-primary">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Pengaturan Visibilitas Tab MyProfile
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Atur fitur mana yang aktif di halaman member. Jika dinonaktifkan (OFF), tab akan menampilkan status <strong>"Under Construction"</strong> bagi member.
              </p>
            </div>
          </div>
        </div>

        {/* ALWAYS ACTIVE TAB INFO */}
        <div className="p-4 bg-bg-well/60 border border-border-default rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-text-primary/10 rounded-lg text-text-primary">
              <LayoutDashboard size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary block">
                Tab Ikhtisar (Overview)
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Tab utama profil yang menampilkan ringkasan biodata & minat member.
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Selalu Aktif
          </span>
        </div>

        {/* DYNAMIC TAB TOGGLES */}
        <div className="space-y-3 pt-2">
          {tabsConfig.map((config) => {
            const isEnabled = value[config.key];
            const Icon = config.icon;

            return (
              <div
                key={config.key}
                onClick={() => toggleTab(config.key)}
                className="p-4 bg-bg-well/60 border border-border-default rounded-xl flex items-center justify-between gap-4 hover:border-text-primary/40 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-bg-well border border-border-default rounded-lg text-text-primary shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      {config.title}
                    </span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      {config.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {isEnabled ? (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif (ON)
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Under Construction (OFF)
                    </span>
                  )}

                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleTab(config.key)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER INFO BOX */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 flex items-start gap-3">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Informasi Pengaturan Fitur</p>
            <p className="text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
              Mematikan status tab (OFF) tidak akan menghapus data yang tersimpan. Pengguna tetap dapat melihat tombol tab bertanda 🚧 yang mengarah ke tampilanUnder Construction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
