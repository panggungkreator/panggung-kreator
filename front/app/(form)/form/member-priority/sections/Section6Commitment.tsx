import React from "react";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import {
  OBSTACLE_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
  INVESTMENT_OPTIONS,
} from "../constants";

interface Section6CommitmentProps {
  pbObstacle: string;
  setPbObstacle: (val: string) => void;
  customPbObstacle: string;
  setCustomPbObstacle: (val: string) => void;
  timeCommitment: string;
  setTimeCommitment: (val: string) => void;
  investmentBudget: string;
  setInvestmentBudget: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section6Commitment: React.FC<Section6CommitmentProps> = ({
  pbObstacle,
  setPbObstacle,
  customPbObstacle,
  setCustomPbObstacle,
  timeCommitment,
  setTimeCommitment,
  investmentBudget,
  setInvestmentBudget,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="mt-10">
        <RadioGroupLine
          id="pbObstacle"
          label="APA HAMBATAN TERBESAR KAMU BUAT MULAI BANGUN PERSONAL BRANDING HARI INI? *"
          options={OBSTACLE_OPTIONS}
          value={pbObstacle}
          onValueChange={setPbObstacle}
          customValue={customPbObstacle}
          onCustomChange={setCustomPbObstacle}
          customPlaceholder="Tuliskan hambatan lainnya..."
          idPrefix="obs"
          error={fieldErrors.pbObstacle}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="timeCommitment"
          label="KALAU PANGGUNG KREATOR MENGADAKAN SESI MENTORING ATAU SHARING INTENSIF BUAT BAHAS KENDALA KAMU DI ATAS, SEBERAPA BESAR WAKTU YANG SIAP KAMU LUANGKAN? *"
          options={TIME_COMMITMENT_OPTIONS}
          value={timeCommitment}
          onValueChange={setTimeCommitment}
          idPrefix="tc"
          error={fieldErrors.timeCommitment}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="investmentBudget"
          label="SEBERAPA BERANI KAMU INVESTASI (BIAYA) UNTUK IKUT KELAS PROFESIONAL BUAT NINGKATIN SKILL PUBLIC SPEAKING & PERSONAL BRANDING KAMU? *"
          options={INVESTMENT_OPTIONS}
          value={investmentBudget}
          onValueChange={setInvestmentBudget}
          idPrefix="inv"
          error={fieldErrors.investmentBudget}
        />
      </div>
    </div>
  );
};
