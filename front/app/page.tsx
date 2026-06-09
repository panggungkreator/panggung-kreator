import React from 'react';
import Header from '@/components/ui/Header';
import { getLandingSectionsAction } from '@/lib/actions/landing-actions';
import { getPackagesAction } from '@/lib/actions/package-actions';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { LandingCMSProvider } from '@/components/landing/LandingCMSContext';
import { AdminEditBar } from '@/components/landing/AdminEditBar';
import { HeroSection } from '@/components/landing/HeroSection';
import { WelcomeSection } from '@/components/landing/WelcomeSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { CurriculumSection } from '@/components/landing/CurriculumSection';
import { 
  TargetAudienceSection, 
  CommunityValuesSection, 
  VisionSection, 
  FacilitiesSection, 
  TestimonialsSection, 
  ClosingCtaSection, 
  FaqSection, 
  FooterSection 
} from '@/components/landing/RemainingSections';
import { PricingSection } from '@/components/landing/PricingSection';

// Prevent Next.js from aggressively caching this page so admin changes reflect immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LandingPage() {
  // Check if current user is admin
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  let isAdmin = false;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const { data: adminMember } = await supabase
      .from('members')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (adminMember && adminMember.role === 'admin') {
      isAdmin = true;
    }
  }

  // Fetch sections data
  const { data: sectionsData, success } = await getLandingSectionsAction();
  const sections = success && sectionsData ? sectionsData : [];

  // Fetch packages data
  const { data: packagesData, success: pkgSuccess } = await getPackagesAction();
  const packages = pkgSuccess && packagesData ? packagesData : [];

  // Helper to extract section content
  const getSection = (type: string) => {
    return sections.find((s: any) => s.section_type === type) || { is_visible: true, content: {} };
  };

  const heroData = getSection('hero');
  const welcomeData = getSection('welcome');
  const painPointsData = getSection('pain_points');
  const curriculumData = getSection('curriculum');
  const targetAudienceData = getSection('target_audience');
  const communityValuesData = getSection('community_values');
  const visionData = getSection('vision');
  const facilitiesData = getSection('facilities');
  const testimonialsData = getSection('testimonials');
  const closingCtaData = getSection('closing_cta');
  const faqData = getSection('faq');
  const footerData = getSection('footer');

  return (
    <LandingCMSProvider isAdmin={isAdmin}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0a] dark:text-white font-sans transition-colors duration-300 selection:bg-[#bc151b] selection:text-white overflow-x-hidden">
        
        {/* Admin Tools */}
        <AdminEditBar />

        {/* 1. Header/Navbar */}
        <Header isFixed={true} />

        {/* Dynamic Sections */}
        <HeroSection id="hero" isVisible={heroData.is_visible} content={heroData.content} packages={packages} />
        <WelcomeSection id="welcome" isVisible={welcomeData.is_visible} content={welcomeData.content} />
        <PainPointsSection id="pain_points" isVisible={painPointsData.is_visible} content={painPointsData.content} />
        <CurriculumSection id="curriculum" isVisible={curriculumData.is_visible} content={curriculumData.content} />
        <TargetAudienceSection id="target_audience" isVisible={targetAudienceData.is_visible} content={targetAudienceData.content} />
        <CommunityValuesSection id="community_values" isVisible={communityValuesData.is_visible} content={communityValuesData.content} />
        <VisionSection id="vision" isVisible={visionData.is_visible} content={visionData.content} />
        <FacilitiesSection id="facilities" isVisible={facilitiesData.is_visible} content={facilitiesData.content} />
        <TestimonialsSection id="testimonials" isVisible={testimonialsData.is_visible} content={testimonialsData.content} />
        <PricingSection id="pricing" isVisible={true} content={getSection('pricing').content} packagesData={packages} />
        <ClosingCtaSection id="closing_cta" isVisible={closingCtaData.is_visible} content={closingCtaData.content} />
        <FaqSection id="faq" isVisible={faqData.is_visible} content={faqData.content} />
        <FooterSection id="footer" isVisible={footerData.is_visible} content={footerData.content} />

      </div>
    </LandingCMSProvider>
  );
}
