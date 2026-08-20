"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Menu, X, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import Logo from "../components/ui/Logo";

export default function NavHeader() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize theme
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

    // Handle scroll background transition
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Check user session
    const supabase = createClient();
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoadingSession(false);
      }
    };
    fetchSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
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

  const handleSignOut = async () => {
    try {
      await signout();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  const navLinks = [
    { label: "Tentang", href: "#origin-story" },
    { label: "Program", href: "#program" },
    { label: "Harga", href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
        ? "bg-white/90 dark:bg-[#2c2c2c]/90 backdrop-blur-md py-4 border-zinc-200 dark:border-zinc-800 shadow-sm"
        : "bg-transparent py-6 border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Logo size="md" isLink={false} />
          </Link>
        </div>



        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {mounted ? (
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-all rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 cursor-pointer flex items-center justify-center"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          )}

          {loadingSession ? (
            <div className="flex items-center gap-2">
              <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/akademi/dashboard"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white/50 dark:bg-zinc-900/50"
              >
                <User size={14} /> Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-500/20 bg-white/50 dark:bg-zinc-900/50 cursor-pointer flex items-center justify-center"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/checkout"
              className="text-sm font-bold text-white transition-all bg-[#bc151b] hover:bg-[#9a1116] border border-[#bc151b] hover:border-[#9a1116] rounded-lg px-5 py-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] duration-150"
            >
              Daftar Sekarang
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 md:hidden">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] z-40 bg-white dark:bg-[#2c2c2c] border-t border-zinc-100 dark:border-zinc-900 md:hidden animate-fade-in">
          <div className="flex flex-col p-6 gap-6 h-full justify-between">
            <nav className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-semibold text-zinc-800 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white transition-colors py-2 border-b border-zinc-100 dark:border-zinc-900/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-4 pb-12">
              {loadingSession ? (
                <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              ) : user ? (
                <>
                  <Link
                    href="/akademi/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center font-semibold text-zinc-700 dark:text-zinc-300 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-center font-semibold text-red-600 dark:text-red-400 py-3 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/checkout"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-bold text-white py-3 bg-[#bc151b] rounded-lg shadow-sm"
                >
                  Daftar Sekarang
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
