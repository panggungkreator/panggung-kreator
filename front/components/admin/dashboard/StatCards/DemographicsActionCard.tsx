"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users2, ExternalLink } from "lucide-react";
import { DemographicsMetric } from "../types";
import { DemographicsModal } from "./DemographicsModal";

interface DemographicsActionCardProps {
  demographics: DemographicsMetric;
  modalOpen?: boolean;
  onOpenModal?: () => void;
  onCloseModal?: () => void;
}

export function DemographicsActionCard({
  demographics,
  modalOpen,
  onOpenModal,
  onCloseModal,
}: DemographicsActionCardProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = modalOpen !== undefined ? modalOpen : internalOpen;

  const handleOpen = () => {
    if (onOpenModal) onOpenModal();
    else setInternalOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (modalOpen !== undefined) {
      if (!open && onCloseModal) onCloseModal();
      else if (open && onOpenModal) onOpenModal();
    } else {
      setInternalOpen(open);
    }
  };

  return (
    <>
      <Card className="rounded-3xl border border-border-default/70 bg-bg-card shadow-xs hover:border-zinc-400/50 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between">
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted block">
                Insight Demografi
              </span>
              <p className="text-sm font-bold text-text-primary line-clamp-2 mt-0.5">
                {demographics.summary || "Didominasi rentang usia 18–24 tahun & kreator konten."}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-bg-well/70 border border-border-default flex items-center justify-center text-text-primary shrink-0">
              <Users2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="pt-2.5 border-t border-border-default/60 flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">
              4 Kategori Sebaran
            </span>
            <button
              type="button"
              onClick={handleOpen}
              className="h-9 px-3.5 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Detail Demografi</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </CardContent>
      </Card>

      <DemographicsModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        data={demographics}
      />
    </>
  );
}
