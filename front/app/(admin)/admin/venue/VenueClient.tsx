"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  ChevronDown,
  AlertCircle,
  RotateCcw,
  Loader,
  CheckCircle,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Compass
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  capacity: number;
  contact_wa: string;
  contact_name: string;
  maps_url: string;
  photo_urls: string[];
  amenities: string[];
  pros: string[];
  cons: string[];
  last_used_at: string | null;
  internal_notes: string;
  is_recommended: boolean;
  order_index: number;
  created_at: string;
}

interface VenueClientProps {
  initialVenues: Venue[];
}

export default function VenueClient({ initialVenues }: VenueClientProps) {
  const [venues, setVenues] = useState<Venue[]>(() => {
    if (initialVenues && initialVenues.length > 0) {
      return initialVenues;
    }
    return [
      {
        id: "dummy-1",
        name: "Panggung Kreator Space",
        address: "Jl. Sudirman No. 12, Senayan",
        city: "Jakarta",
        description: "Ruang serbaguna premium yang sangat cocok untuk acara public speaking, workshop, dan gathering komunitas.",
        capacity: 150,
        contact_name: "Budi Santoso",
        contact_wa: "081234567890",
        maps_url: "https://maps.google.com",
        photo_urls: [],
        amenities: ["AC", "Sound System", "Stage", "High-speed Wifi", "Projector"],
        pros: ["Lokasi strategis", "Fasilitas audio sangat lengkap"],
        cons: ["Parkir terbatas pada jam kerja"],
        last_used_at: null,
        internal_notes: "Hubungi H-7 sebelum acara.",
        is_recommended: true,
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: "dummy-2",
        name: "BTB Auditorium Bandung",
        address: "Jl. Dago No. 45, Coblong",
        city: "Bandung",
        description: "Auditorium luas dengan akustik ruangan terbaik, cocok untuk seminar skala besar dan pertunjukan seni.",
        capacity: 300,
        contact_name: "Ani Wijaya",
        contact_wa: "089876543210",
        maps_url: "https://maps.google.com",
        photo_urls: [],
        amenities: ["AC", "Premium Acoustics", "Backstage Room", "Widescreen Projector"],
        pros: ["Kapasitas besar", "Akustik kelas dunia"],
        cons: ["Biaya sewa relatif tinggi"],
        last_used_at: null,
        internal_notes: "Ada diskon khusus untuk komunitas non-profit.",
        is_recommended: true,
        order_index: 2,
        created_at: new Date().toISOString()
      },
      {
        id: "dummy-3",
        name: "Kreatif Hub Studio",
        address: "Jl. Tunjungan No. 88",
        city: "Surabaya",
        description: "Studio bernuansa industrial modern yang ramah bagi para kreator konten dan komunitas kreatif lokal.",
        capacity: 50,
        contact_name: "Joko Susilo",
        contact_wa: "085678901234",
        maps_url: "https://maps.google.com",
        photo_urls: [],
        amenities: ["AC", "Studio Lighting", "Podcast Equipment", "Coffee Bar"],
        pros: ["Desain sangat estetik", "Peralatan podcast lengkap"],
        cons: ["Kapasitas terbatas"],
        last_used_at: null,
        internal_notes: "Sangat cocok untuk acara kolaborasi intim.",
        is_recommended: false,
        order_index: 3,
        created_at: new Date().toISOString()
      }
    ];
  });
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  // Filtering states
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [recommendFilter, setRecommendFilter] = useState("all");

  // Helper to re-fetch venues
  const refreshVenues = async () => {
    try {
      const supabase = createClient();
      const { data: rawVenues } = await supabase
        .from("venues")
        .select("*")
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });

      if (rawVenues) {
        const formatted = rawVenues.map((v: any) => ({
          id: v.id,
          name: v.name,
          address: v.address || "",
          city: v.city || "",
          description: v.description || "",
          capacity: v.capacity || 0,
          contact_wa: v.contact_wa || "",
          contact_name: v.contact_name || "",
          maps_url: v.maps_url || "",
          photo_urls: Array.isArray(v.photo_urls) ? v.photo_urls : [],
          amenities: Array.isArray(v.amenities) ? v.amenities : [],
          pros: Array.isArray(v.pros) ? v.pros : [],
          cons: Array.isArray(v.cons) ? v.cons : [],
          last_used_at: v.last_used_at,
          internal_notes: v.internal_notes || "",
          is_recommended: v.is_recommended ?? false,
          order_index: v.order_index || 0,
          created_at: v.created_at,
        }));
        setVenues(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Delete Venue
  // Trigger Delete Venue Modal
  const handleDeleteVenue = (venue: Venue) => {
    setVenueToDelete(venue);
  };

  // Handle Confirm Delete Venue
  const handleConfirmDelete = async () => {
    if (!venueToDelete) return;
    const venue = venueToDelete;
    setVenueToDelete(null);

    try {
      const supabase = createClient();

      // Delete files from storage
      if (venue.photo_urls && venue.photo_urls.length > 0) {
        const filePaths = venue.photo_urls.map(url => {
          const parts = url.split("/venues/");
          return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean) as string[];

        if (filePaths.length > 0) {
          await supabase.storage.from("venues").remove(filePaths);
        }
      }

      // Delete DB record
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", venue.id);

      if (error) throw new Error(error.message);

      toast.success("Venue berhasil dihapus secara permanen!");
      await refreshVenues();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus venue: " + err.message);
    }
  };

  // Toggle Is Recommended Inline
  const handleToggleRecommend = async (venueId: string, currentStatus: boolean, name: string) => {
    const nextStatus = !currentStatus;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("venues")
        .update({ is_recommended: nextStatus })
        .eq("id", venueId);

      if (error) {
        toast.error("Gagal mengubah rekomendasi: " + error.message);
      } else {
        toast.success(`Rekomendasi "${name}" berhasil diperbarui!`);
        setVenues(prev =>
          prev.map(v => (v.id === venueId ? { ...v, is_recommended: nextStatus } : v))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan: " + (err.message || err));
    }
  };

  // Unique Cities list for filter dropdown
  const cities = useMemo(() => {
    const set = new Set(venues.map(v => v.city));
    return Array.from(set).filter(Boolean);
  }, [venues]);

  // Filtered venues dataset
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.address.toLowerCase().includes(search.toLowerCase());

      const matchesCity =
        cityFilter === "all" || v.city === cityFilter;

      const matchesRecommend =
        recommendFilter === "all" ||
        (recommendFilter === "recommended" && v.is_recommended) ||
        (recommendFilter === "regular" && !v.is_recommended);

      return matchesSearch && matchesCity && matchesRecommend;
    });
  }, [venues, search, cityFilter, recommendFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted">
            [ KOMUNITAS ]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Database Venue (Lokasi Acara)
          </h1>
        </div>
        <div>
          <Link
            href="/admin/venue/addVenue"
            className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider"
          >
            <Plus size={14} />
            Tambah Venue Baru
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
              placeholder="Cari nama atau alamat..."
              className="bg-bg-well border border-gray-400 rounded-full py-4 pl-9 pr-4 text-xs w-full text-text-primary focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                {cities.map((c, i) => (
                  <SelectItem key={i} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recommend Filter */}
          <div className="relative">
            <Select value={recommendFilter} onValueChange={setRecommendFilter}>
              <SelectTrigger className="h-[50px] border-gray-400">
                <SelectValue placeholder="Semua Rekomendasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rekomendasi</SelectItem>
                <SelectItem value="recommended">Hanya Direkomendasikan</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Venues Grid Layout */}
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
            const hasPhoto = venue.photo_urls && venue.photo_urls.length > 0;
            const displayPhoto = hasPhoto ? venue.photo_urls[0] : null;

            return (
              <div
                key={venue.id}
                className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex flex-col justify-between hover:border-text-primary/30 transition-colors"
              >
                {/* Photo Header */}
                <div className="h-44 bg-bg-well border-b border-border-default relative flex items-center justify-center overflow-hidden">
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Compass className="w-10 h-10 text-text-muted/60" />
                  )}

                  {/* Recommendation Badge Overlay */}
                  {venue.is_recommended && (
                    <span className="absolute top-3 left-3 text-[9px] font-bold text-[#2D5A00] bg-accent-green px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/10 shadow-sm">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Info Content Area */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-text-primary truncate">
                      {venue.name}
                    </h3>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">{venue.city}</p>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-2 leading-relaxed">{venue.address}</p>
                  </div>

                  {/* Meta items */}
                  <div className="text-[10px] text-text-secondary space-y-1 bg-bg-well/50 p-2.5 border border-border-default/45 rounded-xl font-medium">
                    <p className="flex items-center gap-1.5"><Users size={12} className="text-text-secondary" /> Kapasitas: <span className="font-semibold text-text-primary">{venue.capacity} Kursi</span></p>
                    {venue.contact_name && (
                      <p className="flex items-center gap-1.5"><User size={12} className="text-text-secondary" /> CP: <span className="font-semibold text-text-primary">{venue.contact_name} ({venue.contact_wa})</span></p>
                    )}
                  </div>

                  {/* Amenities tags */}
                  {venue.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.slice(0, 3).map((am, idx) => (
                        <span key={idx} className="text-[9px] font-bold px-2 py-0.5 bg-bg-well border border-border-default rounded-full text-text-secondary uppercase">
                          {am}
                        </span>
                      ))}
                      {venue.amenities.length > 3 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-bg-well border border-border-default rounded-full text-text-muted">
                          +{venue.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-border-default/50 flex gap-2">
                  {venue.maps_url && (
                    <a
                      href={venue.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border-default hover:bg-bg-well rounded-full p-2 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center shrink-0"
                      title="Google Maps"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggleRecommend(venue.id, venue.is_recommended, venue.name)}
                    className={`flex-1 border text-[10px] font-bold uppercase tracking-wider rounded-full py-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${venue.is_recommended
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                      : "border-border-default text-text-secondary hover:bg-bg-well hover:text-text-primary"
                      }`}
                  >
                    Recommend
                  </button>
                  <Link
                    href={`/admin/venue/addVenue?id=${venue.id}`}
                    className="border border-border-default hover:bg-bg-well rounded-full p-2 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Edit Venue"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDeleteVenue(venue)}
                    className="border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 rounded-full p-2 text-red-500 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Hapus Venue"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-card border border-border-default rounded-2xl p-12 text-center">
          <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2.5" />
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Tidak ada venue yang sesuai filter
          </p>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={!!venueToDelete}
        onOpenChange={(open) => !open && setVenueToDelete(null)}
        title="Hapus Venue"
        description={
          <>
            Apakah Anda yakin ingin menghapus venue &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">{venueToDelete?.name}</span>&rdquo; secara permanen?
            <p className="mt-2 text-xs text-zinc-455 dark:text-zinc-500 font-bold">
              Semua file foto terkait di storage juga akan dibersihkan secara otomatis.
            </p>
          </>
        }
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
