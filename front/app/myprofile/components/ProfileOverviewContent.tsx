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
    return { label: "🏆 KREATOR MASTER", desc: "Berpengalaman tinggi & siap membimbing kreator lain." };
  };

  const stageInfo = getStageInfo(readinessScore);

  return (
    <div className="bg-transparent border-0 p-0 space-y-8 shadow-none rounded-none w-full animate-fade-in text-neutral-900 dark:text-neutral-100 font-sans">

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

      {/* SECTION 1: RINGKASAN ABSENSI & KEHADIRAN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h3 className="font-sans font-bold text-lg md:text-xl text-neutral-900 dark:text-white">
            Ringkasan <span className="highlight-stabilo">Kehadiran</span>
          </h3>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ KEHADIRAN ]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="border-l-2 border-neutral-900 dark:border-white pl-4 py-1 space-y-0.5">
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              [ EVENT DIHADIRI ]
            </span>
            <p className="text-base font-bold font-sans text-neutral-900 dark:text-white">
              {totalAttended} Event Komunitas
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Kehadiran aktif pada agenda mingguan & event komunitas.
            </p>
          </div>

          <div className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1 space-y-0.5">
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              [ LEVEL PENGALAMAN ]
            </span>
            <p className="text-base font-bold font-sans text-neutral-900 dark:text-white uppercase">
              {experienceLevel ? `${experienceLevel}` : "Belum Diatur"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Tingkat kematangan dalam berbicara dan memproduksi konten.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CREATOR READINESS INDEX & STAGE LEVEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h3 className="font-sans font-bold text-lg md:text-xl text-neutral-900 dark:text-white flex items-center gap-2">
            Indikator <span className="highlight-stabilo">Kesiapan</span> Panggung
          </h3>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ READINESS INDEX ]
          </span>
        </div>

        <div className="p-5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 rounded-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                STAGE LEVEL SEKARANG
              </span>
              <p className="text-base font-bold font-mono text-neutral-900 dark:text-white uppercase mt-0.5">
                {stageInfo.label}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                {readinessScore}<span className="text-xs text-neutral-400 font-normal">/100</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block">SKOR KESIAPAN</span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-1">
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-none overflow-hidden">
              <div
                className="bg-neutral-900 dark:bg-white h-full transition-all duration-700 ease-out"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
              {stageInfo.desc}
            </p>
          </div>

          {/* METRICS METERS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">EVENT DIHADIRI</span>
              <p className="text-sm font-bold font-mono text-neutral-900 dark:text-white">{totalAttended} Sesi</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">KEPERCAYAAN DIRI</span>
              <p className="text-sm font-bold font-mono text-neutral-900 dark:text-white">{confidenceScale}/10 Pede</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">TINGKAT PENGALAMAN</span>
              <p className="text-sm font-bold font-mono text-neutral-900 dark:text-white uppercase">{experienceLevel || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SELF-DIAGNOSTIC PUBLIC SPEAKING & MENTAL */}
      {(interests?.ps_challenges || interests?.nervous_trigger || interests?.confidence_scale) && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h3 className="font-sans font-bold text-lg md:text-xl text-neutral-900 dark:text-white">
              Diagnosis & Tantangan <span className="highlight-stabilo">Public Speaking</span>
            </h3>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              [ DIAGNOSIS ]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TANTANGAN UTAMA */}
            {interests.ps_challenges && interests.ps_challenges.length > 0 && (
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                  [ TANTANGAN UTAMA BERBICARA ]
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interests.ps_challenges.map((challenge: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] font-mono uppercase border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                    >
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PEMICU GUGUP */}
            {interests.nervous_trigger && (
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                  [ PEMICU GUGUP UTAMA ]
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans pt-0.5">
                  {interests.nervous_trigger}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: PERSONA, VISI & MONETISASI KREATOR */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h3 className="font-sans font-bold text-lg md:text-xl text-neutral-900 dark:text-white">
            Persona, Visi & <span className="highlight-stabilo">Monetisasi</span>
          </h3>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            [ METRICS & GOALS ]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ROLE MODEL & AUDIENS */}
          {(interests?.role_model || interests?.target_audience) && (
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 space-y-3">
              {interests.role_model && (
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">ROLE MODEL / INSPIRASI</span>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-0.5">{interests.role_model}</p>
                </div>
              )}

              {interests.target_audience && (
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">TARGET AUDIENS KREATOR</span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mt-0.5">{interests.target_audience}</p>
                </div>
              )}
            </div>
          )}

          {/* MONETISASI & SKILLS */}
          {(interests?.monetization_interest || interests?.skills_to_master || interests?.time_commitment) && (
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 space-y-3">
              {interests.monetization_interest && (
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">MINAT MONETISASI</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-mono font-bold uppercase border border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                    {interests.monetization_interest}
                  </span>
                </div>
              )}

              {interests.skills_to_master && (
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">SKILL YANG INGIN DIKUASAI</span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">{interests.skills_to_master}</p>
                </div>
              )}

              {interests.time_commitment && (
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">KOMITMEN MENTORING</span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">{interests.time_commitment}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* KENDALA KARIER & KOMUNITAS */}
        {(interests?.career_obstacle || interests?.active_communities) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {interests.career_obstacle && (
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">TANTANGAN KARIER UTAMA</span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{interests.career_obstacle}</p>
              </div>
            )}

            {interests.active_communities && (
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">KOMUNITAS LAIN YANG DIIKUTI</span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{interests.active_communities}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 5: MINAT & PILAR KEAHLIAN */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          [ PILAR KEAHLIAN UTAMA ]
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

      {/* SECTION 6: TARGET GOALS */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          [ TARGET & GOALS KREATOR ]
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

