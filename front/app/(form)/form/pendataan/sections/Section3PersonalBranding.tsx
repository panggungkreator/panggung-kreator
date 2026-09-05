import React from "react";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { SKILLS_TO_MASTER_OPTIONS, MONETIZATION_OPTIONS } from "../constants";

interface Section3PersonalBrandingProps {
  skillsToMaster: string;
  setSkillsToMaster: (val: string) => void;
  customSkillsToMaster: string;
  setCustomSkillsToMaster: (val: string) => void;
  roleModel: string;
  setRoleModel: (val: string) => void;
  monetizationInterest: string;
  setMonetizationInterest: (val: string) => void;
  customMonetizationInterest: string;
  setCustomMonetizationInterest: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section3PersonalBranding: React.FC<Section3PersonalBrandingProps> = ({
  skillsToMaster,
  setSkillsToMaster,
  customSkillsToMaster,
  setCustomSkillsToMaster,
  roleModel,
  setRoleModel,
  monetizationInterest,
  setMonetizationInterest,
  customMonetizationInterest,
  setCustomMonetizationInterest,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="mt-10">
        <RadioGroupLine
          id="skillsToMaster"
          label="SKILL APA YANG PALING INGIN KAMU KUASAI SAAT INI? *"
          options={SKILLS_TO_MASTER_OPTIONS}
          value={skillsToMaster}
          onValueChange={setSkillsToMaster}
          customValue={customSkillsToMaster}
          onCustomChange={setCustomSkillsToMaster}
          customPlaceholder="Tuliskan skill lainnya..."
          idPrefix="stm"
          error={fieldErrors.skillsToMaster}
        />
      </div>

      <div className="mt-10">
        <InputLine
          id="roleModel"
          name="roleModel"
          label="SIAPA SOSOK PUBLIC SPEAKER ATAU CONTENT CREATOR YANG JADI PANUTAN KAMU SAAT INI? *"
          placeholder="Contoh: Raditya Dika, Merry Riana, GaryVee, dll."
          value={roleModel}
          onChange={(e) => setRoleModel(e.target.value)}
          error={fieldErrors.roleModel}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="monetizationInterest"
          label="JALUR MONETISASI APA YANG PALING KAMU MINATI? *"
          options={MONETIZATION_OPTIONS}
          value={monetizationInterest}
          onValueChange={setMonetizationInterest}
          customValue={customMonetizationInterest}
          onCustomChange={setCustomMonetizationInterest}
          customPlaceholder="Tuliskan jalur monetisasi lainnya..."
          idPrefix="mi"
          error={fieldErrors.monetizationInterest}
        />
      </div>
    </div>
  );
};
