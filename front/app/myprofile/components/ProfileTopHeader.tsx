"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MemberProfile } from "@/lib/types/member";
import ChangePasswordModal from "@/components/member/ChangePasswordModal";
import {
  Edit3,
  Lock,
  LogOut,
  Sun,
  Moon,
  Shield,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface ProfileTopHeaderProps {
  member: MemberProfile;
  onSignout: () => void;
  isLoggingOut?: boolean;
}

export default function ProfileTopHeader({
  member,
  onSignout,
  isLoggingOut = false,
}: ProfileTopHeaderProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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

  const usernameDisplay = member.username || member.stage_name || member.full_name || "Member";
  const initial = usernameDisplay.charAt(0).toUpperCase();

  return (
    <>
      <header className="w-full flex items-center justify-end gap-4">
        {/* RIGHT: THEME TOGGLE & PROFILE DROPDOWN NAVBAR MENU */}
        <div className="flex items-center gap-3 relative shrink-0 ml-auto">
          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#151B18] text-neutral-600 hover:text-[#1C1C1C] dark:text-neutral-300 dark:hover:text-white border border-black/5 dark:border-white/10 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* PROFILE DROPDOWN TRIGGER */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full dark:bg-[#151B18] transition-all cursor-pointer select-none active:scale-95 group"
            >
              {/* CANVAS INITIAL AVATAR */}
              <div className="w-8 h-8 rounded-full bg-[#1C1C1C] dark:bg-[#18181B] text-white dark:text-neutral-200 border border-transparent dark:border-white/10 flex items-center justify-center font-sans font-bold text-sm shrink-0">
                {initial}
              </div>

              {/* USERNAME */}
              <span className="font-sans font-bold text-sm text-[#1C1C1C] dark:text-white transition-opacity">
                {usernameDisplay}
              </span>

              {/* CHEVRON ICON */}
              <ChevronDown
                size={15}
                className={`text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#151B18] rounded-2xl shadow-xl border border-[#212121]/10 dark:border-white/10 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Info Header */}
                <div className="px-3.5 py-2.5 mb-1 border-b border-[#212121]/10 dark:border-white/10">
                  <p className="text-xs font-sans font-bold text-[#212121] dark:text-white truncate">
                    {member.stage_name || member.full_name}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                    @{member.username || member.email}
                  </p>
                </div>

                {/* Dropdown Menu Items */}
                <div className="space-y-1">
                  {/* Admin Dashboard */}
                  {member.role === "admin" && (
                    <a
                      href={getAdminUrl()}
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-3.5 py-2 rounded-xl font-sans text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 transition-colors"
                    >
                      <Shield size={15} />
                      <span>Panel Admin</span>
                    </a>
                  )}

                  {/* Edit Profil */}
                  <Link
                    href="/myprofile/edit"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full px-3.5 py-2 rounded-xl font-sans text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-[#F6F5FA] dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                  >
                    <Edit3 size={15} />
                    <span>Edit Profil</span>
                  </Link>

                  {/* Ganti Password */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl font-sans text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-[#F6F5FA] dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors text-left"
                  >
                    <Lock size={15} />
                    <span>Ganti Password</span>
                  </button>

                  <div className="my-1 border-t border-[#212121]/10 dark:border-white/10" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full px-3.5 py-2 rounded-xl font-sans text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors text-left disabled:opacity-50 cursor-pointer"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Keluar...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={15} />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}
