"use client";

import React from "react";
import { StatCard } from "./StatCard";
import { DemographicsActionCard } from "./DemographicsActionCard";
import { DashboardPayload } from "../types";

interface StatCardsGroupProps {
  stats: DashboardPayload["stats"];
  demographics: DashboardPayload["demographics"];
}

export function StatCardsGroup({ stats, demographics }: StatCardsGroupProps) {
  const memberGrowthPositive = stats.memberGrowthPercentage >= 0;
  const eventGrowthPositive = stats.eventGrowthPercentage >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Total Member */}
      <StatCard
        label="Total Member Terdaftar"
        value={stats.totalMembers.toLocaleString()}
        growth={{
          value: `${memberGrowthPositive ? "+" : ""}${stats.memberGrowthPercentage}%`,
          isPositive: memberGrowthPositive,
          period: "Bulan ini",
        }}
        sparklineColor="#BAFF6A"
        sparklinePath="M 0,35 Q 20,40 35,18 T 70,25 T 100,5"
      />

      {/* Card 2: Total Event */}
      <StatCard
        label="Total Event Terlaksana"
        value={stats.totalEvents.toLocaleString()}
        growth={{
          value: `${eventGrowthPositive ? "+" : ""}${stats.eventGrowthPercentage}%`,
          isPositive: eventGrowthPositive,
          period: "Bulan ini",
        }}
        sparklineColor="#111111"
        sparklinePath="M 0,25 Q 25,10 50,28 T 80,12 T 100,18"
      />

      {/* Card 3: Action Card Demografi Peserta */}
      <DemographicsActionCard demographics={demographics} />
    </div>
  );
}
