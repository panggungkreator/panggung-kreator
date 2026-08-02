import React from "react";
import { getLandingSectionsAction } from "@/lib/actions/landing-actions";
import { getPackagesAction } from "@/lib/actions/package-actions";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Editor Context & Admin toolbar
import { EditorProvider } from "@/components/editor/EditorContext";
import { AdminEditBar } from "@/components/editor/AdminEditBar";
import ScrollAnimationInit from "@/components/ui/ScrollAnimationInit";

// Redesigned layout sections
import NavHeader from "@/layout/nav-header";
import SectionHero from "@/layout/section-hero";
import SectionPainPoints from "@/layout/section-pain-points";
import SectionTurningPoint from "@/layout/section-turning-point";
import SectionOriginStory from "@/layout/section-origin-story";
import SectionPerformerVision from "@/layout/section-performer-vision";
import SectionCurriculum from "@/layout/section-curriculum";
import SectionPricing from "@/layout/section-pricing";
import SectionWhyUs from "@/layout/section-why-us";
import SectionTransformation from "@/layout/section-transformation";
import SectionClosingCta from "@/layout/section-closing-cta";
import SectionFaq from "@/layout/section-faq";
import FooterMain from "@/layout/footer-main";

// Prevent Next.js from caching this page so admin changes reflect immediately
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LandingPage() {
  // Check if current user is admin
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  let isAdmin = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: adminMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminMember && adminMember.role === "admin") {
      isAdmin = true;
    }
  }

  // Fetch sections data from database
  const { data: sectionsData, success } = await getLandingSectionsAction();
  const sections = success && sectionsData ? sectionsData : [];

  // Fetch packages data from database
  const { data: packagesData, success: pkgSuccess } = await getPackagesAction();
  const packages = pkgSuccess && packagesData ? packagesData : [];

  return (
    <EditorProvider isAdmin={isAdmin} initialSections={sections}>
      <div className="min-h-screen bg-zinc-55 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white font-sans transition-colors duration-300 selection:bg-amber-500 selection:text-zinc-950 overflow-x-hidden">
        
        {/* Scroll Animations Initializer */}
        <ScrollAnimationInit />

        {/* Admin Tools */}
        <AdminEditBar />

        {/* 1. Header/Navbar */}
        <NavHeader />

        {/* Dynamic Redesigned Sections */}
        <SectionHero />
        <SectionPainPoints />
        <SectionTurningPoint />
        <SectionOriginStory />
        <SectionPerformerVision />
        <SectionCurriculum />
        <SectionPricing packagesData={packages} />
        <SectionWhyUs />
        <SectionTransformation />
        <SectionClosingCta />
        <SectionFaq />
        
        {/* Footer */}
        <FooterMain />

      </div>
    </EditorProvider>
  );
}
