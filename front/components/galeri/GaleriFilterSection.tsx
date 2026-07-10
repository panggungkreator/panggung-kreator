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

export default function GaleriFilterSection({ initialAlbums }: GaleriFilterSectionProps) {
  const { fadeUp, parallax, staggerIn } = useScrollAnimations();

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

  useEffect(() => {
    // Re-trigger stagger animation when items change (including pagination/load-more)
    if (itemsRef.current.length > 0) {
      const validItems = itemsRef.current.filter((item) => item !== null) as HTMLElement[];
      staggerIn(validItems, 0.08, 30);
    }
  }, [staggerIn, limit]);

  // Apply parallax on images or wrappers
  useEffect(() => {
    imgRefs.current.forEach((img) => {
      if (img) parallax(img, 0.08);
    });
  }, [parallax, limit]);

  // Sort by event_date descending
  const albumsToUse = [...(initialAlbums || [])].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );

  const displayedItems = albumsToUse.slice(0, limit);
  const hasMore = albumsToUse.length > limit;

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

  return (
    <section className="relative bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white z-10 mb-16 md:mb-24 pt-6">
      {/* Grid Container - Perfect 1px borders */}
      {albumsToUse.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-[#2c2c2c] border-b border-[#2c2c2c] dark:border-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2c2c2c]/40 dark:text-white/30">
            Belum ada dokumentasi.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-[#2c2c2c] dark:bg-white gap-[1px]"
          >
            {displayedItems.map((album, idx) => {
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
