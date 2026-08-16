"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signout } from '@/lib/actions/auth-actions';
import { useRouter, usePathname } from 'next/navigation';

export default function Header({ isFixed = false }: { isFixed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

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

    // Check user session
    const supabase = createClient();
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
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
      router.push('/');
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  return (
    <header className={`${isFixed ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#2c2c2c]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 transition-colors duration-300`}>
      <Logo size="md" />

      <div className="flex items-center gap-3">
        {mounted ? (
          <button
            onClick={toggleTheme}
            className="p-3 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-all rounded-lg border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer flex items-center justify-center"
            title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        ) : (
          <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 animate-pulse" />
        )}

        {pathname !== '/akademi/checkout' && (
          <Link
            href="/akademi/checkout"
            className="text-sm font-bold text-white transition-all border border-[#bc151b] hover:border-[#9a1116] rounded-lg px-4 py-2 bg-[#bc151b] hover:bg-[#9a1116] cursor-pointer shadow-sm shadow-[#bc151b]/20"
          >
            Daftar Sekarang
          </Link>
        )}
      </div>
    </header>
  );
}
