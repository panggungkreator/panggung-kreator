import React from "react";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { MAIN_TOPIC_OPTIONS, EXPERT_DESIRE_OPTIONS } from "../constants";

interface Section5TopicProps {
  mainTopic: string;
  setMainTopic: (val: string) => void;
  customMainTopic: string;
  setCustomMainTopic: (val: string) => void;
  mainMessage: string;
  setMainMessage: (val: string) => void;
  targetAudience: string;
  setTargetAudience: (val: string) => void;
  expertDesire: string;
  setExpertDesire: (val: string) => void;
  fieldErrors?: Record<string, string>;
}

export const Section5Topic: React.FC<Section5TopicProps> = ({
  mainTopic,
  setMainTopic,
  customMainTopic,
  setCustomMainTopic,
  mainMessage,
  setMainMessage,
  targetAudience,
  setTargetAudience,
  expertDesire,
  setExpertDesire,
  fieldErrors = {},
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="mt-10">
        <RadioGroupLine
          id="mainTopic"
          label="KALAU DISURUH BIKIN KONTEN SETIAP HARI, KAMU PALING BETAH BAHAS TOPIK APA? *"
          options={MAIN_TOPIC_OPTIONS}
          value={mainTopic}
          onValueChange={setMainTopic}
          customValue={customMainTopic}
          onCustomChange={setCustomMainTopic}
          customPlaceholder="Tuliskan topik lainnya..."
          idPrefix="mt"
          error={fieldErrors.mainTopic}
        />
      </div>

      <div className="mt-10">
        <TextareaLine
          id="mainMessage"
          name="mainMessage"
          label="LEBIH SPESIFIK LAGI, APA &quot;PESAN UTAMA&quot; YANG INGIN KAMU TANAMKAN DI PIKIRAN AUDIENSMU? *"
          hint='Contoh: "Saya ingin orang tahu bahwa mulai bisnis itu tidak harus modal besar" atau "Saya ingin orang peduli pada kesehatan mental"'
          rows={3}
          placeholder="Tuliskan pesan utamamu..."
          value={mainMessage}
          onChange={(e) => setMainMessage(e.target.value)}
          error={fieldErrors.mainMessage}
        />
      </div>

      <div className="mt-10">
        <InputLine
          id="targetAudience"
          name="targetAudience"
          label="SIAPA TARGET AUDIENS YANG PALING INGIN KAMU SAPA MELALUI KONTEN ATAU BICARAMU? *"
          placeholder="Contoh: Mahasiswa tingkat akhir, Ibu rumah tangga berbisnis, Gen Z, dll."
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          error={fieldErrors.targetAudience}
        />
      </div>

      <div className="mt-10">
        <RadioGroupLine
          id="expertDesire"
          label="SEBERAPA BESAR KEINGINANMU UNTUK DIKENAL SEBAGAI &quot;AHLI&quot; DI BIDANG TERSEBUT? *"
          options={EXPERT_DESIRE_OPTIONS}
          value={expertDesire}
          onValueChange={setExpertDesire}
          idPrefix="ed"
          error={fieldErrors.expertDesire}
        />
      </div>
    </div>
  );
};
