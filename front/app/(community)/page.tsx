import React from "react";
import HeroSection from "@/components/community/HeroSection";
import MarqueeSection from "@/components/community/MarqueeSection";
import PillarsSection from "@/components/community/PillarsSection";
import ProgramsSection from "@/components/community/ProgramsSection";
import StatsBarSection from "@/components/community/StatsBarSection";
import JourneySection from "@/components/community/JourneySection";
import MembershipSection from "@/components/community/MembershipSection";
import GallerySection from "@/components/community/GallerySection";
import ValuesSection from "@/components/community/ValuesSection";
import ClosingCTA from "@/components/community/ClosingCTA";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      {/* 1. Hero Section (Giant headline + visual stage) */}
      <HeroSection />

      {/* 2. Marquee Ticker (Infinite horizontal typography ribbon) */}
      <MarqueeSection />

      {/* 3. Pillars Section (Stark 3-column numbered grid) */}
      <PillarsSection />

      {/* 4. Programs Section (9-column structured cards with mobile carousel) */}
      <ProgramsSection />

      {/* 5. Stats Bar (COMMUNITY METRICS - 5-column counter ribbon) */}
      <StatsBarSection />

      {/* 6. Journey Section (1 STAGE, 1 PROGRESS - 4-phase horizontal workflow grid) */}
      <JourneySection />

      {/* 7. Membership Section (NEW - exclusive benefits and learning platform) */}
      <MembershipSection />

      {/* 8. Gallery Section (DOKUMENTASI KEGIATAN - 2x2 visual overlay grid) */}
      <GallerySection />

      {/* 9. Values Section (NEW - core community values 5-column grid) */}
      <ValuesSection />

      {/* 10. Closing CTA Section (Full-bleed contrast call-to-action block) */}
      <ClosingCTA />
    </div>
  );
}
