import React from "react";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { PhoneNumberLine } from "@/components/ui/style-line/PhoneNumberLine";
import { DateBirthLine } from "@/components/ui/style-line/DateBirthLine";

interface Section1ProfileProps {
  fullName: string;
  setFullName: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
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
  occupation: string;
  setOccupation: (val: string) => void;
  fieldErrors: Record<string, string>;
  handleFieldChange: (field: string, val: string) => void;
}

export const Section1Profile: React.FC<Section1ProfileProps> = React.memo(function Section1Profile({
  fullName,
  setFullName,
  birthDate,
  setBirthDate,
  address,
  setAddress,
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
  occupation,
  setOccupation,
  fieldErrors,
  handleFieldChange,
}) {
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

      <DateBirthLine
        id="birthDate"
        label="TANGGAL LAHIR *"
        value={birthDate}
        onChange={(val) => {
          setBirthDate(val);
          handleFieldChange("birthDate", val);
        }}
        error={fieldErrors.birthDate}
      />

      <InputLine
        id="address"
        name="address"
        label="ALAMAT TINGGAL *"
        placeholder="Contoh: Jl. Sudirman No. 12, Jakarta Selatan"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          handleFieldChange("address", e.target.value);
        }}
        error={fieldErrors.address}
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

      <div className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputLine
            id="instagramUsername"
            name="instagramUsername"
            label="INSTAGRAM"
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
            label="TIKTOK"
            placeholder="username"
            prefixText="@"
            value={tiktokUsername}
            onChange={(e) => {
              setTiktokUsername(e.target.value);
              handleFieldChange("tiktokUsername", e.target.value);
            }}
            error={fieldErrors.tiktokUsername}
          />

          <InputLine
            id="youtubeUrl"
            name="youtubeUrl"
            label="YOUTUBE"
            placeholder="Channel / @handle"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />

          <InputLine
            id="linkedinUrl"
            name="linkedinUrl"
            label="LINKEDIN"
            placeholder="linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
      </div>

      <InputLine
        id="occupation"
        name="occupation"
        label="APA KESIBUKAN / PEKERJAAN KAMU SAAT INI? *"
        placeholder="Contoh: Karyawan Swasta, Freelancer, Student, dll."
        value={occupation}
        onChange={(e) => {
          setOccupation(e.target.value);
          handleFieldChange("occupation", e.target.value);
        }}
        error={fieldErrors.occupation}
      />
    </div>
  );
});

Section1Profile.displayName = "Section1Profile";
