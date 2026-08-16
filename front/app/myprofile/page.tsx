"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MemberProfile, ReferralMember } from "@/lib/types/member";
import PortfolioManager from "@/components/member/PortfolioManager";
import { toast } from "sonner";
import { signout } from "@/lib/actions/auth-actions";
import ProfileLayout from "./components/ProfileLayout";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileOverviewContent from "./components/ProfileOverviewContent";
import ProfileTabs, { ProfileTab } from "./components/ProfileTabs";
import ProfileStatsCards from "./components/ProfileStatsCards";
import AttendanceTracker from "./components/AttendanceTracker";
import AffiliatePanel from "./components/AffiliatePanel";
import { Loader2 } from "lucide-react";

export default function MyProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralMember[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const fetchMemberData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Parallel fetching initial data
      const [profileRes, attendanceCountRes, referralRes] = await Promise.all([
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

        // 3. Referred members list
        supabase
          .from("members")
          .select("id, full_name, email, membership_tier, created_at")
          .eq("referred_by", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;

      setMember(profileRes.data as MemberProfile);
      setAttendanceCount(attendanceCountRes.count ?? 0);
      setReferrals((referralRes.data as ReferralMember[]) || []);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      toast.error("Gagal memuat profil.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const handleSignout = async () => {
    await signout();
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

  return (
    <ProfileLayout
      member={member}
      tabs={
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAffiliateActive={isAffiliateActive}
        />
      }
      sidebar={
        <ProfileSidebar member={member} onSignout={handleSignout} />
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
        <AttendanceTracker memberId={member.id} />
      )}

      {activeTab === "portfolio" && (
        <div className="bg-transparent border-0 p-0 shadow-none">
          <PortfolioManager memberId={member.id} />
        </div>
      )}

      {activeTab === "affiliate" && isAffiliateActive && (
        <AffiliatePanel member={member} referrals={referrals} />
      )}
    </ProfileLayout>
  );
}
