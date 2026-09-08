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
    { key: "overview", label: "Dashboard", icon: LayoutDashboard },
    { key: "attendance", label: "Absensi", icon: CalendarCheck },
    { key: "portfolio", label: "Portofolio", icon: FolderKanban },
    { key: "affiliate", label: "Affiliate", icon: Share2 },
  ];

  // Tab affiliate selalu tampil agar member yang belum memiliki kode dapat mengaktifkannya di dalam tab
  const visibleTabs = allTabs;

  return (
    <>
      {/* ═══ DESKTOP TAB BAR (hidden on mobile, visible on lg) — Persis Sesuai Gambar Referensi ═══ */}
      <div className="hidden lg:block w-full">
        <div className="w-full">
          <div className="flex items-center gap-8 border-b border-neutral-200/80 dark:border-neutral-800 overflow-x-auto no-scrollbar">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const isDisabled = !!disabledTabs?.[tab.key];
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`group relative flex items-center gap-2.5 pb-3 px-1 text-sm transition-all duration-150 cursor-pointer whitespace-nowrap flex-shrink-0 ${isActive
                    ? "text-neutral-900 dark:text-white font-semibold"
                    : isDisabled
                      ? "text-amber-500/70 hover:text-amber-600 cursor-not-allowed"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                >
                  <Icon
                    size={17}
                    className={`transition-colors ${isActive
                      ? "text-neutral-900 dark:text-white stroke-[2.2]"
                      : isDisabled
                        ? "text-amber-500"
                        : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 stroke-[1.8]"
                      }`}
                  />
                  <span>{tab.label}</span>
                  {isDisabled && <span className="text-xs" title="Fitur sedang dalam pengembangan">🚧</span>}

                  {/* Active Underline Indicator sitting right on the bottom border line */}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white rounded-full transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE FLOATING PILL / FLOATING ACTION DOCK (Persis Sesuai Gambar Referensi) ═══ */}
      <div className="lg:hidden fixed bottom-2.5 left-1/2 -translate-x-1/2 z-30">
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

