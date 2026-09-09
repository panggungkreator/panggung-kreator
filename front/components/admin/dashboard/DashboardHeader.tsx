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
        </div>
      </div>
    </div>
  );
}
