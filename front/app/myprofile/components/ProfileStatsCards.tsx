"use client";

import React from "react";
import { MembershipTier } from "@/lib/types/member";

interface ProfileStatsCardsProps {
  membershipTier: MembershipTier;
  totalAttended: number;
  commissionBalance: number;
  totalReferrals: number;
  isAffiliateActive: boolean;
}

export default function ProfileStatsCards({
  membershipTier,
  totalAttended,
  commissionBalance,
  totalReferrals,
  isAffiliateActive,
}: ProfileStatsCardsProps) {
  const statsList = [
    {
      label: "TIER KEANGGOTAAN",
      value: `${membershipTier.toUpperCase()} TIER`,
    },
    {
      label: "TOTAL KEHADIRAN",
      value: `${totalAttended} EVENT`,
    },
    ...(isAffiliateActive
      ? [
          {
            label: "SALDO KOMISI",
            value: `RP ${(commissionBalance || 0).toLocaleString("id-ID")}`,
          },
          {
            label: "TEMAN DIAJAK",
            value: `${totalReferrals} KREATOR`,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-transparent border-b border-neutral-200 dark:border-neutral-800 pb-5 pt-1 w-full">
      <div className={`grid gap-4 ${isAffiliateActive ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
        {statsList.map((stat, idx) => (
          <div
            key={idx}
            className="flex flex-col space-y-1 pr-2 border-r last:border-r-0 border-neutral-200 dark:border-neutral-800/80"
          >
            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              [ {stat.label} ]
            </span>
            <span className="text-sm md:text-base font-bold font-sans tracking-wide text-neutral-900 dark:text-white uppercase">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
