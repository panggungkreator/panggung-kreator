"use client";

import React from "react";

export type ProfileTab = "overview" | "attendance" | "portfolio" | "affiliate";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isAffiliateActive: boolean;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  isAffiliateActive,
}: ProfileTabsProps) {
  const allTabs: { key: ProfileTab; label: string }[] = [
    { key: "overview", label: "Ikhtisar" },
    { key: "attendance", label: "Absensi Event" },
    { key: "portfolio", label: "Portfolio Karya" },
    { key: "affiliate", label: "Program Affiliate" },
  ];

  const visibleTabs = isAffiliateActive
    ? allTabs
    : allTabs.filter((t) => t.key !== "affiliate");

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-px">
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              isActive
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold bg-neutral-100/50 dark:bg-neutral-900/50"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            [ {isActive ? <span className="highlight-stabilo highlight-stabilo-nav">{tab.label}</span> : tab.label} ]
          </button>
        );
      })}
    </div>
  );
}
