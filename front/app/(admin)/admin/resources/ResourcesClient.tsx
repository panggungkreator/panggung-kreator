"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Trash2,
  Edit,
  Plus,
  Search,
  CheckCircle,
  X,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  deleteResourceAction,
  toggleResourcePublishAction,
} from "@/lib/actions/resource-actions";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size_kb: number;
  package_tier: string;
  category: string;
  is_published: boolean;
  order_index: number;
  uploaded_by: string;
  created_at: string;
}

interface ResourcesClientProps {
  initialResources: Resource[];
  paginationLimit?: number;
}

const categoryLabels: Record<string, string> = {
  materi: "Materi / E-Book",
  rekaman: "Rekaman Video/Audio",
  template: "Template / Assets",
  referensi: "Referensi / Link",
  lainnya: "Lainnya",
};

const tierLabels: Record<string, string> = {
  all: "Free (Semua Member)",
  free: "Free Tier",
  regular: "Regular Tier",
  mvp: "MVP Tier",
};

export default function ResourcesClient({
  initialResources,
  paginationLimit = 10,
}: ResourcesClientProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtering states
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("any");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, tierFilter, categoryFilter, statusFilter]);

  const formatFileSize = (kb: number) => {
    if (kb >= 1024) {
      return (kb / 1024).toFixed(1) + " MB";
    }
    return kb.toFixed(0) + " KB";
  };

  // Unique categories list for filters
  const categories = useMemo(() => {
    const set = new Set(resources.map((r) => r.category));
    return Array.from(set).filter(Boolean);
  }, [resources]);

  // Handle Toggle Published Status
  const handleToggleStatus = (resourceId: string, currentStatus: boolean, title: string) => {
    // Optimistic UI update
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, is_published: !currentStatus } : r))
    );

    startTransition(async () => {
      const res = await toggleResourcePublishAction(resourceId, currentStatus);
      if (res.success) {
        toast.success(
          !currentStatus ? `"${title}" berhasil dipublish!` : `"${title}" diubah menjadi draft.`
        );
      } else {
        toast.error("Gagal mengubah status: " + res.error);
        // Rollback
        setResources((prev) =>
          prev.map((r) => (r.id === resourceId ? { ...r, is_published: currentStatus } : r))
        );
      }
    });
  };

  // Handle Confirm Delete Resource
  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    const { id, title } = resourceToDelete;
    setResourceToDelete(null);

    startTransition(async () => {
      const res = await deleteResourceAction(id);
      if (res.success) {
        setResources((prev) => prev.filter((r) => r.id !== id));
        toast.success(`Materi "${title}" berhasil dihapus.`);
      } else {
        toast.error("Gagal menghapus materi: " + res.error);
      }
    });
  };

  // Filtered dataset
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const query = search.toLowerCase();
      const matchesSearch =
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query);

      const matchesTier = tierFilter === "any" || r.package_tier === tierFilter;
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && r.is_published) ||
        (statusFilter === "draft" && !r.is_published);

      return matchesSearch && matchesTier && matchesCategory && matchesStatus;
    });
  }, [resources, search, tierFilter, categoryFilter, statusFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = resources.length;
    const published = resources.filter((r) => r.is_published).length;
    const draft = resources.filter((r) => !r.is_published).length;
    return { total, published, draft };
  }, [resources]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredResources.length, startIndex + limit);
  const paginatedResources = useMemo(() => {
    return filteredResources.slice(startIndex, endIndex);
  }, [filteredResources, startIndex, endIndex]);

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Resources & Materi Akademi
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kumpulan e-book panduan, rekaman webinar, dan aset materi pembelajaran.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Header Quick Search (h-9 rounded-full) */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul/materi..."
              className="w-full h-9 pl-9 pr-8 text-xs rounded-full bg-bg-well/70 border border-border-default focus:border-text-primary focus:outline-none transition-all placeholder:text-text-muted"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Action Button Header Desktop (h-9 px-4 rounded-full) */}
          <Link
            href="/admin/resources/addResource"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Upload Resource</span>
          </Link>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Materi</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.total}
          </span>
        </button>

        {/* Published */}
        <button
          type="button"
          onClick={() => setStatusFilter("published")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "published"
              ? "bg-[#dcfce7] text-[#15803d] shadow-xs border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {stats.published}
          </span>
        </button>

        {/* Draft */}
        <button
          type="button"
          onClick={() => setStatusFilter("draft")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "draft"
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-300 dark:border-zinc-700"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Draft</span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {stats.draft}
          </span>
        </button>
      </div>

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default/70 bg-bg-well/50">
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Judul Materi
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Kategori
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Tier Akses
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  File
                </th>
                <th className="py-3.5 px-5 border-r border-border-default/60 uppercase tracking-wider font-bold">
                  Status
                </th>
                <th className="py-3.5 px-5 text-center uppercase tracking-wider font-bold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {paginatedResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    Tidak ada data resource ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedResources.map((r) => (
                  <tr key={r.id} className="hover:bg-bg-well/30 transition-colors">
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <div className="font-bold text-text-primary text-sm">{r.title}</div>
                      {r.description && (
                        <div className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
                          {r.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <span className="px-2.5 py-1 rounded-lg bg-bg-well text-[11px] font-semibold text-text-secondary border border-border-default/50">
                        {categoryLabels[r.category] || r.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <span className="inline-flex items-center gap-1 font-semibold text-text-primary uppercase text-[10px] tracking-wider">
                        {r.package_tier === "mvp" ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                            MVP
                          </span>
                        ) : r.package_tier === "regular" ? (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold">
                            Regular
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 font-bold">
                            Free
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <FileText size={13} className="text-zinc-400 shrink-0" />
                        <span className="font-mono uppercase font-bold text-[10px]">
                          {r.file_type || "FILE"}
                        </span>
                        <span className="text-text-muted">•</span>
                        <span className="text-[11px]">{formatFileSize(r.file_size_kb)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-border-default/40">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id, r.is_published, r.title)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          r.is_published
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20"
                        }`}
                        title="Klik untuk mengubah status publish"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.is_published ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                          }`}
                        />
                        {r.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {r.file_url && (
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors"
                            title="Unduh / Buka File"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link
                          href={`/admin/resources/addResource?id=${r.id}`}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Edit Materi"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setResourceToDelete(r)}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus Materi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-3.5">
        {paginatedResources.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data resource ditemukan.</p>
          </div>
        ) : (
          paginatedResources.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99]"
            >
              {/* Card Top: Category, Tier & Status */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-default/40">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-bg-well text-[10px] font-bold text-text-secondary">
                    {categoryLabels[r.category] || r.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-text-secondary border border-border-default/50">
                    {r.package_tier}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(r.id, r.is_published, r.title)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    r.is_published
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      r.is_published ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                    }`}
                  />
                  {r.is_published ? "Published" : "Draft"}
                </button>
              </div>

              {/* Card Middle: Title, Description, File info */}
              <div className="my-3 space-y-2">
                <div>
                  <h3 className="text-sm font-black tracking-tight text-text-primary leading-snug">
                    {r.title}
                  </h3>
                  {r.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-bg-well/60 border border-border-default/40 text-[11px] text-text-secondary">
                  <FileText size={12} className="text-zinc-400 shrink-0" />
                  <span className="font-mono uppercase font-bold text-[10px] text-text-primary">
                    {r.file_type || "FILE"}
                  </span>
                  <span className="text-text-muted">•</span>
                  <span>{formatFileSize(r.file_size_kb)}</span>
                </div>
              </div>

              {/* Card Bottom: Metadata & Actions */}
              <div className="pt-3 border-t border-border-default/40 flex items-center justify-between gap-2">
                <div>
                  {r.file_url && (
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0369a1] dark:text-sky-400 hover:underline"
                    >
                      <span>Buka File</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/admin/resources/addResource?id=${r.id}`}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                    title="Edit Materi"
                  >
                    <Edit size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setResourceToDelete(r)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                    title="Hapus Materi"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredResources.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="materi"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Tier Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  tierFilter !== "any" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Tier"
              >
                <Sparkles className="w-4 h-4" />
                {tierFilter !== "any" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-64 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Tier Akses
                </span>
                {tierFilter !== "any" && (
                  <button
                    type="button"
                    onClick={() => setTierFilter("any")}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "any", label: "Semua Tier" },
                  { id: "all", label: "Free (Semua)" },
                  { id: "regular", label: "Regular" },
                  { id: "mvp", label: "MVP" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierFilter(t.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      tierFilter === t.id
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Category Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  categoryFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Kategori"
              >
                <Layers className="w-4 h-4" />
                {categoryFilter !== "all" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BAFF6A]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-64 p-3.5 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3 mb-2 z-50 max-h-72 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Filter Kategori
                </span>
                {categoryFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    categoryFilter === "all"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-text-secondary hover:bg-bg-well"
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer truncate ${
                      categoryFilter === c
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-text-secondary hover:bg-bg-well"
                    }`}
                  >
                    {categoryLabels[c] || c}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Upload Resource */}
          <Link
            href="/admin/resources/addResource"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Upload Resource Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload</span>
          </Link>
        </div>
      </div>

      {/* ═══ DELETE CONFIRM DIALOG (Kustom Tanpa window.confirm) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(resourceToDelete)}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
        title="Hapus Resource / Materi"
        description={`Apakah Anda yakin ingin menghapus materi "${resourceToDelete?.title}"? File dan data materi akan dihapus secara permanen.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
