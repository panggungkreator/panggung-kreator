"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Briefcase,
  Globe,
  Link2,
  User,
  Phone,
  Plus,
  Trash2,
  Edit,
  Search,
  ChevronDown,
  AlertCircle,
  RotateCcw,
  Loader,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Star,
  Eye
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

interface Partner {
  id: string;
  name: string;
  type: string;
  website_url: string;
  instagram_url: string;
  contact_person: string;
  contact_wa: string;
  description: string;
  partnership_since: string;
  is_active: boolean;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

interface PartnerClientProps {
  initialPartners: Partner[];
}

export default function PartnerClient({ initialPartners }: PartnerClientProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [partnerDetail, setPartnerDetail] = useState<Partner | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const refreshPartners = async () => {
    try {
      const supabase = createClient();
      const { data: raw } = await supabase
        .from("partners")
        .select("*")
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });

      if (raw) {
        const formatted = raw.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type || "kafe",
          website_url: p.website_url || "",
          instagram_url: p.instagram_url || "",
          contact_person: p.contact_person || "",
          contact_wa: p.contact_wa || "",
          description: p.description || "",
          partnership_since: p.partnership_since || "",
          is_active: p.is_active ?? true,
          is_featured: p.is_featured ?? false,
          order_index: p.order_index || 0,
          created_at: p.created_at,
        }));
        setPartners(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Featured Inline
  const handleToggleFeatured = async (partnerId: string, currentStatus: boolean, name: string) => {
    try {
      const supabase = createClient();
      const next = !currentStatus;
      const { error } = await supabase
        .from("partners")
        .update({ is_featured: next })
        .eq("id", partnerId);

      if (error) {
        toast.error("Gagal memperbarui rekomendasi: " + error.message);
      } else {
        toast.success(`Status rekomendasi "${name}" berhasil diperbarui!`);
        setPartners(prev =>
          prev.map(p => (p.id === partnerId ? { ...p, is_featured: next } : p))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan: " + (err.message || err));
    }
  };

  // Toggle Active Inline
  const handleToggleActive = async (partnerId: string, currentStatus: boolean, name: string) => {
    try {
      const supabase = createClient();
      const next = !currentStatus;
      const { error } = await supabase
        .from("partners")
        .update({ is_active: next })
        .eq("id", partnerId);

      if (error) {
        toast.error("Gagal memperbarui status keaktifan: " + error.message);
      } else {
        toast.success(`Status keaktifan "${name}" berhasil diperbarui!`);
        setPartners(prev =>
          prev.map(p => (p.id === partnerId ? { ...p, is_active: next } : p))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan: " + (err.message || err));
    }
  };

  // Move Order Index (Re-ordering tool)
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredPartners.length) return;

    const currentItem = filteredPartners[index];
    const neighborItem = filteredPartners[targetIdx];

    try {
      const supabase = createClient();

      // Swap order indices in Supabase
      const { error: err1 } = await supabase
        .from("partners")
        .update({ order_index: neighborItem.order_index })
        .eq("id", currentItem.id);

      const { error: err2 } = await supabase
        .from("partners")
        .update({ order_index: currentItem.order_index })
        .eq("id", neighborItem.id);

      if (err1 || err2) throw new Error("Gagal mengurutkan.");

      await refreshPartners();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // Trigger Delete Partner Modal
  const handleDeletePartner = (partner: Partner) => {
    setPartnerToDelete(partner);
  };

  // Handle Confirm Delete Partner
  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    const partner = partnerToDelete;
    setPartnerToDelete(null);

    try {
      const supabase = createClient();



      // Delete DB record
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", partner.id);

      if (error) throw new Error(error.message);

      toast.success("Partner berhasil dihapus secara permanen!");
      await refreshPartners();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus partner: " + err.message);
    }
  };

  // Filtered dataset
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || p.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.is_active) ||
        (statusFilter === "inactive" && !p.is_active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [partners, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Partner & Kolaborator
          </h1>
        </div>
        <div>
          <Link
            href="/admin/partner/addPartner"
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Plus size={14} />
            Tambah Partner Baru
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="py-5 space-y-4">
        <div className="flex gap-4">

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari partner..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Partner</SelectItem>
                <SelectItem value="kafe">Kafe</SelectItem>
                <SelectItem value="kampus">Kampus / Sekolah</SelectItem>
                <SelectItem value="brand">Brand / Bisnis</SelectItem>
                <SelectItem value="media">Media Partner</SelectItem>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Grid Boxed Table of Partners */}
      <div className="bg-bg-card border border-border-default rounded-2xl">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold">
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50 text-center">Urutan</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Nama</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Tipe</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Kontak Person</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">WhatsApp</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Sosmed & Web</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Featured</th>
                <th className="py-4 px-6 border-b border-r border-border-default/70 bg-bg-well/50">Status Aktif</th>
                <th className="py-4 px-6 border-b border-border-default/70 bg-bg-well/50 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data partner ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p, index) => {
                  const isLastRow = index === filteredPartners.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-r border-border-default/30 last:border-r-0 py-4 px-6`;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-bg-well/30 transition-colors group"
                    >
                      {/* Order Controls */}
                      <td className={cellBorderClass}>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleMoveOrder(index, "up")}
                            disabled={index === 0}
                            className="p-1 border border-border-default rounded hover:bg-bg-well text-text-secondary disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <span className="font-bold text-[10px] text-text-primary">#{p.order_index}</span>
                          <button
                            onClick={() => handleMoveOrder(index, "down")}
                            disabled={index === filteredPartners.length - 1}
                            className="p-1 border border-border-default rounded hover:bg-bg-well text-text-secondary disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Name */}
                      <td className={cellBorderClass}>
                        <div className="flex items-center gap-3">
                          <div>
                            <button
                              onClick={() => setPartnerDetail(p)}
                              className="font-bold text-text-primary hover:underline block text-sm leading-tight text-left cursor-pointer"
                            >
                              {p.name}
                            </button>
                            {p.description && (
                              <span className="block text-[10px] text-text-secondary font-medium mt-0.5 max-w-[160px] truncate" title={p.description}>
                                {p.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className={cellBorderClass}>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block uppercase bg-bg-well border border-border-default text-text-secondary">
                          {p.type.replace("_", " ")}
                        </span>
                      </td>

                      {/* Contact Person */}
                      <td className={`${cellBorderClass} font-semibold text-text-primary`}>
                        {p.contact_person || "-"}
                      </td>

                      {/* WhatsApp */}
                      <td className={`${cellBorderClass} text-text-secondary font-medium`}>
                        {p.contact_wa || "-"}
                      </td>

                      {/* Web links */}
                      <td className={cellBorderClass}>
                        <div className="flex gap-2">
                          {p.website_url && (
                            <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-border-default hover:bg-bg-well rounded text-text-secondary hover:text-text-primary">
                              <Globe size={13} />
                            </a>
                          )}
                          {p.instagram_url && (
                            <a href={`https://instagram.com/${p.instagram_url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-border-default hover:bg-bg-well rounded text-text-secondary hover:text-text-primary">
                              <Link2 size={13} />
                            </a>
                          )}
                          {!p.website_url && !p.instagram_url && <span className="text-text-muted">-</span>}
                        </div>
                      </td>

                      {/* Featured Star toggle */}
                      <td className={cellBorderClass}>
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.is_featured, p.name)}
                          className={`p-1.5 border rounded-lg cursor-pointer ${p.is_featured
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                            : "border-border-default text-text-muted hover:text-text-secondary"
                            }`}
                          title="Tandai Unggulan (Featured)"
                        >
                          <Star size={13} className={p.is_featured ? "fill-current" : ""} />
                        </button>
                      </td>

                      {/* Active Status toggle */}
                      <td className={cellBorderClass}>
                        <button
                          onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${p.is_active
                            ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] border-emerald-200/20"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-zinc-200/30"
                            }`}
                        >
                          {p.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>

                      <td className={cellBorderClass}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPartnerDetail(p)}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-lg cursor-pointer flex items-center justify-center"
                            title="Detail Partner"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/partner/addPartner?id=${p.id}`}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-lg cursor-pointer flex items-center justify-center"
                            title="Edit Partner"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePartner(p)}
                            className="p-1.5 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg cursor-pointer"
                            title="Hapus Partner"
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
        isOpen={!!partnerToDelete}
        onOpenChange={(open) => !open && setPartnerToDelete(null)}
        title="Hapus Partner"
        description={
          <>
            Apakah Anda yakin ingin menghapus partner &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">{partnerToDelete?.name}</span>&rdquo; secara permanen?
            <p className="mt-2 text-xs text-zinc-455 dark:text-zinc-500 font-bold">
              File logo partner di storage juga akan dibersihkan secara otomatis.
            </p>
          </>
        }
        onConfirm={handleConfirmDelete}
      />

      {/* Partner Detail Dialog */}
      <Dialog open={!!partnerDetail} onOpenChange={(open) => !open && setPartnerDetail(null)}>
        <DialogContent className="max-w-md sm:max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-zinc-800 dark:text-zinc-200 shadow-2xl">
          <DialogHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 h-6 flex items-center rounded-full text-zinc-500 dark:text-zinc-400 font-mono">
                Detail Partner
              </span>
              {partnerDetail?.is_featured && (
                <span className="px-2.5 h-6 flex items-center rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-widest gap-1">
                  <Star size={10} className="fill-current" />
                  Featured
                </span>
              )}
              <span className={`px-2.5 h-6 flex items-center rounded-full text-[9px] font-black uppercase tracking-widest border ${partnerDetail?.is_active
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-500/10 border-zinc-500/30 text-zinc-500"
                }`}>
                {partnerDetail?.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white mt-3 uppercase tracking-wider font-title leading-tight">
              {partnerDetail?.name}
            </DialogTitle>
          </DialogHeader>

          {partnerDetail && (
            <div className="space-y-5">

              {/* Deskripsi */}
              {partnerDetail.description ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Deskripsi</span>
                  <p className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {partnerDetail.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">Tidak ada deskripsi untuk partner ini.</p>
              )}
              {/* Kategori Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-zinc-900 dark:bg-yellow-100 text-white dark:text-zinc-900 uppercase tracking-widest">
                  {partnerDetail.type.replace("_", " ")}
                </span>
              </div>
              {/* Kontak Person Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Kontak Person</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>{partnerDetail.contact_person || "-"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">WhatsApp</span>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span>{partnerDetail.contact_wa || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Sosial Media & Tautan Section */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tautan & Sosial Media</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Website */}
                  {partnerDetail.website_url ? (
                    <a
                      href={partnerDetail.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold text-zinc-700 dark:text-zinc-350"
                    >
                      <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="truncate">{partnerDetail.website_url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-semibold text-zinc-400 italic">
                      <Globe className="w-4 h-4 text-zinc-300 shrink-0" />
                      <span>Website tidak ada</span>
                    </div>
                  )}

                  {/* Instagram */}
                  {partnerDetail.instagram_url ? (
                    <a
                      href={`https://instagram.com/${partnerDetail.instagram_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold text-zinc-700 dark:text-zinc-350 font-mono"
                    >
                      <Link2 className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>@{partnerDetail.instagram_url}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-semibold text-zinc-400 italic">
                      <Link2 className="w-4 h-4 text-zinc-300 shrink-0" />
                      <span>Instagram tidak ada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400 font-semibold font-mono">
                <span>Dibuat: {formatDate(partnerDetail.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
