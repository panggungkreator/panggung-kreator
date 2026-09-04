"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, ReferralMember } from "@/lib/types/member";
import PortfolioManager from "@/components/member/PortfolioManager";
import { toast } from "sonner";
import { performCompleteSignOut } from "@/lib/utils/auth-client";
import { clearStaleAuthStorage } from "@/lib/utils/url";
import ProfileLayout from "./components/ProfileLayout";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileOverviewContent from "./components/ProfileOverviewContent";
import ProfileTabs, { ProfileTab } from "./components/ProfileTabs";
import ProfileStatsCards from "./components/ProfileStatsCards";
import AttendanceTracker from "./components/AttendanceTracker";
import AffiliatePanel from "./components/AffiliatePanel";
import { Loader2 } from "lucide-react";
import { getReferredMembersAction } from "@/lib/actions/referral-actions";
import { getTabVisibilitySettingsAction, TabVisibilitySettings } from "@/lib/actions/settings-actions";
import UnderConstruction from "./components/UnderConstruction";

export default function MyProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralMember[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [tabSettings, setTabSettings] = useState<TabVisibilitySettings>({
    tab_attendance_enabled: true,
    tab_portfolio_enabled: true,
    tab_affiliate_enabled: true,
  });

  const fetchMemberData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let {
        data: { user },
      } = await supabase.auth.getUser();

      // Fallback: jika getUser() belum terhidrasi di mobile browser, cek via getSession()
      if (!user) {
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData?.session?.user ?? null;
      }

      if (!user) {
        clearStaleAuthStorage();
        router.push("/login");
        return;
      }



      // Parallel fetching initial data
      const [profileRes, attendanceCountRes, referralRes, ledgerRes, tabVisRes] = await Promise.all([
        // 1. Profile & interests
        supabase
          .from("members")
          .select("*, interests:member_interests(*)")
          .eq("id", user.id)
          .single(),

        // 2. Total attended count
        supabase
          .from("attendances")
          .select("id", { count: "exact", head: true })
          .eq("member_id", user.id)
          .eq("is_present", true),

        // 3. Referred members list via Server Action (bypasses RLS restrictions)
        getReferredMembersAction(),

        // 4. Commission ledger history
        supabase
          .from("commission_ledger")
          .select("*")
          .eq("member_id", user.id)
          .order("created_at", { ascending: false }),

        // 5. System tab visibility settings
        getTabVisibilitySettingsAction(),
      ]);

      if (profileRes.error) throw profileRes.error;

      const profileData = profileRes.data;
      if (profileData) {
        // Guard: Jika role === admin, lempar ke dashboard admin
        if (profileData.role === "admin") {
          const isLocalhost =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          const adminUrl =
            !isLocalhost && process.env.NEXT_PUBLIC_ADMIN_URL
              ? process.env.NEXT_PUBLIC_ADMIN_URL
              : "/admin";
          window.location.href = adminUrl;
          return;
        }

        // Guard: Jika member belum mengisi data minat, lempar ke /myprofile/onboarding
        const interests = profileData.interests;
        const hasCompletedInterests =
          interests &&
          (Array.isArray(interests) ? interests.length > 0 : !!(interests as any)?.id);

        if (profileData.role === "member" && !hasCompletedInterests) {
          router.replace("/myprofile/onboarding");
          return;
        }
      }

      setMember(profileData as MemberProfile);
      setAttendanceCount(attendanceCountRes.count ?? 0);
      setReferrals((referralRes as any)?.data || []);
      setLedger((ledgerRes.data as any[]) || []);
      if (tabVisRes) setTabSettings(tabVisRes);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      toast.error("Gagal memuat profil. \n Coba reload kembali.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await performCompleteSignOut("/login");
    } catch (err) {
      console.error("Signout error:", err);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white font-sans gap-3">
        <Loader2 className="animate-spin h-7 w-7 text-neutral-900 dark:text-white" />
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Memuat Profil...
        </span>
      </div>
    );
  }

  if (!member) return null;

  // Conditional affiliate active state
  const isAffiliateActive =
    !!member.affiliate_code || (member.commission_balance || 0) > 0;

  const disabledTabs = {
    attendance: !tabSettings.tab_attendance_enabled,
    portfolio: !tabSettings.tab_portfolio_enabled,
    affiliate: !tabSettings.tab_affiliate_enabled,
  };

  return (
    <ProfileLayout
      member={member}
      tabs={
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAffiliateActive={isAffiliateActive}
          disabledTabs={disabledTabs}
        />
      }
      sidebar={
        <ProfileSidebar member={member} onSignout={handleSignout} isLoggingOut={isLoggingOut} />
      }
    >
      {activeTab === "overview" && (
        <ProfileOverviewContent
          member={member}
          totalAttended={attendanceCount}
          totalReferrals={referrals.length}
        />
      )}

      {activeTab === "attendance" && (
        disabledTabs.attendance ? (
          <UnderConstruction
            title="Absensi Event"
            description="Fitur Absensi Event sedang dalam peningkatan performa sistem. Terima kasih atas kesabaran Anda."
            onBackToOverview={() => setActiveTab("overview")}
          />
        ) : (
          <AttendanceTracker memberId={member.id} />
        )
      )}

      {activeTab === "portfolio" && (
        disabledTabs.portfolio ? (
          <UnderConstruction
            title="Portofolio Kreator"
            description="Fitur manajemen portofolio karya sedang dalam pengembangan."
            onBackToOverview={() => setActiveTab("overview")}
          />
        ) : (
          <div className="bg-transparent border-0 p-0 shadow-none">
            <PortfolioManager memberId={member.id} />
          </div>
        )
      )}

      {activeTab === "affiliate" && (
        disabledTabs.affiliate ? (
          <UnderConstruction
            title="Program Affiliate"
            description="Panel Affiliate sedang menjalani penyesuaian sistem komisi. Silakan hubungi admin untuk info lebih lanjut."
            onBackToOverview={() => setActiveTab("overview")}
          />
        ) : (
          <AffiliatePanel
            member={member}
            referrals={referrals}
            ledger={ledger}
            onAffiliateGenerated={(newCode) => {
              setMember((prev) => (prev ? { ...prev, affiliate_code: newCode } : prev));
            }}
          />
        )
      )}
    </ProfileLayout>
  );
}
