"use client";

import React from "react";
import PortfolioManager from "@/components/member/PortfolioManager";
import { MemberProfile } from "@/lib/types/member";

interface PortfolioPanelProps {
  member: MemberProfile;
}

export default function PortfolioPanel({ member }: PortfolioPanelProps) {
  return (
    <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      {/* SECTION HEADER */}
      <div className="border-b border-border-default/60 pb-4">
        <h2 className="text-base font-bold text-text-primary">
          Daftar Karya & Portofolio
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Tampilkan portofolio terbaik, video karya, materi visual, atau tautan showcase Anda.
        </p>
      </div>

      <PortfolioManager memberId={member.id} username={member.username || undefined} />
    </div>
  );
}
