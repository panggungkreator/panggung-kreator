import React from "react";
import { MultiSelectLine } from "@/components/ui/style-line/MultiSelectLine";
import { ScaleSelectorLine } from "@/components/ui/style-line/ScaleSelectorLine";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";
import { PS_CHALLENGE_OPTIONS } from "../constants";

interface Section2PublicSpeakingProps {
  psChallenges: string[];
  togglePsChallenge: (val: string) => void;
  customPsChallenge: string;
  setCustomPsChallenge: (val: string) => void;
  confidenceScale: number | null;
  setConfidenceScale: (val: number) => void;
  nervousTrigger: string;
  setNervousTrigger: (val: string) => void;
  blunderStory: string;
  setBlunderStory: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

const NERVOUS_TRIGGER_OPTIONS = [
  "Bicara tatap muka langsung di depan orang banyak",
  "Bicara di depan kamera untuk konten (IG/TikTok dll)",
];

export const Section2PublicSpeaking: React.FC<Section2PublicSpeakingProps> = ({
  psChallenges,
  togglePsChallenge,
  customPsChallenge,
  setCustomPsChallenge,
  confidenceScale,
  setConfidenceScale,
  nervousTrigger,
  setNervousTrigger,
  blunderStory,
  setBlunderStory,
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
        customValue={customPsChallenge}
        onCustomChange={setCustomPsChallenge}
        customPlaceholder="Tuliskan kendala lainnya..."
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
          minLabel="1 (TERENDAH)"
          maxLabel="10 (TERTINGGI)"
          error={fieldErrors.confidenceScale}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="nervousTrigger"
          label="MANA YANG LEBIH BIKIN KAMU GEMETER BAIK SEBELUM TAMPIL MAUPUN PADA SAAT TAMPIL? *"
          options={NERVOUS_TRIGGER_OPTIONS}
          value={nervousTrigger}
          onValueChange={setNervousTrigger}
          idPrefix="nt"
          error={fieldErrors.nervousTrigger}
        />
      </div>

      <div className="mt-10">
        <TextareaLine
          id="blunderStory"
          name="blunderStory"
          label="CERITAKAN SATU MOMEN &quot;BLUNDER&quot; ATAU KEGAGALAN SAAT PUBLIC SPEAKING YANG PALING MEMBEKAS BAGI KAMU? *"
          rows={3}
          placeholder="Ceritakan pengalamanmu di sini..."
          value={blunderStory}
          onChange={(e) => setBlunderStory(e.target.value)}
          error={fieldErrors.blunderStory}
        />
      </div>
    </div>
  );
};
