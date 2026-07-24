"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, PortfolioItem, Pillar } from "@/lib/types/member";
import { Globe, MapPin, Film, Award, ExternalLink, ArrowLeft, User, Video } from "lucide-react";
import Link from "next/link";

interface TalentDetailPageProps {
  params: Promise<{
    username: string;
  }> | { username: string };
}

const PILLARS: { value: Pillar; label: string }[] = [
  { value: "public_speaking", label: "🎤 Public Speaking" },
  { value: "content_creation", label: "🎬 Content Creation" },
  { value: "personal_branding", label: "✨ Personal Branding" },
];

export default function TalentDetailPage({ params }: TalentDetailPageProps) {
  const resolvedParams = use(Promise.resolve(params));
  const username = resolvedParams.username;

  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [activePillar, setActivePillar] = useState<Pillar>("public_speaking");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchTalentDetails = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Query member by username
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

      // Query public portfolio items for the member
      const { data: portfolioItems, error: portError } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("member_id", profile.id)
        .eq("is_public", true)
        .order("sort_order", { ascending: true });

      if (portError) throw portError;
      setPortfolio(portfolioItems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalentDetails();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#0A0A0A] text-black dark:text-white">
        <svg className="animate-spin h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-black dark:text-white space-y-4">
        <h2 className="text-xl font-mono uppercase">[ 404_MEMBER_NOT_FOUND ]</h2>
        <p className="text-zinc-500 text-xs">Akun member dengan username ini tidak ditemukan.</p>
        <Link href="/talent" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider rounded-none">
          Kembali ke Showcase
        </Link>
      </div>
    );
  }

  const filteredPortfolio = portfolio.filter((item) => item.pillar === activePillar);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0A0A0A] text-black dark:text-white font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* BACK TO SHOWCASE LINK */}
        <div>
          <Link
            href="/talent"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={12} /> [ Kembali ke Directory ]
          </Link>
        </div>

        {/* PROFILE SPLIT VIEW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: PROFILE & CONTACT */}
          <div className="md:col-span-4 bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 p-6 space-y-6">
            
            {/* Avatar image */}
            <div className="relative aspect-square w-full bg-neutral-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-zinc-300 dark:text-zinc-700">
                  <User size={96} />
                </div>
              )}
            </div>

            {/* Stage name & Domisili */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white">
                {member.stage_name || member.full_name}
              </h2>
              {member.occupation && member.occupation !== "other" && (
                <span className="text-xs text-zinc-500 dark:text-zinc-450 uppercase font-mono tracking-wider block">
                  {member.occupation.replace('_', ' ')}
                </span>
              )}
              {member.city && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-0.5">
                  <MapPin size={10} /> {member.city.toUpperCase()}
                </span>
              )}
            </div>

            {/* Description / Bio */}
            {member.description && (
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-450 uppercase block">[ BIO / TENTANG ]</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  {member.description}
                </p>
              </div>
            )}

            {/* Social Links */}
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <span className="text-[9px] font-mono text-zinc-450 uppercase block">[ HUBUNGI TALENT ]</span>
              <div className="flex flex-wrap gap-2">
                {member.instagram_username && (
                  <a
                    href={
                      member.instagram_username.startsWith("http")
                        ? member.instagram_username
                        : `https://instagram.com/${member.instagram_username.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-zinc-500 dark:text-zinc-450"
                    title="Instagram"
                  >
                    <span className="text-[10px] font-bold font-mono">IG</span>
                  </a>
                )}
                {member.tiktok_username && (
                  <a
                    href={`https://tiktok.com/@${member.tiktok_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-zinc-500 dark:text-zinc-450"
                    title="TikTok"
                  >
                    <span className="text-[10px] font-bold font-mono">TK</span>
                  </a>
                )}
                {member.youtube_url && (
                  <a
                    href={member.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-zinc-500 dark:text-zinc-400"
                    title="YouTube"
                  >
                    <Video size={14} />
                  </a>
                )}
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-zinc-500 dark:text-zinc-400"
                    title="LinkedIn"
                  >
                    <span className="text-[10px] font-bold font-mono">IN</span>
                  </a>
                )}
                {member.portfolio_url && (
                  <a
                    href={member.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-zinc-500 dark:text-zinc-400"
                    title="Website"
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: PORTFOLIO SHOWCASE */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Pillar Selector Tab */}
            <div className="flex border-b border-zinc-250 dark:border-zinc-800 gap-1 overflow-x-auto">
              {PILLARS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setActivePillar(p.value)}
                  className={`px-5 py-3 text-xs font-mono uppercase tracking-widest border border-b-0 rounded-none cursor-pointer transition-all ${
                    activePillar === p.value
                      ? "bg-white dark:bg-[#121212] border-zinc-250 dark:border-zinc-800 text-black dark:text-white font-bold border-t-2 border-t-black dark:border-t-white"
                      : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Portfolio items grid */}
            {filteredPortfolio.length === 0 ? (
              <div className="bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 py-16 text-center text-xs text-zinc-500 dark:text-zinc-450 font-mono">
                [ TALENT BELUM MENUNJUKKAN KARYA DI PILAR INI ]
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                {filteredPortfolio.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 flex flex-col justify-between group relative"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-center">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="h-full w-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="text-zinc-500 flex flex-col items-center gap-2">
                          <Film size={28} />
                          <span className="text-[8px] uppercase font-mono tracking-wider">{item.item_type}</span>
                        </div>
                      )}
                      
                      {item.media_url && (
                        <a
                          href={item.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 p-1.5 bg-black/80 hover:bg-[#bc151b] text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-tight text-black dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-450 pt-2 border-t border-zinc-100 dark:border-zinc-900 mt-2">
                        SOURCE: {item.media_source.toUpperCase()} // TYPE: {item.item_type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
