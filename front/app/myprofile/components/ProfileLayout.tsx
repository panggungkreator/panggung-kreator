"use client";

import React, { useState, useEffect } from "react";
import { MemberProfile } from "@/lib/types/member";
import { Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";

interface ProfileLayoutProps {
  member?: MemberProfile;
  tabs: React.ReactNode;
  sidebar: React.ReactNode;
  statsCards?: React.ReactNode;
  children: React.ReactNode;
}

export default function ProfileLayout({
  member,
  tabs,
  sidebar,
  statsCards,
  children,
}: ProfileLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
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

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between">
      {/* TOP BAR ON MOBILE — ONLY HAMBURGER TOGGLE BUTTON ALIGNED RIGHT */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md h-14 px-4 flex items-center justify-end border-b border-neutral-200/60 dark:border-neutral-800/60">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neutral-900 dark:text-white transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
          aria-label="Toggle Navigation Menu"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Menu
              className={`w-6 h-6 absolute transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                }`}
            />
            <X
              className={`w-6 h-6 absolute transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
              }`}
            />
          </div>
        </button>
      </header>

      {/* MOBILE ANIMATED HAMBURGER MENU DRAWER — CONTENT COMES DIRECTLY FROM SIDEBAR PROP (PROFILE SIDEBAR) */}
      <div
        className={`lg:hidden fixed top-14 left-0 right-0 bottom-0 z-50 bg-white dark:bg-[#0A0A0A] transition-all duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen
          ? "opacity-100 py-6 px-6 shadow-2xl pointer-events-auto"
          : "opacity-0 py-0 px-6 pointer-events-none translate-y-[-10px]"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div className="w-full max-w-sm mx-auto pb-12" onClick={(e) => e.stopPropagation()}>
          {sidebar}
        </div>
      </div>

      {/* MAIN CONTAINER — DESKTOP HAS NO TOP NAV OR HEADER (PT-8) */}
      <div className="max-w-7xl w-full mx-auto pt-14 lg:pt-8 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8 flex-1">
        {/* MAIN TWO-COLUMN SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* LEFT COLUMN: IDENTITY SIDEBAR (DESKTOP ONLY WITH THIN AUTO-HIDE SCROLL) */}
          <aside className="hidden lg:block lg:col-span-3 w-full sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar pr-2">{sidebar}</aside>

          {/* RIGHT COLUMN: TAB NAVIGATION & DATA DETAILS */}
          <main className="lg:col-span-9 w-full space-y-6">
            {statsCards && <div className="w-full">{statsCards}</div>}
            {tabs && <div className="w-full">{tabs}</div>}
            <div className="w-full overflow-x-clip">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
