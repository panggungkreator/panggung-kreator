"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Users2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardPayload } from "./types";
import { DashboardHeader } from "./DashboardHeader";
import { StatCardsGroup } from "./StatCards/StatCardsGroup";
import { EventAttendanceChart } from "./Charts/EventAttendanceChart";
import { StreakLeaderboardTable } from "./Tables/StreakLeaderboardTable";
import { TopSkillsBarChart } from "./Insights/TopSkillsBarChart";
import { TopChallengesBarChart } from "./Insights/TopChallengesBarChart";
import { MonetizationInterestsChart } from "./Insights/MonetizationInterestsChart";

interface DashboardClientProps {
  initialData?: Partial<DashboardPayload>;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isDemographicsModalOpen, setIsDemographicsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data dashboard telah diperbarui");
    }, 600);
  };

  // Default fallback data adhering strictly to Xenith layout and Panggung Kreator context
  const data: DashboardPayload = {
    adminName: initialData?.adminName || "Admin",
    stats: {
      totalMembers: initialData?.stats?.totalMembers ?? 0,
      newMembersCount: initialData?.stats?.newMembersCount ?? 0,
      memberGrowthPercentage: initialData?.stats?.memberGrowthPercentage ?? 0,
      totalEvents: initialData?.stats?.totalEvents ?? 0,
      newEventsCount: initialData?.stats?.newEventsCount ?? 0,
      eventGrowthPercentage: initialData?.stats?.eventGrowthPercentage ?? 0,
    },
    demographics: initialData?.demographics || {
      summary: "Didominasi kelompok usia 18–24 tahun (62%) dan kreator konten mandiri.",
      ageDistribution: [
        { range: "< 18", count: 18, percentage: 5 },
        { range: "18-24", count: 215, percentage: 62 },
        { range: "25-34", count: 88, percentage: 25 },
        { range: "35+", count: 27, percentage: 8 },
      ],
      careerGoalDistribution: [
        { name: "Profesi Utama", count: 39, percentage: 57, color: "#111111" },
        { name: "Sampingan / Branding", count: 25, percentage: 36, color: "#BAFF6A" },
        { name: "Eksplorasi", count: 5, percentage: 7, color: "#D1D5DB" },
      ],
      occupationDistribution: [
        { name: "Mahasiswa/Pelajar", count: 145, percentage: 42 },
        { name: "Content Creator", count: 112, percentage: 32 },
        { name: "Karyawan Swasta", count: 58, percentage: 17 },
        { name: "Wirausaha/Freelance", count: 33, percentage: 9 },
      ],
      topCities: [
        { city: "Jakarta", count: 120, percentage: 34 },
        { city: "Bandung", count: 74, percentage: 21 },
        { city: "Surabaya", count: 52, percentage: 15 },
        { city: "Yogyakarta", count: 41, percentage: 12 },
        { city: "Semarang", count: 25, percentage: 7 },
        { city: "Lainnya", count: 36, percentage: 11 },
      ],
    },
    eventAttendances: initialData?.eventAttendances || [
      { id: "1", title: "Public Speaking Bootcamp #1", shortDate: "10 Jan", fullDate: "10 Januari 2026", attendees: 34 },
      { id: "2", title: "Content Mastery Clinic", shortDate: "24 Jan", fullDate: "24 Januari 2026", attendees: 48 },
      { id: "3", title: "Storytelling On Camera", shortDate: "07 Feb", fullDate: "07 Februari 2026", attendees: 52 },
      { id: "4", title: "Voice & Delivery Intensive", shortDate: "21 Feb", fullDate: "21 Februari 2026", attendees: 68 },
      { id: "5", title: "Creator Meetup Jakarta", shortDate: "05 Mar", fullDate: "05 Maret 2026", attendees: 84 },
      { id: "6", title: "Monetization Masterclass", shortDate: "18 Mar", fullDate: "18 Maret 2026", attendees: 76 },
    ],
    streakLeaderboard: initialData?.streakLeaderboard || [
      { rank: 1, id: "m1", name: "Zac Davies", email: "zac@creator.id", tier: "Pro", streak: 12, totalAttendance: 16 },
      { rank: 2, id: "m2", name: "Amanda Sarah", email: "amanda@gmail.com", tier: "Creator", streak: 10, totalAttendance: 14 },
      { rank: 3, id: "m3", name: "Bagus Pratama", email: "bagus@pangkreas.com", tier: "Creator", streak: 9, totalAttendance: 11 },
      { rank: 4, id: "m4", name: "Rian Hidayat", email: "rian.h@outlook.com", tier: "Starter", streak: 7, totalAttendance: 9 },
      { rank: 5, id: "m5", name: "Dinda Kirana", email: "dinda@kreator.net", tier: "Free", streak: 6, totalAttendance: 7 },
      { rank: 6, id: "m6", name: "Farhan Maulana", email: "farhan@tech.id", tier: "Starter", streak: 5, totalAttendance: 6 },
    ],
    topSkills: initialData?.topSkills ?? [],
    topChallenges: initialData?.topChallenges ?? [],
    monetizationInterests: initialData?.monetizationInterests ?? [],
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 font-sans text-text-primary">
      {/* 2.1 Header Row */}
      <DashboardHeader
        adminName={data.adminName}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2.2 Row of 3 Stat Cards (Mini Sparklines + Demographic Modal) */}
      <StatCardsGroup
        stats={data.stats}
        demographics={data.demographics}
        isDemographicsModalOpen={isDemographicsModalOpen}
        onOpenDemographicsModal={() => setIsDemographicsModalOpen(true)}
        onCloseDemographicsModal={() => setIsDemographicsModalOpen(false)}
      />

      {/* 2.3 Row 1: Chart Kehadiran (Kiri) & Streak Leaderboard (Kanan) - Sejajar Bersebelahan */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Kolom Kiri: Chart Kehadiran per Event */}
        <div className="xl:col-span-7">
          <EventAttendanceChart attendances={data.eventAttendances} />
        </div>

        {/* Kolom Kanan: Leaderboard Member dengan Streak Terbanyak */}
        <div className="xl:col-span-5">
          <StreakLeaderboardTable members={data.streakLeaderboard} />
        </div>
      </div>

      {/* 2.4 Row 2: Wawasan Form Pendataan (Diletakkan di Bawah Secara Rapih 3 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Topik & Minat Belajar Terpopuler */}
        <TopSkillsBarChart skills={data.topSkills} />

        {/* Tantangan Terbesar Member */}
        <TopChallengesBarChart challenges={data.topChallenges} />

        {/* Minat Monetisasi */}
        <MonetizationInterestsChart interests={data.monetizationInterests} />
      </div>

      {/* ═══ FLOATING BOTTOM CONTROLS (Compact Proportional Dock Persis admin-mobile.md) ═══ */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white">
          {/* Refresh Button (Mobile FAB) */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            title="Segarkan data dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-white" : ""}`} />
          </button>

          {/* Primary Action Button: Demografi */}
          <button
            type="button"
            onClick={() => setIsDemographicsModalOpen(true)}
            className="h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Users2 className="w-4 h-4 stroke-[2.2]" />
            <span>Demografi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
