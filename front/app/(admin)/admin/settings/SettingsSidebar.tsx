"use client";

import React from "react";
import { Settings2, QrCode, Gift, LayoutDashboard, LucideIcon } from "lucide-react";

export type TabId = "general" | "absensi" | "referral" | "myprofile";

export interface TabItem {
  id: TabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const SETTINGS_TABS: TabItem[] = [
  {
    id: "general",
    label: "General Settings",
    description: "Informasi & konfigurasi sistem",
    icon: Settings2,
  },
  {
    id: "absensi",
    label: "Absensi QR Code",
    description: "Email konfirmasi presensi",
    icon: QrCode,
  },
  {
    id: "referral",
    label: "Referral Code",
    description: "Pengaturan komisi & reward global",
    icon: Gift,
  },
  {
    id: "myprofile",
    label: "Fitur MyProfile",
    description: "Toggle visibilitas tab member",
    icon: LayoutDashboard,
  },
];

interface SettingsSidebarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  unsavedTabs: Record<TabId, boolean>;
}

export default function SettingsSidebar({
  activeTab,
  onTabChange,
  unsavedTabs,
}: SettingsSidebarProps) {
  return (
    <nav className="w-full space-y-1 lg:sticky lg:top-4">
      {/* Desktop Vertical Menu / Mobile Horizontal Tabs */}
      <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1.5 no-scrollbar">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasUnsaved = unsavedTabs[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all text-left cursor-pointer shrink-0 min-w-[200px] lg:min-w-0 lg:w-full border ${
                isActive
                  ? "bg-bg-card border-border-default shadow-xs text-text-primary font-bold"
                  : "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-well/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-text-primary text-bg-card"
                      : "bg-bg-well text-text-secondary"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold leading-none flex items-center gap-2">
                    <span>{tab.label}</span>
                    {hasUnsaved && (
                      <span
                        className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                        title="Ada perubahan belum disimpan"
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-text-secondary block mt-1 font-normal">
                    {tab.description}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
