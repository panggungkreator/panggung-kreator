import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfirmationClient from "./ConfirmationClient";
import { getPaginationLimitSettingAction } from "@/lib/actions/settings-actions";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage() {
  const supabase = await createClient();

  // Ambil user yang terotentikasi
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifikasi peran (role) user
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/myprofile");
  }

  // Tarik data seluruh new member yang menunggu konfirmasi (membership_tier = 'new_member' atau non-priority baru)
  const { data: members, error } = await supabase
    .from("members")
    .select(`
      *,
      referrer:referred_by (
        id,
        full_name,
        stage_name,
        affiliate_code
      )
    `)
    .neq("role", "admin")
    .or("membership_tier.eq.new_member,and(membership_tier.is.null,created_at.gte.2026-09-07T00:00:00+07:00,payment_status.neq.paid)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members for confirmation page:", error);
  }

  // Tarik data seluruh paket untuk pemetaan paket di tabel admin
  const { data: packages, error: pkgError } = await supabase
    .from("packages")
    .select("id, name");

  if (pkgError) {
    console.error("Error fetching packages for confirmation map:", pkgError);
  }

  // Tarik batas limit pagination dari pengaturan sistem
  const paginationLimit = await getPaginationLimitSettingAction();

  return (
    <ConfirmationClient
      initialMembers={members || []}
      packages={packages || []}
      paginationLimit={paginationLimit}
    />
  );
}
