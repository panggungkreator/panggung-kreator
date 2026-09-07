"use client";

import React from "react";
import { LayoutDashboard, CalendarCheck, FolderKanban, Share2, Home } from "lucide-react";

export type ProfileTab = "overview" | "attendance" | "portfolio" | "affiliate";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isAffiliateActive: boolean;
  disabledTabs?: Partial<Record<ProfileTab, boolean>>;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  isAffiliateActive,
  disabledTabs,
}: ProfileTabsProps) {
  const allTabs: { key: ProfileTab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Ikhtisar", icon: Home },
    { key: "attendance", label: "Absensi", icon: CalendarCheck },
    { key: "portfolio", label: "Portofolio", icon: FolderKanban },
    { key: "affiliate", label: "Affiliate", icon: Share2 },
  ];

  // Tab affiliate selalu tampil agar member yang belum memiliki kode dapat mengaktifkannya di dalam tab
  const visibleTabs = allTabs;

  return (
    <>
      {/* ═══ DESKTOP TAB BAR (hidden on mobile, visible on lg) ═══ */}
      <div className="hidden lg:block w-full border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled = !!disabledTabs?.[tab.key];
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 rounded-none whitespace-nowrap cursor-pointer flex-shrink-0 border ${isActive
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-bold shadow-sm"
                  : isDisabled
                    ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/60"
                    : "bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-white"
                  }`}
              >
                <Icon size={11} className={`flex-shrink-0 ${isActive ? "text-white dark:text-neutral-900" : isDisabled ? "text-amber-500" : "text-neutral-400 dark:text-neutral-500"}`} />
                <span>{tab.label}</span>
                {isDisabled && <span className="text-[10px]" title="Fitur sedang dalam pengembangan">🚧</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ MOBILE FLOATING PILL / FLOATING ACTION DOCK (Persis Sesuai Gambar Referensi) ═══ */}
      <div className="lg:hidden fixed bottom-2.5 left-1/2 -translate-x-1/2 z-50">
        <nav
          aria-label="Navigasi Tab Profil"
          className="flex items-center gap-1.5 p-1.5 bg-black/90 dark:bg-neutral-950/95 backdrop-blur-md rounded-full border border-neutral-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled = !!disabledTabs?.[tab.key];
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                aria-label={tab.label}
                title={tab.label}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${isActive
                  ? "bg-white text-neutral-950 shadow-md scale-105"
                  : "text-neutral-400 hover:text-white bg-transparent"
                  } ${isDisabled ? "opacity-60" : ""}`}
              >
                <Icon
                  size={14}
                  className={`transition-all duration-150 ${isActive ? "stroke-[2.4]" : "stroke-[1.8]"
                    }`}
                />
                {isDisabled && (
                  <span className="absolute -top-1 -right-1 text-[8px] leading-none">🚧</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

