"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Briefcase,
  Globe,
  User,
  Phone,
  Plus,
  Trash2,
  Edit,
  Search,
  AlertCircle,
  X,
  Star,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

function InstagramIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  deletePartnerAction,
  togglePartnerFeaturedAction,
  togglePartnerActiveAction,
  updatePartnersOrderAction,
} from "@/lib/actions/partner-actions";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  type: string;
  logo_url: string;
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
  paginationLimit?: number;
}

const PARTNER_TYPES = [
  { value: "kafe", label: "Kafe / Venue" },
  { value: "kampus", label: "Kampus / Sekolah" },
  { value: "brand", label: "Brand / Bisnis" },
  { value: "media", label: "Media Partner" },
  { value: "sponsor", label: "Sponsor" },
  { value: "lainnya", label: "Lainnya" },
];

export default function PartnerClient({
  initialPartners,
  paginationLimit = 10,
}: PartnerClientProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [partnerDetail, setPartnerDetail] = useState<Partner | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeLabel = (type: string) => {
    const found = PARTNER_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  // Toggle Featured Inline
  const handleToggleFeatured = (partnerId: string, currentStatus: boolean, name: string) => {
    startTransition(async () => {
      const res = await togglePartnerFeaturedAction(partnerId, currentStatus);
      if (res.success) {
        setPartners((prev) =>
          prev.map((p) => (p.id === partnerId ? { ...p, is_featured: !currentStatus } : p))
        );
        toast.success(`Status rekomendasi "${name}" berhasil diperbarui!`);
      } else {
        toast.error("Gagal mengubah rekomendasi: " + res.error);
      }
    });
  };

  // Toggle Active Inline
  const handleToggleActive = (partnerId: string, currentStatus: boolean, name: string) => {
    startTransition(async () => {
      const res = await togglePartnerActiveAction(partnerId, currentStatus);
      if (res.success) {
        setPartners((prev) =>
          prev.map((p) => (p.id === partnerId ? { ...p, is_active: !currentStatus } : p))
        );
        toast.success(`Status aktif "${name}" berhasil diubah.`);
      } else {
        toast.error("Gagal mengubah status aktif: " + res.error);
      }
    });
  };

  // Move Order Up/Down
  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredPartners.length) return;

    const reordered = [...filteredPartners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const payload = reordered.map((p, idx) => ({
      id: p.id,
      order_index: idx + 1,
    }));

    setPartners((prev) => {
      const copy = [...prev];
      payload.forEach((item) => {
        const found = copy.find((c) => c.id === item.id);
        if (found) found.order_index = item.order_index;
      });
      return copy.sort((a, b) => a.order_index - b.order_index);
    });

    startTransition(async () => {
      await updatePartnersOrderAction(payload);
    });
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!partnerToDelete) return;
    const { id, name } = partnerToDelete;
    setPartnerToDelete(null);

    startTransition(async () => {
      const res = await deletePartnerAction(id);
      if (res.success) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
        toast.success(`Partner "${name}" berhasil dihapus.`);
      } else {
        toast.error("Gagal menghapus partner: " + res.error);
      }
    });
  };

  // Filtered dataset
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const query = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.contact_person.toLowerCase().includes(query);

      const matchesType = typeFilter === "all" || p.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.is_active) ||
        (statusFilter === "inactive" && !p.is_active) ||
        (statusFilter === "featured" && p.is_featured);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [partners, search, typeFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredPartners.length, startIndex + limit);
  const paginatedPartners = useMemo(() => {
    return filteredPartners.slice(startIndex, endIndex);
  }, [filteredPartners, startIndex, endIndex]);

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Partner & Kolaborator
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola kemitraan strategis dengan kafe, kampus, brand, dan sponsor komunitas.
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
              placeholder="Cari partner, kontak..."
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
            href="/admin/partner/addPartner"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Tambah Partner</span>
          </Link>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua Partner */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setTypeFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "all" && typeFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Partner</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {partners.length}
          </span>
        </button>

        {/* Status Aktif */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("active");
            setTypeFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "active"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Aktif</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {partners.filter((p) => p.is_active).length}
          </span>
        </button>

        {/* Featured */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("featured");
            setTypeFilter("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            statusFilter === "featured"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <Star size={12} className="fill-current" />
          <span>Featured</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {partners.filter((p) => p.is_featured).length}
          </span>
        </button>

        {/* Type pills */}
        {PARTNER_TYPES.map((t) => {
          const count = partners.filter((p) => p.type === t.value).length;
          if (count === 0) return null;
          const isSelected = typeFilter === t.value && statusFilter === "all";
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTypeFilter(t.value);
                setStatusFilter("all");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span>{t.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ 1. DESKTOP VIEW: TABLE (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold bg-bg-well/50">
                <th className="py-3.5 px-4 border-b border-border-default/70 w-16 text-center">Urutan</th>
                <th className="py-3.5 px-5 border-b border-border-default/70">Partner</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Tipe</th>
                <th className="py-3.5 px-4 border-b border-border-default/70">Kontak CP</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 text-center">Featured</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 text-center">Status</th>
                <th className="py-3.5 px-4 border-b border-border-default/70 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted font-semibold">
                    Tidak ada data partner ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((p, index) => {
                  const globalIdx = startIndex + index;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border-default/40 last:border-b-0 hover:bg-bg-well/30 transition-colors"
                    >
                      {/* Urutan Up/Down */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(globalIdx, "up")}
                            disabled={globalIdx === 0}
                            className="p-1 rounded hover:bg-bg-well text-text-secondary disabled:opacity-20 cursor-pointer"
                            title="Naikkan urutan"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <span className="font-mono text-[10px] text-text-muted font-bold">
                            {p.order_index}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(globalIdx, "down")}
                            disabled={globalIdx === filteredPartners.length - 1}
                            className="p-1 rounded hover:bg-bg-well text-text-secondary disabled:opacity-20 cursor-pointer"
                            title="Turunkan urutan"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Partner Name & Logo */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          {p.logo_url ? (
                            <img
                              src={p.logo_url}
                              alt={p.name}
                              className="w-9 h-9 rounded-xl object-cover border border-border-default/50 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-bg-well border border-border-default/50 flex items-center justify-center shrink-0 text-text-muted font-bold text-xs">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-text-primary text-xs truncate block">
                              {p.name}
                            </span>
                            {p.description && (
                              <p className="text-[11px] text-text-secondary truncate max-w-xs">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-well text-text-secondary border border-border-default/50">
                          {getTypeLabel(p.type)}
                        </span>
                      </td>

                      {/* Kontak CP */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <p className="font-semibold text-text-primary">
                            {p.contact_person || "-"}
                          </p>
                          {p.contact_wa && (
                            <p className="text-text-muted font-mono">{p.contact_wa}</p>
                          )}
                        </div>
                      </td>

                      {/* Featured */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p.id, p.is_featured, p.name)}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            p.is_featured
                              ? "text-amber-500 hover:text-amber-600 bg-amber-500/10"
                              : "text-zinc-300 hover:text-zinc-400 dark:text-zinc-700"
                          }`}
                          title={p.is_featured ? "Hapus dari rekomendasi" : "Jadikan rekomendasi"}
                        >
                          <Star size={15} className={p.is_featured ? "fill-amber-500" : ""} />
                        </button>
                      </td>

                      {/* Status Aktif */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            p.is_active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                          }`}
                        >
                          {p.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPartnerDetail(p)}
                            className="p-1.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Detail Partner"
                          >
                            <Eye size={13} />
                          </button>
                          <Link
                            href={`/admin/partner/addPartner?id=${p.id}`}
                            className="p-1.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Edit Partner"
                          >
                            <Edit size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPartnerToDelete(p)}
                            className="p-1.5 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Hapus Partner"
                          >
                            <Trash2 size={13} />
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

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-3.5">
        {paginatedPartners.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data partner ditemukan.</p>
          </div>
        ) : (
          paginatedPartners.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99] space-y-3"
            >
              {/* Top Row: Type Pill + Featured + Status */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-default/40">
                <span className="px-2.5 py-0.5 rounded-full bg-bg-well text-[10px] font-bold uppercase tracking-wider text-text-secondary border border-border-default/50">
                  {getTypeLabel(p.type)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(p.id, p.is_featured, p.name)}
                    className="p-1 text-amber-500 cursor-pointer"
                    title="Featured"
                  >
                    <Star size={14} className={p.is_featured ? "fill-amber-500" : "text-zinc-300"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                      p.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                    }`}
                  >
                    {p.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
              </div>

              {/* Middle Row: Logo + Info */}
              <div className="flex gap-3 items-start my-1">
                {p.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-border-default/50 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-bg-well border border-border-default/50 flex items-center justify-center shrink-0 text-text-muted font-bold text-sm">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black tracking-tight text-text-primary truncate">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  {p.contact_person && (
                    <p className="text-[11px] text-text-muted mt-1 truncate">
                      CP: <span className="font-semibold text-text-primary">{p.contact_person}</span>{" "}
                      {p.contact_wa && `(${p.contact_wa})`}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Row: Social links & Actions */}
              <div className="pt-2.5 border-t border-border-default/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {p.website_url && (
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary"
                      title="Website"
                    >
                      <Globe size={13} />
                    </a>
                  )}
                  {p.instagram_url && (
                    <a
                      href={p.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary"
                      title="Instagram"
                    >
                      <InstagramIcon size={13} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPartnerDetail(p)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                    title="Detail Partner"
                  >
                    <Eye size={13} />
                  </button>
                  <Link
                    href={`/admin/partner/addPartner?id=${p.id}`}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                    title="Edit Partner"
                  >
                    <Edit size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPartnerToDelete(p)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                    title="Hapus Partner"
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
        totalItems={filteredPartners.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="partner"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Type Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  typeFilter !== "all" || statusFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Partner"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(typeFilter !== "all" || statusFilter !== "all") && (
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
                  Filter Partner
                </span>
                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("all");
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
                    onClick={() => setTypeFilter("all")}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      typeFilter === "all"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                    }`}
                  >
                    Semua
                  </button>
                  {PARTNER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTypeFilter(t.value)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        typeFilter === t.value
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Tambah Partner */}
          <Link
            href="/admin/partner/addPartner"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Tambah Partner Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah</span>
          </Link>
        </div>
      </div>

      {/* ═══ DETAIL MODAL (Mobile Responsive rounded-none sm:rounded-3xl border-0 sm:border) ═══ */}
      <Dialog open={Boolean(partnerDetail)} onOpenChange={(open) => !open && setPartnerDetail(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-zinc-950 border-0 sm:border border-border-default p-6 rounded-none sm:rounded-3xl">
          <DialogHeader className="pb-3 border-b border-border-default/60">
            <DialogTitle className="text-base font-black text-text-primary">
              Detail Partner & Kolaborator
            </DialogTitle>
          </DialogHeader>

          {partnerDetail && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center gap-3">
                {partnerDetail.logo_url ? (
                  <img
                    src={partnerDetail.logo_url}
                    alt={partnerDetail.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-border-default/50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-bg-well border border-border-default/50 flex items-center justify-center text-text-muted font-bold text-lg">
                    {partnerDetail.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-sm text-text-primary">
                    {partnerDetail.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-bg-well text-[10px] font-bold text-text-secondary border border-border-default/50 uppercase">
                      {getTypeLabel(partnerDetail.type)}
                    </span>
                    {partnerDetail.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold flex items-center gap-1">
                        <Star size={10} className="fill-current" /> Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {partnerDetail.description && (
                <div className="p-3 bg-bg-well/50 rounded-xl border border-border-default/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Deskripsi
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    {partnerDetail.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-well/50 rounded-xl border border-border-default/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Contact Person
                  </span>
                  <p className="font-semibold text-text-primary">
                    {partnerDetail.contact_person || "-"}
                  </p>
                  <p className="text-text-muted font-mono text-[11px]">
                    {partnerDetail.contact_wa || "-"}
                  </p>
                </div>

                <div className="p-3 bg-bg-well/50 rounded-xl border border-border-default/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Kemitraan Sejak
                  </span>
                  <p className="font-semibold text-text-primary">
                    {formatDate(partnerDetail.partnership_since)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {partnerDetail.website_url && (
                  <a
                    href={partnerDetail.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-xl border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 font-bold text-[11px]"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                  </a>
                )}
                {partnerDetail.instagram_url && (
                  <a
                    href={partnerDetail.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-xl border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 font-bold text-[11px]"
                  >
                    <InstagramIcon size={13} />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRM DIALOG (Kustom Tanpa window.confirm) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(partnerToDelete)}
        onOpenChange={(open) => !open && setPartnerToDelete(null)}
        title="Hapus Partner"
        description={`Apakah Anda yakin ingin menghapus partner "${partnerToDelete?.name}"? Data partner ini akan dihapus secara permanen.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
