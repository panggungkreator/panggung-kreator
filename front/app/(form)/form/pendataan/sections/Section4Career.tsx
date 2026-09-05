import React from "react";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";

interface Section4CareerProps {
  careerGoal: string;
  setCareerGoal: (val: string) => void;
  firstOpportunity: string;
  setFirstOpportunity: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section4Career: React.FC<Section4CareerProps> = ({
  careerGoal,
  setCareerGoal,
  firstOpportunity,
  setFirstOpportunity,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="mt-10">
        <TextareaLine
          id="careerGoal"
          name="careerGoal"
          label="APA CITA-CITA ATAU TARGET KARIER IMPIANMU DALAM 2-3 TAHUN KE DEPAN? *"
          hint="Contoh: Menjadi Speaker Nasional, Manajer di perusahaan, Influencer, dll."
          rows={3}
          placeholder="Tuliskan target kariermu..."
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
          error={fieldErrors.careerGoal}
        />
      </div>

      <div className="mt-10">
        <TextareaLine
          id="firstOpportunity"
          name="firstOpportunity"
          label="JIKA KAMU SUDAH JAGO PUBLIC SPEAKING & PUNYA PERSONAL BRANDING YANG KUAT, PELUANG APA YANG INGIN KAMU KEJAR PERTAMA KALI? *"
          hint="Contoh: Menjadi Speaker Nasional di berbagai seminar kepemimpinan dan edukasi, serta membangun komunitas mentoring profesional."
          rows={3}
          placeholder="Tuliskan peluang impianmu..."
          value={firstOpportunity}
          onChange={(e) => setFirstOpportunity(e.target.value)}
          error={fieldErrors.firstOpportunity}
        />
      </div>
    </div>
  );
};
