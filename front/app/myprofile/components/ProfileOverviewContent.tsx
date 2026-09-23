"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MemberProfile, AttendanceRecord } from "@/lib/types/member";
import {
  QrCode,
  Copy,
  Check,
  Link2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Clock,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

interface ProfileOverviewContentProps {
  member: MemberProfile;
  totalAttended: number;
  totalReferrals: number;
  attendanceRecords?: AttendanceRecord[];
  isOwner?: boolean;
}

// Clean Monochrome Brand Icons
function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
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

const DEFAULT_PILLARS = [
  "Public Speaking & MC",
  "Content Creation",
  "Personal Branding",
  "Networking & Kolaborasi",
];

const GOAL_MAP: Record<string, string> = {
  self_learning: "Mengembangkan Diri / Belajar Hal Baru",
  professional_career: "Membangun Karier Profesional",
  business: "Mendukung Bisnis yang Sedang Berjalan",
  social_media: "Membuat Konten Media Sosial secara Serius",
};

const EXPERIENCE_MAP: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

const INTEREST_MAP: Record<string, string> = {
  public_speaking: "Public Speaking",
  mc_host: "MC / Host",
  voice_over: "Voice Over",
  content_creator: "Content Creator",
  personal_branding: "Personal Brand",
  live_host: "Live Host",
};

export default function ProfileOverviewContent({
  member,
  totalAttended,
  totalReferrals = 0,
  attendanceRecords = [],
  isOwner = true,
}: ProfileOverviewContentProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    number: number;
    record: AttendanceRecord | null;
  } | null>(null);

  // Ambil data acara terakhir yang diikuti
  const sortedRecords = attendanceRecords && attendanceRecords.length > 0
    ? [...attendanceRecords].sort((a, b) => {
      const dateA = new Date(a.event?.event_date || a.created_at).getTime();
      const dateB = new Date(b.event?.event_date || b.created_at).getTime();
      return dateB - dateA;
    })
    : [];
  const latestAttendedRecord = sortedRecords.length > 0 ? sortedRecords[0] : null;
  const latestEvent = latestAttendedRecord?.event || null;

  const handleCopyCode = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!member.affiliate_code) return;
    navigator.clipboard.writeText(member.affiliate_code);
    setCopiedCode(true);
    toast.success(`Kode referral "${member.affiliate_code}" berhasil disalin!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = isOwner && member.affiliate_code
      ? `${window.location.origin}/akademi/checkout?ref=${member.affiliate_code}`
      : typeof window !== "undefined"
      ? (member.username ? `${window.location.origin}/talent/${member.username}` : window.location.href)
      : "";
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success(isOwner && member.affiliate_code ? "Link pendaftaran referral berhasil disalin!" : "Link profil kreator berhasil disalin!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const initials = (member.full_name || member.stage_name || "M")
    .charAt(0)
    .toUpperCase();

  const formattedBirthDate = member.birth_date
    ? new Date(member.birth_date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : null;

  const age = member.birth_date
    ? new Date().getFullYear() - new Date(member.birth_date).getFullYear()
    : null;

  const isValidVal = (val?: string | null): boolean => {
    if (!val) return false;
    const trimmed = val.trim();
    return trimmed !== "" && trimmed !== "-" && trimmed !== "none" && trimmed !== "null" && trimmed !== "undefined";
  };

  const socialMedia = member.social_media || {};

  const socialLinks = [
    isValidVal(socialMedia.instagram) && {
      label: "Instagram",
      icon: InstagramIcon,
      url: `https://instagram.com/${socialMedia.instagram!.replace("@", "").trim()}`,
      text: `@${socialMedia.instagram!.replace("@", "").trim()}`,
    },
    isValidVal(socialMedia.tiktok) && {
      label: "TikTok",
      icon: TikTokIcon,
      url: `https://tiktok.com/@${socialMedia.tiktok!.replace("@", "").trim()}`,
      text: `@${socialMedia.tiktok!.replace("@", "").trim()}`,
    },
    isValidVal(socialMedia.youtube) && {
      label: "YouTube",
      icon: YouTubeIcon,
      url: socialMedia.youtube!.startsWith("http") ? socialMedia.youtube! : `https://${socialMedia.youtube!}`,
      text: "Channel",
    },
    isValidVal(socialMedia.linkedin) && {
      label: "LinkedIn",
      icon: LinkedInIcon,
      url: socialMedia.linkedin!.startsWith("http") ? socialMedia.linkedin! : `https://${socialMedia.linkedin!}`,
      text: "Profil",
    },
    isValidVal(member.portfolio_url) && {
      label: "Website",
      icon: Globe,
      url: member.portfolio_url!.startsWith("http") ? member.portfolio_url! : `https://${member.portfolio_url!}`,
      text: "Portfolio",
    },
  ].filter(Boolean) as { label: string; icon: React.ElementType; url: string; text: string }[];

  const interests = member.interests;
  const primaryInterests = interests?.primary_interests;
  const hasInterests = Array.isArray(primaryInterests) && primaryInterests.length > 0;

  // Split name for stacked bold typography (Nama Member)
  const nameToDisplay = (member.full_name || member.stage_name || "MEMBER").trim();
  const nameParts = nameToDisplay.split(" ");
  const firstWord = nameParts[0] || "";
  const restWords = nameParts.slice(1).join(" ") || "";

  // Headline occupation / subtitle role
  const subtitleRole = member.occupation
    ? member.occupation.replace(/_/g, " ").toUpperCase()
    : hasInterests
      ? primaryInterests.map((p) => INTEREST_MAP[p] || p.replace(/_/g, " ")).join(" • ").toUpperCase()
      : "CREATOR & TALENT";

  const rawGoals = interests?.goals || [];
  const goals = Array.isArray(rawGoals)
    ? rawGoals
      .map((g: string) => g?.trim())
      .filter((g: string) => g && g !== "Tidak ada" && g !== "none" && g !== "-")
      .map((g: string) => GOAL_MAP[g] || g)
    : [];
  const hasGoals = goals.length > 0;

  const rawExperience = interests?.experience_level;
  const experienceLevel = rawExperience ? (EXPERIENCE_MAP[rawExperience] || rawExperience) : null;

  // --- KALKULASI CREATOR READINESS INDEX ---
  const confidenceScale = interests?.confidence_scale || 5;
  const confidenceScore = (confidenceScale / 10) * 40;
  const attendanceScore = Math.min((totalAttended / 5) * 30, 30);
  const expScore = rawExperience === "advanced" ? 30 : rawExperience === "intermediate" ? 20 : 10;
  const readinessScore = Math.min(Math.round(confidenceScore + attendanceScore + expScore), 100);

  const getStageInfo = (score: number) => {
    if (score <= 40) return { label: "FONDASI BELAJAR", desc: "Fokus penguasaan materi dasar & latihan awal." };
    if (score <= 70) return { label: "TUMBUH & LATIHAN", desc: "Mulai aktif tampil di kelas & membangun jam terbang." };
    if (score <= 90) return { label: "SIAP MANGGUNG / MC", desc: "Siap tampil di panggung publik & event komunitas utama." };
    return { label: "KREATOR MASTER", desc: "Berpengalaman tinggi & siap membimbing kreator lain." };
  };

  const stageInfo = getStageInfo(readinessScore);

  return (
    <div className="bg-transparent border-0 p-0 space-y-8 shadow-none w-full animate-fade-in text-[#212121] dark:text-[#F4F4F4] font-sans">

      {/* 📱 MOBILE HERO TALENT PROFILE (IMAGE OVERLAY SHEET CARD - MATCHING REFERENCE DESIGN) */}
      <div className="md:hidden flex flex-col pb-8 border-b border-[#212121]/10 dark:border-white/10">
        {/* Full-width tall portrait photo canvas (Sticky Parallax Behind Sheet) */}
        <div className="sticky top-16 sm:top-20 z-0 w-full aspect-[4/5] max-h-[460px] bg-neutral-900 text-white overflow-hidden rounded-3xl shadow-sm relative">
          {/* Floating Edit Profil Button on Top Left with Pencil Logo */}
          {isOwner && (
            <Link
              href="/myprofile/edit"
              className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 text-xs font-semibold shadow-md transition-all active:scale-95"
              title="Edit Profil"
            >
              <Pencil size={13} className="shrink-0" />
              <span>Edit Profil</span>
            </Link>
          )}

          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.full_name || member.stage_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#1A1A1A] via-[#212121] to-[#2E2E2E] text-white p-6 select-none">
              <span className="text-6xl font-bold font-sans tracking-tight opacity-90">{initials}</span>
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase mt-3">[ TALENT CANVAS ]</span>
            </div>
          )}
        </div>

        {/* Overlapping Sheet Card */}
        <div className="-mt-16 sm:-mt-20 relative z-10 w-full bg-[#F6F5FA] dark:bg-[#0E1210] text-[#212121] dark:text-[#F4F4F4] rounded-t-[28px] sm:rounded-t-[32px] rounded-b-none pt-5 px-0 pb-0 border-0 shadow-none flex flex-col items-center text-center">
          {/* Top Handle / Drag Indicator */}
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mb-5" />

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#212121] dark:text-white capitalize">
            {nameToDisplay}
          </h1>

          {/* Stage name or username & occupation */}
          {(member.stage_name || member.username || member.occupation) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              {member.stage_name && (
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {member.stage_name}
                </span>
              )}
              <span>•</span>
              {member.occupation && (
                <>
                  <span className="capitalize">{member.occupation.replace(/_/g, " ")}</span>
                </>
              )}
            </div>
          )}

          {/* Bio Description */}
          <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans mt-4 max-w-sm sm:max-w-md">
            {member.description || "Belum ada bio singkat. Lengkapi profilmu di menu Edit Profil."}
          </p>

          {/* Additional details: City, Social Media & Referral */}
          {(socialLinks.length > 0 || member.city || member.affiliate_code) && (
            <div className="w-full pt-4 mt-4 border-t border-[#212121]/10 dark:border-white/10 flex flex-col items-center gap-3">
              {member.city && (
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-xs font-mono text-[11px]">
                  <MapPin size={12} className="shrink-0 text-neutral-400" />
                  <span>{member.city}</span>
                </div>
              )}

              {/* Social Media Links with Account Names */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
                  {socialLinks.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 text-xs font-medium transition-all shadow-2xs hover:scale-105 active:scale-95"
                        title={item.label}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-[130px]">{item.text}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Revamped Mobile Affiliate Card */}
              {member.affiliate_code && (
                <div className="w-full max-w-md mt-1 p-4 rounded-2xl bg-white/80 dark:bg-[#151B18]/80 backdrop-blur-sm border border-[#212121]/10 dark:border-white/10 shadow-2xs space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold font-mono tracking-wider text-neutral-600 dark:text-neutral-300 uppercase">
                        Program Affiliate
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Aktif
                    </span>
                  </div>

                  {/* Kode Referral Box */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 transition-all">
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">Kode Referral</span>
                    {copiedCode ? (
                      <span className="font-mono font-bold text-xs tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in duration-150">
                        <Check size={13} className="stroke-[2.5]" />
                        Kode tersalin
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-xs tracking-wider text-neutral-900 dark:text-neutral-100 selection:bg-[#eff0a3]">
                        {member.affiliate_code}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl bg-[#eff0a3] text-[#1E301B] dark:bg-[#eff0a3] dark:text-[#1E301B] text-xs font-bold hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                      title="Salin Kode Referral"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-800" /> : <Copy size={14} />}
                      <span>{copiedCode ? "Tersalin" : "Salin Kode"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl bg-[#212121] dark:bg-white text-white dark:text-[#212121] text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                      title="Salin Link Referral"
                    >
                      {copiedLink ? <Check size={14} /> : <Link2 size={14} />}
                      <span>{copiedLink ? "Tersalin" : "Salin Link"}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center leading-tight">
                    Ajak teman bergabung & dapatkan komisi dari setiap sesi pendaftaran.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🌟 DESKTOP HERO TALENT PROFILE (CLEAN MINIMALIST MONOCHROME & SMOOTH PALETTE) */}
      <div className="hidden md:flex md:flex-row items-start gap-6 sm:gap-8 pb-8 border-b border-[#212121]/10 dark:border-white/10">

        {/* LEFT: TALL PORTRAIT RECTANGLE PHOTO / CANVAS */}
        <div className="w-full sm:w-[220px] md:w-[240px] lg:w-[260px] aspect-[3/4] min-h-[320px] md:min-h-[360px] bg-[#212121] text-white relative overflow-hidden flex items-center justify-center shrink-0 rounded-2xl shadow-sm">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.full_name || member.stage_name}
              className="w-full h-full object-cover contrast-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#1A1A1A] via-[#212121] to-[#2E2E2E] text-white p-6 select-none">
              <span className="text-5xl font-bold font-sans tracking-tight opacity-90">{initials}</span>
              <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase mt-3">[ TALENT CANVAS ]</span>
            </div>
          )}
        </div>

        {/* RIGHT: STACKED BOLD TYPOGRAPHY & IDENTITY DETAILS (CONTENT ANCHORED BOTTOM-UP) */}
        <div className="flex-1 w-full flex flex-col justify-end self-stretch py-0.5 space-y-4">

          {/* TOP / MAIN HEADER SECTION: STACKED NAME + NAMA PANGGUNG & OCCUPATION + BIO */}
          <div className="space-y-2">
            <div>
              <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#212121] dark:text-white leading-[0.95]">
                <span>{firstWord}</span>
                {restWords && <span className="block mt-1">{restWords}</span>}
              </h1>

              {/* NAMA PANGGUNG & OCCUPATION INLINE META */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                {member.stage_name ? (
                  <span className="text-neutral-700 dark:text-neutral-300 font-semibold tracking-wide">
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
                    <span className="uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-semibold">
                      {member.occupation.replace(/_/g, " ")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* BIO SECTION (NATURALLY INTEGRATED) */}
            {member.description ? (
              <p className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans pt-1">
                {member.description}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 italic font-sans pt-0.5">
                Belum ada bio singkat. Lengkapi profilmu di menu Edit Profil.
              </p>
            )}
          </div>

          {/* METADATA LIST (LOCATION, EMAIL, PHONE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t border-[#212121]/10 dark:border-white/10 text-xs">
            {member.city && (
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                <MapPin size={13} className="text-neutral-400 shrink-0" />
                <span className="truncate">{member.city}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-mono text-[11px] truncate">
                <Mail size={13} className="text-neutral-400 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {member.whatsapp_number && (
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                <Phone size={13} className="text-neutral-400 shrink-0" />
                <span className="truncate">{member.whatsapp_number}</span>
              </div>
            )}
          </div>

          {/* SOCIAL LINKS & REFERRAL QUICK ACTION */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#212121]/10 dark:border-white/10">
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#151B18] text-[#212121] dark:text-neutral-300 hover:text-black dark:hover:text-white border border-[#212121]/10 dark:border-white/10 transition-all shadow-2xs hover:scale-105 active:scale-95"
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>

            {/* Referral Code Copy & Share Profile */}
            <div className="flex items-center gap-2">
              {member.affiliate_code && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eff0a3] text-[#1E301B] dark:bg-[#253822] dark:text-[#eff0a3] text-xs font-mono font-bold hover:opacity-90 transition-all shadow-2xs cursor-pointer active:scale-95 border border-[#1E301B]/10"
                  title="Salin Kode Referral"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-700 dark:text-emerald-300" /> : <Copy size={12} />}
                  <span>{member.affiliate_code}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#212121] dark:bg-white text-white dark:text-[#212121] text-xs font-sans font-bold hover:opacity-90 transition-opacity shadow-2xs cursor-pointer active:scale-95"
                title="Salin Link Profil"
              >
                {copiedLink ? <Check size={12} /> : <Link2 size={12} />}
                <span>Bagikan</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: RINGKASAN KEHADIRAN & AKTIVITAS EVENT (CADENCE STREAK) */}
      <div className="space-y-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-1 sm:gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg md:text-xl text-[#212121] dark:text-white flex items-center gap-2">
            Ringkasan <span className="highlight-stabilo">Kehadiran</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ KEHADIRAN & AKTIVITAS ]
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          {/* SISI KIRI: METRIK EVENT TOTAL (4 COLS) - HONEYDEW ACCENT TINT */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#CFDECA]/25 dark:bg-[#CFDECA]/10 border border-[#CFDECA]/50 dark:border-[#CFDECA]/20 flex flex-col justify-between space-y-4 shadow-2xs">
            <div>
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md mb-3">
                TOTAL EVENT DIHADIRI
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#212121] dark:text-white">
                  {totalAttended}
                </span>
                <span className="text-xs font-sans text-neutral-700 dark:text-neutral-300 font-semibold uppercase tracking-wider">
                  Sesi Komunitas
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#212121]/10 dark:border-white/10 space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-mono text-neutral-500 dark:text-neutral-400 font-bold block">
                ACARA TERAKHIR DIIKUTI
              </span>
              {latestEvent ? (
                <div>
                  <p className="font-bold text-[#212121] dark:text-white text-xs leading-snug line-clamp-2">
                    {latestEvent.title}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
                    <Calendar size={11} className="shrink-0" />
                    <span>
                      {new Date(latestEvent.event_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                  Belum ada acara yang diikuti
                </p>
              )}
            </div>
          </div>

          {/* SISI KANAN: EVENT ACTIVITY CADENCE STREAK (GITHUB-STYLE HEATMAP TILES) (8 COLS) */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md mb-2">
                  RIWAYAT SESI MANGGUNG (16 SESI)
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                  Visualisasi kehadiran sesi berkala panggung & komunitas. Klik nomor untuk detail.
                </p>
              </div>

              {/* LEGEND BADGE */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-600 dark:text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
                <span>Kosong</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-[#EFF0A3] dark:bg-[#EFF0A3]/90 border border-black/10" />
                <span>Hadir</span>
              </div>
            </div>

            {/* HEATMAP CADENCE GRID */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 sm:gap-2 py-1">
              {Array.from({ length: 16 }).map((_, idx) => {
                const isAttended = idx < totalAttended;
                const sessionNum = idx + 1;
                const sessionRecord = attendanceRecords && attendanceRecords[idx] ? attendanceRecords[idx] : null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSession({ number: sessionNum, record: sessionRecord })}
                    title={`Sesi #${sessionNum}: Klik untuk melihat detail acara`}
                    className={`aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer group relative active:scale-90 hover:scale-105 ${isAttended
                      ? "bg-[#EFF0A3] dark:bg-[#EFF0A3] text-[#212121] font-bold shadow-2xs scale-100 border border-[#212121]/15 hover:ring-2 hover:ring-[#EFF0A3]/60"
                      : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-600 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                  >
                    <span className="text-[8px] sm:text-[9px] font-mono">
                      {sessionNum}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 dark:text-neutral-500 pt-2 border-t border-[#212121]/10 dark:border-white/10">
              <span>SESI 01</span>
              <span>SESI 08</span>
              <span>SESI 16</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SELF-DIAGNOSTIC PUBLIC SPEAKING & MENTAL (TABLE & TIMELINE HIGHLIGHT) */}
      {(interests?.ps_challenges || interests?.nervous_trigger || interests?.confidence_scale) && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-1 sm:gap-2">
            <h3 className="font-sans font-bold text-base sm:text-lg md:text-xl text-[#212121] dark:text-white">
              Diagnosis & Tantangan <span className="highlight-stabilo">Public Speaking</span>
            </h3>
            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              [ DIAGNOSTIK MENTAL ]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            {/* TANTANGAN UTAMA DENGAN CONNECTED DOT LIST (7 COLS) */}
            <div className="md:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 space-y-4 shadow-2xs">
              <div>
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md">
                  TANTANGAN UTAMA BERBICARA
                </span>
              </div>

              {interests.ps_challenges && interests.ps_challenges.length > 0 ? (
                <div className="relative pl-6 space-y-2.5 pt-1 before:absolute before:left-[7px] before:top-3.5 before:bottom-3.5 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800">
                  {interests.ps_challenges.map((challenge: string, idx: number) => (
                    <div key={idx} className="relative flex items-center gap-3">
                      {/* Connected Dot */}
                      <span className="absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#212121] dark:bg-white ring-4 ring-white dark:ring-[#151B18] shadow-2xs" />
                      </span>
                      {/* Content Pill Card */}
                      <div className="flex-1 px-3.5 py-2 rounded-xl bg-[#F6F5FA] dark:bg-[#1E2622] border border-[#212121]/5 dark:border-white/5 text-xs font-semibold text-[#212121] dark:text-neutral-100 shadow-2xs hover:border-[#212121]/20 dark:hover:border-white/20 transition-colors">
                        {challenge}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">Belum ada data tantangan yang dipilih.</p>
              )}
            </div>

            {/* PEMICU GUGUP & TINGKAT KEPERCAYAAN DIRI (5 COLS) - SOFT SLATE TINT */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-[#D8DFE9]/25 dark:bg-[#D8DFE9]/10 border border-[#D8DFE9]/50 dark:border-[#D8DFE9]/20 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md">
                  PEMICU GUGUP UTAMA
                </span>
                <p className="text-xs font-medium text-[#212121] dark:text-neutral-200 leading-relaxed pt-1">
                  {interests.nervous_trigger || "Tidak ada catatan pemicu gugup spesifik."}
                </p>
              </div>

              {/* CONFIDENCE SCALE BAR */}
              <div className="pt-3 border-t border-[#212121]/10 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-bold">Skala Kepercayaan Diri</span>
                  <span className="font-mono font-bold text-[#212121] dark:text-white">
                    {confidenceScale}/10 Pede
                  </span>
                </div>
                <div className="w-full bg-white/70 dark:bg-neutral-800 h-2 rounded-full overflow-hidden border border-black/5">
                  <div
                    className="bg-[#212121] dark:bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${(confidenceScale / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PERSONA, VISI & MONETISASI KREATOR (STRUCTURED BENTO TABLE) */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-1 sm:gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg md:text-xl text-[#212121] dark:text-white">
            Persona, Visi & <span className="highlight-stabilo">Monetisasi</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ METRICS & GOALS ]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* KARTU 1: INSPIRASI & AUDIENS */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 space-y-4 shadow-2xs">
            <div className="space-y-1.5">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#CFDECA] text-[#1E301B] dark:bg-[#253822] dark:text-[#CFDECA] px-2.5 py-0.5 rounded-md">
                ROLE MODEL / INSPIRASI
              </span>
              <p className="text-sm font-bold text-[#212121] dark:text-white">
                {interests?.role_model || "-"}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#212121]/10 dark:border-white/10">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#CFDECA] text-[#1E301B] dark:bg-[#253822] dark:text-[#CFDECA] px-2.5 py-0.5 rounded-md">
                TARGET AUDIENS KREATOR
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                {interests?.target_audience || "-"}
              </p>
            </div>

            {interests?.career_obstacle && (
              <div className="space-y-1.5 pt-3 border-t border-[#212121]/10 dark:border-white/10">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#CFDECA] text-[#1E301B] dark:bg-[#253822] dark:text-[#CFDECA] px-2.5 py-0.5 rounded-md">
                  TANTANGAN KARIER UTAMA
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                  {interests.career_obstacle}
                </p>
              </div>
            )}
          </div>

          {/* KARTU 2: MONETISASI, SKILL & KOMITMEN */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 space-y-4 shadow-2xs">
            <div className="space-y-1.5">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFF0A3] text-[#302F1A] dark:bg-[#38371F] dark:text-[#EFF0A3] px-2.5 py-0.5 rounded-md">
                MINAT MONETISASI
              </span>
              <div>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold font-sans bg-[#212121] text-white dark:bg-white dark:text-[#212121] shadow-2xs">
                  {interests?.monetization_interest || "Belum Dipilih"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#212121]/10 dark:border-white/10">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFF0A3] text-[#302F1A] dark:bg-[#38371F] dark:text-[#EFF0A3] px-2.5 py-0.5 rounded-md">
                SKILL YANG INGIN DIKUASAI
              </span>
              <p className="text-xs font-bold text-[#212121] dark:text-white">
                {interests?.skills_to_master || "-"}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#212121]/10 dark:border-white/10">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFF0A3] text-[#302F1A] dark:bg-[#38371F] dark:text-[#EFF0A3] px-2.5 py-0.5 rounded-md">
                KOMUNITAS AKTIF
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                {interests?.active_communities || "Panggung Kreator"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PILAR KEAHLIAN & TARGET KREATOR (CONNECTED TIMELINE & TAGS) */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between border-b border-[#212121]/10 dark:border-neutral-800 pb-3 gap-1 sm:gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg md:text-xl text-[#212121] dark:text-white">
            Pilar Keahlian & <span className="highlight-stabilo">Target Kreator</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ SKILLS & ROADMAP ]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* PILAR KEAHLIAN UTAMA */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 space-y-3 shadow-2xs">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md">
                BIDANG KREASI YANG DITEKUNI
              </span>
            </div>

            {hasInterests ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {primaryInterests.map((interest: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#212121]/10 dark:border-white/10 bg-[#F6F5FA] dark:bg-neutral-800 text-[#212121] dark:text-neutral-100 shadow-2xs hover:border-[#212121]/30 transition-colors"
                  >
                    {(INTEREST_MAP[interest] || interest.replace(/_/g, " "))}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {DEFAULT_PILLARS.map((pilar, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400"
                  >
                    {pilar}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* TARGET & GOALS ROADMAP (CONNECTED DOT LIST) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151B18] border border-[#212121]/10 dark:border-white/10 space-y-3 shadow-2xs">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-[#212121] dark:bg-white text-white dark:text-[#212121] px-2.5 py-0.5 rounded-md">
                ROADMAP & TARGET KREATOR
              </span>
            </div>

            {hasGoals ? (
              <div className="relative pl-6 space-y-2.5 pt-2 before:absolute before:left-[7px] before:top-3.5 before:bottom-3.5 before:w-[2px] before:bg-[#EFF0A3]/70 dark:before:bg-[#EFF0A3]/40">
                {goals.map((goal: string, idx: number) => (
                  <div key={idx} className="relative flex items-center gap-3 text-xs text-[#212121] dark:text-neutral-200 font-sans">
                    {/* Precise Connected Dot on vertical line with Vanilla Accent */}
                    <span className="absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EFF0A3] ring-4 ring-white dark:ring-[#151B18] border border-[#212121]/20 shadow-2xs" />
                    </span>
                    <div className="flex-1 px-3.5 py-2 rounded-xl bg-[#F6F5FA] dark:bg-neutral-800/90 border border-[#212121]/5 dark:border-white/5 font-semibold leading-relaxed shadow-2xs">
                      {goal}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 font-sans italic pt-2">
                Belum ada target spesifik yang disimpan. Perbarui di Edit Profil.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🎟️ POPUP DETAIL SESI PANGGUNG */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={selectedSession ? `Sesi #${selectedSession.number}` : ""}
        subtitle="Riwayat Sesi Panggung & Komunitas"
        maxWidth="max-w-sm"
      >
        {selectedSession && (
          <div className="space-y-4 pt-1 text-left">
            {selectedSession.record ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Hadir di Acara</span>
                </div>

                <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold block mb-1">
                      Nama Acara
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                      {selectedSession.record.event?.title || "Sesi Panggung Kreator"}
                    </h4>
                  </div>

                  {selectedSession.record.event?.event_date && (
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold block mb-1">
                        Tanggal Pelaksanaan
                      </span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        <Calendar size={13} className="text-neutral-500 shrink-0" />
                        <span>
                          {new Date(selectedSession.record.event.event_date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedSession.record.event?.start_time && (
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <Clock size={13} className="text-neutral-400 shrink-0" />
                      <span>
                        {selectedSession.record.event.start_time.slice(0, 5)} WIB
                        {selectedSession.record.event.end_time ? ` - ${selectedSession.record.event.end_time.slice(0, 5)} WIB` : ""}
                      </span>
                    </div>
                  )}

                  {selectedSession.record.event?.location && (
                    <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <MapPin size={13} className="text-neutral-400 shrink-0" />
                      <span>{selectedSession.record.event.location}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span>Belum Diikuti</span>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 text-center py-4">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Kamu belum tercatat hadir pada Sesi #{selectedSession.number}. Tetap ikuti sesi komunitas dan panggung kreator selanjutnya!
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
