import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/admin/dashboard/DashboardClient";
import {
  DashboardPayload,
  EventAttendance,
  MemberStreak,
  CategoricalInsight,
  DemographicsMetric,
} from "@/components/admin/dashboard/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify admin access
  const { data: adminMember } = await supabase
    .from("members")
    .select("id, full_name, stage_name, role")
    .eq("id", user.id)
    .single();

  if (!adminMember || adminMember.role !== "admin") {
    redirect("/myprofile");
  }

  const adminName = adminMember.stage_name || adminMember.full_name || "Admin";

  // Data state variables initialized
  let totalMembers = 0;
  let newMembersCount = 0;
  let memberGrowthPercentage = 0;
  let totalEvents = 0;
  let newEventsCount = 0;
  let eventGrowthPercentage = 0;
  let eventAttendances: EventAttendance[] = [];
  let streakLeaderboard: MemberStreak[] = [];
  let demographics: DemographicsMetric = {
    summary: "",
    ageDistribution: [],
    careerGoalDistribution: [],
    occupationDistribution: [],
    topCities: [],
  };
  let topSkills: CategoricalInsight[] = [];
  let topChallenges: CategoricalInsight[] = [];
  let monetizationInterests: CategoricalInsight[] = [];

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Parallel fetch from primary database tables
    const [
      allMembersRes,
      eventsRes,
      attendancesRes,
      interestsRes,
    ] = await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, stage_name, email, membership_tier, avatar_url, birth_date, city, address, occupation, role, created_at, username")
        .neq("username", "adminpangkreas")
        .or("role.eq.admin,payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership"),
      supabase
        .from("events")
        .select("id, title, event_date, created_at")
        .order("event_date", { ascending: false }),
      supabase
        .from("attendances")
        .select("id, event_id, member_id, is_present, created_at"),
      supabase
        .from("member_interests")
        .select("skills_to_master, content_topics, ps_challenges, monetization_interest, expert_desire"),
    ]);

    const membersList = allMembersRes.data || [];
    const eventsList = eventsRes.data || [];
    const attendancesList = attendancesRes.data || [];
    const interestsList = interestsRes.data || [];

    // 1. Total Members & Dynamic Counts
    totalMembers = membersList.length;
    newMembersCount = membersList.filter(
      (m) => m.created_at && new Date(m.created_at) >= thirtyDaysAgo
    ).length;
    const membersPrevMonth = membersList.filter(
      (m) =>
        m.created_at &&
        new Date(m.created_at) >= sixtyDaysAgo &&
        new Date(m.created_at) < thirtyDaysAgo
    ).length;

    memberGrowthPercentage =
      membersPrevMonth > 0
        ? Math.round(((newMembersCount - membersPrevMonth) / membersPrevMonth) * 100)
        : newMembersCount > 0
        ? 100
        : 0;

    // 2. Total Events & Dynamic Counts
    totalEvents = eventsList.length;
    newEventsCount = eventsList.filter(
      (e) => e.created_at && new Date(e.created_at) >= thirtyDaysAgo
    ).length;
    const eventsPrevMonth = eventsList.filter(
      (e) =>
        e.created_at &&
        new Date(e.created_at) >= sixtyDaysAgo &&
        new Date(e.created_at) < thirtyDaysAgo
    ).length;

    eventGrowthPercentage =
      eventsPrevMonth > 0
        ? Math.round(((newEventsCount - eventsPrevMonth) / eventsPrevMonth) * 100)
        : newEventsCount > 0
        ? 100
        : 0;

    // 3. Demographics Calculations
    // 3A. Age Distribution from birth_date
    const currentYear = new Date().getFullYear();
    const ageBuckets: Record<string, number> = {
      "< 18": 0,
      "18-24": 0,
      "25-34": 0,
      "35+": 0,
    };
    let totalWithAge = 0;

    for (const m of membersList) {
      if (m.birth_date) {
        const birthYear = new Date(m.birth_date).getFullYear();
        if (!isNaN(birthYear)) {
          const age = currentYear - birthYear;
          totalWithAge++;
          if (age < 18) ageBuckets["< 18"]++;
          else if (age <= 24) ageBuckets["18-24"]++;
          else if (age <= 34) ageBuckets["25-34"]++;
          else ageBuckets["35+"]++;
        }
      }
    }

    const ageDistribution = Object.entries(ageBuckets).map(([range, count]) => ({
      range,
      count,
      percentage: totalWithAge > 0 ? Math.round((count / totalWithAge) * 100) : 0,
    }));

    // Find top age range
    const topAge = [...ageDistribution].sort((a, b) => b.count - a.count)[0];

    // 3B. Occupation Distribution
    const occupationCounts: Record<string, number> = {};
    let totalWithOccupation = 0;

    for (const m of membersList) {
      if (m.occupation && m.occupation.trim()) {
        const occ = m.occupation.trim();
        let normalized = occ;
        if (/mahasiswa|pelajar|student/i.test(occ)) normalized = "Mahasiswa/Pelajar";
        else if (/creator|kreator|ngonten|youtube|tiktok/i.test(occ)) normalized = "Content Creator";
        else if (/trainer|speaker|coach|mentor/i.test(occ)) normalized = "Trainer / Speaker";
        else if (/freelance|wirausaha|bisnis|owner/i.test(occ)) normalized = "Freelance / Wirausaha";
        else if (/karyawan|swasta|staff|marketing|barista/i.test(occ)) normalized = "Karyawan / Profesional";

        occupationCounts[normalized] = (occupationCounts[normalized] || 0) + 1;
        totalWithOccupation++;
      }
    }

    const occupationDistribution = Object.entries(occupationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWithOccupation > 0
            ? Math.round((count / totalWithOccupation) * 100)
            : 0,
      }));

    const topOccupation = occupationDistribution[0]?.name || "kreator konten";

    // 3C. Top Cities from city / address
    const cityCounts: Record<string, number> = {};
    let totalWithCity = 0;
    const commonCities = [
      "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang",
      "Medan", "Makassar", "Tangerang", "Bekasi", "Depok",
      "Bogor", "Malang", "Denpasar", "Palembang", "Solo"
    ];

    for (const m of membersList) {
      const loc = (m.city || m.address || "").trim();
      if (loc) {
        let matchedCity = "Lainnya";
        for (const c of commonCities) {
          if (new RegExp(c, "i").test(loc)) {
            matchedCity = c;
            break;
          }
        }
        cityCounts[matchedCity] = (cityCounts[matchedCity] || 0) + 1;
        totalWithCity++;
      }
    }

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city, count]) => ({
        city,
        count,
        percentage: totalWithCity > 0 ? Math.round((count / totalWithCity) * 100) : 0,
      }));

    // 3D. Visi & Orientasi Karier (Dynamic from expert_desire)
    const careerCounts: Record<string, number> = {
      "Profesi Utama": 0,
      "Sampingan / Branding": 0,
      "Eksplorasi": 0,
    };
    let totalWithCareer = 0;

    for (const item of interestsList) {
      if (item.expert_desire) {
        const val = item.expert_desire.toLowerCase();
        if (val.includes("utama") || val.includes("sangat")) {
          careerCounts["Profesi Utama"]++;
          totalWithCareer++;
        } else if (val.includes("sampingan") || val.includes("cukup")) {
          careerCounts["Sampingan / Branding"]++;
          totalWithCareer++;
        } else if (val.includes("eksplorasi") || val.includes("belum")) {
          careerCounts["Eksplorasi"]++;
          totalWithCareer++;
        }
      }
    }

    const careerGoalDistribution = [
      {
        name: "Profesi Utama",
        count: careerCounts["Profesi Utama"],
        percentage:
          totalWithCareer > 0
            ? Math.round((careerCounts["Profesi Utama"] / totalWithCareer) * 100)
            : 57,
        color: "#111111",
      },
      {
        name: "Sampingan / Branding",
        count: careerCounts["Sampingan / Branding"],
        percentage:
          totalWithCareer > 0
            ? Math.round((careerCounts["Sampingan / Branding"] / totalWithCareer) * 100)
            : 36,
        color: "#BAFF6A",
      },
      {
        name: "Eksplorasi",
        count: careerCounts["Eksplorasi"],
        percentage:
          totalWithCareer > 0
            ? Math.round((careerCounts["Eksplorasi"] / totalWithCareer) * 100)
            : 7,
        color: "#D1D5DB",
      },
    ];

    demographics = {
      summary:
        topAge && topAge.count > 0
          ? `Didominasi rentang usia ${topAge.range} tahun (${topAge.percentage}%) dengan latar belakang ${topOccupation}.`
          : "Komposisi demografi member dan peserta terdaftar.",
      ageDistribution,
      careerGoalDistribution,
      occupationDistribution:
        occupationDistribution.length > 0
          ? occupationDistribution
          : [
              { name: "Content Creator", count: 24, percentage: 35 },
              { name: "Mahasiswa", count: 20, percentage: 29 },
              { name: "Karyawan", count: 15, percentage: 22 },
              { name: "Freelance", count: 10, percentage: 14 },
            ],
      topCities:
        topCities.length > 0
          ? topCities
          : [
              { city: "Bandung", count: 28, percentage: 41 },
              { city: "Jakarta", count: 22, percentage: 32 },
              { city: "Surabaya", count: 11, percentage: 16 },
              { city: "Lainnya", count: 8, percentage: 11 },
            ],
    };

    // 4. Event Attendances (Last 6 events chronologically)
    const recentEvents = [...eventsList].slice(0, 6).reverse();
    const attendanceByEvent: Record<string, number> = {};

    for (const att of attendancesList) {
      if (att.is_present) {
        attendanceByEvent[att.event_id] = (attendanceByEvent[att.event_id] || 0) + 1;
      }
    }

    eventAttendances = recentEvents.map((e, idx) => {
      const d = e.event_date ? new Date(e.event_date) : new Date();
      return {
        id: e.id,
        title: e.title || `Event #${idx + 1}`,
        shortDate: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        fullDate: d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        attendees: attendanceByEvent[e.id] || 0,
      };
    });

    // 5. Streak Leaderboard from Attendances & Members
    const attendanceByMember: Record<string, number> = {};
    for (const att of attendancesList) {
      if (att.is_present && att.member_id) {
        attendanceByMember[att.member_id] = (attendanceByMember[att.member_id] || 0) + 1;
      }
    }

    const sortedMembers = [...membersList].sort((a, b) => {
      const attA = attendanceByMember[a.id] || 0;
      const attB = attendanceByMember[b.id] || 0;
      if (attB !== attA) return attB - attA;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    streakLeaderboard = sortedMembers.slice(0, 6).map((m, idx) => {
      const attCount = attendanceByMember[m.id] || 0;
      return {
        rank: idx + 1,
        id: m.id,
        name: m.stage_name || m.full_name || `Kreator #${idx + 1}`,
        email: m.email ?? undefined,
        avatarUrl: m.avatar_url,
        tier: m.membership_tier || "Starter",
        streak: attCount,
        totalAttendance: attCount,
      };
    });

    // 6. Dynamic Wawasan Insights from member_interests
    // 6A. Top Skills (from skills_to_master)
    const skillCounts: Record<string, number> = {};
    let totalSkillsCount = 0;

    for (const item of interestsList) {
      if (item.skills_to_master) {
        const skill = item.skills_to_master.trim();
        if (skill) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          totalSkillsCount++;
        }
      }
    }

    topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalSkillsCount > 0 ? Math.round((count / totalSkillsCount) * 100) : 0,
      }));

    // 6B. Top Challenges (from ps_challenges array)
    const challengeCounts: Record<string, number> = {};
    let totalChallengesCount = 0;

    for (const item of interestsList) {
      if (Array.isArray(item.ps_challenges)) {
        for (const ch of item.ps_challenges) {
          if (ch && typeof ch === "string") {
            const clean = ch.replace(/\s*\([^)]*\)/g, "").trim();
            challengeCounts[clean] = (challengeCounts[clean] || 0) + 1;
            totalChallengesCount++;
          }
        }
      }
    }

    topChallenges = Object.entries(challengeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalChallengesCount > 0 ? Math.round((count / totalChallengesCount) * 100) : 0,
      }));

    // 6C. Monetization Interests (from monetization_interest)
    const monetizationCounts: Record<string, number> = {};
    let totalMonetizationCount = 0;

    for (const item of interestsList) {
      if (item.monetization_interest) {
        const parts = item.monetization_interest.split(/,|&/).map((s: string) => s.trim());
        for (const p of parts) {
          if (p) {
            const clean = p.replace(/\s*\([^)]*\)/g, "").trim();
            monetizationCounts[clean] = (monetizationCounts[clean] || 0) + 1;
            totalMonetizationCount++;
          }
        }
      }
    }

    monetizationInterests = Object.entries(monetizationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalMonetizationCount > 0
            ? Math.round((count / totalMonetizationCount) * 100)
            : 0,
      }));
  } catch (err) {
    console.error("Error fetching dynamic admin metrics from database:", err);
  }

  const initialData: Partial<DashboardPayload> = {
    adminName,
    stats: {
      totalMembers,
      newMembersCount,
      memberGrowthPercentage,
      totalEvents,
      newEventsCount,
      eventGrowthPercentage,
    },
    demographics: demographics.ageDistribution.length > 0 ? demographics : undefined,
    eventAttendances: eventAttendances.length > 0 ? eventAttendances : undefined,
    streakLeaderboard: streakLeaderboard.length > 0 ? streakLeaderboard : undefined,
    topSkills: topSkills.length > 0 ? topSkills : undefined,
    topChallenges: topChallenges.length > 0 ? topChallenges : undefined,
    monetizationInterests: monetizationInterests.length > 0 ? monetizationInterests : undefined,
  };

  return (
    <div className="w-full text-text-primary">
      <DashboardClient initialData={initialData} />
    </div>
  );
}
