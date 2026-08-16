"use client";

import React from "react";
import { MemberProfile } from "@/lib/types/member";

interface ProfileOverviewContentProps {
  member: MemberProfile;
  totalAttended: number;
  totalReferrals: number;
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
}: ProfileOverviewContentProps) {
  const interests = member.interests;
  const primaryInterests = interests?.primary_interests;
  const hasInterests = Array.isArray(primaryInterests) && primaryInterests.length > 0;

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
  const aiAnalysis = interests?.ai_analysis;

  return (
    <div className="bg-transparent border-0 p-0 space-y-8 shadow-none rounded-none w-full animate-fade-in text-neutral-900 dark:text-neutral-100">
      {/* SECTION 0: BIO / TENTANG MEMBER */}
      {member.description && (
        <div className="space-y-2 pb-2">
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            [ TENTANG / BIO ]
          </span>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
            {member.description}
          </p>
        </div>
      )}

      {/* SECTION 1: RINGKASAN AKTIVITAS & LEVEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h3 className="font-sans font-bold text-lg md:text-xl text-neutral-900 dark:text-white">
            <span className="highlight-stabilo">Fokus & Tujuan Kreator</span>
          </h3>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ IKHTISAR DATA ]
          </span>
        </div>

        {/* METRICS ROW (TRANSPARENT, MINIMALIST) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="border-l-2 border-neutral-900 dark:border-white pl-4 py-1 space-y-0.5">
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              [ EVENT DIHADIRI ]
            </span>
            <p className="text-base font-bold font-sans text-neutral-900 dark:text-white">
              <span className="highlight-stabilo">{totalAttended} Event Komunitas</span>
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Kehadiran aktif pada agenda mingguan dan bi-weekly.
            </p>
          </div>

          <div className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1 space-y-0.5">
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              [ LEVEL PENGALAMAN ]
            </span>
            <p className="text-base font-bold font-sans text-neutral-900 dark:text-white uppercase">
              <span className="highlight-stabilo">{experienceLevel ? `${experienceLevel}` : "Belum Diatur"}</span>
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Tingkat kematangan dalam berbicara dan memproduksi konten.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: MINAT & FOKUS KEAHLIAN */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          [ MINAT & FOKUS KEAHLIAN ]
        </h4>

        {hasInterests ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {primaryInterests.map((interest: string, idx: number) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200"
              >
                {(INTEREST_MAP[interest] || interest.replace(/_/g, " ")).toUpperCase()}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {DEFAULT_PILLARS.map((pilar, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400"
              >
                [ {pilar} ]
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: TARGET GOALS */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          [ TARGET & GOALS ]
        </h4>

        {hasGoals ? (
          <div className="space-y-2 pt-1">
            {goals.map((goal: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-sans"
              >
                <span className="text-neutral-400 dark:text-neutral-600 font-mono mt-0.5">•</span>
                <span className="leading-relaxed">{goal}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 font-mono italic">
            [ Belum ada target spesifik yang disimpan. Perbarui di Edit Profil. ]
          </p>
        )}
      </div>
    </div>
  );
}
