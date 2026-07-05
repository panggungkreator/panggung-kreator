import React from "react";
import KolaborasiHeroSection from "@/components/kolaborasi/KolaborasiHeroSection";
import KolaborasiOverviewSection from "@/components/kolaborasi/KolaborasiOverviewSection";
import KolaborasiAudiensSection from "@/components/kolaborasi/KolaborasiAudiensSection";
import KolaborasiProgramSection from "@/components/kolaborasi/KolaborasiProgramSection";
import KolaborasiPartnerTypeSection from "@/components/kolaborasi/KolaborasiPartnerTypeSection";
import KolaborasiWhySection from "@/components/kolaborasi/KolaborasiWhySection";
import KolaborasiCTASection from "@/components/kolaborasi/KolaborasiCTASection";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      <KolaborasiHeroSection />
      <KolaborasiOverviewSection />
      <KolaborasiAudiensSection />
      <KolaborasiProgramSection />
      <KolaborasiPartnerTypeSection />
      <KolaborasiWhySection />
      <KolaborasiCTASection />
    </div>
  );
}
