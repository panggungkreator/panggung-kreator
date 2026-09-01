import React from "react";
import { MultiSelectLine } from "@/components/ui/style-line/MultiSelectLine";
import { ScaleSelectorLine } from "@/components/ui/style-line/ScaleSelectorLine";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { PS_CHALLENGE_OPTIONS, NERVOUS_TRIGGER_OPTIONS } from "../constants";

interface Section2PublicSpeakingProps {
  psChallenges: string[];
  togglePsChallenge: (val: string) => void;
  confidenceScale: number | null;
  setConfidenceScale: (val: number) => void;
  nervousTrigger: string;
  setNervousTrigger: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section2PublicSpeaking: React.FC<Section2PublicSpeakingProps> = ({
  psChallenges,
  togglePsChallenge,
  confidenceScale,
  setConfidenceScale,
  nervousTrigger,
  setNervousTrigger,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <MultiSelectLine
        id="psChallenges"
        label="APA KENDALA TERBESAR YANG KAMU RASAKAN SAAT HARUS BICARA DI DEPAN UMUM? (PILIH MAKSIMAL 3) *"
        options={PS_CHALLENGE_OPTIONS}
        selected={psChallenges}
        onToggle={togglePsChallenge}
        maxSelect={3}
        showRemaining
        error={fieldErrors.psChallenges}
      />

      <div className="mt-10">
        <ScaleSelectorLine
          id="confidenceScale"
          label="DALAM SKALA 1-10, SEBERAPA PERCAYA DIRI KAMU SAAT INI JIKA DIMINTA BICARA MENDADAK? *"
          min={1}
          max={10}
          value={confidenceScale}
          onChange={setConfidenceScale}
          minLabel="1 (SANGAT RAGU)"
          maxLabel="10 (SANGAT YAKIN)"
          error={fieldErrors.confidenceScale}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="nervousTrigger"
          label="MANA YANG LEBIH BIKIN KAMU GEMETAR BAIK SEBELUM TAMPIL MAUPUN PADA SAAT TAMPIL? *"
          options={NERVOUS_TRIGGER_OPTIONS}
          value={nervousTrigger}
          onValueChange={setNervousTrigger}
          idPrefix="nt"
          error={fieldErrors.nervousTrigger}
        />
      </div>
    </div>
  );
};
