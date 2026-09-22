"use client";

import React from "react";
import AchievementsManager from "@/components/member/AchievementsManager";
import { MemberProfile } from "@/lib/types/member";

interface AchievementPanelProps {
  member: MemberProfile;
}

export default function AchievementPanel({ member }: AchievementPanelProps) {
  return (
    <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      {/* SECTION HEADER */}
      <div className="border-b border-border-default/60 pb-4">
        <h2 className="text-base font-bold text-text-primary">
          Penghargaan & Prestasi
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Sertifikasi keahlian, piala kompetisi, atau pencapaian profesional Anda.
        </p>
      </div>

      <AchievementsManager memberId={member.id} />
    </div>
  );
}
