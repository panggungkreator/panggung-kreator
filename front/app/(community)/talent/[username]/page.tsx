"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, PortfolioItem, MemberExperience } from "@/lib/types/member";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Award,
  Calendar,
  MapPin,
  Building,
  Video,
  Mail,
  Phone,
  Globe,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface TalentDetailPageProps {
  params?: Promise<{
    username: string;
  }> | { username: string };
}

const isValidVal = (val?: string | null): boolean => {
  if (!val) return false;
  const trimmed = val.trim();
  return trimmed !== "" && trimmed !== "-" && trimmed !== "none" && trimmed !== "null" && trimmed !== "undefined";
};

// Clean Monochrome Brand Icons
function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="0" ry="0" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43V12a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-3.43z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
    </svg>
  );
}

export default function TalentDetailPage({ params }: TalentDetailPageProps) {
  const routeParams = useParams();
  const rawUsername = routeParams?.username;
  const username = (Array.isArray(rawUsername) ? rawUsername[0] : (rawUsername as string)) || "";

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [experiences, setExperiences] = useState<MemberExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  const fetchTalentDetails = async () => {
    if (!username) return;
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
    if (username) {
      fetchTalentDetails();
    }
  }, [username]);

  const handleTrackView = async (item: PortfolioItem) => {
    try {
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-[#2c2c2c] dark:text-[#F4F4F4] font-mono gap-3">
        <svg className="animate-spin h-6 w-6 text-[#2c2c2c] dark:text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#666666] dark:text-neutral-400">
          [ MEMUAT PROFIL KREATOR... ]
        </span>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-[#2c2c2c] dark:text-[#F4F4F4] space-y-4 font-mono px-4 text-center">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666] dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800 px-3 py-1 rounded-none">
          [ 404_PROFIL_TIDAK_DITEMUKAN ]
        </span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#2c2c2c] dark:text-white font-sans">
          Kreator Tidak Ditemukan
        </h2>
        <p className="text-[#666666] dark:text-neutral-400 text-xs max-w-sm leading-relaxed font-sans">
          Akun kreator dengan username @{username} belum terdaftar atau profil belum diset publik.
        </p>
        <Link
          href="/talent"
          className="mt-2 px-6 py-2.5 bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c] font-bold text-xs uppercase tracking-[0.2em] rounded-none hover:opacity-90 transition-opacity"
        >
          &larr; Kembali ke Direktori Talent
        </Link>
      </div>
    );
  }

  const initials = (member.full_name || member.stage_name || "M")
    .charAt(0)
    .toUpperCase();

  const socialMedia = member.social_media || {};

  const socialLinks = [
    isValidVal(socialMedia.instagram) && {
      label: "Instagram",
      icon: InstagramIcon,
      url: `https://instagram.com/${socialMedia.instagram!.replace("@", "").trim()}`,
    },
    isValidVal(socialMedia.tiktok) && {
      label: "TikTok",
      icon: TikTokIcon,
      url: `https://tiktok.com/@${socialMedia.tiktok!.replace("@", "").trim()}`,
    },
    isValidVal(socialMedia.youtube) && {
      label: "YouTube",
      icon: YouTubeIcon,
      url: socialMedia.youtube!.startsWith("http") ? socialMedia.youtube! : `https://${socialMedia.youtube!}`,
    },
    isValidVal(socialMedia.linkedin) && {
      label: "LinkedIn",
      icon: LinkedInIcon,
      url: socialMedia.linkedin!.startsWith("http") ? socialMedia.linkedin! : `https://${socialMedia.linkedin!}`,
    },
    isValidVal(member.portfolio_url) && {
      label: "Website",
      icon: Globe,
      url: member.portfolio_url!.startsWith("http") ? member.portfolio_url! : `https://${member.portfolio_url!}`,
    },
  ].filter(Boolean) as { label: string; icon: React.ElementType; url: string }[];

  // Split name for stacked bold typography
  const nameToDisplay = (member.full_name || member.stage_name || "MEMBER").trim();
  const nameParts = nameToDisplay.split(" ");
  const firstWord = nameParts[0] || "";
  const restWords = nameParts.slice(1).join(" ") || "";

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0A0A0A] text-[#2c2c2c] dark:text-[#F4F4F4] font-sans selection:bg-[#2c2c2c] selection:text-white dark:selection:bg-white dark:selection:text-black">

      {/* 🌟 MAIN CONTENT CONTAINER */}
      <div className="max-w-5xl w-full mx-auto pt-6 lg:pt-8 pb-20 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8 mt-12">

        {/* TOP BAR: BREADCRUMB ONLY (THEME MODE REMOVED) */}
        <header className="flex items-center justify-between pb-4">
          <Link
            href="/talent"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#666666] hover:text-[#2c2c2c] dark:text-neutral-400 dark:hover:text-white transition-colors py-1"
          >
            <ArrowLeft size={14} />
            <span>[ DIREKTORI TALENT ]</span>
          </Link>
        </header>

        {/* 📱 MOBILE HERO SECTION (ROUNDED-NONE, SHADOW-NONE, HIGH-CONTRAST) */}
        <div className="md:hidden flex flex-col pb-8 border-b border-neutral-200 dark:border-neutral-800 space-y-5">
          {/* Portrait Photo without border radius */}
          <div className="w-full aspect-[4/5] max-h-[440px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-white overflow-hidden rounded-none shadow-none relative">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name || member.stage_name}
                className="w-full h-full object-cover rounded-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c2c2c] text-white p-6 select-none rounded-none">
                <span className="text-6xl font-sans font-black tracking-tight">{initials}</span>
                <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase mt-3">[ TALENT CANVAS ]</span>
              </div>
            )}
          </div>

          {/* Identity details */}
          <div className="space-y-3">
            <h1 className="font-sans font-black text-3xl uppercase tracking-tighter text-[#2c2c2c] dark:text-white leading-[0.88]">
              <span>{firstWord}</span>
              {restWords && <span className="block mt-1">{restWords}</span>}
            </h1>

            {/* Subtitle tag */}
            {(member.stage_name || member.username || member.occupation) && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#666666] dark:text-neutral-400 font-medium">
                {member.stage_name ? (
                  <span className="font-bold text-[#2c2c2c] dark:text-neutral-200">
                    {member.stage_name}
                  </span>
                ) : member.username ? (
                  <span>@{member.username}</span>
                ) : null}
                <span>•</span>
                {member.occupation && (
                  <span className="font-bold text-[#2c2c2c] dark:text-neutral-200">
                    {member.occupation.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            )}

            {/* Bio */}
            {member.description && (
              <p className="text-xs sm:text-[13px] text-[#666666] dark:text-neutral-300 leading-relaxed font-sans pt-1">
                {member.description}
              </p>
            )}

            {/* Metadata (Location, Email, Phone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs font-mono">
              {member.city && (
                <div className="flex items-center gap-2 text-[#666666] dark:text-neutral-400 text-[11px] uppercase tracking-wider">
                  <MapPin size={13} className="text-[#666666] shrink-0" />
                  <span className="truncate">{member.city}</span>
                </div>
              )}
              {member.email && (
                <div className="flex items-center gap-2 text-[#666666] dark:text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Mail size={13} className="text-[#666666] shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.whatsapp_number && (
                <div className="flex items-center gap-2 text-[#666666] dark:text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Phone size={13} className="text-[#666666] shrink-0" />
                  <span className="truncate">{member.whatsapp_number}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="pt-2 flex items-center gap-2">
                {socialLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-none flex items-center justify-center bg-white dark:bg-neutral-900 text-[#2c2c2c] dark:text-neutral-300 hover:bg-[#2c2c2c] hover:text-white dark:hover:bg-white dark:hover:text-[#2c2c2c] border border-neutral-200 dark:border-neutral-800 transition-colors shadow-none"
                      title={item.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 💻 DESKTOP HERO SECTION (STARK MONOCHROME, ROUNDED-NONE, SHADOW-NONE) */}
        <div className="hidden md:flex md:flex-row items-start gap-6 sm:gap-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">

          {/* LEFT: TALL PORTRAIT RECTANGLE PHOTO (ROUNDED-NONE) */}
          <div className="w-full sm:w-[220px] md:w-[240px] lg:w-[260px] aspect-[3/4] min-h-[320px] md:min-h-[360px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-white relative overflow-hidden flex items-center justify-center shrink-0 rounded-none shadow-none">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name || member.stage_name}
                className="w-full h-full object-cover contrast-105 rounded-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c2c2c] text-white p-6 select-none rounded-none">
                <span className="text-5xl font-sans font-black tracking-tight">{initials}</span>
                <span className="text-[8px] font-mono tracking-[0.25em] text-neutral-400 uppercase mt-3">[ TALENT CANVAS ]</span>
              </div>
            )}
          </div>

          {/* RIGHT: STACKED BOLD TYPOGRAPHY & IDENTITY DETAILS */}
          <div className="flex-1 w-full flex flex-col justify-end self-stretch py-0.5 space-y-4">

            {/* NAME + STAGE NAME & OCCUPATION + BIO */}
            <div className="space-y-2">
              <div>
                <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-[#2c2c2c] dark:text-white leading-[0.88]">
                  <span>{firstWord}</span>
                  {restWords && <span className="block mt-1">{restWords}</span>}
                </h1>

                {/* SUBTITLE */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#666666] dark:text-neutral-400 mt-2 font-medium">
                  {member.stage_name ? (
                    <span className="font-bold text-[#2c2c2c] dark:text-neutral-200">
                      {member.stage_name}
                    </span>
                  ) : member.username ? (
                    <span>@{member.username}</span>
                  ) : null}
                  {member.occupation && (
                    <>
                      {(member.stage_name || member.username) && (
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      )}
                      <span className="font-bold text-[#2c2c2c] dark:text-neutral-200">
                        {member.occupation.replace(/_/g, " ")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* BIO */}
              {member.description ? (
                <p className="text-xs sm:text-[13px] text-[#666666] dark:text-neutral-300 leading-relaxed font-sans pt-1">
                  {member.description}
                </p>
              ) : (
                <p className="text-xs text-[#666666] dark:text-neutral-500 italic font-sans pt-0.5">
                  Belum ada bio singkat.
                </p>
              )}
            </div>

            {/* METADATA LIST (LOCATION, EMAIL, PHONE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs font-mono">
              {member.city && (
                <div className="flex items-center gap-2 text-[#666666] dark:text-neutral-400 text-[11px] uppercase tracking-wider">
                  <MapPin size={13} className="text-[#666666] shrink-0" />
                  <span className="truncate">{member.city}</span>
                </div>
              )}
              {member.email && (
                <div className="flex items-center gap-2 text-[#666666] dark:text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Mail size={13} className="text-[#666666] shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.whatsapp_number && (
                <div className="flex items-center gap-2 text-[#666666] dark:text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Phone size={13} className="text-[#666666] shrink-0" />
                  <span className="truncate">{member.whatsapp_number}</span>
                </div>
              )}
            </div>

            {/* SOCIAL LINKS ROW (SHARP CORNERS, HIGH CONTRAST) */}
            {socialLinks.length > 0 && (
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                {socialLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-none flex items-center justify-center bg-white dark:bg-neutral-900 text-[#2c2c2c] dark:text-neutral-300 hover:bg-[#2c2c2c] hover:text-white dark:hover:bg-white dark:hover:text-[#2c2c2c] border border-neutral-200 dark:border-neutral-800 transition-colors shadow-none"
                      title={item.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            LIST PORTOFOLIO (FILTERS REMOVED, SERIF ACCENT, ROUNDED-NONE)
        ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          {/* Header with Title (Serif Contrast Accent, No Filters) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#2c2c2c] dark:border-neutral-700 pb-3 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight text-[#2c2c2c] dark:text-white leading-none">
                Etalase <span className="font-serif italic font-normal text-[#666666] dark:text-neutral-400 lowercase">portofolio & karya</span>
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666] dark:text-neutral-400">
              [ {portfolio.length} KARYA ]
            </span>
          </div>

          {/* PORTFOLIO GRID (ALL ITEMS DIRECTLY DISPLAYED) */}
          {portfolio.length === 0 ? (
            <div className="p-12 rounded-none border border-dashed border-neutral-300 dark:border-neutral-800 text-center font-mono text-xs text-[#666666] dark:text-neutral-400 space-y-1">
              <p>[ BELUM ADA PORTOFOLIO PUBLIK ]</p>
              <p className="text-[11px] font-sans text-neutral-500">
                Talenta ini belum mengunggah karya publik.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#121212] rounded-none border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col justify-between group transition-colors hover:border-[#2c2c2c] dark:hover:border-white shadow-none"
                >
                  {/* THUMBNAIL / MEDIA / CERTIFICATE */}
                  {item.item_type === "achievement" && !item.thumbnail_url ? (
                    /* EDITORIAL TYPOGRAPHY CERTIFICATE */
                    <div className="relative aspect-[16/10] w-full bg-neutral-950 p-6 flex flex-col justify-between border-b border-neutral-800 text-white overflow-hidden rounded-none">
                      <div className="border border-neutral-800 p-4 h-full flex flex-col justify-between relative rounded-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-neutral-400">
                            CERTIFICATE // RECOGNITION
                          </span>
                          <Award size={18} className="text-amber-400" />
                        </div>
                        <div className="text-center space-y-1 my-auto">
                          <h4 className="font-serif text-sm sm:text-base font-normal uppercase tracking-wider text-neutral-100 line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                        <div className="text-[8px] font-mono uppercase tracking-[0.25em] text-neutral-500 text-center">
                          [ PANGGUNG KREATOR VERIFIED ]
                        </div>
                      </div>

                      {item.media_url && (
                        <a
                          href={item.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleTrackView(item)}
                          className="absolute bottom-3 right-3 p-2 bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
                          title="Buka Kredensial"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  ) : (
                    /* VIDEO / IMAGE / LINK MEDIA CARD */
                    <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-center rounded-none">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer rounded-none"
                          onClick={() => {
                            if (item.item_type === "image" && item.thumbnail_url) {
                              setPreviewImage({ title: item.title, url: item.thumbnail_url });
                            }
                          }}
                        />
                      ) : (
                        <div className="text-neutral-500 flex flex-col items-center gap-2">
                          {item.item_type === "video" ? (
                            <Video size={28} />
                          ) : item.item_type === "image" ? (
                            <ImageIcon size={28} />
                          ) : (
                            <Sparkles size={28} />
                          )}
                          <span className="text-[9px] uppercase font-mono tracking-[0.25em]">[ {item.item_type} ]</span>
                        </div>
                      )}

                      {/* FEATURED BADGE */}
                      {item.is_featured && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] text-[8px] font-mono font-bold uppercase tracking-[0.2em] rounded-none border border-neutral-700">
                          [ UNGGULAN ]
                        </div>
                      )}

                      {/* EXTERNAL LINK BUTTON */}
                      {item.media_url && (
                        <a
                          href={item.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleTrackView(item)}
                          className="absolute bottom-2 right-2 p-2 bg-black/80 hover:bg-white hover:text-black text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-none"
                          title="Buka Karya"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* CARD CONTENT */}
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#666666] dark:text-neutral-400 mb-1">
                        <span className="font-bold tracking-wider">[ {item.pillar?.replace(/_/g, " ")} ]</span>
                        <span className="flex items-center gap-1">
                          <Eye size={11} />
                          {item.view_count || 0}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold uppercase tracking-tight text-[#2c2c2c] dark:text-white line-clamp-2">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-[#666666] dark:text-neutral-400 line-clamp-2 leading-relaxed pt-1 font-sans">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-[10px] font-mono text-[#666666] dark:text-neutral-500">
                      <span className="uppercase">[ {item.media_source?.toUpperCase() || "LINK"} ]</span>
                      <span className="uppercase font-bold tracking-wider">{item.item_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════
            JAM TERBANG & REKAM JEJAK (PENGALAMAN)
        ═══════════════════════════════════════════════════════════ */}
        {experiences.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b-2 border-[#2c2c2c] dark:border-neutral-700 pb-3">
              <div>
                <h3 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight text-[#2c2c2c] dark:text-white leading-none">
                  Jam Terbang <span className="font-serif italic font-normal text-[#666666] dark:text-neutral-400 lowercase">& rekam jejak</span>
                </h3>
                <p className="text-xs text-[#666666] dark:text-neutral-400 font-mono uppercase tracking-wider mt-1">
                  Riwayat panggung, kepanitiaan, karier profesional, dan pengalaman publik.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666] dark:text-neutral-400">
                [ {experiences.length} REKAM JEJAK ]
              </span>
            </div>

            <div className="relative pl-6 space-y-6 pt-2 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative group">
                  {/* Square Bullet Dot on vertical timeline */}
                  <span className="absolute -left-6 w-5 h-5 rounded-none flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-none bg-[#2c2c2c] dark:bg-white ring-4 ring-white dark:ring-[#0A0A0A]" />
                  </span>

                  {/* Card container */}
                  <div className="p-5 rounded-none bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-none hover:border-[#2c2c2c] dark:hover:border-white transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#666666] dark:text-neutral-400 uppercase">
                      <span className="flex items-center gap-1.5 font-bold tracking-wider">
                        <Calendar size={12} className="text-[#666666]" />
                        {formatPeriod(exp.start_date, exp.end_date, exp.is_current)}
                      </span>
                      {exp.is_current && (
                        <span className="px-2 py-0.5 rounded-none bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] font-bold text-[9px] font-mono uppercase tracking-wider">
                          [ SEKARANG ]
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold uppercase tracking-tight text-[#2c2c2c] dark:text-white pt-0.5">
                      {exp.role}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] dark:text-neutral-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Building size={13} className="text-[#666666] shrink-0" />
                        <span>{exp.institution}</span>
                      </span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider">
                            <MapPin size={12} className="text-[#666666] shrink-0" />
                            <span>{exp.location}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-xs text-[#666666] dark:text-neutral-300 leading-relaxed pt-2 border-t border-neutral-100 dark:border-neutral-900 font-sans">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 🖼️ IMAGE PREVIEW MODAL (ROUNDED-NONE) */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={previewImage.title}
          subtitle="Pratinjau Foto Karya"
          maxWidth="max-w-3xl"
        >
          <div className="w-full flex items-center justify-center p-2">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-none border border-neutral-200 dark:border-neutral-800 shadow-none"
            />
          </div>
        </Modal>
      )}

    </div>
  );
}
