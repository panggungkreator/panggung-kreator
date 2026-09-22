"use client";

import React from "react";
import ExperienceManager from "@/components/member/ExperienceManager";
import { MemberProfile } from "@/lib/types/member";

interface ExperiencePanelProps {
  member: MemberProfile;
}

export default function ExperiencePanel({ member }: ExperiencePanelProps) {
  return (
    <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      {/* SECTION HEADER */}
      <div className="border-b border-border-default/60 pb-4">
        <h2 className="text-base font-bold text-text-primary">
          Daftar Jam Terbang & Pengalaman
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Dokumentasikan rekam jejak peran, event, atau panggung yang pernah Anda isi.
        </p>
      </div>

      <ExperienceManager memberId={member.id} />
    </div>
  );
}
