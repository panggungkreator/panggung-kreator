"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sun, Moon, Menu, X, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/lib/actions/auth-actions";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize theme from HTML class list or localStorage
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Supabase Auth session check
    const supabase = createClient();
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchSession();

    // Listen for auth change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
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
    { label: "Cerita Kami", href: "/tentang" },
    { label: "Galeri", href: "/galeri" },
    { label: "Kolaborasi", href: "/kolaborasi" },
  ];

  /**
   * Smooth-scroll to an anchor target using the global Lenis instance.
   * Closes the mobile menu first if open, then scrolls after a brief delay
   * so the layout has time to reflow.
   */
  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault();
      const wasMenuOpen = isMobileMenuOpen;
      if (wasMenuOpen) setIsMobileMenuOpen(false);

      const scrollToTarget = () => {
        const el = document.querySelector(hash);
        if (!el) return;

        if (window.__lenis) {
          window.__lenis.scrollTo(el as HTMLElement, {
            offset: -90,
            duration: 1.8,
            easing: (t: number) => 1 - Math.pow(1 - t, 4),
          });
        } else {
          el.scrollIntoView({ behavior: "smooth" });
        }

        window.history.pushState(null, "", hash);
      };

      // If mobile menu was open, give it time to close before scrolling
      if (wasMenuOpen) {
        setTimeout(scrollToTarget, 150);
      } else {
        scrollToTarget();
      }
    },
    [isMobileMenuOpen]
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
          ? "bg-white/95 dark:bg-[#2c2c2c]/95 backdrop-blur-md py-4 border-[#2c2c2c] dark:border-white"
          : "bg-white dark:bg-[#2c2c2c] py-6 border-[#2c2c2c]/10 dark:border-white/10"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <img src="/logo-dark.png" alt="Logo" className="h-16 w-auto dark:block hidden" />
            <img src="/logo-light.png" alt="Logo" className="h-16 w-auto dark:hidden" />
          </Link>

          {/* Central Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-sans text-xs uppercase tracking-[0.2em] font-bold transition-all duration-200 ${isActive
                    ? "bg-[#ffe78a] text-black dark:bg-[#0762bd] dark:text-white px-3 py-1.5"
                    : "text-[#2c2c2c]/60 hover:text-[#2c2c2c] dark:text-white/60 dark:hover:text-white px-3 py-1.5"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {mounted ? (
              <button
                onClick={toggleTheme}
                className="text-[#2c2c2c]/60 hover:text-[#2c2c2c] dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
                title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            ) : null}

            {/* {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/myprofile"
                  className="font-sans text-xs uppercase tracking-[0.2em] text-[#2c2c2c]/60 hover:text-[#2c2c2c] dark:text-white/60 dark:hover:text-white transition-colors duration-200 font-bold"
                >
                  Profil Saya
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] text-[10px] font-bold uppercase tracking-[0.25em] px-5 py-2.5 border border-[#2c2c2c] dark:border-white hover:bg-transparent hover:text-[#2c2c2c] dark:hover:bg-transparent dark:hover:text-white transition-all duration-350 rounded-none cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : ( */}
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-xs uppercase tracking-[0.2em] font-bold text-[#2c2c2c]/60 hover:text-[#2c2c2c] dark:text-white/60 dark:hover:text-white transition-colors"
              >
                Masuk
              </Link>
              <a
                href="#gabung"
                onClick={(e) => handleSmoothScroll(e, "#gabung")}
                className="text-xs uppercase tracking-[0.2em] font-bold bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] px-5 py-2.5 rounded-none border border-[#2c2c2c] dark:border-white hover:bg-white hover:text-[#2c2c2c] dark:hover:bg-[#2c2c2c] dark:hover:text-white transition-all duration-300 cursor-pointer"
              >
                GABUNG — GRATIS
              </a>
            </div>
            {/* )} */}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-4 md:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="text-[#2c2c2c]/60 dark:text-white/60"
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#2c2c2c] dark:text-white cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-[#2c2c2c] md:hidden flex flex-col pt-28 p-6 gap-8 justify-between">
          <nav className="flex flex-col gap-6 pt-4 items-start">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold tracking-[0.15em] uppercase transition-all duration-200 ${isActive
                    ? "bg-[#ffe78a] text-black dark:bg-[#0762bd] dark:text-white px-4 py-2"
                    : "text-[#2c2c2c]/70 hover:text-[#2c2c2c] dark:text-white/70 dark:hover:text-white px-4 py-2"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 pb-12">
            {user ? (
              <>
                <Link
                  href="/myprofile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 border border-[#2c2c2c] dark:border-white text-xs uppercase tracking-[0.2em] font-bold text-[#2c2c2c] dark:text-white bg-[#2c2c2c]/5 dark:bg-white/5 rounded-none"
                >
                  Profil Saya
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-center py-3 border border-red-600/30 text-xs uppercase tracking-[0.2em] font-bold text-red-600 bg-red-50 dark:bg-red-950/10 rounded-none"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 border border-[#2c2c2c] dark:border-white text-xs uppercase tracking-[0.2em] font-bold text-[#2c2c2c] dark:text-white bg-[#2c2c2c]/5 dark:bg-white/5 rounded-none"
                >
                  Masuk
                </Link>
                <a
                  href="#gabung"
                  onClick={(e) => handleSmoothScroll(e, "#gabung")}
                  className="w-full text-center py-3 bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] text-xs uppercase tracking-[0.2em] font-bold rounded-none border border-[#2c2c2c] dark:border-white cursor-pointer"
                >
                  GABUNG — GRATIS
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
