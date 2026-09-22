"use client";

import React from "react";
import {
  User,
  Share2,
  Briefcase,
  Sparkles,
  Award,
  Lock,
  LucideIcon,
  Backpack,
} from "lucide-react";

export type ProfileEditTabId =
  | "identitas"
  | "sosial"
  | "portofolio"
  | "keamanan";

export interface ProfileEditTabItem {
  id: ProfileEditTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const PROFILE_EDIT_TABS: ProfileEditTabItem[] = [
  {
    id: "identitas",
    label: "Informasi Pribadi",
    description: "Data diri, kontak, & foto profil",
    icon: User,
  },
  {
    id: "sosial",
    label: "Sosial Media & Tautan",
    description: "Instagram, TikTok, YouTube, dll",
    icon: Share2,
  },
  {
    id: "portofolio",
    label: "Portofolio & Rekam Jejak",
    description: "Jam terbang, karya, & prestasi",
    icon: Backpack,
  },
  {
    id: "keamanan",
    label: "Keamanan & Akun",
    description: "Ganti username & kata sandi",
    icon: Lock,
  },
];

interface EditProfileSidebarProps {
  activeTab: ProfileEditTabId;
  onTabChange: (id: ProfileEditTabId) => void;
  unsavedTabs?: Partial<Record<ProfileEditTabId, boolean>>;
  disabledTabs?: Partial<Record<ProfileEditTabId, boolean>>;
}

export default function EditProfileSidebar({
  activeTab,
  onTabChange,
  unsavedTabs = {},
  disabledTabs = {},
}: EditProfileSidebarProps) {
  return (
    <nav className="w-full space-y-1 lg:sticky lg:top-4">
      {/* Desktop Vertical Menu / Mobile Horizontal Tabs */}
      <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1.5 no-scrollbar">
        {PROFILE_EDIT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasUnsaved = unsavedTabs[tab.id];
          const isDisabled = !!disabledTabs[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all text-left shrink-0 min-w-[200px] lg:min-w-0 lg:w-full border ${
                isDisabled
                  ? "opacity-40 cursor-not-allowed bg-transparent border-transparent text-text-muted select-none"
                  : isActive
                  ? "bg-bg-card border-border-default shadow-xs text-text-primary font-bold cursor-pointer"
                  : "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-well/60 cursor-pointer"
              }`}
              title={isDisabled ? `${tab.label} (Dinonaktifkan)` : tab.label}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isDisabled
                      ? "bg-bg-well/50 text-text-muted"
                      : isActive
                      ? "bg-text-primary text-bg-card"
                      : "bg-bg-well text-text-secondary"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold leading-none flex items-center gap-2">
                    <span>{tab.label}</span>
                    {isDisabled && (
                      <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-bg-well text-text-muted border border-border-default">
                        Nonaktif
                      </span>
                    )}
                    {hasUnsaved && !isDisabled && (
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
