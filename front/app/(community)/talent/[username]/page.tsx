"use client";

import React, { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, PortfolioItem, MemberExperience, Pillar } from "@/lib/types/member";
import {
  MapPin,
  Award,
  ExternalLink,
  ArrowLeft,
  User,
  Video,
  Eye,
  Calendar,
  Building,
  Briefcase,
  Sparkles,
  Share2,
  Globe,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface TalentDetailPageProps {
  params: Promise<{
    username: string;
  }> | { username: string };
}

const PILLARS: { value: Pillar | "all"; label: string }[] = [
  { value: "all", label: "Semua Karya" },
  { value: "public_speaking", label: "Public Speaking" },
  { value: "content_creation", label: "Storytelling" },
  { value: "personal_branding", label: "Personal Branding" },
];

const isValidSocialVal = (val?: string | null): val is string => {
  if (!val) return false;
  const trimmed = val.trim();
  return trimmed !== "" && trimmed !== "-" && trimmed !== "none" && trimmed !== "null" && trimmed !== "undefined";
};

export default function TalentDetailPage({ params }: TalentDetailPageProps) {
  const resolvedParams = use(Promise.resolve(params));
  const username = resolvedParams.username;

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [experiences, setExperiences] = useState<MemberExperience[]>([]);
  const [activePillar, setActivePillar] = useState<Pillar | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchTalentDetails = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. Query member profile by username
      const { data: profile, error: profileError } = await supabase
        .from("members")
        .select("*, interests:member_interests(*)")
        .eq("username", username)
        .maybeSingle();

      if (profileError || !profile) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setMember(profile);

      // 2. Parallel query: public portfolio items and experiences
      const [portRes, expRes] = await Promise.all([
        supabase
          .from("portfolio_items")
          .select("*")
          .eq("member_id", profile.id)
          .eq("is_public", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),

        supabase
          .from("member_experiences")
          .select("*")
          .eq("member_id", profile.id)
          .order("sort_order", { ascending: true })
          .order("start_date", { ascending: false }),
      ]);

      if (portRes.data) setPortfolio(portRes.data);
      if (expRes.data) setExperiences(expRes.data);
    } catch (err) {
      console.error("Error fetching talent details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalentDetails();
  }, [username]);

  const handleTrackView = async (item: PortfolioItem) => {
    try {
      // Optimistic update local view count
      setPortfolio((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, view_count: (p.view_count || 0) + 1 } : p))
      );

      await fetch(`/api/portfolio/${item.id}/view`, {
        method: "POST",
      });
    } catch (err) {
      console.warn("Track view error:", err);
    }
  };

  const formatPeriod = (start: string, end: string | null, isCurrent: boolean) => {
    const formatYear = (dateStr: string) => {
      if (!dateStr) return "";
      if (dateStr.length === 4) return dateStr;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : `${d.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`;
    };

    const s = formatYear(start);
    if (isCurrent) return `${s} - Sekarang`;
    const e = end ? formatYear(end) : "";
    return e ? `${s} - ${e}` : s;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white font-mono gap-3">
        <svg className="animate-spin h-7 w-7 text-neutral-900 dark:text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs uppercase tracking-widest">[ MEMUAT PROFIL KREATOR... ]</span>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white space-y-4 font-mono px-4 text-center">
        <h2 className="text-xl uppercase font-bold">[ 404_KREATOR_TIDAK_DITEMUKAN ]</h2>
        <p className="text-neutral-500 text-xs max-w-sm">
          Akun kreator dengan username @{username} belum terdaftar atau profil belum diset publik.
        </p>
        <Link
          href="/talent"
          className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
        >
          &larr; Kembali ke Direktori Talent
        </Link>
      </div>
    );
  }

  const filteredPortfolio = portfolio.filter((item) =>
    activePillar === "all" ? true : item.pillar === activePillar
  );

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* TOP DIRECTORY BAR */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 py-3 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/talent"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>[ DIREKTORI KREATOR ]</span>
          </Link>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline-block">
            PANGGUNG KREATOR TALENT SHOWCASE
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER: 40/60 STARK EDITORIAL GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-49px)]">
        
        {/* ═══════════════════════════════════════════════════════════
            KOLOM KIRI (40% - IDENTITAS KREATOR, FOTO & KONTAK)
        ═══════════════════════════════════════════════════════════ */}
        <aside className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 lg:p-10 space-y-8 lg:sticky lg:top-0 lg:h-[calc(100vh-49px)] lg:overflow-y-auto no-scrollbar">
          
          {/* FOTO PROFIL MONOCHROME EDGE-TO-EDGE */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden group">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="h-full w-full object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                <User size={96} strokeWidth={1} />
              </div>
            )}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md text-white border border-white/20 text-[9px] font-mono uppercase tracking-widest">
              {member.membership_tier?.toUpperCase() || "MEMBER"}
            </div>
          </div>

          {/* NAMA TIPOGRAFI RAKSASA & METADATA MONOSPACE */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans uppercase tracking-tight text-neutral-900 dark:text-white leading-[0.95] break-words">
              {member.stage_name || member.full_name}
            </h1>

            {member.stage_name && member.stage_name !== member.full_name && (
              <p className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                Nama Asli: {member.full_name}
              </p>
            )}

            {/* METADATA GRID BOX */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-2 text-[10px] font-mono uppercase">
              <div className="p-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <span className="text-neutral-400 block mb-0.5">[ PROFESI ]</span>
                <span className="font-bold text-neutral-900 dark:text-white truncate block">
                  {member.occupation?.replace(/_/g, " ") || "KREATOR"}
                </span>
              </div>

              <div className="p-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <span className="text-neutral-400 block mb-0.5">[ DOMISILI ]</span>
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1 truncate">
                  <MapPin size={10} className="shrink-0" />
                  {member.city || member.address || "INDONESIA"}
                </span>
              </div>
            </div>
          </div>

          {/* BIO / DESKRIPSI EDITORIAL */}
          {member.description && (
            <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                [ TENTANG KREATOR ]
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                {member.description}
              </p>
            </div>
          )}

          {/* JEJARING SOSIAL & TAUTAN */}
          <div className="space-y-3 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              [ HUBUNGI & JEJARING ]
            </span>
            <div className="flex flex-wrap gap-2">
              {isValidSocialVal(member.social_media?.instagram) && (
                <a
                  href={
                    member.social_media!.instagram!.startsWith("http")
                      ? member.social_media!.instagram!
                      : `https://instagram.com/${member.social_media!.instagram!.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer"
                >
                  <span>IG</span>
                  <ExternalLink size={11} />
                </a>
              )}

              {isValidSocialVal(member.social_media?.tiktok) && (
                <a
                  href={`https://tiktok.com/@${member.social_media!.tiktok!.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer"
                >
                  <span>TIKTOK</span>
                  <ExternalLink size={11} />
                </a>
              )}

              {isValidSocialVal(member.social_media?.youtube) && (
                <a
                  href={member.social_media!.youtube!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer"
                >
                  <Video size={13} />
                  <span>YOUTUBE</span>
                </a>
              )}

              {isValidSocialVal(member.social_media?.linkedin) && (
                <a
                  href={member.social_media!.linkedin!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer"
                >
                  <span>LINKEDIN</span>
                  <ExternalLink size={11} />
                </a>
              )}

              {isValidSocialVal(member.portfolio_url) && (
                <a
                  href={member.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer"
                >
                  <Globe size={13} />
                  <span>WEBSITE</span>
                </a>
              )}
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════
            KOLOM KANAN (60% - SECTION PENGALAMAN & PORTOFOLIO GRID)
        ═══════════════════════════════════════════════════════════ */}
        <main className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-12">

          {/* ──────────────────────────────────────────────────────────
              SECTION 1: JAM TERBANG & REKAM JEJAK (TIMELINE VERTIKAL)
          ────────────────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-neutral-500" />
                <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-neutral-900 dark:text-white">
                  [ 01. JAM TERBANG & PENGALAMAN ]
                </h2>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase">
                {experiences.length} REKAM JEJAK
              </span>
            </div>

            {experiences.length === 0 ? (
              <div className="p-8 border border-dashed border-neutral-300 dark:border-neutral-800 text-center font-mono text-xs text-neutral-400">
                [ BELUM ADA REKAM JEJAK PENGALAMAN YANG DITAMPILKAN ]
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-8 ml-2">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-white dark:bg-[#0A0A0A] border-2 border-neutral-900 dark:border-white rounded-none group-hover:bg-neutral-900 dark:group-hover:bg-white transition-colors" />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-400 uppercase">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatPeriod(exp.start_date, exp.end_date, exp.is_current)}
                        </span>
                        {exp.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />
                              {exp.location}
                            </span>
                          </>
                        )}
                        {exp.is_current && (
                          <span className="px-1.5 py-0.2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold">
                            SEKARANG
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 dark:text-white font-sans pt-0.5">
                        {exp.role}
                      </h3>

                      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <Building size={13} className="text-neutral-400" />
                        {exp.institution}
                      </p>

                      {exp.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-2 font-sans">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ──────────────────────────────────────────────────────────
              SECTION 2: ETALASE PORTOFOLIO & KARYA (GRID EDITORIAL)
          ────────────────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neutral-500" />
                <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-neutral-900 dark:text-white">
                  [ 02. ETALASE KARYA & PRESTASI ]
                </h2>
              </div>

              {/* CHIP FILTERS */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {PILLARS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setActivePillar(p.value)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-none cursor-pointer transition-all shrink-0 ${
                      activePillar === p.value
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-bold"
                        : "bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredPortfolio.length === 0 ? (
              <div className="p-12 border border-dashed border-neutral-300 dark:border-neutral-800 text-center font-mono text-xs text-neutral-400">
                [ BELUM ADA KARYA DI PILAR INI ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                {filteredPortfolio.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between group relative transition-all hover:border-neutral-900 dark:hover:border-neutral-100"
                  >
                    {/* THUMBNAIL / MEDIA / TYPOGRAPHY CERTIFICATE */}
                    {item.item_type === "achievement" && !item.thumbnail_url ? (
                      /* PIAGAM TIPOGRAFI LUXURY DESIGN */
                      <div className="relative aspect-[16/10] w-full bg-neutral-950 p-6 flex flex-col justify-between border-b border-neutral-800 text-white overflow-hidden">
                        <div className="border border-neutral-800 p-4 h-full flex flex-col justify-between relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-400">
                              CERTIFICATE // RECOGNITION
                            </span>
                            <Award size={18} className="text-amber-400" />
                          </div>
                          <div className="text-center space-y-1 my-auto">
                            <h4 className="font-serif text-sm sm:text-base font-normal uppercase tracking-wider text-neutral-100 line-clamp-2">
                              {item.title}
                            </h4>
                          </div>
                          <div className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 text-center">
                            PANGGUNG KREATOR VERIFIED
                          </div>
                        </div>

                        {item.media_url && (
                          <a
                            href={item.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackView(item)}
                            className="absolute bottom-2 right-2 p-1.5 bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Buka Kredensial"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ) : (
                      /* REGULAR VIDEO / IMAGE MEDIA CARD */
                      <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-neutral-500 flex flex-col items-center gap-2">
                            <Video size={28} />
                            <span className="text-[8px] uppercase font-mono tracking-wider">{item.item_type}</span>
                          </div>
                        )}

                        {/* FEATURED BADGE */}
                        {item.is_featured && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[8px] font-mono font-bold uppercase tracking-widest border border-white/20 dark:border-black/20">
                            [ ★ UNGGULAN ]
                          </div>
                        )}

                        {/* EXTERNAL LINK BUTTON */}
                        {item.media_url && (
                          <a
                            href={item.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackView(item)}
                            className="absolute bottom-2 right-2 p-1.5 bg-black/80 hover:bg-neutral-900 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Buka Karya"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* CARD METADATA & VIEW COUNT */}
                    <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase text-neutral-400 mb-1">
                          <span>{item.pillar?.replace(/_/g, " ")}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={10} />
                            {item.view_count || 0}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900 dark:text-white line-clamp-2">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed pt-1">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                        <span>[ {item.media_source?.toUpperCase() || "LINK"} ]</span>
                        <span className="uppercase">{item.item_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
