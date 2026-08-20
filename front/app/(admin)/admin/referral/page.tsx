import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReferralManagement from "./ReferralManagement";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const supabase = await createClient();

  // Ambil sesi user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verifikasi peran (role) user
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Tarik data seluruh referral codes beserta pemiliknya
  const { data: referralCodes, error } = await supabase
    .from("referral_codes")
    .select(`
      id,
      code,
      owner_member_id,
      description,
      is_active,
      usage_count,
      max_usage,
      total_revenue,
      default_reward,
      created_at,
      updated_at,
      members:owner_member_id (
        id,
        full_name,
        stage_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching referral codes for admin:", error);
  }

  // Tarik daftar member/admin untuk opsi pemilihan owner saat buat kode
  const { data: memberOptions } = await supabase
    .from("members")
    .select("id, full_name, stage_name, email, role")
    .order("full_name", { ascending: true })
    .limit(300);

  const formattedCodes = (referralCodes || []).map((rc: any) => ({
    id: rc.id,
    code: rc.code,
    owner_member_id: rc.owner_member_id,
    description: rc.description || "",
    is_active: rc.is_active,
    usage_count: rc.usage_count || 0,
    max_usage: rc.max_usage || 0,
    total_revenue: rc.total_revenue || 0,
    default_reward: Number(rc.default_reward || 0),
    created_at: rc.created_at,
    updated_at: rc.updated_at,
    owner_name: rc.members?.stage_name || rc.members?.full_name || "Unknown",
    owner_email: rc.members?.email || "-",
  }));

  return (
    <div className="flex flex-col h-full animate-fade-in p-8 text-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-zinc-400">
            [ AKADEMI ]
          </span>
          <h2 className="text-2xl font-bold font-title text-zinc-900 dark:text-white mt-1">
            Kelola Kode Referral & Reward
          </h2>
        </div>
      </div>

      <ReferralManagement
        initialCodes={formattedCodes}
        memberOptions={memberOptions || []}
      />
    </div>
  );
}
