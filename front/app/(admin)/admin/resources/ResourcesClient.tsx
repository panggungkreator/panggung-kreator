"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  XCircle,
  Search,
  CheckCircle,
  RotateCcw,
  Loader,
  AlertCircle,
  FileDown,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

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
}

const categoryLabels: Record<string, string> = {
  materi: "Materi / E-Book",
  rekaman: "Rekaman Video/Audio",
  template: "Template / Assets",
  referensi: "Referensi / Link",
  lainnya: "Lainnya"
};

export default function ResourcesClient({
  initialResources,
}: ResourcesClientProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  // Filtering states
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("any");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatFileSize = (kb: number) => {
    if (kb >= 1024) {
      return (kb / 1024).toFixed(1) + " MB";
    }
    return kb.toFixed(0) + " KB";
  };

  // Unique categories list for filters
  const categories = useMemo(() => {
    const set = new Set(resources.map(r => r.category));
    return Array.from(set).filter(Boolean);
  }, [resources]);

  // Refresh client resource data
  const refreshResources = async () => {
    try {
      const supabase = createClient();
      const { data: rawResources } = await supabase
        .from("resources")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (rawResources) {
        const formatted = rawResources.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description || "",
          file_url: r.file_url,
          file_type: r.file_type || "",
          file_size_kb: r.file_size_kb || 0,
          package_tier: r.package_tier || "all",
          category: r.category || "General",
          is_published: r.is_published ?? false,
          order_index: r.order_index || 0,
          uploaded_by: r.uploaded_by,
          created_at: r.created_at,
        }));
        setResources(formatted);
      }
    } catch (err) {
      console.error("Gagal menyegarkan materi:", err);
    }
  };

  // Toggle Publish Inline
  const handleTogglePublish = async (resourceId: string, currentStatus: boolean, title: string) => {
    const nextStatus = !currentStatus;
    const confirmation = window.confirm(
      `Ubah status publish "${title}" menjadi ${nextStatus ? "PUBLISHED" : "DRAFT"}?`
    );
    if (!confirmation) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("resources")
        .update({ is_published: nextStatus })
        .eq("id", resourceId);

      if (error) {
        toast.error("Gagal mengubah status: " + error.message);
      } else {
        toast.success(`Status publish "${title}" berhasil diperbarui!`);
        setResources(prev =>
          prev.map(r => (r.id === resourceId ? { ...r, is_published: nextStatus } : r))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan: " + (err.message || err));
    }
  };

  // Handle Delete Resource
  // Trigger Delete Resource Modal
  const handleDeleteResource = (res: Resource) => {
    setResourceToDelete(res);
  };

  // Handle Confirm Delete Resource
  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    const res = resourceToDelete;
    setResourceToDelete(null);

    try {
      const supabase = createClient();

      // Extract file path from file_url
      // Example url: https://.../storage/v1/object/public/resources/files/filename.pdf
      const urlParts = res.file_url.split("/resources/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from("resources")
          .remove([filePath]);
        if (storageError) {
          console.warn("File storage removal warning:", storageError.message);
        }
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from("resources")
        .delete()
        .eq("id", res.id);

      if (dbError) throw new Error(dbError.message);

      toast.success("Materi berhasil dihapus secara permanen!");
      await refreshResources();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus: " + err.message);
    }
  };

  // Filtered dataset
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());

      const matchesTier =
        tierFilter === "any" || r.package_tier === tierFilter;

      const matchesCategory =
        categoryFilter === "all" || r.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && r.is_published) ||
        (statusFilter === "draft" && !r.is_published);

      return matchesSearch && matchesTier && matchesCategory && matchesStatus;
    });
  }, [resources, search, tierFilter, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header (Ecomora Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ AKADEMI ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Resources & Materi Akademi
          </h1>
        </div>
        <div>
          <Link
            href="/admin/resources/addResource"
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Plus size={14} />
            Upload Resource Baru
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl py-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Tier Filter */}
          <div className="relative">
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Tier Paket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Semua Tier Paket</SelectItem>
                <SelectItem value="all">Free</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="mvp">MVP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c, i) => (
                  <SelectItem key={i} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          {/* Status Filter */}
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Grid Boxed Table of Resources */}
      <div className="bg-bg-card border border-border-default rounded-2xl ">
        {/* <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-default/45">
          <span className="text-xs font-bold text-text-primary">
            DAFTAR BERKAS MATERI AKADEMI ({filteredResources.length})
          </span>
        </div> */}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Judul & Berkas</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Kategori</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Tier Paket</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Ukuran</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Status Publish</th>
                <th className="py-4 px-6 border-b border-r border-border-default last:border-r-0 bg-bg-well/40">Tanggal Upload</th>
                <th className="py-4 px-6 border-b border-border-default last:border-r-0 bg-bg-well/40 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data berkas materi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res, index) => {
                  const isLastRow = index === filteredResources.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-bg-well/30 transition-colors group"
                    >
                      <td className={`${cellBorderClass} font-bold text-text-primary`}>
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-text-secondary shrink-0" />
                          <span className="truncate max-w-[200px]" title={res.title}>
                            {res.title}
                          </span>
                        </div>
                        {res.description && (
                          <span className="block text-[10px] font-medium text-text-secondary mt-0.5 max-w-[240px] truncate">
                            {res.description}
                          </span>
                        )}
                      </td>
                      <td className={`${cellBorderClass} font-semibold text-text-primary`}>
                        {categoryLabels[res.category] || res.category}
                      </td>
                      <td className={cellBorderClass}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block uppercase ${res.package_tier === "mvp"
                          ? "bg-amber-100 text-amber-600 border border-amber-200/20"
                          : res.package_tier === "regular"
                            ? "bg-[#EEF0FF] text-[#5B67D8]"
                            : "bg-neutral-100 text-neutral-500"
                          }`}>
                          {res.package_tier}
                        </span>
                      </td>
                      <td className={`${cellBorderClass} text-text-secondary font-medium`}>
                        {formatFileSize(res.file_size_kb)}
                        <span className="block text-[10px] text-text-secondary mt-0.5 uppercase">
                          {res.file_type}
                        </span>
                      </td>
                      <td className={cellBorderClass}>
                        <button
                          onClick={() => handleTogglePublish(res.id, res.is_published, res.title)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${res.is_published
                            ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] border-emerald-200/20"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-zinc-200/30"
                            }`}
                        >
                          {res.is_published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className={`${cellBorderClass} text-text-secondary`}>
                        {formatDate(res.created_at)}
                      </td>
                      <td className={cellBorderClass}>
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#0369a1] hover:text-sky-700 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg cursor-pointer flex items-center justify-center"
                            title="Unduh / Buka Berkas"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/admin/resources/addResource?id=${res.id}`}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-lg cursor-pointer flex items-center justify-center"
                            title="Edit Info"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteResource(res)}
                            className="p-1.5 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
        title="Hapus Materi Belajar"
        description={
          <>
            Apakah Anda yakin ingin menghapus materi &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">{resourceToDelete?.title}</span>&rdquo; secara permanen?
            <p className="mt-2 text-xs text-zinc-455 dark:text-zinc-500 font-bold">
              File asli di storage juga akan dibersihkan secara otomatis.
            </p>
          </>
        }
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
