"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MemberProfile } from "@/lib/types/member";
import { Globe, Copy, Check, Lock, Link2, Shield } from "lucide-react";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/member/ChangePasswordModal";

interface ProfileSidebarProps {
  member: MemberProfile;
  onSignout?: () => void;
  onLinkClick?: () => void;
  isLoggingOut?: boolean;
  showActions?: boolean;
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

export default function ProfileSidebar({
  member,
  onSignout,
  onLinkClick,
  isLoggingOut,
  showActions = true,
}: ProfileSidebarProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const getAdminUrl = () => {
    if (typeof window === "undefined") return "/admin";
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":") || hostname === "[::1]";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || isIpAddress;

    if (isLocalhost) {
      return "/admin";
    }

    let rootDomain = "panggungkreator.web.id";
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      if (hostname.endsWith(".web.id") && parts.length >= 3) {
        rootDomain = parts.slice(-3).join(".");
      } else {
        rootDomain = parts.slice(-2).join(".");
      }
    }
    return process.env.NEXT_PUBLIC_ADMIN_URL || `${protocol}//admin.${rootDomain}${port}/`;
  };

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
    if (!member.affiliate_code) return;
    const link = `${window.location.origin}/akademi/checkout?ref=${member.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Link pendaftaran referral berhasil disalin!");
    setTimeout(() => setCopiedLink(false), 2500);
  };
  const initials = (member.full_name || member.stage_name || "M")
    .charAt(0)
    .toUpperCase();

  const formattedJoinDate = member.profile_completed_at || (member as any).created_at
    ? new Date((member as any).created_at || member.profile_completed_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

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

  const age = member.birth_date
    ? new Date().getFullYear() - new Date(member.birth_date).getFullYear()
    : null;

  return (
    <div className="w-full flex flex-col items-center text-center relative">
      {/* CARD TOP LABEL */}
      <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-6 hidden">
        PROFIL MEMBER
      </span>

      {/* PURE CANVAS INITIAL AVATAR */}
      <div className="relative my-2 sm:my-3 flex items-center justify-center w-full">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1C1C1C] dark:bg-white text-white dark:text-[#1C1C1C] flex items-center justify-center text-4xl sm:text-5xl font-sans font-bold shadow-md select-none">
          {initials}
        </div>
      </div>

      {/* MEMBER NAME & STAGE NAME */}
      <div className="space-y-1 w-full mt-2">
        <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-white font-normal leading-snug">
          <span className="highlight-stabilo font-semibold">{member.full_name || member.stage_name}</span>
        </h2>
        {member.stage_name && member.full_name && (
          <p className="text-xs font-sans text-neutral-500 dark:text-neutral-400">
            {member.stage_name}
          </p>
        )}
        {member.username && (
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            @{member.username}
          </p>
        )}
      </div>

      {/* TIER & METADATA PILLS */}
      <div className="flex flex-wrap justify-center items-center gap-1.5 mt-4 w-full">
        <span className="px-3 py-1 text-[11px] font-sans font-bold uppercase tracking-wider rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200">
          {member.membership_tier.toUpperCase()} TIER
        </span>

        {member.city && (
          <span className="px-3 py-1 text-[11px] font-sans font-medium uppercase tracking-wider rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white/40 dark:bg-neutral-900/40">
            {member.city}
          </span>
        )}

        {age !== null && (
          <span className="px-3 py-1 text-[11px] font-sans font-medium uppercase tracking-wider rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white/40 dark:bg-neutral-900/40">
            {age} THN
          </span>
        )}

        {member.occupation && (
          <span className="px-3 py-1 text-[11px] font-sans font-medium uppercase tracking-wider rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white/40 dark:bg-neutral-900/40">
            {member.occupation.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* SOCIAL LINKS (CIRCULAR BUTTONS) */}
      {socialLinks.length > 0 && (
        <div className="w-full pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#151B18] text-[#1C1C1C] dark:text-white border border-neutral-200/80 dark:border-neutral-800 shadow-2xs hover:scale-110 active:scale-95 transition-all"
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* REFERRAL QUICK COPY (CANVAS CLEAN) */}
      {member.affiliate_code && (
        <div className="w-full pt-6 space-y-2 text-left">
          <span className="text-[10px] font-sans font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
            KODE REFERRAL
          </span>

          {/* Code pill / clickable to copy code */}
          <div
            onClick={handleCopyCode}
            className="flex items-center justify-between p-3 bg-white dark:bg-[#151B18] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer group select-none shadow-2xs"
            title="Klik untuk salin kode saja"
          >
            <span className="text-sm font-mono font-bold text-[#1C1C1C] dark:text-white tracking-wider truncate">
              {member.affiliate_code}
            </span>
            {copiedCode ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
            ) : (
              <Copy className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0 ml-1.5 transition-colors" />
            )}
          </div>

          {/* Two Action Buttons: Salin Kode & Salin Link */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyCode}
              className={`py-2 px-3 text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none rounded-full active:scale-95 border ${copiedCode
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                  : "bg-white dark:bg-[#151B18] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#1C1C1C] dark:text-white border-neutral-200/80 dark:border-neutral-800 shadow-2xs"
                }`}
              title="Salin hanya kode referral"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 opacity-70" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`py-2 px-3 text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none rounded-full active:scale-95 border ${copiedLink
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                  : "bg-white dark:bg-[#151B18] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#1C1C1C] dark:text-white border-neutral-200/80 dark:border-neutral-800 shadow-2xs"
                }`}
              title="Salin tautan pendaftaran referral lengkap"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 opacity-70" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS (FOR MOBILE DRAWER) */}
      {showActions && (
        <>
          <div className="w-full space-y-2.5 pt-4">
            {member.role === "admin" && (
              <a
                href={getAdminUrl()}
                onClick={onLinkClick}
                className="w-full h-10 px-4 bg-amber-500 hover:bg-amber-600 text-black font-sans text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 font-bold rounded-full shadow-xs active:scale-95"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Dashboard Admin &rarr;</span>
              </a>
            )}

            <Link
              href="/myprofile/edit"
              onClick={onLinkClick}
              className="w-full h-10 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-sans text-xs uppercase tracking-wider transition-all flex items-center justify-center font-bold rounded-full shadow-xs active:scale-95"
            >
              Edit Profil
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsChangePasswordOpen(true);
                if (onLinkClick) onLinkClick();
              }}
              className="w-full h-10 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 font-sans text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center rounded-full active:scale-95"
            >
              Ganti Password
            </button>

            {onSignout && (
              <button
                type="button"
                onClick={onSignout}
                disabled={isLoggingOut}
                className="w-full h-10 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/60 font-sans text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center rounded-full disabled:opacity-50 active:scale-95"
              >
                {isLoggingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Logging out...</span>
                  </span>
                ) : (
                  "Logout"
                )}
              </button>
            )}
          </div>

          <ChangePasswordModal
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
          />
        </>
      )}

      {/* JOIN DATE */}
      <div className="pt-4 mt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 w-full text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        TERDAFTAR: {formattedJoinDate}
      </div>
    </div>
  );
}
