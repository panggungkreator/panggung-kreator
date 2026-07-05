"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScrollAnimations } from "../community/useScrollAnimations";
import { Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";

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
}

interface GaleriFilterSectionProps {
  initialAlbums: Album[];
}

const categories = [
  { label: "SEMUA", value: "all" },
  { label: "OPEN MIC", value: "open-mic" },
  { label: "PUBLIC SPEAKING", value: "public-speaking" },
  { label: "MC PRACTICE", value: "mc-practice" },
  { label: "NETWORKING", value: "networking" },
  { label: "CONTENT CLASS", value: "content-class" },
  { label: "LAINNYA", value: "lainnya" },
];

const dummyAlbums: Album[] = [
  {
    id: "dummy-1",
    title: "OPEN MIC NIGHT - PANGGUNG KE 10",
    slug: "open-mic-night-panggung-ke-10",
    category: "open-mic",
    event_date: "2026-06-12",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Sesi open mic spesial ke-10, menampilkan 15 kreator berbakat di panggung utama.",
    is_published: true,
    display_order: 1
  },
  {
    id: "dummy-2",
    title: "PUBLIC SPEAKING BOOTCAMP",
    slug: "public-speaking-bootcamp",
    category: "public-speaking",
    event_date: "2026-05-24",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Pelatihan intensif 2 hari tentang penguasaan panggung dan teknik berbicara.",
    is_published: true,
    display_order: 2
  },
  {
    id: "dummy-3",
    title: "MC PRACTICE SESSIONS",
    slug: "mc-practice-sessions",
    category: "mc-practice",
    event_date: "2026-05-10",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Praktik langsung memandu protokoler formal dan non-formal bagi pemula.",
    is_published: true,
    display_order: 3
  },
  {
    id: "dummy-4",
    title: "CREATIVE NETWORKING DAY",
    slug: "creative-networking-day",
    category: "networking",
    event_date: "2026-04-19",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Temu kolaborasi antar kreator, influencer, dan praktisi industri kreatif.",
    is_published: true,
    display_order: 4
  },
  {
    id: "dummy-5",
    title: "CONTENT CREATION WORKSHOP",
    slug: "content-creation-workshop",
    category: "content-class",
    event_date: "2026-03-15",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Sesi interaktif kupas tuntas pra-produksi, syuting, hingga pasca-produksi.",
    is_published: true,
    display_order: 5
  },
  {
    id: "dummy-6",
    title: "GATHERING PANGGUNG KREATOR",
    slug: "gathering-panggung-kreator",
    category: "lainnya",
    event_date: "2026-02-28",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Sesi kebersamaan perayaan pencapaian tahunan komunitas.",
    is_published: true,
    display_order: 6
  },
  {
    id: "dummy-7",
    title: "MASTERCLASS CREATOR WEEKEND",
    slug: "masterclass-creator-weekend",
    category: "content-class",
    event_date: "2026-01-20",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Praktik langsung membuat hook konten yang memikat audiens.",
    is_published: true,
    display_order: 7
  },
  {
    id: "dummy-8",
    title: "PUBLIC SPEAKING SEMINAR",
    slug: "public-speaking-seminar",
    category: "public-speaking",
    event_date: "2026-01-05",
    hero_image_url: null,
    album_link: "https://drive.google.com",
    description: "Seminar awal tahun membangun rasa percaya diri di depan umum.",
    is_published: true,
    display_order: 8
  }
];

