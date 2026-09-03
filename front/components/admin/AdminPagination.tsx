"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  limit: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  limit,
  itemLabel = "data",
  onPageChange,
  className = "",
}: AdminPaginationProps) {
  if (totalItems <= 0) return null;

  return (
    <div
      className={`bg-white dark:bg-[#121212] border border-border-default/70 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs select-none ${className}`}
    >

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="h-9 px-3.5 rounded-xl border border-border-default bg-bg-card hover:bg-bg-well text-xs font-bold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={14} />
          <span>Sebelumnya</span>
        </button>

        <div className="px-3 py-1.5 rounded-xl bg-bg-well text-xs font-bold font-mono text-text-primary min-w-[90px] text-center">
          Hal {currentPage} dari {totalPages}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="h-9 px-3.5 rounded-xl border border-border-default bg-bg-card hover:bg-bg-well text-xs font-bold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95"
          title="Halaman Selanjutnya"
        >
          <span>Selanjutnya</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
