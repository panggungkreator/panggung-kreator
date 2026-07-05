"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  X,
  Eye
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
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
}

const CATEGORIES = [
  { value: "open-mic", label: "Open Mic" },
  { value: "public-speaking", label: "Public Speaking" },
  { value: "mc-practice", label: "MC Practice" },
  { value: "networking", label: "Networking" },
  { value: "content-class", label: "Content Class" },
  { value: "lainnya", label: "Lainnya" }
];

export default function GaleriCMSClient({ initialAlbums }: GaleriCMSClientProps) {
  const [detailAlbum, setDetailAlbum] = useState<Album | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<{
    id: string;
    title: string;
    imageUrl: string | null;
  } | null>(null);
  const [albums, setAlbums] = useState<Album[]>(() => {
    if (initialAlbums && initialAlbums.length > 0) {
      return initialAlbums;
    }
    return [
      {
        id: "dummy-album-1",
        title: "PANGGUNG OPEN MIC #12 - EDISI KEMERDEKAAN",
        slug: "panggung-open-mic-12-edisi-kemerdekaan",
        category: "open-mic",
        event_date: "2026-08-17",
        hero_image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
        album_link: "https://drive.google.com",
        description: "Dokumentasi keseruan panggung Open Mic edisi spesial Hari Kemerdekaan dengan 15 performer luar biasa.",
        is_published: true,
        display_order: 1
      },
      {
        id: "dummy-album-2",
        title: "PUBLIC SPEAKING BOOTCAMP BERSAMA MENTOR",
        slug: "public-speaking-bootcamp-bersama-mentor",
        category: "public-speaking",
        event_date: "2026-07-25",
        hero_image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60",
        album_link: "https://drive.google.com",
        description: "Sesi intensif praktek public speaking, olah vokal, gestur tubuh, dan teknik mengatasi demam panggung.",
        is_published: true,
        display_order: 2
      },
      {
        id: "dummy-album-3",
        title: "NETWORKING & SHARING SESSION KAFE KREATIF",
        slug: "networking-sharing-session-kafe-kreatif",
        category: "networking",
        event_date: "2026-06-10",
        hero_image_url: null,
        album_link: "https://drive.google.com",
        description: "Tempat berkumpulnya para kreator konten di Bandung untuk berbagi ide, kolaborasi, dan memperluas relasi.",
        is_published: false,
        display_order: 3
      }
    ];
  });
  // Sync state with initialAlbums when it changes
  useEffect(() => {
    if (initialAlbums && initialAlbums.length > 0) {
      setAlbums(initialAlbums);
    }
  }, [initialAlbums]);

  // Handle Delete Album Trigger
  const handleDeleteClick = (id: string, albumTitle: string, imageUrl: string | null) => {
    setAlbumToDelete({ id, title: albumTitle, imageUrl });
  };

  // Execute actual Delete
  const handleConfirmDelete = async () => {
    if (!albumToDelete) return;
    const { id, imageUrl } = albumToDelete;

    // Close confirmation dialog
    setAlbumToDelete(null);

    try {
      const supabase = createClient();

      // Delete database record
      const { error } = await supabase
        .from("gallery_albums")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Optimistically remove from state
      setAlbums(prev => prev.filter(item => item.id !== id));
      toast.success("Album galeri berhasil dihapus secara permanen!");

      // Try to clean up storage if it was a Supabase uploaded file
      if (imageUrl && imageUrl.includes("storage/v1/object/public/gallery/")) {
        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("gallery").remove([fileName]);
        }
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Gagal menghapus data: " + (error.message || error));
    }
  };

  // Stop Lenis scroll when modal is open to prevent lag/conflicts
  useEffect(() => {
    const win = window as any;
    if (typeof window !== "undefined" && win.__lenis) {
      if (detailAlbum) {
        win.__lenis.stop();
      } else {
        win.__lenis.start();
      }
    }
    return () => {
      if (typeof window !== "undefined" && win.__lenis) {
        win.__lenis.start();
      }
    };
  }, [detailAlbum]);

  // Helper to format date
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Get label for category
  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-2 md:p-6 text-zinc-800 dark:text-zinc-200">

      {/* Action Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-wider">
            Kelola Galeri & Album
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs">
            Daftar album kegiatan komunitas. Album ini akan ditampilkan di halaman Galeri Publik.
          </p>
        </div>
        <Link href="/admin/galeri/addGallery" className="flex items-center gap-1.5 px-6 py-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 rounded-full transition-all shadow-sm cursor-pointer tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Tambah Album</span>
        </Link>
      </div>

      {/* Table Area (always full width) */}
      <div className="w-full bg-bg-card rounded-2xl border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold bg-bg-well/50">
                <th className="py-4 px-6 border-b border-border-default/70">Album / Judul</th>
                <th className="py-4 px-6 border-b border-border-default/70 w-36">Kategori</th>
                <th className="py-4 px-6 border-b border-border-default/70 w-48">Tanggal</th>
                <th className="py-4 px-6 border-b border-border-default/70 w-32">Status</th>
                <th className="py-4 px-6 text-center border-b border-border-default/70 w-48">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {albums.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-bold ">
                    Belum ada data album dokumentasi.
                  </td>
                </tr>
              ) : (
                albums.map((album, index) => {
                  const isLastRow = index === albums.length - 1;
                  const cellBorderClass = `${isLastRow ? "" : "border-b"} border-border-default/30 py-4 px-6`;

                  return (
                    <tr
                      key={album.id}
                      className="hover:bg-bg-well/30 transition-colors group"
                    >

                      {/* Title & Slug */}
                      <td className={cellBorderClass}>
                        <div className="font-extrabold text-sm uppercase tracking-wide text-zinc-900 dark:text-white max-w-sm truncate">{album.title}</div>
                        {album.description && (
                          <p className="text-[11px] text-text-secondary truncate mt-1 max-w-sm font-medium">{album.description}</p>
                        )}
                        {album.album_link && (
                          <a
                            href={album.album_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-1 mt-1.5"
                          >
                            <LinkIcon className="w-3 h-3" /> Google Drive Link
                          </a>
                        )}
                      </td>

                      {/* Category */}
                      <td className={cellBorderClass}>
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md">
                          {getCategoryLabel(album.category)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className={cellBorderClass}>
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-650 dark:text-zinc-300">
                          <span>{formatDateString(album.event_date)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className={cellBorderClass}>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${album.is_published
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${album.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {album.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className={cellBorderClass}>
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => setDetailAlbum(album)}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-full cursor-pointer flex items-center justify-center gap-1"
                            title="Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/admin/galeri/addGallery?id=${album.id}`}>
                            <Button className="p-2 text-text-secondary hover:text-text-primary bg-bg-well hover:bg-border-default/50 border border-border-default rounded-full cursor-pointer flex items-center justify-center h-auto shadow-none">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(album.id, album.title, album.hero_image_url)}
                            className="p-2 text-[#b91c1c] hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full cursor-pointer flex items-center justify-center"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Detail Modal */}
      <Dialog open={!!detailAlbum} onOpenChange={(open) => !open && setDetailAlbum(null)}>
        <DialogContent className="max-w-2xl" data-lenis-prevent>
          <DialogHeader>
            <DialogTitle>DETAIL ALBUM DOKUMENTASI</DialogTitle>
          </DialogHeader>

          {detailAlbum && (
            <>
              <div className="overflow-y-auto space-y-6 flex-1 pr-1 -mr-3 pb-4 max-h-[60vh]">
                {/* Cover Image */}
                <div className="h-64 w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
                  {detailAlbum.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detailAlbum.hero_image_url}
                      alt={detailAlbum.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-zinc-400" />
                  )}
                </div>

                {/* Title & Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wide leading-snug">
                      {detailAlbum.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                        {getCategoryLabel(detailAlbum.category)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-455 font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                        <Calendar size={13} className="text-zinc-400" />
                        <span>{formatDateString(detailAlbum.event_date)}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${detailAlbum.is_published
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/10"
                        : "bg-amber-50 text-amber-700 border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/10"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${detailAlbum.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {detailAlbum.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {detailAlbum.description && (
                    <div className="space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-440 dark:text-zinc-500 block">Deskripsi Kegiatan</span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
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
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 text-xs font-black uppercase tracking-widest text-[#0369a1] bg-[#e0f2fe] hover:bg-[#bae6fd] dark:bg-sky-950/20 dark:text-sky-400 dark:hover:bg-sky-950/30 rounded-full transition-all cursor-pointer border border-sky-500/10"
                      >
                        <LinkIcon size={14} />
                        <span>Buka Album Google Drive</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="bg-zinc-50/50 dark:bg-zinc-900/20">
                <Link href={`/admin/galeri/addGallery?id=${detailAlbum.id}`}>
                  <Button
                    onClick={() => setDetailAlbum(null)}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full cursor-pointer flex items-center gap-1.5 transition-colors font-semibold h-auto shadow-none"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </Button>
                </Link>
                <Button
                  onClick={() => setDetailAlbum(null)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 hover:bg-[#2c2c2c] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full cursor-pointer transition-colors h-auto"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!albumToDelete} onOpenChange={(open) => !open && setAlbumToDelete(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[24px]">
          <DialogHeader className="pb-2 mb-0 border-b-0">
            <DialogTitle className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              Hapus Album Dokumentasi
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed px-1">
            Apakah Anda yakin ingin menghapus album &ldquo;<span className="font-extrabold text-zinc-950 dark:text-white underline decoration-red-500 decoration-2">{albumToDelete?.title}</span>&rdquo; secara permanen?
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-bold">
              File foto utama di storage juga akan dibersihkan secara otomatis.
            </p>
          </div>

          <div className="flex flex-row justify-end gap-3 pt-4 px-1">
            <Button
              onClick={() => setAlbumToDelete(null)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full cursor-pointer h-auto shadow-none"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full cursor-pointer h-auto border-0 shadow-sm"
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
