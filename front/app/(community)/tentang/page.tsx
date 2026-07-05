import React from "react";
import TentangHeroSection from "@/components/tentang/TentangHeroSection";
import TentangAboutSection from "@/components/tentang/TentangAboutSection";
import TentangHistorySection from "@/components/tentang/TentangHistorySection";
import TentangPhilosophySection from "@/components/tentang/TentangPhilosophySection";
import TentangVisionSection from "@/components/tentang/TentangVisionSection";
import ValuesSection from "@/components/community/ValuesSection";
import TentangTimelineSection from "@/components/tentang/TentangTimelineSection";
import TentangTeamSection from "@/components/tentang/TentangTeamSection";
import TentangCTASection from "@/components/tentang/TentangCTASection";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      {/* 1. Hero Section */}
      <TentangHeroSection />

      {/* 2. About Section */}
      <TentangAboutSection />

      {/* 3. History Section */}
      <TentangHistorySection />

      {/* 4. Philosophy Section */}
      <TentangPhilosophySection />

      {/* 5. Vision & Mission Section */}
      <TentangVisionSection />

      {/* 6. Values Section (Reused from landing page) */}
      <ValuesSection />

      {/* 7. Timeline Section */}
      <TentangTimelineSection />

      {/* 8. Team Section */}
      <TentangTeamSection />

      {/* 9. CTA Section */}
      <TentangCTASection />
    </div>
  );
}
