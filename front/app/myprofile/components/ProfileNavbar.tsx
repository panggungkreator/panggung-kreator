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
    </>
  );
}
