"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MemberProfile } from "@/lib/types/member";
import { performCompleteSignOut } from "@/lib/utils/auth-client";
import { Sun, Moon, Menu, X, User, Edit3, Home, LogOut, ArrowLeft, Layers, Image as ImageIcon, Users } from "lucide-react";

interface ProfileNavbarProps {
  member?: MemberProfile | null;
}

export default function ProfileNavbar({ member }: ProfileNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      setIsMenuOpen(false);
      await performCompleteSignOut("/login");
    } catch (err) {
      console.error("Signout error:", err);
      setIsLoggingOut(false);
    }
  };

  const initials = member
    ? (member.stage_name || member.full_name || "M").substring(0, 2).toUpperCase()
    : "M";
  const isEditPage = pathname === "/myprofile/edit" || pathname?.startsWith("/myprofile/edit");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* LEFT: BRAND LOGO / BACK HOME */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group text-neutral-900 dark:text-white font-mono text-xs uppercase tracking-widest"
            >
              <img src="/logo-dark.png" alt="Logo" className="h-10 w-auto dark:block hidden" />
              <img src="/logo-light.png" alt="Logo" className="h-10 w-auto dark:hidden" />
            </Link>
          </div>

          {/* CENTER: DASHBOARD BADGE (DESKTOP) */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
              PORTAL MEMBER
            </span>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer items-center justify-center ${
                isEditPage ? "hidden md:inline-flex" : "inline-flex"
              }`}
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/myprofile"
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${pathname === "/myprofile"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
              >
                Profil
              </Link>
              <Link
                href="/myprofile/edit"
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
              >
                Edit
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            {!isEditPage && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-transform active:scale-95 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Menu
                    className={`w-5 h-5 absolute transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                      }`}
                  />
                  <X
                    className={`w-5 h-5 absolute transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                      }`}
                  />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* CUSTOM ANIMATED MOBILE HAMBURGER NAV DRAWER */}
        {!isEditPage && (
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-neutral-200 dark:border-neutral-800 bg-white/98 dark:bg-[#0A0A0A]/98 backdrop-blur-xl ${isMenuOpen ? "max-h-[85vh] opacity-100 py-6 px-6 shadow-2xl" : "max-h-0 opacity-0 py-0 px-6 pointer-events-none"
              }`}
          >
          {/* MEMBER QUICK CARD HEADER IN NAV */}
          {member && (
            <div className="flex flex-col items-center text-center gap-3 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 border border-neutral-200 dark:border-neutral-800">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.stage_name || member.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-lg font-bold font-mono">
                    {initials}
                  </div>
                )}
              </div>
              <div className="w-full space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                  [ PROFIL AKTIF ]
                </div>
                <h3 className="font-serif text-lg text-neutral-900 dark:text-white font-semibold truncate leading-snug">
                  <span className="highlight-stabilo">{member.stage_name || member.full_name}</span>
                </h3>
                {member.username && (
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate">
                    @{member.username}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* MOBILE NAV LINKS */}
          <nav className="space-y-2.5 text-center">
            <Link
              href="/myprofile"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-center gap-2.5 p-3 text-xs font-mono uppercase tracking-wider transition-colors ${pathname === "/myprofile"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
            >
              <User size={16} />
              <span>Profil Saya</span>
            </Link>

            <Link
              href="/myprofile/edit"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-center gap-2.5 p-3 text-xs font-mono uppercase tracking-wider transition-colors ${pathname === "/myprofile/edit"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
            >
              <Edit3 size={16} />
              <span>Edit Profil</span>
            </Link>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-mono uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Keluar Akun...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={15} />
                    <span>Keluar Akun</span>
                  </>
                )}
              </button>
            </div>
          </nav>
        </div>
        )}
      </header>
    </>
  );
}
