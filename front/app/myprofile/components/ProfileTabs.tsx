"use client";

import React from "react";
import { LayoutDashboard, CalendarCheck, FolderKanban, Share2 } from "lucide-react";

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
    { key: "overview", label: "Ikhtisar", icon: LayoutDashboard },
    { key: "attendance", label: "Absensi Event", icon: CalendarCheck },
    { key: "portfolio", label: "Portofolio", icon: FolderKanban },
    { key: "affiliate", label: "Affiliate", icon: Share2 },
  ];

  // Tab affiliate selalu tampil agar member yang belum memiliki kode dapat mengaktifkannya di dalam tab
  const visibleTabs = allTabs;

  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-800 pb-3">
      {/* Scrollable Container with Smooth Scroll & Clean Spacing */}
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
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 rounded-none whitespace-nowrap cursor-pointer flex-shrink-0 border ${
                isActive
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-bold shadow-sm"
                  : isDisabled
                  ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/60"
                  : "bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon size={14} className={`flex-shrink-0 ${isActive ? "text-white dark:text-neutral-900" : isDisabled ? "text-amber-500" : "text-neutral-400 dark:text-neutral-500"}`} />
              <span>{tab.label}</span>
              {isDisabled && <span className="text-[10px]" title="Fitur sedang dalam pengembangan">🚧</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
