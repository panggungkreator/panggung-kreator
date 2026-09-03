"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  X,
  Eye,
  Search,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  deleteGalleryAlbumAction,
  deleteMultipleGalleryAlbumsAction,
  toggleGalleryAlbumPublishedAction,
} from "@/lib/actions/gallery-actions";
import { toast } from "sonner";

interface Album {
  id: string;
  title: string;
  slug: string;
  category: string;
  event_date: string;
  hero_image_url: string | null;
  album_link: string | null;
  description: string | null;
  is_published: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface GaleriCMSClientProps {
  initialAlbums: Album[];
  paginationLimit?: number;
}

const CATEGORIES = [
  { value: "open-mic", label: "Open Mic" },
  { value: "public-speaking", label: "Public Speaking" },
  { value: "mc-practice", label: "MC Practice" },
  { value: "networking", label: "Networking" },
  { value: "content-class", label: "Content Class" },
  { value: "lainnya", label: "Lainnya" },
];

export default function GaleriCMSClient({
  initialAlbums,
  paginationLimit = 10,
}: GaleriCMSClientProps) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [detailAlbum, setDetailAlbum] = useState<Album | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMultiDeleteDialog, setShowMultiDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryLabel = (val: string) => {
    const found = CATEGORIES.find((c) => c.value === val);
    return found ? found.label : val;
  };

