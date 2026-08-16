import React from "react";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { PhoneNumberLine } from "@/components/ui/style-line/PhoneNumberLine";
import { CityInputLine } from "@/components/ui/style-line/CityInputLine";
import { RadioGroupLine } from "@/components/ui/style-line/RadioGroupLine";
import { OCCUPATION_OPTIONS } from "../constants";

interface Section1ProfileProps {
  fullName: string;
  setFullName: (val: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  instagramUsername: string;
  setInstagramUsername: (val: string) => void;
  tiktokUsername: string;
  setTiktokUsername: (val: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (val: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  citiesList: { id: string; name: string }[];
  occupation: string;
  setOccupation: (val: string) => void;
  customOccupation: string;
  setCustomOccupation: (val: string) => void;
  fieldErrors: Record<string, string>;
  handleFieldChange: (field: string, val: string) => void;
}

export const Section1Profile: React.FC<Section1ProfileProps> = ({
  fullName,
  setFullName,
  whatsappNumber,
  setWhatsappNumber,
  email,
  setEmail,
  instagramUsername,
  setInstagramUsername,
  tiktokUsername,
  setTiktokUsername,
  youtubeUrl,
  setYoutubeUrl,
  linkedinUrl,
  setLinkedinUrl,
  city,
  setCity,
  citiesList,
  occupation,
  setOccupation,
  customOccupation,
  setCustomOccupation,
  fieldErrors,
  handleFieldChange,
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <InputLine
        id="fullName"
        name="fullName"
        label="NAMA LENGKAP *"
        placeholder="Contoh: Budi Santoso"
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
          handleFieldChange("fullName", e.target.value);
        }}
        error={fieldErrors.fullName}
      />

      <PhoneNumberLine
        id="whatsappNumber"
        name="whatsappNumber"
        label="NO. WHATSAPP *"
        value={whatsappNumber}
        onChange={(formattedVal) => {
          setWhatsappNumber(formattedVal);
          handleFieldChange("whatsappNumber", formattedVal);
        }}
        error={fieldErrors.whatsappNumber}
      />

      <InputLine
        id="email"
        name="email"
        label="EMAIL *"
        type="email"
        placeholder="budi@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          handleFieldChange("email", e.target.value);
        }}
        error={fieldErrors.email}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
        <InputLine
          id="instagramUsername"
          name="instagramUsername"
          label="AKUN INSTAGRAM"
          placeholder="username"
          prefixText="@"
          value={instagramUsername}
          onChange={(e) => {
            setInstagramUsername(e.target.value);
            handleFieldChange("instagramUsername", e.target.value);
          }}
          error={fieldErrors.instagramUsername}
        />

        <InputLine
          id="tiktokUsername"
          name="tiktokUsername"
          label="AKUN TIKTOK"
          placeholder="username"
          prefixText="@"
          value={tiktokUsername}
          onChange={(e) => {
            setTiktokUsername(e.target.value);
            handleFieldChange("tiktokUsername", e.target.value);
          }}
          error={fieldErrors.tiktokUsername}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputLine
          id="youtubeUrl"
          name="youtubeUrl"
          label="AKUN YOUTUBE"
          placeholder="Channel / @handle"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />

        <InputLine
          id="linkedinUrl"
          name="linkedinUrl"
          label="AKUN LINKEDIN"
          placeholder="linkedin.com/in/username"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />
      </div>

      <CityInputLine
        id="city"
        name="city"
        label="DOMISILI (KOTA/KABUPATEN) *"
        value={city}
        onChange={setCity}
        citiesList={citiesList}
        error={fieldErrors.city}
      />

      <RadioGroupLine
        label="APA KESIBUKAN / PROFESI KAMU SAAT INI?"
        options={OCCUPATION_OPTIONS}
        value={occupation}
        onValueChange={setOccupation}
        customValue={customOccupation}
        onCustomChange={setCustomOccupation}
        customPlaceholder="Tuliskan profesi / kesibukanmu..."
        idPrefix="occ"
      />
    </div>
  );
};
