"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";
import { signout } from "@/lib/actions/auth-actions";
import { Sun, Moon, Bell, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Fetch pending members count and listen to changes
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("payment_status", "pending")
          .neq("role", "admin");

        if (!error && count !== null) {
          setPendingCount(count);
        }
      } catch (err) {
        console.error("Error fetching pending count:", err);
      }
    };

    fetchPendingCount();

    const supabase = createClient();
    const channel = supabase
      .channel("pending_members_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown on outside clicks
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = () => setIsDropdownOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

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
    try {
      await signout();
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0a] dark:text-zinc-100 font-sans transition-colors duration-300 flex flex-col selection:bg-[#bc151b] selection:text-white">
      {/* Header Admin */}
      <header className="px-6 py-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Logo size="md" isLink={false} />
          {/* <span className="bg-red-500/10 text-[#bc151b] text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-red-500/20">
            Admin Panel
          </span> */}
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors relative cursor-pointer animate-fade-in">
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-[#0a0a0a]"></span>
            )}
          </button>

          {/* theme mode */}
          {mounted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors relative cursor-pointer animate-fade-in"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Profile Dropdown Container */}
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#bc151b] text-white flex items-center justify-center font-bold overflow-hidden shadow-md text-xs">
                A
              </div>
              <div className="hidden md:flex items-center gap-1">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Admin</p>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-white/5">
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Akun</p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Admin</p>
                </div>


                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />

                {/* Logout Button in Dropdown */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignOut();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
