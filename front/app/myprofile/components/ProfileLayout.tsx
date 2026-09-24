"use client";

import React, { useState } from "react";
import { MemberProfile } from "@/lib/types/member";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

interface ProfileLayoutProps {
  member?: MemberProfile;
  header?: React.ReactNode;
  tabs?: React.ReactNode;
  sidebar?: React.ReactNode;
  statsCards?: React.ReactNode;
  children: React.ReactNode;
}

export default function ProfileLayout({
  member,
  header,
  tabs,
  sidebar,
  statsCards,
  children,
}: ProfileLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F6F5FA] dark:bg-[#0E1210] text-[#212121] dark:text-[#F4F4F4] font-sans flex flex-col justify-between selection:bg-[#212121] selection:text-white dark:selection:bg-white dark:selection:text-black">

      {/* 📱 MOBILE TOP BAR (HAMBURGER TOGGLE) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#151B18]/80 backdrop-blur-xl h-16 px-5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <Logo size="sm" isLink={true} />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 text-[#1C1C1C] dark:text-white transition-transform active:scale-95 flex items-center justify-center rounded-full bg-white dark:bg-[#1F2623] shadow-sm border border-black/5 dark:border-white/5 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Menu
              className={`w-5 h-5 absolute transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                }`}
            />
            <X
              className={`w-5 h-5 absolute transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                }`}
            />
          </div>
        </button>
      </header>

      {/* MOBILE HAMBURGER MENU DRAWER */}
      <div
        className={`lg:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-[#F6F5FA] dark:bg-[#0E1210] transition-all duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen
          ? "opacity-100 py-6 sm:px-6 shadow-2xl pointer-events-auto"
          : "opacity-0 py-0 px-4 sm:px-6 pointer-events-none translate-y-[-10px]"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div className="w-full max-w-lg mx-auto pb-24 space-y-6" onClick={(e) => e.stopPropagation()}>
          {sidebar && <div className="w-full">{sidebar}</div>}
        </div>
      </div>

      {/* 💻 MAIN DESKTOP DOCK NAVIGATION (FIXED ON LEFT EDGE) */}
      <div className="hidden lg:flex fixed left-6 xl:left-10 top-1/2 -translate-y-1/2 z-30">
        {tabs}
      </div>

      {/* 💻 MAIN DESKTOP LAYOUT (CLEAN CENTERED MAIN CONTENT) */}
      <div className="max-w-5xl w-full mx-auto pt-20 lg:pt-8 pb-28 lg:pb-12 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 lg:gap-8">

        {/* TOP HEADER (Breadcrumb + Profile Dropdown) */}
        {header && <div className="hidden lg:block w-full">{header}</div>}

        {/* MAIN TAB CONTENT AREA */}
        <main className="w-full min-w-0 flex flex-col gap-6 lg:gap-8 z-0 p-4">
          {statsCards && <div className="w-full">{statsCards}</div>}
          <div className="w-full overflow-x-clip">{children}</div>
        </main>
      </div>

      {/* MOBILE FLOATING BOTTOM DOCK */}
      <div className={`lg:hidden transition-all duration-200 ${isMobileMenuOpen ? "hidden" : "block"}`}>
        {tabs}
      </div>
    </div>
  );
}