  // Toggle publish
  const handleTogglePublish = (id: string, currentStatus: boolean, title: string) => {
    startTransition(async () => {
      const res = await toggleGalleryAlbumPublishedAction(id, currentStatus);
      if (res.success) {
        setAlbums((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_published: !currentStatus } : a))
        );
        toast.success(`Status publikasi "${title}" berhasil diubah.`);
      } else {
        toast.error("Gagal mengubah status: " + res.error);
      }
    });
  };

  // Single delete
  const handleConfirmSingleDelete = () => {
    if (!albumToDelete) return;
    const { id, title } = albumToDelete;
    setAlbumToDelete(null);

    startTransition(async () => {
      const res = await deleteGalleryAlbumAction(id);
      if (res.success) {
        setAlbums((prev) => prev.filter((a) => a.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        toast.success(`Album "${title}" berhasil dihapus.`);
      } else {
        toast.error("Gagal menghapus album: " + res.error);
      }
    });
  };

  // Multi delete
  const handleConfirmMultiDelete = () => {
    if (selectedIds.length === 0) return;
    const ids = [...selectedIds];
    setShowMultiDeleteDialog(false);

    startTransition(async () => {
      const res = await deleteMultipleGalleryAlbumsAction(ids);
      if (res.success) {
        setAlbums((prev) => prev.filter((a) => !ids.includes(a.id)));
        setSelectedIds([]);
        toast.success(`${ids.length} album berhasil dihapus.`);
      } else {
        toast.error("Gagal menghapus album: " + res.error);
      }
    });
  };

  // Filtered dataset
  const filteredAlbums = useMemo(() => {
    return albums.filter((a) => {
      const query = search.toLowerCase();
      const matchesSearch =
        a.title.toLowerCase().includes(query) ||
        (a.description && a.description.toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === "all" || a.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && a.is_published) ||
        (statusFilter === "draft" && !a.is_published);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [albums, search, categoryFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAlbums.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredAlbums.length, startIndex + limit);
  const paginatedAlbums = useMemo(() => {
    return filteredAlbums.slice(startIndex, endIndex);
  }, [filteredAlbums, startIndex, endIndex]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAlbums.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Dokumentasi & Galeri Kegiatan
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Arsip foto dokumentasi, album Google Drive, dan kegiatan kreator.
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
              placeholder="Cari judul dokumentasi..."
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
            href="/admin/galeri/addGallery"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Tambah Album</span>
          </Link>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua Album */}
        <button
          type="button"
          onClick={() => {
            setCategoryFilter("all");
            setStatusFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            categoryFilter === "all" && statusFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Album</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {albums.length}
          </span>
        </button>

        {/* Published */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("published");
            setCategoryFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "published"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Published</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {albums.filter((a) => a.is_published).length}
          </span>
        </button>

        {/* Draft */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("draft");
            setCategoryFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "draft"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Draft</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {albums.filter((a) => !a.is_published).length}
          </span>
        </button>

        {/* Category Pills */}
        {CATEGORIES.map((cat) => {
          const count = albums.filter((a) => a.category === cat.value).length;
          if (count === 0) return null;
          const isSelected = categoryFilter === cat.value && statusFilter === "all";

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setCategoryFilter(cat.value);
                setStatusFilter("all");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span>{cat.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk action bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-zinc-900 text-white rounded-2xl flex items-center justify-between shadow-md">
          <span className="text-xs font-bold pl-2">
            {selectedIds.length} album terpilih
          </span>
          <button
            type="button"
            onClick={() => setShowMultiDeleteDialog(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Hapus Terpilih</span>
          </button>
        </div>
      )}

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold bg-bg-well/50">
                <th className="py-3.5 px-4 border-b border-border-default/70 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAlbums.length > 0 &&
                      selectedIds.length === filteredAlbums.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-5 border-b border-border-default/70">Album / Dokumentasi</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Kategori</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Tanggal Acara</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 text-center">Status</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlbums.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data album dokumentasi ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedAlbums.map((album) => (
                  <tr
                    key={album.id}
                    className="border-b border-border-default/40 last:border-b-0 hover:bg-bg-well/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(album.id)}
                        onChange={() => handleSelectRow(album.id)}
                        className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {album.hero_image_url ? (
                          <img
                            src={album.hero_image_url}
                            alt={album.title}
                            className="w-10 h-10 rounded-xl object-cover border border-border-default/50 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-bg-well border border-border-default/50 flex items-center justify-center shrink-0 text-text-muted">
                            <ImageIcon size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-text-primary text-xs truncate block">
                            {album.title}
                          </span>
                          {album.description && (
                            <p className="text-[11px] text-text-secondary truncate max-w-sm">
                              {album.description}
                            </p>
                          )}
                          {album.album_link && (
                            <a
                              href={album.album_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <LinkIcon size={10} /> Google Drive
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-well text-text-secondary border border-border-default/50">
                        {getCategoryLabel(album.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-secondary">
                      {formatDate(album.event_date)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleTogglePublish(album.id, album.is_published, album.title)
                        }
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          album.is_published
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {album.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailAlbum(album)}
                          className="p-1.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Detail"
                        >
                          <Eye size={13} />
                        </button>
                        <Link
                          href={`/admin/galeri/addGallery?id=${album.id}`}
                          className="p-1.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setAlbumToDelete(album)}
                          className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
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
        {paginatedAlbums.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data album dokumentasi.</p>
          </div>
        ) : (
          paginatedAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99] space-y-3"
            >
              {/* Top Row: Category + Published Switch + Date */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-default/40">
                <span className="px-2.5 py-0.5 rounded-full bg-bg-well text-[10px] font-bold uppercase tracking-wider text-text-secondary border border-border-default/50">
                  {getCategoryLabel(album.category)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted font-mono">
                    {formatDate(album.event_date)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePublish(album.id, album.is_published, album.title)
                    }
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                      album.is_published
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {album.is_published ? "Published" : "Draft"}
                  </button>
                </div>
              </div>

              {/* Middle Row: Photo + Info */}
              <div className="flex gap-3 items-start my-1">
                {album.hero_image_url ? (
                  <img
                    src={album.hero_image_url}
                    alt={album.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-border-default/50 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-bg-well border border-border-default/50 flex items-center justify-center shrink-0 text-text-muted">
                    <ImageIcon size={20} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black tracking-tight text-text-primary truncate">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}
                  {album.album_link && (
                    <a
                      href={album.album_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <LinkIcon size={11} /> Google Drive Folder
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Row: Actions */}
              <div className="pt-2.5 border-t border-border-default/40 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setDetailAlbum(album)}
                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                  title="Detail Album"
                >
                  <Eye size={13} />
                </button>
                <Link
                  href={`/admin/galeri/addGallery?id=${album.id}`}
                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                  title="Edit Album"
                >
                  <Edit size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => setAlbumToDelete(album)}
                  className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                  title="Hapus Album"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredAlbums.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="album"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Category Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  categoryFilter !== "all" || statusFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Kategori Galeri"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(categoryFilter !== "all" || statusFilter !== "all") && (
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
                  Filter Galeri
                </span>
                {(categoryFilter !== "all" || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Kategori
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      categoryFilter === "all"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                    }`}
                  >
                    Semua
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategoryFilter(cat.value)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        categoryFilter === cat.value
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Tambah Album */}
          <Link
            href="/admin/galeri/addGallery"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Tambah Album Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah</span>
          </Link>
        </div>
      </div>

      {/* ═══ DETAIL MODAL (Mobile Responsive rounded-none sm:rounded-3xl border-0 sm:border) ═══ */}
      <Dialog open={Boolean(detailAlbum)} onOpenChange={(open) => !open && setDetailAlbum(null)}>
        <DialogContent className="max-w-xl bg-white dark:bg-zinc-950 border-0 sm:border border-border-default p-6 rounded-none sm:rounded-3xl">
          <DialogHeader className="pb-3 border-b border-border-default/60">
            <DialogTitle className="text-base font-black text-text-primary">
              Detail Album Kegiatan
            </DialogTitle>
          </DialogHeader>

          {detailAlbum && (
            <div className="space-y-4 pt-2 text-xs">
              {detailAlbum.hero_image_url && (
                <div className="rounded-2xl overflow-hidden border border-border-default aspect-video max-h-56">
                  <img
                    src={detailAlbum.hero_image_url}
                    alt={detailAlbum.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-bg-well text-[10px] font-bold text-text-secondary border border-border-default/50 uppercase">
                    {getCategoryLabel(detailAlbum.category)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      detailAlbum.is_published
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {detailAlbum.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-text-primary">
                  {detailAlbum.title}
                </h3>
                <p className="text-text-muted font-mono text-[11px] mt-0.5">
                  Tanggal Kegiatan: {formatDate(detailAlbum.event_date)}
                </p>
              </div>

              {detailAlbum.description && (
                <div className="p-3 bg-bg-well/50 rounded-xl border border-border-default/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Deskripsi
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    {detailAlbum.description}
                  </p>
                </div>
              )}

              {detailAlbum.album_link && (
                <div className="pt-2">
                  <a
                    href={detailAlbum.album_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 rounded-xl bg-text-primary text-bg-card hover:opacity-90 flex items-center justify-center gap-2 font-bold text-xs shadow-xs"
                  >
                    <ExternalLink size={14} />
                    <span>Buka Google Drive Folder Dokumentasi</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRM DIALOG (Single) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(albumToDelete)}
        onOpenChange={(open) => !open && setAlbumToDelete(null)}
        title="Hapus Album Dokumentasi"
        description={`Apakah Anda yakin ingin menghapus album "${albumToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmSingleDelete}
      />

      {/* ═══ DELETE CONFIRM DIALOG (Multiple) ═══ */}
      <DeleteConfirmDialog
        isOpen={showMultiDeleteDialog}
        onOpenChange={setShowMultiDeleteDialog}
        title="Hapus Album Terpilih"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} album dokumentasi terpilih secara permanen?`}
        onConfirm={handleConfirmMultiDelete}
      />
    </div>
  );
}
