"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { MemberProfile } from "@/lib/types/member";
import { toast } from "sonner";
import {
  Globe,
  Loader2,
  RotateCcw,
  Check,
} from "lucide-react";

interface SocialLinksPanelProps {
  member: MemberProfile;
  onSaved?: (updatedMember?: Partial<MemberProfile>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  saveTriggerRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  discardTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

export default function SocialLinksPanel({
  member,
  onSaved,
  onDirtyChange,
  saveTriggerRef,
  discardTriggerRef,
}: SocialLinksPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [instagramUsername, setInstagramUsername] = useState(
    member.social_media?.instagram || ""
  );
  const [tiktokUsername, setTiktokUsername] = useState(
    member.social_media?.tiktok || ""
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    member.social_media?.youtube || ""
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    member.social_media?.linkedin || ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    member.portfolio_url || ""
  );

  const isDirty = useMemo(() => {
    return (
      instagramUsername !== (member.social_media?.instagram || "") ||
      tiktokUsername !== (member.social_media?.tiktok || "") ||
      youtubeUrl !== (member.social_media?.youtube || "") ||
      linkedinUrl !== (member.social_media?.linkedin || "") ||
      portfolioUrl !== (member.portfolio_url || "")
    );
  }, [
    instagramUsername,
    tiktokUsername,
    youtubeUrl,
    linkedinUrl,
    portfolioUrl,
    member,
  ]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleReset = useCallback(() => {
    setInstagramUsername(member.social_media?.instagram || "");
    setTiktokUsername(member.social_media?.tiktok || "");
    setYoutubeUrl(member.social_media?.youtube || "");
    setLinkedinUrl(member.social_media?.linkedin || "");
    setPortfolioUrl(member.portfolio_url || "");
    toast.info("Perubahan tautan jejaring dibatalkan.");
  }, [member]);

  const formatYoutubeUrl = (url: string): string => {
    const trimmed = (url || "").trim();
    if (!trimmed || trimmed === "-") return "-";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("youtube.com") || trimmed.startsWith("www.youtube.com")) {
      return `https://${trimmed}`;
    }
    if (trimmed.startsWith("@")) {
      return `https://youtube.com/${trimmed}`;
    }
    return `https://${trimmed}`;
  };

  const formatLinkedinUrl = (url: string): string => {
    const trimmed = (url || "").trim();
    if (!trimmed || trimmed === "-") return "-";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("linkedin.com") || trimmed.startsWith("www.linkedin.com")) {
      return `https://${trimmed}`;
    }
    if (trimmed.startsWith("in/")) {
      return `https://linkedin.com/${trimmed}`;
    }
    return `https://${trimmed}`;
  };

  const formatWebsiteUrl = (url: string): string => {
    const trimmed = (url || "").trim();
    if (!trimmed || trimmed === "-") return "-";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSave = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const socialMediaPayload = {
        instagram: instagramUsername.trim() || null,
        tiktok: tiktokUsername.trim() || null,
        youtube: formatYoutubeUrl(youtubeUrl),
        linkedin: formatLinkedinUrl(linkedinUrl),
      };
      const formattedPortfolioUrl = formatWebsiteUrl(portfolioUrl);

      const response = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            social_media: socialMediaPayload,
            portfolio_url: formattedPortfolioUrl,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal memperbarui tautan sosial media.");
      }

      toast.success("Tautan sosial media & portofolio berhasil disimpan!");
      if (onSaved) {
        onSaved({
          social_media: socialMediaPayload as any,
          portfolio_url: formattedPortfolioUrl,
        });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }, [
    instagramUsername,
    tiktokUsername,
    youtubeUrl,
    linkedinUrl,
    portfolioUrl,
    onSaved,
  ]);

  useEffect(() => {
    if (saveTriggerRef) {
      saveTriggerRef.current = handleSave;
    }
    if (discardTriggerRef) {
      discardTriggerRef.current = handleReset;
    }
  }, [saveTriggerRef, discardTriggerRef, handleSave, handleReset]);

  return (
    <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      {/* SECTION HEADER */}
      <div className="border-b border-border-default/60 pb-4">
        <h2 className="text-base font-bold text-text-primary">
          Tautan Sosial Media & Portofolio Web
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Tautkan akun sosial media dan portofolio eksternal untuk memperkuat personal branding Anda.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* INSTAGRAM */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-pink-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              <span>Instagram</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs select-none">
                @
              </span>
              <input
                type="text"
                value={instagramUsername.replace(/^@/, "")}
                onChange={(e) => setInstagramUsername(e.target.value.replace(/^@/, ""))}
                placeholder="username_instagram"
                className="w-full pl-8 pr-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
              />
            </div>
          </div>

          {/* TIKTOK */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              <span>TikTok</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs select-none">
                @
              </span>
              <input
                type="text"
                value={tiktokUsername.replace(/^@/, "")}
                onChange={(e) => setTiktokUsername(e.target.value.replace(/^@/, ""))}
                placeholder="username_tiktok"
                className="w-full pl-8 pr-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
              />
            </div>
          </div>

          {/* YOUTUBE */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              <span>Channel YouTube</span>
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/@channelAnda"
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* LINKEDIN */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-bold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              <span>Profil LinkedIn</span>
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/profilAnda"
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>

          {/* WEBSITE PORTOFOLIO */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-text-secondary mb-1.5 font-bold flex items-center gap-1.5">
              <Globe size={13} className="text-emerald-500 shrink-0" />
              <span>Website Portofolio Eksternal</span>
            </label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://portfolio-anda.com atau drive/notion link"
              className="w-full px-4 py-2.5 bg-bg-well/50 border border-border-default rounded-xl text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-hidden focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-4 border-t border-border-default/60">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-well transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer bg-text-primary text-bg-card hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
