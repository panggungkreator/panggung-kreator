"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile } from "@/lib/types/member";
import { Search, MapPin, Award, User, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";

const INTERESTS = [
  { value: 'public_speaking', label: 'Public Speaking' },
  { value: 'mc_host',         label: 'MC / Host' },
  { value: 'voice_over',      label: 'Voice Over' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'personal_branding', label: 'Personal Branding' },
  { value: 'live_host',       label: 'Live Host' },
];

export default function TalentShowcasePage() {
  const [talents, setTalents] = useState<MemberProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTalents = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Query member dengan detail kuesioner interest-nya
      let query = supabase
        .from("members")
        .select("*, interests:member_interests(*)")
        .eq("role", "member")
        .not("username", "is", null); // Hanya yang punya username publik

      const { data, error } = await query;
      if (error) throw error;
      setTalents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  // Client-side filtering for fast interactive search
  const filteredTalents = talents.filter((t) => {
    const matchesSearch =
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.stage_name && t.stage_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.city && t.city.toLowerCase().includes(search.toLowerCase())) ||
      (t.occupation && t.occupation.toLowerCase().includes(search.toLowerCase()));

    const matchesInterest =
      !selectedInterest ||
      (t.interests?.primary_interests &&
        (t.interests.primary_interests as string[]).includes(selectedInterest));

    return matchesSearch && matchesInterest;
  });

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0A0A0A] text-black dark:text-white font-sans selection:bg-black selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-black dark:border-zinc-800 pb-6 gap-4">
          <h1 className="text-3xl lg:text-4xl font-serif italic tracking-tight leading-none text-black dark:text-white">
            Talent <br />
            <span className="not-italic font-sans font-black tracking-wide text-zinc-850 dark:text-zinc-300 uppercase text-2xl lg:text-3xl">
              Showcase & Directory
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-450 font-mono uppercase tracking-wider">
            [ MENAMPILKAN KREATOR TERBAIK INDONESIA ]
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 p-4 gap-4 items-center">
          <div className="relative col-span-1 sm:col-span-2">
            <span className="absolute left-3 top-2.5 text-zinc-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, kota, profesi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent pl-10 border-b border-zinc-200 dark:border-zinc-800 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-1.5 text-xs rounded-none focus:outline-none focus:border-black dark:focus:border-white text-zinc-500 dark:text-zinc-400 cursor-pointer appearance-none"
            >
              <option value="">Semua Bidang Minat</option>
              {INTERESTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TALENT DIRECTORY GRID */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="border border-dashed border-zinc-300 dark:border-zinc-800 py-16 text-center text-xs text-zinc-500 dark:text-zinc-450 font-mono">
            [ TIDAK MENEMUKAN KREATOR YANG COCOK DENGAN PENCARIAN ANDA ]
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {filteredTalents.map((talent) => (
              <Link
                key={talent.id}
                href={`/talent/${talent.username}`}
                className="bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 p-5 space-y-4 flex flex-col justify-between hover:border-black dark:hover:border-white transition-all group cursor-pointer"
              >
                {/* Photo / Avatar */}
                <div className="relative aspect-square w-full bg-neutral-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                  {talent.avatar_url ? (
                    <img
                      src={talent.avatar_url}
                      alt={talent.full_name}
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="text-zinc-300 dark:text-zinc-700">
                      <User size={64} />
                    </div>
                  )}
                  
                  {talent.membership_tier !== "free" && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white font-sans text-[7px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-amber-600">
                      Pro
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-tight text-black dark:text-white line-clamp-1">
                      {talent.stage_name || talent.full_name}
                    </h3>
                    
                    {talent.occupation && talent.occupation !== "other" && (
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block uppercase tracking-wider font-mono">
                        {talent.occupation.replace('_', ' ')}
                      </span>
                    )}

                    {talent.city && (
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500 flex items-center gap-0.5 font-mono">
                        <MapPin size={8} /> {talent.city.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Chips Interests */}
                  {talent.interests?.primary_interests && talent.interests.primary_interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-900 mt-2">
                      {talent.interests.primary_interests.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="px-1.5 py-0.5 bg-neutral-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[8px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                        >
                          {item.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
