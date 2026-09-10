import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";
import { ADMIN_USERNAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
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

  // Tarik data seluruh member untuk tabel admin (termasuk member berstatus admin, konfirmasi pembayaran lunas atau member priority/reguler/membership, kecuali root admin sistem)
  let membersQuery = supabase
    .from("members")
    .select("*, interests:member_interests(*), package:packages(id, name)")
    .neq("username", ADMIN_USERNAME)
    .or("role.eq.admin,payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership");

  let { data: members, error } = await membersQuery.order("created_at", { ascending: false });

  if (error) {
    console.warn("Error fetching members with join interests for admin:", error.message);

    // Fallback: Query members tanpa relational join, lalu ambil member_interests secara terpisah bila ada
    let fallbackQuery = supabase
      .from("members")
      .select("*")
      .neq("username", ADMIN_USERNAME)
      .or("role.eq.admin,payment_status.eq.paid,membership_tier.eq.priority,membership_tier.eq.reguler,membership_tier.eq.membership");

    const { data: rawMembers } = await fallbackQuery.order("created_at", { ascending: false });

    if (rawMembers) {
      const { data: interestsData } = await supabase.from("member_interests").select("*");
      const interestsMap = new Map((interestsData || []).map((item: any) => [item.member_id, item]));

      members = rawMembers.map((m: any) => ({
        ...m,
        interests: interestsMap.get(m.id) || null,
      }));
    }
  }

  // Tarik data seluruh paket untuk pemetaan paket di tabel admin
  const { data: packages, error: pkgError } = await supabase
    .from("packages")
    .select("id, name");

  if (pkgError) {
    console.error("Error fetching packages for admin map:", pkgError);
  }

  // Tarik data admin_roles untuk memetakan jabatan admin
  const { data: adminRolesData } = await supabase
    .from("admin_roles")
    .select("member_id, label, color, status")
    .neq("status", "revoked");

  const adminRolesMap = new Map(
    (adminRolesData || []).map((ar: any) => [ar.member_id, ar])
  );

  const enrichedMembers = (members || []).map((m: any) => ({
    ...m,
    admin_role: adminRolesMap.get(m.id) || null,
  }));

  // Tarik batas limit pagination dari pengaturan sistem (default: 10)
  const { getPaginationLimitSettingAction } = await import("@/lib/actions/settings-actions");
  const paginationLimit = await getPaginationLimitSettingAction();

  return (
    <MembersClient
      initialMembers={enrichedMembers}
      packages={packages || []}
      paginationLimit={paginationLimit}
    />
  );
}
