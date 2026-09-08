"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface DashboardHeaderProps {
  adminName?: string;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ adminName = "Admin", onSearch }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB] dark:border-[#2A2E42]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] dark:text-white">
            Welcome Back, {adminName}!
          </h1>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#BAFF6A] text-[#2D5A00]">
            <Sparkles className="w-3 h-3 mr-1" />
            Live Sync
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8B8FA8] mt-1">
          Pantau metrik utama, kehadiran event, dan wawasan minat kreator dari database.
        </p>
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            type="text"
            placeholder="Cari member..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-9 h-9 rounded-full text-xs bg-[#F5F5F5] dark:bg-[#22263A] border border-[#E5E7EB] dark:border-[#2A2E42] text-[#111111] dark:text-[#F0F0F0] placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#111111]"
          />
        </div>
      </div>
    </div>
  );
}
