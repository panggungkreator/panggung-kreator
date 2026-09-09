"use client";

import React from "react";
import { StatCard } from "./StatCard";
import { DemographicsActionCard } from "./DemographicsActionCard";
import { DashboardPayload } from "../types";

interface StatCardsGroupProps {
  stats: DashboardPayload["stats"];
  demographics: DashboardPayload["demographics"];
  isDemographicsModalOpen?: boolean;
  onOpenDemographicsModal?: () => void;
  onCloseDemographicsModal?: () => void;
}

export function StatCardsGroup({
  stats,
  demographics,
  isDemographicsModalOpen,
  onOpenDemographicsModal,
  onCloseDemographicsModal,
}: StatCardsGroupProps) {
  const newMembers = stats.newMembersCount ?? 0;
  const newEvents = stats.newEventsCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Card 1: Total Member */}
      <StatCard
        label="Total Member Terdaftar"
        value={stats.totalMembers.toLocaleString()}
        growth={{
          value: newMembers > 0 ? `+${newMembers} baru` : "0 baru",
          isPositive: newMembers > 0 ? true : null,
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
          value: newEvents > 0 ? `+${newEvents} baru` : "0 baru",
          isPositive: newEvents > 0 ? true : null,
          period: "Bulan ini",
        }}
        sparklineColor="#111111"
        sparklinePath="M 0,25 Q 25,10 50,28 T 80,12 T 100,18"
      />

      {/* Card 3: Action Card Demografi Peserta */}
      <DemographicsActionCard
        demographics={demographics}
        modalOpen={isDemographicsModalOpen}
        onOpenModal={onOpenDemographicsModal}
        onCloseModal={onCloseDemographicsModal}
      />
    </div>
  );
}
