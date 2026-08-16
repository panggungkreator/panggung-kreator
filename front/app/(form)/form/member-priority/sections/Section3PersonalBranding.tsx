import React from "react";
import { ScaleSelectorLine } from "@/components/ui/style-line/ScaleSelectorLine";
import { MultiSelectLine } from "@/components/ui/style-line/MultiSelectLine";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { LEARNING_TOPIC_OPTIONS } from "../constants";

interface Section3PersonalBrandingProps {
  pbImportance: number | null;
  setPbImportance: (val: number) => void;
  learningTopics: string[];
  toggleLearningTopic: (val: string) => void;
  customLearningTopic: string;
  setCustomLearningTopic: (val: string) => void;
  roleModel: string;
  setRoleModel: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section3PersonalBranding: React.FC<Section3PersonalBrandingProps> = ({
  pbImportance,
  setPbImportance,
  learningTopics,
  toggleLearningTopic,
  customLearningTopic,
  setCustomLearningTopic,
  roleModel,
  setRoleModel,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="mt-10">
        <ScaleSelectorLine
          id="pbImportance"
          label="SEBERAPA PENTING MENURUTMU PERSONAL BRANDING UNTUK MENUNJANG KARIRMU? *"
          min={1}
          max={5}
          value={pbImportance}
          onChange={setPbImportance}
          minLabel="1 (SANGAT TIDAK PENTING)"
          maxLabel="5 (SANGAT PENTING)"
          error={fieldErrors.pbImportance}
        />
      </div>

      <div className="mt-10">
        <MultiSelectLine
          id="learningTopics"
          label="TOPIK APA YANG PALING INGIN KAMU PELAJARI LEBIH DALAM? *"
          options={LEARNING_TOPIC_OPTIONS}
          selected={learningTopics}
          onToggle={toggleLearningTopic}
          customValue={customLearningTopic}
          onCustomChange={setCustomLearningTopic}
          customPlaceholder="Tuliskan topik lainnya..."
          error={fieldErrors.learningTopics}
        />
      </div>

      <div className="mt-10">
        <InputLine
          id="roleModel"
          name="roleModel"
          label="SIAPA SOSOK PUBLIC SPEAKER ATAU CREATOR YANG JADI PANUTAN KAMU SAAT INI? *"
          placeholder="Contoh: Raditya Dika, Merry Riana, GaryVee, dll."
          value={roleModel}
          onChange={(e) => setRoleModel(e.target.value)}
          error={fieldErrors.roleModel}
        />
      </div>
    </div>
  );
};
