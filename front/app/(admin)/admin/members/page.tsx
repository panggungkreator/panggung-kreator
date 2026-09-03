import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
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

  // Ambil daftar member_id yang terdaftar sebagai admin (active/pending) untuk diexclude
  const { data: adminRoles } = await supabase
    .from("admin_roles")
    .select("member_id")
    .neq("status", "revoked");

  const adminMemberIds = (adminRoles || []).map((r) => r.member_id).filter(Boolean);

  // Tarik data seluruh member untuk tabel admin (kecuali admin & pending/active admin, hanya yang konfirmasi pembayaran lunas atau member priority)
  let membersQuery = supabase
    .from("members")
    .select("*, interests:member_interests(*), package:packages(id, name)")
    .neq("role", "admin")
    .or("payment_status.eq.paid,membership_tier.eq.priority");

  if (adminMemberIds.length > 0) {
    membersQuery = membersQuery.not("id", "in", `(${adminMemberIds.join(",")})`);
  }

  let { data: members, error } = await membersQuery.order("created_at", { ascending: false });

  if (error) {
    console.warn("Error fetching members with join interests for admin:", error.message);

    // Fallback: Query members tanpa relational join, lalu ambil member_interests secara terpisah bila ada
    let fallbackQuery = supabase
      .from("members")
      .select("*")
      .neq("role", "admin")
      .or("payment_status.eq.paid,membership_tier.eq.priority");

    if (adminMemberIds.length > 0) {
      fallbackQuery = fallbackQuery.not("id", "in", `(${adminMemberIds.join(",")})`);
    }

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

  // Tarik batas limit pagination dari pengaturan sistem (default: 10)
  const { getPaginationLimitSettingAction } = await import("@/lib/actions/settings-actions");
  const paginationLimit = await getPaginationLimitSettingAction();

  return (
    <MembersClient
      initialMembers={members || []}
      packages={packages || []}
      paginationLimit={paginationLimit}
    />
  );
}
