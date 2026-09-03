"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Phone,
  User,
  Plus,
  Trash2,
  Edit,
  Search,
  ExternalLink,
  AlertCircle,
  X,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { deleteVenueAction } from "@/lib/actions/venue-actions";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  capacity: number;
  contact_wa: string;
  contact_name: string;
  latitude: number;
  longitude: number;
  photo_urls: string[];
  order_index: number;
  created_at: string;
}

interface VenueClientProps {
  initialVenues: Venue[];
  paginationLimit?: number;
}

export default function VenueClient({
  initialVenues,
  paginationLimit = 10,
}: VenueClientProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = paginationLimit && paginationLimit > 0 ? paginationLimit : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter]);

  // Handle Confirm Delete Venue with dual-sync
  const handleConfirmDelete = async () => {
    if (!venueToDelete) return;
    const { id, name } = venueToDelete;
    setVenueToDelete(null);

    startTransition(async () => {
      const res = await deleteVenueAction(id);
      if (res.success) {
        setVenues((prev) => prev.filter((v) => v.id !== id));
        toast.success(`Venue "${name}" berhasil dihapus.`);
      } else {
        toast.error("Gagal menghapus venue: " + res.error);
      }
    });
  };

  // Unique Cities list for filter chips
  const cities = useMemo(() => {
    const set = new Set(venues.map((v) => v.city));
    return Array.from(set).filter(Boolean);
  }, [venues]);

  // Filtered venues dataset
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const query = search.toLowerCase();
      const matchesSearch =
        v.name.toLowerCase().includes(query) ||
        v.address.toLowerCase().includes(query) ||
        v.city.toLowerCase().includes(query);

      const matchesCity = cityFilter === "all" || v.city === cityFilter;

      return matchesSearch && matchesCity;
    });
  }, [venues, search, cityFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredVenues.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(filteredVenues.length, startIndex + limit);
  const paginatedVenues = useMemo(() => {
    return filteredVenues.slice(startIndex, endIndex);
  }, [filteredVenues, startIndex, endIndex]);

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-zinc-800 dark:text-zinc-200">
      {/* ═══ TOP HEADER (Ecomora Modern Monochrome Style) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
            Database Venue (Lokasi Acara)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola daftar lokasi, kafe, auditorium, dan studio untuk kegiatan komunitas.
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
              placeholder="Cari venue atau kota..."
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
            href="/admin/venue/addVenue"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Tambah Venue</span>
          </Link>
        </div>
      </div>

      {/* ═══ SUMMARY STATS (Pola 1: Horizontal Scrollable Capsule Pills) ═══ */}
      <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs">
        {/* Semua Kota */}
        <button
          type="button"
          onClick={() => setCityFilter("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
            cityFilter === "all"
              ? "bg-white dark:bg-zinc-800 text-text-primary shadow-xs border border-border-default/60"
              : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>Semua Kota</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
            {venues.length}
          </span>
        </button>

        {/* Individual City Pills */}
        {cities.map((city) => {
          const count = venues.filter((v) => v.city === city).length;
          const isSelected = cityFilter === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => setCityFilter(city)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span>{city}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-950 text-[10px] font-extrabold font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ 1. DESKTOP VIEW: GRID (hidden on mobile, visible on md/lg) ═══ */}
      <div className="hidden md:block">
        {paginatedVenues.length === 0 ? (
          <div className="bg-bg-card border border-border-default rounded-2xl p-12 text-center">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2.5" />
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Tidak ada venue yang sesuai filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
            {paginatedVenues.map((venue) => {
              const hasPhoto = venue.photo_urls && venue.photo_urls.length > 0;
              const displayPhoto = hasPhoto ? venue.photo_urls[0] : null;

              return (
                <div
                  key={venue.id}
                  className="bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-text-primary/30 transition-all shadow-xs"
                >
                  {/* Photo Header */}
                  <div className="h-40 bg-bg-well border-b border-border-default/60 relative flex items-center justify-center overflow-hidden">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Compass className="w-10 h-10 text-text-muted/50" />
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                      {venue.city}
                    </span>
                  </div>

                  {/* Info Content Area */}
                  <div className="p-4 flex-1 space-y-3">
                    <div>
                      <h3 className="text-sm font-black text-text-primary truncate">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                        {venue.address}
                      </p>
                    </div>

                    {/* Meta items */}
                    <div className="text-[11px] text-text-secondary space-y-1.5 bg-bg-well/50 p-2.5 border border-border-default/45 rounded-xl font-medium">
                      <p className="flex items-center gap-1.5">
                        <Users size={12} className="text-text-muted shrink-0" />
                        <span>Kapasitas:</span>
                        <span className="font-bold text-text-primary font-mono">
                          {venue.capacity} Kursi
                        </span>
                      </p>
                      {venue.contact_name && (
                        <p className="flex items-center gap-1.5 truncate">
                          <User size={12} className="text-text-muted shrink-0" />
                          <span>CP:</span>
                          <span className="font-semibold text-text-primary truncate">
                            {venue.contact_name} ({venue.contact_wa})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-4 pb-4 pt-2 border-t border-border-default/40 flex items-center gap-2">
                    {venue.latitude && venue.longitude ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 rounded-lg border border-border-default hover:bg-bg-well text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-[11px] font-medium"
                        title="Buka Google Maps"
                      >
                        <ExternalLink size={12} />
                        <span>Maps</span>
                      </a>
                    ) : null}

                    <div className="flex-1 flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/venue/addVenue?id=${venue.id}`}
                        className="h-8 px-3 rounded-lg border border-border-default text-xs font-bold hover:bg-bg-well text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Edit Venue"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setVenueToDelete(venue)}
                        className="h-8 w-8 rounded-lg border border-border-default/60 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer"
                        title="Hapus Venue"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ 2. MOBILE VIEW: CARDS (visible on mobile, hidden on md/lg) ═══ */}
      <div className="md:hidden space-y-3.5">
        {paginatedVenues.length === 0 ? (
          <div className="bg-bg-card border border-border-default/70 rounded-3xl p-8 text-center text-text-muted shadow-xs">
            <Compass className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Tidak ada data venue ditemukan.</p>
          </div>
        ) : (
          paginatedVenues.map((venue) => {
            const hasPhoto = venue.photo_urls && venue.photo_urls.length > 0;
            const displayPhoto = hasPhoto ? venue.photo_urls[0] : null;

            return (
              <div
                key={venue.id}
                className="bg-white dark:bg-[#121212] border border-border-default/70 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between active:scale-[0.99] space-y-3"
              >
                {/* Top Row: City Badge & Capacity */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-default/40">
                  <span className="px-2.5 py-0.5 rounded-full bg-bg-well text-[10px] font-bold font-mono text-text-secondary uppercase">
                    {venue.city}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-primary">
                    <Users size={12} className="text-text-muted" />
                    {venue.capacity} Kursi
                  </span>
                </div>

                {/* Middle Row: Photo + Info */}
                <div className="flex gap-3 items-start my-1">
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={venue.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-border-default/50 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-bg-well border border-border-default/50 flex items-center justify-center shrink-0 text-text-muted">
                      <Compass size={20} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black tracking-tight text-text-primary truncate">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {venue.address}
                    </p>
                    {venue.contact_name && (
                      <p className="text-[11px] text-text-muted mt-1 truncate">
                        CP: {venue.contact_name} ({venue.contact_wa})
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="pt-2.5 border-t border-border-default/40 flex items-center justify-between gap-2">
                  <div>
                    {venue.latitude && venue.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0369a1] dark:text-sky-400 hover:underline"
                      >
                        <ExternalLink size={12} />
                        <span>Google Maps</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/admin/venue/addVenue?id=${venue.id}`}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-bg-well text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                      title="Edit Venue"
                    >
                      <Edit size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVenueToDelete(venue)}
                      className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-500/10 text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                      title="Hapus Venue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══ PAGINATION CONTROLS (Reusable AdminPagination Component) ═══ */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredVenues.length}
        startIndex={startIndex}
        endIndex={endIndex}
        limit={limit}
        itemLabel="venue"
        onPageChange={setCurrentPage}
      />

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* City Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer relative ${
                  cityFilter !== "all" ? "text-white bg-zinc-800" : ""
                }`}
                title="Filter Kota"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {cityFilter !== "all" && (
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
                  Filter Kota Venue
                </span>
                {cityFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setCityFilter("all")}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCityFilter("all")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    cityFilter === "all"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                  }`}
                >
                  Semua ({venues.length})
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setCityFilter(city)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      cityFilter === city
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-bg-well text-text-secondary hover:text-text-primary border border-border-default/60"
                    }`}
                  >
                    {city} ({venues.filter((v) => v.city === city).length})
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Action: Tambah Venue */}
          <Link
            href="/admin/venue/addVenue"
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Tambah Venue Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah</span>
          </Link>
        </div>
      </div>

      {/* ═══ DELETE CONFIRM DIALOG (Kustom Tanpa window.confirm) ═══ */}
      <DeleteConfirmDialog
        isOpen={Boolean(venueToDelete)}
        onOpenChange={(open) => !open && setVenueToDelete(null)}
        title="Hapus Venue"
        description={`Apakah Anda yakin ingin menghapus venue "${venueToDelete?.name}"? Data venue ini akan dihapus secara permanen.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
