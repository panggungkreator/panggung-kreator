"use client";

import React, { useTransition } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { Edit3, Check, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminEditBar() {
  const { isAdmin, isEditMode, setIsEditMode } = useLandingCMS();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-full px-4 py-2 flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Admin
      </div>
      
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
      
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isEditMode 
            ? "bg-[#bc151b] text-white" 
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        {isEditMode ? (
          <>
            <Check size={16} /> Mode Edit Aktif
          </>
        ) : (
          <>
            <Edit3 size={16} /> Masuk Mode Edit
          </>
        )}
      </button>

      <button
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
        disabled={isPending}
        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full transition-colors"
        title="Refresh data halaman"
      >
        <Eye size={18} className={isPending ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
