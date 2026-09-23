"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MemberProfile } from "@/lib/types/member";
import { Shield, User, Lock, LogOut } from "lucide-react";
import ChangePasswordModal from "@/components/member/ChangePasswordModal";

interface ProfileSidebarProps {
  member: MemberProfile;
  onSignout?: () => void;
  onLinkClick?: () => void;
  isLoggingOut?: boolean;
  showActions?: boolean;
}

export default function ProfileSidebar({
  member,
  onSignout,
  onLinkClick,
  isLoggingOut,
  showActions = true,
}: ProfileSidebarProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const getAdminUrl = () => {
    if (typeof window === "undefined") return "/admin";
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const isIpAddress =
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
      hostname.includes(":") ||
      hostname === "[::1]";
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      isIpAddress;

    if (isLocalhost) {
      return "/admin";
    }

    let rootDomain = "panggungkreator.web.id";
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      if (hostname.endsWith(".web.id") && parts.length >= 3) {
        rootDomain = parts.slice(-3).join(".");
      } else {
        rootDomain = parts.slice(-2).join(".");
      }
    }
    return process.env.NEXT_PUBLIC_ADMIN_URL || `${protocol}//admin.${rootDomain}${port}/`;
  };

  const initials = (member.full_name || member.stage_name || "M")
    .charAt(0)
    .toUpperCase();

  const formattedJoinDate =
    member.profile_completed_at || (member as any).created_at
      ? new Date((member as any).created_at || member.profile_completed_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "-";

  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-6.5rem)] text-center relative">
      {/* 🔝 TOP SECTION: IDENTITY & PRIMARY NAVIGATION */}
      <div className="w-full flex flex-col items-center">
        {/* 👤 AVATAR: ENLARGED IMAGE WITH FALLBACK TO INITIALS */}
        <div className="relative my-2 sm:my-3 flex items-center justify-center w-full">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-xl select-none ring-4 ring-black/10 dark:ring-white/20">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name || member.stage_name || "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl sm:text-6xl font-sans font-bold">{initials}</span>
            )}
          </div>
        </div>

        {/* 🏷️ MEMBER NAME & USERNAME */}
        <div className="space-y-1 w-full mt-3">
          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-white font-bold tracking-tight leading-tight">
            {member.full_name || member.stage_name}
          </h2>
          {member.username && (
            <p className="text-sm sm:text-base font-mono font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              @{member.username}
            </p>
          )}
        </div>

        {/* 🧭 NAVIGATION MENU ITEMS (EXTRA LARGE, NO ARROWS) */}
        {showActions && (
          <div className="w-full space-y-3.5 sm:space-y-4 pt-8 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1 block mb-4">
              Menu Navigasi
            </span>

            {/* 1. Panel Admin (Khusus Admin) */}
            {member.role === "admin" && (
              <a
                href={getAdminUrl()}
                onClick={onLinkClick}
                className="w-full flex items-center p-5 sm:p-5.5 rounded-3xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-950 dark:text-amber-200 transition-all active:scale-[0.98] group shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-bold font-sans block text-neutral-900 dark:text-white leading-snug">
                      Dashboard Admin
                    </span>
                    <span className="text-xs sm:text-sm text-amber-700/90 dark:text-amber-300/90 font-mono mt-1 block">
                      Kelola member & sistem
                    </span>
                  </div>
                </div>
              </a>
            )}

            {/* 2. Edit Profil */}
            <Link
              href="/myprofile/edit"
              onClick={onLinkClick}
              className="w-full flex items-center p-5 sm:p-5.5 rounded-3xl bg-white dark:bg-[#151B18] hover:bg-neutral-50 dark:hover:bg-neutral-800/80 border border-black/8 dark:border-white/8 text-neutral-800 dark:text-neutral-200 transition-all shadow-sm hover:shadow-md active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold font-sans block text-neutral-900 dark:text-white leading-snug">
                    Edit Profil
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1 block">
                    Perbarui data diri & foto
                  </span>
                </div>
              </div>
            </Link>

            {/* 3. Ganti Password */}
            <button
              type="button"
              onClick={() => {
                setIsChangePasswordOpen(true);
                if (onLinkClick) onLinkClick();
              }}
              className="w-full flex items-center p-5 sm:p-5.5 rounded-3xl bg-white dark:bg-[#151B18] hover:bg-neutral-50 dark:hover:bg-neutral-800/80 border border-black/8 dark:border-white/8 text-neutral-800 dark:text-neutral-200 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold font-sans block text-neutral-900 dark:text-white leading-snug">
                    Ganti Password
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1 block">
                    Keamanan & kata sandi
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 🔻 BOTTOM SECTION: LOGOUT BUTTON AT THE VERY BOTTOM */}
      <div className="w-full pt-10 pb-4 space-y-4">
        {showActions && onSignout && (
          <button
            type="button"
            onClick={onSignout}
            disabled={isLoggingOut}
            className="w-full p-5 sm:p-5.5 rounded-3xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-600 dark:text-red-400 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] group shadow-sm flex items-center justify-center gap-3.5"
          >
            <span className="text-base sm:text-lg font-bold font-sans">
              {isLoggingOut ? "Keluar Akun..." : "Keluar / Logout"}
            </span>
          </button>
        )}

        {/* 📅 TANGGAL TERDAFTAR */}
        <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-center">
          TERDAFTAR: {formattedJoinDate}
        </div>
      </div>

      {/* 🔒 CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
