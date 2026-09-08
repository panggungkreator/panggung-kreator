"use client";

import React, { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

  // Default fallback data adhering strictly to Xenith layout and Panggung Kreator context
  const data: DashboardPayload = {
    adminName: initialData?.adminName || "Admin",
    stats: {
      totalMembers: initialData?.stats?.totalMembers ?? 348,
      memberGrowthPercentage: initialData?.stats?.memberGrowthPercentage ?? 24,
      totalEvents: initialData?.stats?.totalEvents ?? 18,
      eventGrowthPercentage: initialData?.stats?.eventGrowthPercentage ?? 12,
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
    topSkills: initialData?.topSkills || [
      { name: "Speaking Skill", count: 245, percentage: 70 },
      { name: "Storytelling", count: 189, percentage: 54 },
      { name: "Content Creation", count: 172, percentage: 49 },
      { name: "Personal Branding", count: 140, percentage: 40 },
      { name: "Pitching & Presentation", count: 98, percentage: 28 },
    ],
    topChallenges: initialData?.topChallenges || [
      { name: "Gugup Berlebihan", count: 231, percentage: 66 },
      { name: "Takut Dihakimi", count: 184, percentage: 53 },
      { name: "Bingung Struktur", count: 162, percentage: 47 },
      { name: "Suara Gemetar", count: 128, percentage: 37 },
      { name: "Bahasa Tubuh Kaku", count: 110, percentage: 32 },
    ],
    monetizationInterests: initialData?.monetizationInterests || [
      { name: "Endorsement / Sponsorship", count: 210, percentage: 60 },
      { name: "Talent / Speaker / MC", count: 165, percentage: 47 },
      { name: "Produk Digital (e-Course)", count: 132, percentage: 38 },
      { name: "Jasa Freelance Kreatif", count: 105, percentage: 30 },
      { name: "Adsense / Platform Views", count: 88, percentage: 25 },
    ],
  };

  // Filter leaderboard based on header search if query present
  const filteredLeaderboard = searchQuery
    ? data.streakLeaderboard.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : data.streakLeaderboard;

  return (
    <div className="space-y-6 font-sans text-[#111111] dark:text-[#F0F0F0]">
      {/* 2.1 Header Row */}
      <DashboardHeader
        adminName={data.adminName}
        onSearch={(q) => setSearchQuery(q)}
      />

      {/* 2.2 Row of 3 Stat Cards (Mini Sparklines + Demographic Modal) */}
      <StatCardsGroup
        stats={data.stats}
        demographics={data.demographics}
      />

      {/* 2.3 Row 1: Chart Kehadiran (Kiri) & Streak Leaderboard (Kanan) - Sejajar Bersebelahan */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Kolom Kiri: Chart Kehadiran per Event */}
        <div className="xl:col-span-7">
          <EventAttendanceChart attendances={data.eventAttendances} />
        </div>

        {/* Kolom Kanan: Leaderboard Member dengan Streak Terbanyak */}
        <div className="xl:col-span-5">
          <StreakLeaderboardTable members={filteredLeaderboard} />
        </div>
      </div>

      {/* 2.4 Row 2: Wawasan Form Pendataan (Diletakkan di Bawah Secara Rapih 3 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topik & Minat Belajar Terpopuler */}
        <TopSkillsBarChart skills={data.topSkills} />

        {/* Tantangan Terbesar Member */}
        <TopChallengesBarChart challenges={data.topChallenges} />

        {/* Minat Monetisasi */}
        <MonetizationInterestsChart interests={data.monetizationInterests} />
      </div>
    </div>
  );
}
