"use client";

import React from "react";
import {
  User,
  Share2,
  Backpack,
  Lock,
  LucideIcon,
} from "lucide-react";

export type ProfileEditTabId =
  | "identitas"
  | "sosial"
  | "portofolio"
  | "keamanan";

export interface ProfileEditTabItem {
  id: ProfileEditTabId;
  label: string;
  mobileLabel?: string;
  description: string;
  icon: LucideIcon;
}

export const PROFILE_EDIT_TABS: ProfileEditTabItem[] = [
  {
    id: "identitas",
    label: "Informasi Pribadi",
    mobileLabel: "Identitas",
    description: "Data diri, kontak, & foto profil",
    icon: User,
  },
  {
    id: "sosial",
    label: "Sosial Media & Tautan",
    mobileLabel: "Sosmed",
    description: "Instagram, TikTok, YouTube, dll",
    icon: Share2,
  },
  {
    id: "portofolio",
    label: "Portofolio & Rekam Jejak",
    mobileLabel: "Portofolio",
    description: "Jam terbang, karya, & prestasi",
    icon: Backpack,
  },
  {
    id: "keamanan",
    label: "Keamanan & Akun",
    mobileLabel: "Keamanan",
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
    <nav className="w-full lg:sticky lg:top-6" aria-label="Navigasi Pengaturan Profil">
      {/* 📱 MOBILE FLOATING BOTTOM DOCK (MATCHING ProfileTabs.tsx L83-L107) */}
      <div className="lg:hidden fixed bottom-6 inset-x-0 z-40 pointer-events-none flex justify-center px-4">
        <nav
          aria-label="Navigasi Tab Pengaturan"
          className="pointer-events-auto bg-[#1C1C1C] dark:bg-[#18181B] border border-white/10 shadow-2xl rounded-full px-3.5 py-1.5 flex items-center justify-between gap-1 w-full max-w-[270px] sm:max-w-xs text-white"
        >
          {PROFILE_EDIT_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = !!disabledTabs?.[tab.id];
            const hasUnsaved = unsavedTabs?.[tab.id];
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                aria-label={tab.label}
                title={isDisabled ? `${tab.label} (Dinonaktifkan)` : tab.label}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer active:scale-90 flex-1 ${
                  isActive
                    ? "h-11 bg-white text-[#1C1C1C] shadow-md px-3.5"
                    : isDisabled
                    ? "opacity-30 cursor-not-allowed h-10 text-neutral-500"
                    : "h-10 text-neutral-400 hover:text-white bg-transparent"
                }`}
              >
                <Icon
                  size={isActive ? 19 : 20}
                  className={`transition-all duration-150 ${
                    isActive ? "stroke-[2.2]" : "stroke-[1.6]"
                  }`}
                />
                {isDisabled && (
                  <span className="absolute top-0.5 right-0.5 text-[7px] leading-none">
                    🚧
                  </span>
                )}
                {hasUnsaved && !isDisabled && (
                  <span
                    className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                    title="Ada perubahan belum disimpan"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 💻 DESKTOP VERTICAL MENU (ORIGINAL THEME STYLE) */}
      <div className="hidden lg:flex flex-col space-y-1 w-full">
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
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all text-left w-full border ${
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
