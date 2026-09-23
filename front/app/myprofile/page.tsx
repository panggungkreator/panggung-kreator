"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, ReferralMember, AttendanceRecord } from "@/lib/types/member";
import PortfolioManager from "@/components/member/PortfolioManager";
import { toast } from "sonner";
import { performCompleteSignOut } from "@/lib/utils/auth-client";
import { clearStaleAuthStorage } from "@/lib/utils/url";
import ProfileLayout from "./components/ProfileLayout";
import ProfileTopHeader from "./components/ProfileTopHeader";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileOverviewContent from "./components/ProfileOverviewContent";
import ProfileTabs, { ProfileTab } from "./components/ProfileTabs";
import AttendanceTracker from "./components/AttendanceTracker";
import AffiliatePanel from "./components/AffiliatePanel";
import { Loader2 } from "lucide-react";
import { getReferredMembersAction, getMyCommissionLedgerAction } from "@/lib/actions/referral-actions";
import { getTabVisibilitySettingsAction, TabVisibilitySettings } from "@/lib/actions/settings-actions";
import TabSkeleton from "./components/TabSkeleton";
import UnderConstruction from "./components/UnderConstruction";
import { isDedicatedAdmin } from "@/lib/constants";

const TAB_ORDER: ProfileTab[] = ["overview", "attendance", "portfolio", "affiliate"];

export default function MyProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralMember[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && TAB_ORDER.includes(tab as ProfileTab)) {
        return tab as ProfileTab;
      }
    }
    return "overview";
  });
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [tabSettings, setTabSettings] = useState<TabVisibilitySettings>({
    tab_attendance_enabled: true,
    tab_portfolio_enabled: true,
    tab_affiliate_enabled: true,
  });

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTabChange = (newTab: ProfileTab) => {
    if (newTab === activeTab) return;
    const oldIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setSlideDirection(newIndex >= oldIndex ? "right" : "left");

    // Trigger smooth Skeleton loading state
    setIsTabSwitching(true);
    setActiveTab(newTab);
    setTimeout(() => {
      setIsTabSwitching(false);
    }, 280);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Don't hijack swipe inside inputs, buttons, or horizontal scroll areas
    if (
      target.closest("input, textarea, select, button") ||
      target.closest(".overflow-x-auto, .overflow-x-scroll")
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Minimum swipe threshold
    const minSwipeDistance = 45;

    // Ensure horizontal gesture intent (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      if (deltaX < 0) {
        // Swiping Left -> Next Tab
        if (currentIndex < TAB_ORDER.length - 1) {
          handleTabChange(TAB_ORDER[currentIndex + 1]);
        }
      } else {
        // Swiping Right -> Previous Tab
        if (currentIndex > 0) {
          handleTabChange(TAB_ORDER[currentIndex - 1]);
        }
      }
    }
  };

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

        // 2. Attended records with event details
        supabase
          .from("attendances")
          .select(`
            id, event_id, member_id, is_present, scan_method, scanned_at, created_at,
            event:events(id, title, description, event_type, event_date, start_time, end_time, location, capacity)
          `)
          .eq("member_id", user.id)
          .eq("is_present", true)
          .order("created_at", { ascending: true }),

        // 3. Referred members list via Server Action (bypasses RLS restrictions)
        getReferredMembersAction(),

        // 4. Commission ledger history with enriched payout details
        getMyCommissionLedgerAction(),

        // 5. System tab visibility settings
        getTabVisibilitySettingsAction(),
      ]);

      if (profileRes.error) throw profileRes.error;

      const profileData = profileRes.data;
      if (profileData) {
        // Guard: Khusus akun root superadmin lempar ke dashboard admin karena tidak punya profil member
        if (isDedicatedAdmin(profileData.username)) {
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

        // Guard: Jika belum mengisi data minat, lempar ke /myprofile/onboarding
        const interests = profileData.interests;
        const hasCompletedInterests =
          interests &&
          (Array.isArray(interests) ? interests.length > 0 : !!(interests as any)?.id);

        if (!hasCompletedInterests) {
          router.replace("/myprofile/onboarding");
          return;
        }
      }

      const records = (attendanceCountRes.data as unknown as AttendanceRecord[]) || [];
      setMember(profileData as MemberProfile);
      setAttendanceRecords(records);
      setAttendanceCount(records.length);
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
      <div className="fixed inset-0 bg-white dark:bg-[#2c2c2c] text-[#2c2c2c] dark:text-white z-[9999] flex items-center justify-center select-none">
        <span className="font-sans text-[12px] uppercase tracking-[0.3em] font-black animate-pulse">
          Memuat Profil ...
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

  const tabsNode = (
    <ProfileTabs
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isAffiliateActive={isAffiliateActive}
      disabledTabs={disabledTabs}
    />
  );

  return (
    <ProfileLayout
      member={member}
      header={
        <ProfileTopHeader
          member={member}
          onSignout={handleSignout}
          isLoggingOut={isLoggingOut}
        />
      }
      tabs={tabsNode}
      sidebar={
        <ProfileSidebar
          member={member}
          onSignout={handleSignout}
          isLoggingOut={isLoggingOut}
          showActions={true}
        />
      }
    >
      <div
        key={activeTab}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full min-h-[50vh] ${slideDirection === "right"
            ? "animate-tab-slide-right"
            : "animate-tab-slide-left"
          }`}
      >
        {isTabSwitching ? (
          <TabSkeleton activeTab={activeTab} />
        ) : (
          <>
            {activeTab === "overview" && (
              <ProfileOverviewContent
                member={member}
                totalAttended={attendanceCount}
                totalReferrals={referrals.length}
                attendanceRecords={attendanceRecords}
              />
            )}

            {activeTab === "attendance" && (
              disabledTabs.attendance ? (
                <UnderConstruction
                  title="Absensi Event"
                  description="Fitur Absensi Event sedang dalam peningkatan performa sistem. Terima kasih atas kesabaran Anda."
                  onBackToOverview={() => handleTabChange("overview")}
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
                  onBackToOverview={() => handleTabChange("overview")}
                />
              ) : (
                <div className="bg-transparent border-0 p-0 shadow-none">
                  <PortfolioManager
                    memberId={member.id}
                    username={member.username || undefined}
                  />
                </div>
              )
            )}

            {activeTab === "affiliate" && (
              disabledTabs.affiliate ? (
                <UnderConstruction
                  title="Program Affiliate"
                  description="Panel Affiliate sedang menjalani penyesuaian sistem komisi. Silakan hubungi admin untuk info lebih lanjut."
                  onBackToOverview={() => handleTabChange("overview")}
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
          </>
        )}
      </div>
    </ProfileLayout>
  );
}
