"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Users2, ExternalLink } from "lucide-react";
import { DemographicsMetric } from "../types";
import { DemographicsModal } from "./DemographicsModal";

interface DemographicsActionCardProps {
  demographics: DemographicsMetric;
}

export function DemographicsActionCard({ demographics }: DemographicsActionCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-zinc-400/50 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between">
        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#8B8FA8] uppercase tracking-wider block">
                Insight Demografi
              </span>
              <p className="text-sm sm:text-base font-bold text-[#111111] dark:text-white line-clamp-2">
                {demographics.summary || "Didominasi rentang usia 18–24 tahun & kreator konten."}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#22263A] border border-[#E5E7EB] dark:border-[#2A2E42] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#2A2E42] flex items-center justify-between">
            <span className="text-xs text-[#6B7280] dark:text-[#8B8FA8]">
              4 Kategori Sebaran
            </span>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-[#111111] hover:bg-[#222222] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-zinc-200 text-xs font-semibold rounded-lg h-8 px-3 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Detail Demografi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <DemographicsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={demographics}
      />
    </>
  );
}
