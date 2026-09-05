import React from "react";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";
import { TIME_COMMITMENT_OPTIONS } from "../constants";

interface Section6CommitmentProps {
  activeCommunities: string;
  setActiveCommunities: (val: string) => void;
  careerObstacle: string;
  setCareerObstacle: (val: string) => void;
  timeCommitment: string;
  setTimeCommitment: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section6Commitment: React.FC<Section6CommitmentProps> = ({
  activeCommunities,
  setActiveCommunities,
  careerObstacle,
  setCareerObstacle,
  timeCommitment,
  setTimeCommitment,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="mt-10">
        <TextareaLine
          id="activeCommunities"
          name="activeCommunities"
          label="KOMUNITAS APA SAJA YANG KAMU IKUTI SECARA AKTIF SELAIN DI PANGGUNG KREATOR? *"
          rows={3}
          placeholder="Tuliskan nama komunitas..."
          value={activeCommunities}
          onChange={(e) => setActiveCommunities(e.target.value)}
          error={fieldErrors.activeCommunities}
        />
      </div>

      <div className="mt-10">
        <TextareaLine
          id="careerObstacle"
          name="careerObstacle"
          label="APA KENDALA TERBESAR KAMU SAAT INI DALAM BERKARYA/MEMBANGUN KARIR TERMASUK MEWUJUDKAN IMPIAN? *"
          hint="Contoh: Masih ragu menentukan niche yang tepat karena merasa banyak potensi di berbagai bidang, belum memiliki portofolio yang meyakinkan, dan belum terhubung dengan mentor atau komunitas yang sesuai."
          rows={3}
          placeholder="Ceritakan kendala terbesarmu saat ini..."
          value={careerObstacle}
          onChange={(e) => setCareerObstacle(e.target.value)}
          error={fieldErrors.careerObstacle}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="timeCommitment"
          label="KALAU PANGGUNG KREATOR MENGADAKAN SESI MENTORING ATAU SHARING INTENSIF BUAT BAHAS SEMUA KENDALA KAMU, SEBERAPA BESAR WAKTU YANG SIAP KAMU LUANGKAN? *"
          options={TIME_COMMITMENT_OPTIONS}
          value={timeCommitment}
          onValueChange={setTimeCommitment}
          idPrefix="tc"
          error={fieldErrors.timeCommitment}
        />
      </div>
    </div>
  );
};
