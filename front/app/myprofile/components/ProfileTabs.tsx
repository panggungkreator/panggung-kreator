"use client";

import React from "react";
import { PROFILE_NAV_ITEMS, ProfileTab, ProfileNavItem } from "@/lib/constants/profile-navigation";

export type { ProfileTab, ProfileNavItem };

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isAffiliateActive?: boolean;
  disabledTabs?: Partial<Record<ProfileTab, boolean>>;
  layoutMode?: "rail" | "sidebar" | "mobile" | "horizontal";
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  disabledTabs,
}: ProfileTabsProps) {
  const visibleTabs = PROFILE_NAV_ITEMS;

  return (
    <>
      {/* 💻 DESKTOP COMPACT VERTICAL CAPSULE DOCK (COLUMN 1) */}
      <div className="hidden lg:flex items-center justify-center">
        <nav
          aria-label="Navigasi Menu Utama"
          className="flex flex-col items-center gap-2 p-2 bg-[#1C1C1C] dark:bg-[#18181B] border border-white/10 shadow-xl rounded-[2.5rem]"
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
                disabled={isDisabled}
                title={`${tab.label} — ${tab.description}`}
                className={`group relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${isActive
                  ? "bg-white text-[#1C1C1C] shadow-md scale-105"
                  : isDisabled
                    ? "opacity-30 cursor-not-allowed text-neutral-500"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                  }`}
              >
                <Icon
                  size={18}
                  className={`transition-all duration-150 ${isActive ? "stroke-[2.2]" : "stroke-[1.6]"
                    }`}
                />

                {/* DISABLED BADGE */}
                {isDisabled && (
                  <span className="absolute top-0.5 right-0.5 text-[7px] leading-none">🚧</span>
                )}

                {/* HOVER TOOLTIP FLOATING ON RIGHT */}
                <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-white dark:bg-[#151B18] text-[#1C1C1C] dark:text-white text-xs font-sans font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-xl rounded-full border border-black/5 dark:border-white/10">
                  <span>{tab.label}</span>
                  {isDisabled && <span className="ml-1 text-amber-500 text-[9px]">(Segera)</span>}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 📱 MOBILE FLOATING BOTTOM DOCK (ERGONOMIC CAPSULE) */}
      <div className="lg:hidden fixed bottom-6 inset-x-0 z-40 pointer-events-none flex justify-center px-4">
        <nav
          aria-label="Navigasi Tab Mobile"
          className="pointer-events-auto bg-[#1C1C1C] dark:bg-[#18181B] border border-white/10 shadow-2xl rounded-full px-3.5 py-1.5 flex items-center justify-between gap-1 w-full max-w-[270px] sm:max-w-xs text-white"
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
                disabled={isDisabled}
                aria-label={tab.label}
                title={tab.label}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer active:scale-90 flex-1 ${isActive
                  ? "h-11 bg-white text-[#1C1C1C] shadow-md px-3.5"
                  : isDisabled
                    ? "opacity-30 cursor-not-allowed h-10 text-neutral-500"
                    : "h-10 text-neutral-400 hover:text-white bg-transparent"
                  }`}
              >
                <Icon
                  size={isActive ? 19 : 20}
                  className={`transition-all duration-150 ${isActive ? "stroke-[2.2]" : "stroke-[1.6]"
                    }`}
                />
                {isDisabled && (
                  <span className="absolute top-0.5 right-0.5 text-[7px] leading-none">🚧</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