export default function GaleriFilterSection({ initialAlbums }: GaleriFilterSectionProps) {
  const { fadeUp, parallax, staggerIn } = useScrollAnimations();
  const [activeCategory, setActiveCategory] = useState("all");

  // Pagination / Load More states
  const [limit, setLimit] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | HTMLAnchorElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (filterRef.current) {
      fadeUp(filterRef.current, 0.1, 20);
    }
  }, [fadeUp]);

  // Reset limit when category changes
  useEffect(() => {
    setLimit(6);
  }, [activeCategory]);

  useEffect(() => {
    // Re-trigger stagger animation when items change (including pagination/load-more)
    if (itemsRef.current.length > 0) {
      const validItems = itemsRef.current.filter((item) => item !== null) as HTMLElement[];
      staggerIn(validItems, 0.08, 30);
    }
  }, [staggerIn, activeCategory, limit]);

  // Apply parallax on images or wrappers
  useEffect(() => {
    imgRefs.current.forEach((img) => {
      if (img) parallax(img, 0.08);
    });
  }, [parallax, activeCategory, limit]);

  // Fallback to dummy data if initialAlbums is empty
  const albumsToUse = initialAlbums && initialAlbums.length > 0 ? initialAlbums : dummyAlbums;

  const filteredItems = albumsToUse.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const displayedItems = filteredItems.slice(0, limit);
  const hasMore = filteredItems.length > limit;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setLimit((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 800);
  };

  // Date formatter helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to get category details
  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case "open-mic":
        return { label: "OPEN MIC", emoji: "🎤" };
      case "public-speaking":
        return { label: "PUBLIC SPEAKING", emoji: "🗣️" };
      case "mc-practice":
        return { label: "MC PRACTICE", emoji: "🎙️" };
      case "networking":
        return { label: "NETWORKING", emoji: "💡" };
      case "content-class":
        return { label: "CONTENT CLASS", emoji: "🎬" };
      case "lainnya":
      default:
        return { label: "LAINNYA", emoji: "📁" };
    }
  };

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10 mb-16 md:mb-24">
      {/* Filter Bar */}
      <div
        ref={filterRef}
        className="p-6 md:px-16 border-b border-[#2c2c2c] dark:border-white bg-white dark:bg-[#2c2c2c] sticky top-[80px] z-20 flex gap-3 overflow-x-auto scrollbar-none"
      >
        <div className="flex gap-2 mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 border text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-colors duration-250 rounded-none whitespace-nowrap cursor-pointer ${activeCategory === cat.value
                ? "bg-[#2c2c2c] text-white border-[#2c2c2c] dark:bg-white dark:text-[#2c2c2c] dark:border-white"
                : "border-[#2c2c2c]/10 dark:border-white/10 text-[#2c2c2c]/60 dark:text-white/60 hover:border-[#2c2c2c] dark:hover:border-white"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container - Perfect 1px borders */}
      {filteredItems.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2c2c2c]/40 dark:text-white/30">
            Belum ada dokumentasi untuk kategori ini.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-[#2c2c2c] dark:bg-white gap-[1px]"
          >
            {displayedItems.map((album, idx) => {
              const catInfo = getCategoryInfo(album.category);
              const CardElement = album.album_link ? "a" : "div";

              return (
                <CardElement
                  key={album.id}
                  href={album.album_link || undefined}
                  target={album.album_link ? "_blank" : undefined}
                  rel={album.album_link ? "noopener noreferrer" : undefined}
                  ref={(el: any) => {
                    itemsRef.current[idx] = el;
                  }}
                  className="relative aspect-[4/3] overflow-hidden group flex flex-col justify-end bg-white dark:bg-[#2c2c2c] cursor-pointer"
                >
                  {/* Parallax Image / Placeholder */}
                  {album.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      ref={(el: any) => {
                        imgRefs.current[idx] = el;
                      }}
                      src={album.hero_image_url}
                      alt={album.title}
                      className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                    />
                  ) : (
                    <div
                      ref={(el: any) => {
                        imgRefs.current[idx] = el;
                      }}
                      className="absolute inset-0 w-full h-[120%] -top-[10%] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-8 text-center transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                    >
                      {/* Subtle grid pattern background */}
                      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                      <div className="max-w-md px-6 pointer-events-none">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#2c2c2c]/30 dark:text-white/30 block mb-2">
                          [ DOKUMENTASI ]
                        </span>
                        <p className="font-sans text-[11px] text-[#2c2c2c]/40 dark:text-white/30 uppercase tracking-wider leading-relaxed">
                          {album.description || `Foto dokumentasi kegiatan untuk ${album.title}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stark Monochromatic Overlay - Fade on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2c]/90 via-[#2c2c2c]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none"></div>

                  {/* Text Overlay content */}
                  <div className="relative z-10 p-8 text-white flex flex-col justify-end h-full pointer-events-none">
                    <h3 className="text-xl md:text-lg font-extrabold tracking-widest text-white/95 block mb-1.5 uppercase">
                      {formatDate(album.event_date)}
                    </h3>
                    <p className="text-sm md:text-lg font-black uppercase tracking-wider mb-3 line-clamp-2">
                      {album.title}
                    </p>

                    {album.album_link && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-white border-b border-transparent group-hover:border-white/55 w-fit transition-all duration-350">
                        <span>Lihat Album Lengkap</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Corner Bracket Detail for Premium Editorial feel */}
                  <div className="absolute top-6 right-6 z-10 w-4 h-4 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-6 right-6 z-10 w-4 h-4 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardElement>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center py-12 bg-white dark:bg-[#2c2c2c] border-t border-[#2c2c2c]/10 dark:border-white/10">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="relative px-8 py-4 border-2 border-[#2c2c2c] dark:border-white text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#2c2c2c] hover:text-white dark:hover:bg-white dark:hover:text-[#2c2c2c] cursor-pointer disabled:opacity-50 flex items-center gap-2.5 rounded-none"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MEMUAT...</span>
                  </>
                ) : (
                  <span>MUAT LEBIH BANYAK +</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
