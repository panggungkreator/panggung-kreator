"use client";

import React from "react";
import Link from "next/link";
import { MemberProfile } from "@/lib/types/member";
import { Globe } from "lucide-react";

interface ProfileSidebarProps {
  member: MemberProfile;
  onSignout: () => void;
  onLinkClick?: () => void;
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

export default function ProfileSidebar({ member, onSignout, onLinkClick }: ProfileSidebarProps) {
  const initials = (member.stage_name || member.full_name || "M")
    .substring(0, 2)
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

  const socialLinks = [
    isValidVal(member.instagram_username) && {
      label: "Instagram",
      icon: InstagramIcon,
      url: `https://instagram.com/${member.instagram_username!.replace("@", "").trim()}`,
      text: `@${member.instagram_username!.replace("@", "").trim()}`,
    },
    isValidVal(member.tiktok_username) && {
      label: "TikTok",
      icon: TikTokIcon,
      url: `https://tiktok.com/@${member.tiktok_username!.replace("@", "").trim()}`,
      text: `@${member.tiktok_username!.replace("@", "").trim()}`,
    },
    isValidVal(member.youtube_url) && {
      label: "YouTube",
      icon: YouTubeIcon,
      url: member.youtube_url!.startsWith("http") ? member.youtube_url! : `https://${member.youtube_url!}`,
      text: "Channel",
    },
    isValidVal(member.linkedin_url) && {
      label: "LinkedIn",
      icon: LinkedInIcon,
      url: member.linkedin_url!.startsWith("http") ? member.linkedin_url! : `https://${member.linkedin_url!}`,
      text: "Profil",
    },
    isValidVal(member.portfolio_url) && {
      label: "Website",
      icon: Globe,
      url: member.portfolio_url!.startsWith("http") ? member.portfolio_url! : `https://${member.portfolio_url!}`,
      text: "Portfolio",
    },
  ].filter(Boolean) as { label: string; icon: React.ElementType; url: string; text: string }[];

  return (
    <div className="bg-transparent border-0 p-0 flex flex-col items-center text-center shadow-none relative overflow-hidden rounded-none w-full">
      {/* CARD TOP LABEL */}
      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
        PROFIL MEMBER
      </span>

      {/* AVATAR PHOTO / INITIALS (CIRCLE & NO BORDER) */}
      <div className="relative my-4 flex items-center justify-center w-full">
        <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex-shrink-0">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.stage_name || member.full_name}
              className="w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-4xl font-bold font-mono">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* MEMBER NAME & STAGE NAME */}
      <div className="space-y-1 w-full mt-2">
        <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-white font-normal leading-snug">
          <span className="highlight-stabilo font-semibold">{member.stage_name || member.full_name}</span>
        </h2>
        {member.stage_name && member.full_name && (
          <p className="text-xs font-sans text-neutral-500 dark:text-neutral-400">
            {member.full_name}
          </p>
        )}
        {member.username && (
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            @{member.username}
          </p>
        )}
      </div>

      {/* TIER & METADATA BADGES (NO ICONS) */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4 w-full">
        <span className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
          {member.membership_tier.toUpperCase()} TIER
        </span>

        {member.city && (
          <span className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
            {member.city}
          </span>
        )}

        {member.occupation && (
          <span className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
            {member.occupation.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* SOCIAL LINKS (VERTICAL LIST, MONOCHROME WITH ICONS) */}
      {socialLinks.length > 0 && (
        <div className="w-full pt-4 pb-1 space-y-1 border-b border-neutral-200 dark:border-neutral-800">
          {socialLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-1.5 px-2 rounded-none hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group w-full text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 truncate max-w-[140px]">
                  {item.text}
                </span>
              </a>
            );
          })}
        </div>
      )}

      {/* ACTION BUTTONS (EDIT PROFIL & LOGOUT) - NO ICONS */}
      <div className="w-full space-y-2.5 pt-5">
        <Link
          href="/myprofile/edit"
          onClick={onLinkClick}
          className="w-full py-2.5 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest transition-colors block text-center border border-neutral-900 dark:border-white"
        >
          Edit Profil
        </Link>

        <button
          onClick={onSignout}
          className="w-full py-2.5 px-4 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer block text-center"
        >
          Logout
        </button>
      </div>

      {/* JOIN DATE */}
      <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 w-full text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
        TERDAFTAR: {formattedJoinDate}
      </div>
    </div>
  );
}
